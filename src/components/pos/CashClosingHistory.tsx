"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, AlertCircle, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface Closing {
  id: string;
  date: string;
  expected_cash: number;
  actual_cash: number;
  difference: number;
  notes: string;
  created_at: string;
}

const CashClosingHistory: React.FC = () => {
  const [closings, setClosings] = useState<Closing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClosings();
  }, []);

  const fetchClosings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cash_closings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) toast.error('Error al cargar cierres');
    else setClosings(data || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Historial de Arqueos</h3>
      
      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" /></div>
        ) : closings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <FileText className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-slate-500">No hay cierres registrados</p>
          </div>
        ) : closings.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${c.difference === 0 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                {c.difference === 0 ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg">{new Date(c.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  {new Date(c.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 text-center md:text-right">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Esperado</p>
                <p className="font-bold text-slate-700">${c.expected_cash.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Real</p>
                <p className="font-bold text-slate-700">${c.actual_cash.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diferencia</p>
                <p className={`font-black ${c.difference === 0 ? 'text-green-600' : c.difference > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                  {c.difference > 0 ? '+' : ''}${c.difference.toLocaleString()}
                </p>
              </div>
            </div>

            {c.notes && (
              <div className="md:max-w-xs">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas</p>
                <p className="text-xs text-slate-500 italic">"{c.notes}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CashClosingHistory;