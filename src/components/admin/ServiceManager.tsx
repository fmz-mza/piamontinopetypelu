"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Plus, Trash2, Scissors, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Service {
  id?: string;
  name: string;
  price: number;
  category: string;
}

const ServiceManager: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Service>({ name: '', price: 0, category: 'Peluquería' });

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchServices();
    }
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || formData.price <= 0) {
      toast.error('Nombre y precio son obligatorios');
      return;
    }

    try {
      const { error } = await supabase.from('services').insert([formData]);
      if (error) throw error;
      toast.success('Servicio agregado');
      fetchServices();
      setIsModalOpen(false);
      setFormData({ name: '', price: 0, category: 'Peluquería' });
    } catch (err) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      toast.success('Servicio eliminado');
      fetchServices();
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Servicios de Peluquería</h1>
          <p className="text-slate-500">Gestioná los precios de los servicios rápidos del POS</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Servicio
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-pink-500 uppercase mb-1">{service.category}</p>
              <h3 className="font-bold text-slate-800">{service.name}</h3>
              <p className="text-lg font-black text-slate-900">${service.price.toLocaleString()}</p>
            </div>
            <button
              onClick={() => service.id && handleDelete(service.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Nuevo Servicio</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-500 outline-none"
                  placeholder="Ej: Peluquería Caniche"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Precio</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-500 outline-none"
                />
              </div>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Guardar Servicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManager;