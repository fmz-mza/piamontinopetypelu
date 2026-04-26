"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, ShoppingBag, CreditCard, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  type: 'compra' | 'pago';
  amount: number;
  description: string;
}

interface CustomerHistoryProps {
  customer: { id: string; name: string; balance: number };
  onClose: () => void;
}

const CustomerHistory: React.FC<CustomerHistoryProps> = ({ customer, onClose }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [customer.id]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [salesRes, paymentsRes] = await Promise.all([
        supabase.from('sales').select('id, created_at, total').eq('customer_id', customer.id),
        supabase.from('customer_payments').select('id, date, amount').eq('customer_id', customer.id)
      ]);

      const history: Transaction[] = [
        ...(salesRes.data || []).map(s => ({
          id: s.id,
          date: s.created_at,
          type: 'compra' as const,
          amount: s.total,
          description: 'Compra en Cuenta Corriente'
        })),
        ...(paymentsRes.data || []).map(p => ({
          id: p.id,
          date: p.date,
          type: 'pago' as const,
          amount: p.amount,
          description: 'Pago de Deuda'
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTransactions(history);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{customer.name}</h3>
            <p className="text-slate-500 font-medium">Historial de Cuenta Corriente</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 bg-pink-50 border-b border-pink-100 flex justify-between items-center">
          <span className="text-pink-600 font-black uppercase tracking-widest text-xs">Saldo Pendiente</span>
          <span className="text-3xl font-black text-pink-600">${customer.balance.toLocaleString()}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" /></div>
          ) : transactions.length === 0 ? (
            <p className="text-center py-12 text-slate-400 font-medium">No hay movimientos registrados</p>
          ) : (
            transactions.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${t.type === 'compra' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                    {t.type === 'compra' ? <ShoppingBag size={20} /> : <CreditCard size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t.description}</p>
                    <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString('es-AR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg ${t.type === 'compra' ? 'text-slate-800' : 'text-green-600'}`}>
                    {t.type === 'compra' ? '+' : '-'}${t.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHistory;