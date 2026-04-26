"use client";

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CashClosingModalProps {
  expectedCash: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CashClosingModal: React.FC<CashClosingModalProps> = ({ expectedCash, onClose, onSuccess }) => {
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const actual = parseFloat(actualCash);
    if (isNaN(actual)) {
      toast.error('Ingresá un monto válido');
      return;
    }

    setLoading(true);
    try {
      const difference = actual - expectedCash;
      const { error } = await supabase
        .from('cash_closings')
        .insert([{
          expected_cash: expectedCash,
          actual_cash: actual,
          difference: difference,
          notes: notes,
          date: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;
      toast.success('Cierre de caja guardado');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error closing cash:', err);
      toast.error('Error al guardar cierre');
    } finally {
      setLoading(false);
    }
  };

  const difference = (parseFloat(actualCash) || 0) - expectedCash;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cierre de Caja</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efectivo Esperado</p>
            <p className="text-4xl font-black text-slate-900">${expectedCash.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Efectivo Real en Caja</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="number"
                value={actualCash}
                onChange={e => setActualCash(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none text-2xl font-black"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          {actualCash && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${difference === 0 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
              {difference === 0 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-bold">
                Diferencia: {difference > 0 ? '+' : ''}${difference.toLocaleString()}
                {difference === 0 ? ' (Caja cuadrada)' : difference > 0 ? ' (Sobrante)' : ' (Faltante)'}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas / Observaciones</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none resize-none h-24 font-medium"
              placeholder="Ej: Se retiró dinero para cambio..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading || !actualCash}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Confirmar Cierre'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashClosingModal;