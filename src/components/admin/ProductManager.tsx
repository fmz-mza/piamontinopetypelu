"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Plus, Search, Edit2, Trash2, X, Save, AlertCircle, Package, Camera, Settings2, Filter } from 'lucide-react';
import Scanner from '../shared/Scanner';
import CategoryManager from './CategoryManager';
import toast from 'react-hot-toast';

interface Product {
  id?: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  ean: string;
  category: string;
  image_url: string;
}

interface Category {
  id: string;
  name: string;
}

const emptyProduct: Product = {
  name: '',
  price: 0,
  cost: 0,
  stock: 0,
  ean: '',
  category: '',
  image_url: ''
};

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>(emptyProduct);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    if (isSupabaseConfigured()) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('categories').select('*').order('name')
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({ ...emptyProduct });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ ...emptyProduct });
  };

  const handleScan = (code: string) => {
    setFormData(prev => ({ ...prev, ean: code }));
    setShowScanner(false);
    toast.success('Código escaneado');
  };

  const handleSave = async () => {
    if (!formData.name || formData.price < 0) {
      toast.error('Nombre y precio válido son obligatorios');
      return;
    }

    setLoading(true);
    try {
      if (editingProduct?.id) {
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            price: formData.price,
            cost: formData.cost,
            stock: formData.stock,
            ean: formData.ean,
            category: formData.category,
            image_url: formData.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Producto actualizado');
      } else {
        const { id, ...newProductData } = formData;
        const { error } = await supabase.from('products').insert([newProductData]);
        if (error) throw error;
        toast.success('Producto creado');
      }
      await fetchData();
      handleCloseModal();
    } catch (err: any) {
      toast.error(`Error al guardar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Producto eliminado');
      fetchData();
    } catch (err: any) {
      toast.error(`Error al eliminar: ${err.message}`);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ean?.includes(searchTerm);
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-amber-800 mb-2">Supabase no configurado</h3>
            <p className="text-amber-700 text-sm">Configurá las variables de entorno para gestionar productos.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Catálogo de Productos</h1>
          <p className="text-slate-500">{products.length} productos en total</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Settings2 size={18} />
            Categorías
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none px-4 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o código EAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Filter size={18} className="text-slate-400 shrink-0" />
          <button
            onClick={() => setSelectedCategory('Todas')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'Todas' ? 'bg-pink-500 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-pink-200'
            }`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.name ? 'bg-pink-500 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-pink-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
          <Package className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500">No se encontraron productos con estos filtros</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="text-slate-300" size={32} /></div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-800 line-clamp-1">{product.name}</h3>
                  <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {product.category || 'S/C'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-black text-pink-500">${product.price.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">Stock: {product.stock}</p>
                  </div>
                  {product.ean && <span className="text-[10px] text-slate-400 font-mono">{product.ean}</span>}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleOpenModal(product)} className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <Edit2 size={14} /> Editar
                  </button>
                  <button onClick={() => product.id && handleDelete(product.id)} className="px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Nombre *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 outline-none" placeholder="Nombre del producto" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Precio *</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Costo</label>
                  <input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Stock</label>
                  <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 outline-none" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">EAN</label>
                    <button type="button" onClick={() => setShowScanner(true)} className="p-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 flex items-center gap-1 text-[9px] font-black uppercase">
                      <Camera size={12} /> Escanear
                    </button>
                  </div>
                  <input type="text" value={formData.ean} onChange={(e) => setFormData({ ...formData, ean: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 outline-none font-mono" placeholder="Código de barras" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Categoría</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 outline-none bg-white">
                  <option value="">Sin categoría</option>
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">URL de Imagen</label>
                <input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 outline-none" placeholder="https://..." />
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button onClick={handleCloseModal} className="flex-1 px-4 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 px-4 py-3 bg-pink-500 text-white font-bold hover:bg-pink-600 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={18} /> {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CategoryManager 
        isOpen={isCatModalOpen} 
        onClose={() => setIsCatModalOpen(false)} 
        onCategoriesChange={fetchData} 
      />

      {showScanner && <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
    </div>
  );
};

export default ProductManager;