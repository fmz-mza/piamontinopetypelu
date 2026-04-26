"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Plus, Minus, Trash2, Barcode, Search, ShoppingCart, DollarSign, CreditCard, X, AlertCircle, Users, Scissors, ChevronUp, Power, Play, Percent, ChevronDown, ArrowRightLeft, Eye } from 'lucide-react';
import Scanner from '../shared/Scanner';
import OpenCashModal from './OpenCashModal';
import CashClosingModal from './CashClosingModal';
import SaleDetailModal from './SaleDetailModal';
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

interface Sale {
  id: string;
  created_at: string;
  total: number;
  items: { name: string; price: number; quantity: number }[];
  payment_method: string;
  customer_id?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const SalesTerminal: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showOpenCashModal, setShowOpenCashModal] = useState(false);
  const [showCloseCashModal, setShowCloseCashModal] = useState(false);
  const [currentSession, setCurrentSession] = useState<{ id: string } | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente'>('efectivo');
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; balance: number } | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false }).limit(8);
      if (error) throw error;
      setSales(data || []);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  const checkCashSession = async () => {
    try {
      const { data, error } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('status', 'open')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setCurrentSession(data || null);
    } catch (err) {
      console.error('Error checking cash session:', err);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchProducts();
      fetchSales();
      checkCashSession();
    }
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const handleScan = (code: string) => {
    setShowScanner(false);
    const product = products.find(p => p.ean === code);
    if (product) {
      addToCart(product);
    } else {
      toast.error('Producto no encontrado');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!currentSession) {
      toast.error('Debes abrir caja primero');
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const items = cart.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    try {
      const { error } = await supabase.from('sales').insert([{
        total,
        items,
        payment_method: paymentMethod,
        customer_id: selectedCustomer?.id || null
      }]);

      if (error) throw error;

      // Update stock
      for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          await supabase.from('products').update({ 
            stock: product.stock - item.quantity,
            updated_at: new Date().toISOString()
          }).eq('id', item.id);

          await supabase.from('stock_movements').insert([{
            product_id: item.id,
            quantity: -item.quantity,
            type: 'sale',
            reason: 'Venta'
          }]);
        }
      }

      // Update customer balance if cuenta corriente
      if (paymentMethod === 'cuenta_corriente' && selectedCustomer) {
        await supabase.from('customers').update({ 
          balance: selectedCustomer.balance + total 
        }).eq('id', selectedCustomer.id);
      }

      toast.success('Venta realizada con éxito');
      setCart([]);
      fetchProducts();
      fetchSales();
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Error during checkout:', err);
      toast.error('Error al procesar la venta');
    }
  };

  const handleViewSale = (sale: Sale) => {
    setViewingSale(sale);
    setShowSaleModal(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ean?.includes(searchTerm)
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Terminal de Ventas</h1>
          <p className="text-slate-500">
            {currentSession ? 'Caja abierta' : 'Caja cerrada'}
          </p>
        </div>
        <div className="flex gap-2">
          {!currentSession ? (
            <button 
              onClick={() => setShowOpenCashModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Play size={18} /> Abrir Caja
            </button>
          ) : (
            <button 
              onClick={() => setShowCloseCashModal(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Power size={18} /> Cerrar Caja
            </button>
          )}
        </div>
      </div>

      {/* Search and Scanner */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar producto por nombre o EAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="p-3.5 bg-pink-500 text-white rounded-2xl font-medium hover:bg-pink-600 transition-all shadow-lg active:scale-95"
        >
          <Barcode size={24} />
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            <ShoppingCart size={40} className="mx-auto mb-2 opacity-30" />
            <p>No se encontraron productos</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`bg-white p-2 rounded-2xl border border-slate-200 hover:border-pink-300 hover:shadow-sm transition-all text-left active:scale-95 ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
                {product.image_url ? (
                  <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingCart size={20} />
                  </div>
                )}
              </div>
              <p className="font-bold text-slate-800 text-xs line-clamp-2 h-8 leading-tight mb-1">{product.name}</p>
              <div className="flex justify-between items-end">
                <p className="text-pink-500 font-black text-sm">${formatPrice(product.price)}</p>
                <p className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${product.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
                  STK: {product.stock}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Cart Sidebar */}
      {cart.length > 0 && (
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Carrito</h3>
            <button onClick={() => setCart([])} className="p-2 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                  <p className="text-pink-500 font-black text-sm">${formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                    <Minus size={14} />
                  </button>
                  <span className="font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-slate-800">Total:</p>
              <p className="text-2xl font-black text-pink-500">${formatPrice(cartTotal)}</p>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Método de Pago</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'efectivo', label: 'Efectivo', icon: DollarSign },
                  { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                  { id: 'transferencia', label: 'Transferencia', icon: ArrowRightLeft },
                  { id: 'cuenta_corriente', label: 'Cuenta Corriente', icon: Users }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${
                      paymentMethod === method.id
                        ? 'bg-pink-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <method.icon size={14} />
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-pink-500 transition-all active:scale-95"
            >
              Finalizar Venta (${formatPrice(cartTotal)})
            </button>
          </div>
        </div>
      )}

      {/* Recent Sales */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Últimas Operaciones</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {sales.map(sale => (
            <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${
                  sale.payment_method === 'efectivo' ? 'bg-green-50 text-green-600' :
                  sale.payment_method === 'tarjeta' ? 'bg-blue-50 text-blue-600' :
                  sale.payment_method === 'transferencia' ? 'bg-purple-50 text-purple-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {sale.payment_method === 'efectivo' ? <DollarSign size={18} /> :
                   sale.payment_method === 'tarjeta' ? <CreditCard size={18} /> :
                   sale.payment_method === 'transferencia' ? <ArrowRightLeft size={18} /> :
                   <Users size={18} />}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    {new Date(sale.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    {sale.payment_method.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-black text-slate-900">${formatPrice(sale.total)}</p>
                <button 
                  onClick={() => handleViewSale(sale)} 
                  className="p-2 text-slate-300 hover:text-pink-500 transition-colors"
                  title="Ver detalle de venta"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showScanner && <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      {showOpenCashModal && (
        <OpenCashModal 
          onClose={() => setShowOpenCashModal(false)} 
          onSuccess={() => {
            checkCashSession();
            setShowOpenCashModal(false);
          }} 
        />
      )}
      {showCloseCashModal && currentSession && (
        <CashClosingModal 
          expectedCash={0} // Calculate properly in real implementation
          sessionId={currentSession.id}
          onClose={() => setShowCloseCashModal(false)} 
          onSuccess={() => {
            checkCashSession();
            setShowCloseCashModal(false);
          }} 
        />
      )}
      {showSaleModal && (
        <SaleDetailModal 
          isOpen={showSaleModal} 
          onClose={() => setShowSaleModal(false)} 
          sale={viewingSale} 
        />
      )}
    </div>
  );
};

export default SalesTerminal;