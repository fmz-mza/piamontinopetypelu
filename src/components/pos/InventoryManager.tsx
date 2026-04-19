"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Package, Search, Barcode, Plus, Minus, AlertCircle, X } from 'lucide-react';
import Scanner from '../shared/Scanner';
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

  const updateStock = async (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = product.stock + delta;
    if (newStock < 0) {
      toast.error('El stock no puede ser negativo');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', productId);

      if (error) throw error;
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

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', editingStock.id);

      if (error) throw error;
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

  const lowStockProducts = products.filter(p => p.stock <= 5);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  if (!isConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-amber-800 mb-2">Supabase no configurado</h3>
            <p className="text-amber-700 text-sm">
              Configurá las variables de entorno para gestionar el inventario.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">Total Productos</p>
          <p className="text-2xl font-black text-slate-800">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">En Stock</p>
          <p className="text-2xl font-black text-green-500">{products.filter(p => p.stock > 5).length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">Stock Bajo</p>
          <p className="text-2xl font-black text-amber-500">{lowStockProducts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">Sin Stock</p>
          <p className="text-2xl font-black text-red-500">{outOfStockProducts.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría o EAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="px-4 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <Barcode size={18} />
          <span className="hidden sm:inline">Escanear</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Producto</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Categoría</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">EAN</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Precio</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">Stock</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-slate-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{product.category || '-'}</td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-500">{product.ean || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-600'
                          : product.stock <= 5
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-green-100 text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateStock(product.id, -1)}
                          className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                          disabled={product.stock === 0}
                        >
                          <Minus size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStock({ id: product.id, name: product.name, stock: product.stock });
                            setStockValue(product.stock.toString());
                          }}
                          className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => updateStock(product.id, 1)}
                          className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                        >
                          <Plus size={14} />
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

      {/* Scanner Modal */}
      {showScanner && (
        <Scanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Edit Stock Modal */}
      {editingStock && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Editar Stock</h3>
              <button
                onClick={() => {
                  setEditingStock(null);
                  setStockValue('');
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-slate-600 mb-4">{editingStock.name}</p>
              <input
                type="number"
                min="0"
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-center text-2xl font-bold"
                placeholder="0"
              />
            </div>

            <div className="p-4 border-t">
              <button
                onClick={handleSetStock}
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;