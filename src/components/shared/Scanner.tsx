"use client";

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { X, Camera, AlertCircle } from 'lucide-react';

interface ScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        setError(null);
        readerRef.current = new BrowserMultiFormatReader();
        
        const devices = await readerRef.current.listVideoInputDevices();
        if (devices.length === 0) {
          setError('No se encontró ninguna cámara');
          return;
        }

        // Priorizar cámara trasera (environment)
        const selectedDevice = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('trasera')
        ) || devices[devices.length - 1]; // Usualmente la última es la trasera en móviles

        setScanning(true);
        
        await readerRef.current.decodeFromVideoDevice(
          selectedDevice.deviceId,
          videoRef.current!,
          (result, err) => {
            if (result) {
              const code = result.getText();
              onScan(code);
              stopScanner();
            }
            if (err && !(err instanceof NotFoundException)) {
              console.error('Scanner error:', err);
            }
          }
        );
      } catch (err) {
        console.error('Error starting scanner:', err);
        setError('Error al iniciar la cámara. Asegúrate de usar HTTPS o localhost.');
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan]);

  const stopScanner = () => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setScanning(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Camera size={20} className="text-pink-500" />
            Escanear Código
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="relative aspect-square bg-slate-900">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-40 border-2 border-pink-500 rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-pink-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-pink-500 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-pink-500 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-pink-500 rounded-br-lg" />
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-pink-500/50 animate-pulse" />
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
              <div className="text-center p-6">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-white font-medium">{error}</p>
                <p className="text-slate-400 text-sm mt-2">
                  La cámara requiere HTTPS o localhost
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50">
          <p className="text-sm text-slate-600 text-center">
            Posicioná el código de barras dentro del marco
          </p>
        </div>
      </div>
    </div>
  );
};

export default Scanner;