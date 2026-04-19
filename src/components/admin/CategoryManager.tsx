"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, X, Save, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
}

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChange: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose, onCategoriesChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) console.error(error);
    else setCategories(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    try {
      const { error } = await supabase.from('categories').insert([{ name: newCategory.trim() }]);
      if (error) throw error;
      setNewCategory('');
      fetchCategories();
      onCategoriesChange();
      toast.success('Categoría agregada');
    } catch (err) {
      toast.error('Error al agregar');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.trim()) return;
    try {
      const { error } = await supabase.from('categories').update({ name: editValue.trim() }).eq('id', id);
      if (error) throw error;
      setEditingId(null);
      fetchCategories();
      onCategoriesChange();
      toast.success('Categoría actualizada');
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar categoría? Los productos asociados no se borrarán pero quedarán sin categoría.')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      fetchCategories();
      onCategoriesChange();
      toast.success('Categoría eliminada');
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-slate-800">Gestionar Categorías</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nueva categoría..."
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-pink-500"
            />
            <button onClick={handleAdd} className="p-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600">
              <Plus size={24} />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {loading ? (
              <div className="text-center py-4 text-slate-400">Cargando...</div>
            ) : categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                {editingId === cat.id ? (
                  <div className="flex gap-2 w-full">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-2 py-1 rounded border border-pink-300 outline-none"
                    />
                    <button onClick={() => handleUpdate(cat.id)} className="text-green-500"><Save size={18} /></button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400"><X size={18} /></button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(cat.id); setEditValue(cat.name); }} className="p-1.5 text-slate-400 hover:text-blue-500"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;