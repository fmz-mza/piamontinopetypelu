"use client";

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, User, Phone, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface NewCustomerModalProps {
  onClose: () => void;
  onSuccess: (customerId: string) => void;
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ name: name.trim(), phone: phone.trim(), balance: 0 }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Cliente registrado');
      onSuccess(data.id);
      onClose();
    } catch (err) {
      console.error('Error creating customer:', err);
      toast.error('Error al registrar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nuevo Cliente</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                placeholder="Ej: Juan Pérez"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp / Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                placeholder="261..."
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Guardando...' : <><Save size={18} /> Registrar Cliente</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCustomerModal;