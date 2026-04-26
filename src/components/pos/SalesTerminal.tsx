"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  Plus, Minus, Trash2, Barcode, Search, ShoppingCart, 
  DollarSign, CreditCard, X, AlertCircle, Users, 
  ArrowRightLeft, Eye, Power, Play, UserPlus, Trash, FileText,
  ChevronRight, Receipt
} from 'lucide-react';
import Scanner from '../shared/Scanner';
import OpenCashModal from './OpenCashModal';
import CashClosingModal from './CashClosingModal';
import SaleDetailModal from './SaleDetailModal';
import NewCustomerModal from './NewCustomerModal';
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

interface Customer {
  id: string;
  name: string;
  balance: number;
}

interface Sale {
  id: string;
  created_at: string;
  total: number;
  items: { name: string; price: number; quantity: number }[];
  payment_method: string;
  customer_id?: string;
  notes?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const STORAGE_KEY = 'piamontino_pos_state';

const SalesTerminal: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saleNotes, setSaleNotes] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showOpenCashModal, setShowOpenCashModal] = useState(false);
  const [showCloseCashModal, setShowCloseCashModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [currentSession, setCurrentSession] = useState<{ id: string } | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente'>('efectivo');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setCart(parsed.cart || []);
        setSaleNotes(parsed.saleNotes || '');
        setPaymentMethod(parsed.paymentMethod || 'efectivo');
        setSelectedCustomerId(parsed.selectedCustomerId || '');
      } catch (e) {
        console.error("Error parsing saved POS state", e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      cart,
      saleNotes,
      paymentMethod,
      selectedCustomerId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [cart, saleNotes, paymentMethod, selectedCustomerId]);

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

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from('customers').select('id, name, balance').order('name');
      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false }).limit(5);
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
      fetchCustomers();
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

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm('¿Vaciar el carrito?')) {
      setCart([]);
      setSaleNotes('');
      setSelectedCustomerId('');
      localStorage.removeItem(STORAGE_KEY);
    }
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
      toast.success(`${product.name} añadido`);
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

    if (paymentMethod === 'cuenta_corriente' && !selectedCustomerId) {
      toast.error('Selecciona un cliente para Cuenta Corriente');
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
        customer_id: paymentMethod === 'cuenta_corriente' ? selectedCustomerId : null,
        notes: saleNotes
      }]);

      if (error) throw error;

      if (paymentMethod === 'cuenta_corriente') {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (customer) {
          await supabase.from('customers').update({ 
            balance: customer.balance + total 
          }).eq('id', selectedCustomerId);
        }
      }

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

      toast.success('Venta realizada con éxito');
      setCart([]);
      setSaleNotes('');
      setIsMobileCartOpen(false);
      setSelectedCustomerId('');
      localStorage.removeItem(STORAGE_KEY);
      fetchProducts();
      fetchCustomers();
      fetchSales();
    } catch (err) {
      console.error('Error during checkout:', err);
      toast.error('Error al procesar la venta');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ean?.includes(searchTerm)
  );

  const CartContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Cart Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="bg-pink-500 p-2.5 rounded-xl text-white shadow-lg shadow-pink-100">
            <Receipt size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Ticket de Venta</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cartCount} artículos</p>
          </div>
        </div>
        <button 
          onClick={clearCart}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Vaciar Carrito"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-50">
            <ShoppingCart size={48} strokeWidth={1.5} />
            <p className="font-bold text-sm">Carrito vacío</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-pink-200 transition-all">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-xs truncate">{item.name}</p>
                <p className="text-pink-500 font-black text-xs mt-0.5">${formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-lg hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-500 transition-all">
                  <Minus size={12} />
                </button>
                <span className="font-black w-7 text-center text-xs text-slate-700">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-lg hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-500 transition-all">
                  <Plus size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Footer */}
      <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-5">
        {/* Payment Method */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'efectivo', label: 'Efectivo', icon: DollarSign },
            { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
            { id: 'transferencia', label: 'Transf.', icon: ArrowRightLeft },
            { id: 'cuenta_corriente', label: 'Cta. Cte.', icon: Users }
          ].map(method => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id as any)}
              className={`p-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border ${
                paymentMethod === method.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-pink-200'
              }`}
            >
              <method.icon size={14} />
              {method.label}
            </button>
          ))}
        </div>

        {/* Customer Selection */}
        {paymentMethod === 'cuenta_corriente' && (
          <div className="flex gap-2 animate-in slide-in-from-bottom-2 duration-300">
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 outline-none text-xs font-bold"
            >
              <option value="">Seleccionar cliente...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} (${formatPrice(c.balance)})</option>
              ))}
            </select>
            <button
              onClick={() => setShowNewCustomerModal(true)}
              className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-pink-500 transition-all"
            >
              <UserPlus size={18} />
            </button>
          </div>
        )}

        {/* Total & Checkout */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Total a Cobrar</span>
            <span className="text-3xl font-black text-slate-900 tracking-tighter">${formatPrice(cartTotal)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-4 bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-pink-600 transition-all active:scale-95 shadow-xl shadow-pink-100 disabled:opacity-50 disabled:grayscale"
          >
            Finalizar Venta
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6">
      {/* Left Side: Products & Search */}
      <div className="flex-1 flex flex-col min-w-0 space-y-6">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o EAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all font-medium bg-white"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowScanner(true)}
              className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-pink-500 hover:text-pink-500 transition-all shadow-sm"
            >
              <Barcode size={24} />
            </button>
            {!currentSession ? (
              <button onClick={() => setShowOpenCashModal(true)} className="flex-1 sm:flex-none px-6 py-3.5 bg-green-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-100">
                <Play size={18} /> Abrir Caja
              </button>
            ) : (
              <button onClick={() => setShowCloseCashModal(true)} className="flex-1 sm:flex-none px-6 py-3.5 bg-red-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-100">
                <Power size={18} /> Cerrar
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
              </div>
            ) : filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`group bg-white p-3 rounded-[2rem] border border-slate-100 hover:border-pink-300 hover:shadow-xl transition-all text-left active:scale-95 relative overflow-hidden ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-3">
                  {product.image_url ? (
                    <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <ShoppingCart size={24} />
                    </div>
                  )}
                </div>
                <p className="font-bold text-slate-800 text-[11px] line-clamp-2 h-7 leading-tight mb-2">{product.name}</p>
                <div className="flex justify-between items-center">
                  <p className="text-pink-500 font-black text-sm">${formatPrice(product.price)}</p>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${product.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
                    {product.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Sales Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Recientes:</span>
          {sales.map(sale => (
            <button 
              key={sale.id} 
              onClick={() => { setViewingSale(sale); setShowSaleModal(true); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl hover:bg-pink-50 transition-colors shrink-0"
            >
              <div className={`w-2 h-2 rounded-full ${sale.payment_method === 'efectivo' ? 'bg-green-500' : 'bg-blue-500'}`} />
              <span className="text-[10px] font-bold text-slate-600">${formatPrice(sale.total)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side: Cart (Desktop) */}
      <div className="hidden lg:block w-80 xl:w-96 shrink-0 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <CartContent />
      </div>

      {/* Mobile Cart Trigger */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40">
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-center gap-3">
            <div className="bg-pink-500 p-2 rounded-lg">
              <ShoppingCart size={20} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ver Carrito</p>
              <p className="font-bold text-sm">{cartCount} artículos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xl font-black">${formatPrice(cartTotal)}</p>
            <ChevronRight size={20} className="text-slate-500" />
          </div>
        </button>
      </div>

      {/* Mobile Cart Drawer */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileCartOpen(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />
            <div className="flex-1 overflow-hidden">
              <CartContent />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showScanner && <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      {showOpenCashModal && <OpenCashModal onClose={() => setShowOpenCashModal(false)} onSuccess={() => { checkCashSession(); setShowOpenCashModal(false); }} />}
      {showCloseCashModal && currentSession && <CashClosingModal expectedCash={0} sessionId={currentSession.id} onClose={() => setShowCloseCashModal(false)} onSuccess={() => { checkCashSession(); setShowCloseCashModal(false); }} />}
      {showSaleModal && <SaleDetailModal isOpen={showSaleModal} onClose={() => setShowSaleModal(false)} sale={viewingSale} />}
      {showNewCustomerModal && <NewCustomerModal onClose={() => setShowNewCustomerModal(false)} onSuccess={(id) => { fetchCustomers(); setSelectedCustomerId(id); }} />}
    </div>
  );
};

export default SalesTerminal;