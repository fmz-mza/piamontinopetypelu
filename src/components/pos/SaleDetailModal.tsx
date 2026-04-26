"use client";

import React from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { X, Trash2, CreditCard, DollarSign, ArrowRightLeft, Users } from 'lucide-react';
import { formatPrice } from '../AccountingDashboard';

interface Sale {
  id: string;
  created_at: string;
  total: number;
  items: { name: string; price: number; quantity: number }[];
  payment_method: string;
  customer_id?: string;
}

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Detalle de Venta</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Fecha</p>
              <p className="text-slate-900 font-medium">
                {new Date(sale.created_at).toLocaleString('es-AR', { 
                  day: '2-digit', 
                  month: 'short', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Método</p>
              <p className={`font-black text-slate-900 ${sale.payment_method === 'efectivo' ? 'text-green-600' : 
                sale.payment_method === 'tarjeta' ? 'text-blue-600' : 
                sale.payment_method === 'transferencia' ? 'text-purple-600' : 'text-amber-600'}`}>
                {sale.payment_method}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Artículos</p>
            <div className="space-y-1.5">
              {sale.items?.length ? (
                sale.items.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 truncate">{item.name}</span>
                    <span className="text-slate-900 font-medium">
                      ${formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">Sin artículos registrados</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-slate-400 font-medium">Total</p>
            <p className="text-3xl font-black text-slate-900">${formatPrice(sale.total)}</p>
          </div>

          {sale.customer_id && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Cliente</span>
              <span className="font-medium text-slate-800">
                {sale.customer_id === 'undefined' ? 'Nuevo Cliente' : 'Cliente registrado'}
              </span>
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button 
              onClick={() => onClose()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all"
            >
              <X size={18} /> Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;