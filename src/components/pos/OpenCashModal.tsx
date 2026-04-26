"use client";

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, DollarSign, Play } from 'lucide-react';
import toast from 'react-hot-toast';

interface OpenCashModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const OpenCashModal: React.FC<OpenCashModalProps> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    const openingBalance = parseFloat(amount) || 0;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cash_sessions')
        .insert([{
          opening_balance: openingBalance,
          status: 'open'
        }]);

      if (error) throw error;
      toast.success('Caja abierta correctamente');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error opening cash:', err);
      toast.error('Error al abrir caja');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Abrir Caja</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Saldo Inicial (Efectivo)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none text-2xl font-black"
                placeholder="0.00"
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium ml-1">Ingresá el efectivo disponible al iniciar el turno.</p>
          </div>

          <button
            onClick={handleOpen}
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Abriendo...' : <><Play size={18} /> Iniciar Turno</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenCashModal;