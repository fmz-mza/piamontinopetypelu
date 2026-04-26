"use client";

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, DollarSign, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  supplier: { id: string; name: string; balance: number };
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ supplier, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(supplier.balance > 0 ? supplier.balance.toString() : '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Ingresá un monto válido');
      return;
    }

    setSaving(true);
    try {
      // Usamos la fecha y hora local actual en formato ISO
      const now = new Date();
      const isoString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
      const dateOnly = isoString.split('T')[0];

      // 1. Insert supplier transaction (payment)
      const { error: txError } = await supabase
        .from('supplier_transactions')
        .insert([{
          supplier_id: supplier.id,
          type: 'pago',
          amount: paymentAmount,
          description: notes || `Pago a proveedor`,
          date: isoString
        }]);

      if (txError) throw txError;

      // 2. Update supplier balance
      const { data: supplierData, error: fetchError } = await supabase
        .from('suppliers')
        .select('balance')
        .eq('id', supplier.id)
        .single();

      if (fetchError) throw fetchError;

      const currentBalance = supplierData?.balance || 0;
      const newBalance = currentBalance - paymentAmount;

      const { error: balanceError } = await supabase
        .from('suppliers')
        .update({ balance: newBalance })
        .eq('id', supplier.id);

      if (balanceError) throw balanceError;

      // 3. Insert into expenses (usando la fecha local YYYY-MM-DD)
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert([{
          description: `Pago a Proveedor: ${supplier.name}`,
          amount: paymentAmount,
          category: 'Mercadería',
          date: dateOnly,
          type: 'egreso'
        }]);

      if (expenseError) throw expenseError;

      toast.success('Pago registrado correctamente');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving payment:', err);
      toast.error('Error al registrar el pago');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Proveedor
          </label>
          <p className="font-bold text-slate-800">{supplier.name}</p>
        </div>
        <div className="text-right space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">
            Deuda Total
          </label>
          <p className="font-black text-red-500 text-lg">${supplier.balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Monto a Pagar *
        </label>
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none text-2xl font-black"
            placeholder="0.00"
            autoFocus
          />
        </div>
        {supplier.balance > 0 && parseFloat(amount) === supplier.balance && (
          <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase mt-1 ml-1">
            <AlertCircle size={12} /> Saldando deuda total
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Notas / Observaciones
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none resize-none h-24 font-medium"
          placeholder="Ej: Pago total de factura..."
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !amount}
          className="flex-1 py-3 bg-green-500 text-white rounded-2xl font-bold text-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save size={16} />
              Registrar Pago
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;