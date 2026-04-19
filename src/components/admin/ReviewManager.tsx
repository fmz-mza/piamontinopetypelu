"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Plus, Trash2, Star, Save, X, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  id?: string;
  name: string;
  time: string;
  text: string;
  rating: number;
  img: string;
}

const emptyReview: Review = {
  name: '',
  time: 'Hace 1 semana',
  text: '',
  rating: 5,
  img: ''
};

const ReviewManager: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Review>(emptyReview);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchReviews();
    }
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.text) {
      toast.error('Nombre y comentario son obligatorios');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([formData]);

      if (error) throw error;
      toast.success('Reseña agregada');
      fetchReviews();
      setIsModalOpen(false);
      setFormData(emptyReview);
    } catch (err) {
      console.error('Error saving review:', err);
      toast.error('Error al guardar reseña');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Reseña eliminada');
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reseñas de Clientes</h1>
          <p className="text-slate-500">Gestioná los testimonios que aparecen en la web</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Reseña
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group">
              <button
                onClick={() => review.id && handleDelete(review.id)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={review.img || `https://i.pravatar.cc/150?u=${review.id}`} 
                  className="w-12 h-12 rounded-full object-cover bg-slate-100"
                  alt={review.name}
                />
                <div>
                  <h3 className="font-bold text-slate-800">{review.name}</h3>
                  <p className="text-xs text-slate-400">{review.time}</p>
                </div>
              </div>

              <div className="flex text-amber-400 mb-3">
                {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>

              <p className="text-slate-600 text-sm italic">"{review.text}"</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <MessageSquare className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500">No hay reseñas cargadas todavía</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Nueva Reseña</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-500 outline-none"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Comentario</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-500 outline-none resize-none"
                  placeholder="¿Qué dijo el cliente?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Calificación (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Tiempo</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-500 outline-none"
                    placeholder="Ej: Hace 2 días"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Guardar Reseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManager;