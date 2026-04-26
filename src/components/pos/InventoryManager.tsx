"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Package, Search, Barcode, Plus, Minus, AlertCircle, X, History, TrendingUp, TrendingDown } from 'lucide-react';
import Scanner from '../shared/Scanner';
import StockHistoryModal from './StockHistoryModal';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  ean: string;
  category: string;
  image_url: string;
}

const InventoryManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [editingStock, setEditingStock] = useState<{ id: string; name: string; stock: number } | null>(null);
  const [stockValue, setStockValue] = useState('');
  const [selectedProductHistory, setSelectedProductHistory] = useState<Product | null>(null);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    if (isSupabaseConfigured()) {
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (code: string) => {
    setShowScanner(false);
    setSearchTerm(code);
  };

  const updateStock = async (productId: string, delta: number, reason = 'Ajuste manual') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = product.stock + delta;
    if (newStock < 0) {
      toast.error('El stock no puede ser negativo');
      return;
    }

    try {
      // 1. Actualizar stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', productId);

      if (updateError) throw updateError;

      // 2. Registrar movimiento
      await supabase.from('stock_movements').insert([{
        product_id: productId,
        quantity: delta,
        type: delta > 0 ? 'purchase' : 'adjustment',
        reason: reason
      }]);

      fetchProducts();
      toast.success('Stock actualizado');
    } catch (err) {
      console.error('Error updating stock:', err);
      toast.error('Error al actualizar stock');
    }
  };

  const handleSetStock = async () => {
    if (!editingStock) return;
    
    const newStock = parseInt(stockValue);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Stock inválido');
      return;
    }

    const delta = newStock - editingStock.stock;
    if (delta === 0) {
      setEditingStock(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', editingStock.id);

      if (error) throw error;

      await supabase.from('stock_movements').insert([{
        product_id: editingStock.id,
        quantity: delta,
        type: 'adjustment',
        reason: 'Ajuste de inventario manual'
      }]);

      toast.success('Stock actualizado');
      setEditingStock(null);
      setStockValue('');
      fetchProducts();
    } catch (err) {
      console.error('Error updating stock:', err);
      toast.error('Error al actualizar stock');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ean?.includes(searchTerm)
  );

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  if (!isConfigured) return <div className="p-6 bg-amber-50 rounded-2xl">Configurá Supabase</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Productos</p>
          <p className="text-2xl font-black text-slate-800">{products.length}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">En Stock</p>
          <p className="text-2xl font-black text-green-500">{products.filter(p => p.stock > 5).length}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Bajo</p>
          <p className="text-2xl font-black text-amber-500">{lowStockProducts.length}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sin Stock</p>
          <p className="text-2xl font-black text-red-500">{outOfStockProducts.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría o EAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all font-medium"
          />
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="p-3.5 bg-pink-500 text-white rounded-2xl font-medium hover:bg-pink-600 transition-all shadow-lg active:scale-95"
        >
          <Barcode size={24} />
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Package size={40} className="mx-auto mb-2 opacity-30" />
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                  <th className="text-center px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                  <th className="text-center px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{product.ean || 'Sin EAN'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{product.category || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-600'
                          : product.stock <= 5
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-green-100 text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateStock(product.id, -1)}
                          className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          disabled={product.stock === 0}
                        >
                          <Minus size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStock({ id: product.id, name: product.name, stock: product.stock });
                            setStockValue(product.stock.toString());
                          }}
                          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-pink-500 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => updateStock(product.id, 1)}
                          className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-green-50 hover:text-green-500 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => setSelectedProductHistory(product)}
                          className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                          title="Ver Historial"
                        >
                          <History size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showScanner && <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      {selectedProductHistory && <StockHistoryModal product={selectedProductHistory} onClose={() => setSelectedProductHistory(null)} />}

      {/* Edit Stock Modal */}
      {editingStock && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight">Ajuste de Stock</h3>
              <button onClick={() => setEditingStock(null)} className="p-2 text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{editingStock.name}</p>
                <p className="text-xs text-slate-500 font-medium">Stock actual: {editingStock.stock}</p>
              </div>
              <input
                type="number"
                min="0"
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none text-3xl font-black text-center"
                placeholder="0"
                autoFocus
              />
              <button
                onClick={handleSetStock}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all active:scale-95"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;