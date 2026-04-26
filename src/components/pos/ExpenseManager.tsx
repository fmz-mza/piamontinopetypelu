"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, DollarSign, Tag, Calendar as CalendarIcon, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: string;
}

const categories = ['Mercadería', 'Servicios', 'Alquiler', 'Sueldos', 'Limpieza', 'Otros'];

const ExpenseManager: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Mercadería',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) toast.error('Error al cargar gastos');
    else setExpenses(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.description || !formData.amount) {
      toast.error('Completá los campos obligatorios');
      return;
    }

    try {
      const { error } = await supabase.from('expenses').insert([{
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        type: 'egreso'
      }]);

      if (error) throw error;
      toast.success('Gasto registrado');
      setIsModalOpen(false);
      setFormData({ description: '', amount: '', category: 'Mercadería', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (err) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) toast.error('Error al eliminar');
    else {
      toast.success('Gasto eliminado');
      fetchExpenses();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Control de Gastos</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-pink-500 transition-all"
        >
          <Plus size={18} /> Nuevo Gasto
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
              <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</th>
              <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
              <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="py-10 text-center"><div className="animate-spin w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full mx-auto" /></td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-sm">No hay gastos registrados</td></tr>
            ) : expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(exp.date).toLocaleDateString('es-AR')}</td>
                <td className="px-6 py-4 font-bold text-slate-800 text-sm">{exp.description}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase">{exp.category}</span>
                </td>
                <td className="px-6 py-4 text-right font-black text-red-500">-${exp.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(exp.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Registrar Gasto</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                  placeholder="Ej: Pago de luz, Compra de alimento..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-black"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button 
                onClick={handleSave}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all active:scale-95"
              >
                Guardar Gasto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;