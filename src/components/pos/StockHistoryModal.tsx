"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, ArrowUpCircle, ArrowDownCircle, ShoppingCart, Settings } from 'lucide-react';

interface Movement {
  id: string;
  quantity: number;
  type: 'sale' | 'adjustment' | 'purchase';
  reason: string;
  created_at: string;
}

interface StockHistoryModalProps {
  product: { id: string; name: string };
  onClose: () => void;
}

const StockHistoryModal: React.FC<StockHistoryModalProps> = ({ product, onClose }) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [product.id]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovements(data || []);
    } catch (err) {
      console.error('Error fetching stock history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ShoppingCart size={18} className="text-blue-500" />;
      case 'purchase': return <ArrowUpCircle size={18} className="text-green-500" />;
      default: return <Settings size={18} className="text-amber-500" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'sale': return 'Venta';
      case 'purchase': return 'Compra/Ingreso';
      default: return 'Ajuste Manual';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-black text-slate-900 tracking-tight">Historial de Stock</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full" /></div>
          ) : movements.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-sm font-medium">Sin movimientos registrados</p>
          ) : (
            movements.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">{getTypeIcon(m.type)}</div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{getTypeText(m.type)}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(m.created_at).toLocaleString('es-AR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${m.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                  </p>
                  {m.reason && <p className="text-[9px] text-slate-400 italic">{m.reason}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StockHistoryModal;