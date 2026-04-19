"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Calendar, Clock, Plus, Trash2, CheckCircle, XCircle, User, Scissors, MessageSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  pet_name: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pendiente' | 'confirmado' | 'completado' | 'cancelado';
  notes: string;
  services?: { name: string };
}

interface Service {
  id: string;
  name: string;
}

const AppointmentManager: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    pet_name: '',
    service_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00',
    notes: ''
  });

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, servRes] = await Promise.all([
        supabase.from('appointments').select('*, services(name)').order('appointment_date', { ascending: true }),
        supabase.from('services').select('id, name')
      ]);
      if (appRes.data) setAppointments(appRes.data);
      if (servRes.data) setServices(servRes.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.customer_name || !formData.appointment_date) {
      toast.error('Nombre y fecha son obligatorios');
      return;
    }

    try {
      const { error } = await supabase.from('appointments').insert([formData]);
      if (error) throw error;
      toast.success('Turno agendado');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Error al agendar');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(`Turno ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Error al actualizar estado');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-blue-100 text-blue-600';
      case 'completado': return 'bg-green-100 text-green-600';
      case 'cancelado': return 'bg-red-100 text-red-600';
      default: return 'bg-amber-100 text-amber-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Turnos</h1>
          <p className="text-slate-500">Administrá las citas de peluquería</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Turno
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((app) => (
            <div key={app.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800">{app.customer_name}</h3>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={14} /> {app.appointment_date} - {app.appointment_time}hs</span>
                    <span className="flex items-center gap-1"><User size={14} /> Mascota: {app.pet_name || 'N/A'}</span>
                    <span className="flex items-center gap-1"><Scissors size={14} /> {app.services?.name || 'Servicio no especificado'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                {app.status === 'pendiente' && (
                  <button onClick={() => updateStatus(app.id, 'confirmado')} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Confirmar">
                    <CheckCircle size={20} />
                  </button>
                )}
                {app.status !== 'completado' && app.status !== 'cancelado' && (
                  <>
                    <button onClick={() => updateStatus(app.id, 'completado')} className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="Completar">
                      <CheckCircle size={20} />
                    </button>
                    <button onClick={() => updateStatus(app.id, 'cancelado')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Cancelar">
                      <XCircle size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Calendar className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500">No hay turnos programados</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Agendar Turno</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Cliente</label>
                  <input type="text" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-pink-500" placeholder="Nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                  <input type="text" value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-pink-500" placeholder="WhatsApp" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre Mascota</label>
                <input type="text" value={formData.pet_name} onChange={e => setFormData({...formData, pet_name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-pink-500" placeholder="Ej: Firulais" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Servicio</label>
                <select value={formData.service_id} onChange={e => setFormData({...formData, service_id: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-pink-500">
                  <option value="">Seleccionar servicio...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Fecha</label>
                  <input type="date" value={formData.appointment_date} onChange={e => setFormData({...formData, appointment_date: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Hora</label>
                  <input type="time" value={formData.appointment_time} onChange={e => setFormData({...formData, appointment_time: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-pink-500" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <button onClick={handleSave} className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors">
                Agendar Turno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;