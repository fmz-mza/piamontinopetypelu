"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Search, Plus, Minus, Package, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  cost: number;
  stock: number;
  ean: string;
}

interface CartItem extends Product {
  quantity: number;
  unit_price: number;
}

interface PurchaseModalProps {
  supplier: { id: string; name: string };
  onClose: () => void;
  onSuccess: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ supplier, onClose, onSuccess }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, cost, stock, ean')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ean?.includes(searchTerm)
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, unit_price: product.cost || 0 }];
    });
  };

  const updateCartItem = (productId: string, field: 'quantity' | 'unit_price', value: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, [field]: value }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const handleSave = async () => {
    if (cart.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    setSaving(true);
    try {
      const totalAmount = getTotal();
      
      // 1. Insert supplier transaction (purchase)
      const { data: transaction, error: txError } = await supabase
        .from('supplier_transactions')
        .insert([{
          supplier_id: supplier.id,
          type: 'compra',
          amount: totalAmount,
          description: `Compra de mercadería`,
          date: new Date().toISOString()
        }])
        .select()
        .single();

      if (txError) throw txError;

      // 2. Insert purchase items and update stock
      for (const item of cart) {
        // Insert purchase item
        const { error: itemError } = await supabase
          .from('purchase_items')
          .insert([{
            supplier_transaction_id: transaction.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.unit_price * item.quantity
          }]);

        if (itemError) throw itemError;

        // Update product stock
        const product = products.find(p => p.id === item.id);
        if (product) {
          const newStock = product.stock + item.quantity;
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              stock: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);

          if (stockError) throw stockError;

          // Insert stock movement
          await supabase.from('stock_movements').insert([{
            product_id: item.id,
            quantity: item.quantity,
            type: 'purchase',
            reason: `Compra a proveedor: ${supplier.name}`
          }]);
        }
      }

      // 3. Update supplier balance (increase debt)
      const { data: supplierData, error: fetchError } = await supabase
        .from('suppliers')
        .select('balance')
        .eq('id', supplier.id)
        .single();

      if (fetchError) throw fetchError;

      const currentBalance = supplierData?.balance || 0;
      const newBalance = currentBalance + totalAmount;

      const { error: balanceError } = await supabase
        .from('suppliers')
        .update({ balance: newBalance })
        .eq('id', supplier.id);

      if (balanceError) throw balanceError;

      toast.success('Compra registrada correctamente');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving purchase:', err);
      toast.error('Error al registrar la compra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Buscar producto por nombre o EAN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
        />
      </div>

      {/* Products List */}
      <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-2xl">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{product.name}</p>
                  <p className="text-xs text-slate-400">Stock: {product.stock} | Costo: ${product.cost || 0}</p>
                </div>
                <Plus size={16} className="text-pink-500 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cart */}
      <div className="space-y-3">
        <h4 className="font-bold text-slate-800 text-sm">Productos a Comprar</h4>
        
        {cart.length === 0 ? (
          <p className="text-center py-4 text-slate-400 text-sm">No hay productos agregados</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {cart.map(item => (
              <div key={item.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-slate-800 text-sm flex-1">{item.name}</p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Cantidad</label>
                    <div className="flex items-center bg-white rounded-lg border border-slate-200 mt-1">
                      <button 
                        onClick={() => updateCartItem(item.id, 'quantity', item.quantity - 1)}
                        className="px-2 py-1 text-slate-500 hover:bg-slate-100 rounded-l-lg"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="flex-1 text-center text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartItem(item.id, 'quantity', item.quantity + 1)}
                        className="px-2 py-1 text-slate-500 hover:bg-slate-100 rounded-r-lg"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Costo Unit.</label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateCartItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                    />
                  </div>
                  
                  <div className="text-right">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Subtotal</label>
                    <p className="text-sm font-black text-pink-600 mt-1">
                      ${(item.unit_price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total & Actions */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex justify-between items-end mb-4">
          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Compra</span>
          <span className="text-3xl font-black text-slate-900">${getTotal().toLocaleString()}</span>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || cart.length === 0}
            className="flex-1 py-3 bg-pink-500 text-white rounded-2xl font-bold text-sm hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                Registrar Compra
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;