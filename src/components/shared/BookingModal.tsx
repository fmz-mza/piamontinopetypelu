"use client";

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Scissors, Phone, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    pet_name: '',
    service_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchServices();
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        appointment_date: tomorrow.toISOString().split('T')[0]
      }));
    }
  }, [isOpen]);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('id, name').order('name');
    if (data) setServices(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_phone || !formData.service_id) {
      toast.error('Por favor completá los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('appointments').insert([
        { ...formData, status: 'pendiente' }
      ]);

      if (error) throw error;

      toast.success('¡Solicitud enviada! Nos contactaremos pronto.');
      onClose();
      setFormData({
        customer_name: '',
        customer_phone: '',
        pet_name: '',
        service_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
      });
    } catch (err) {
      console.error('Error booking:', err);
      toast.error('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="relative p-8 border-b border-slate-100 bg-gradient-to-br from-pink-50 to-white">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white rounded-full transition-colors shadow-sm"
          >
            <X size={20} className="text-slate-400" />
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Reservar Turno</h2>
          <p className="text-slate-500 font-medium">Completá tus datos y te confirmaremos a la brevedad.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tu Nombre *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  required
                  type="text"
                  value={formData.customer_name}
                  onChange={e => setFormData({...formData, customer_name: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none transition-all font-medium"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  required
                  type="tel"
                  value={formData.customer_phone}
                  onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none transition-all font-medium"
                  placeholder="261..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Mascota</label>
              <input
                type="text"
                value={formData.pet_name}
                onChange={e => setFormData({...formData, pet_name: e.target.value})}
                className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none transition-all font-medium"
                placeholder="Ej: Firulais"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Servicio *</label>
              <div className="relative">
                <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select
                  required
                  value={formData.service_id}
                  onChange={e => setFormData({...formData, service_id: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none transition-all font-medium appearance-none"
                >
                  <option value="">Seleccionar...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Fecha Deseada</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={e => setFormData({...formData, appointment_date: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Hora</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="time"
                  value={formData.appointment_time}
                  onChange={e => setFormData({...formData, appointment_time: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold text-lg hover:bg-pink-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Solicitar Turno <Send size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;