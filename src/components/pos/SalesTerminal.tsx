"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Plus, Minus, Trash2, Barcode, Search, ShoppingCart, DollarSign, CreditCard, X, AlertCircle, Users, Scissors, ChevronUp, Power, Play, Percent, ChevronDown } from 'lucide-react';
import Scanner from '../shared/Scanner';
import OpenCashModal from './OpenCashModal';
import CashClosingModal from './CashClosingModal';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  ean: string;
  category: string;
  image_url: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  balance: number;
}

interface CartItem {
  product: { id: string; name: string; price: number; stock?: number; isService?: boolean };
  quantity: number;
}

const SalesTerminal: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'cuenta_corriente'>('efectivo');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  
  // Nuevo Cliente Modal State
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  // Descuentos y Recargos
  const [discountPercent, setDiscountPercent] = useState(0);
  const [surchargePercent, setSurchargePercent] = useState(0);

  // Estado de Caja
  const [activeSession, setActiveSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showClosedWarning, setShowClosedWarning] = useState(false);

  const checkCashSession = useCallback(async () => {
    setCheckingSession(true);
    try {
      const { data } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('status', 'open')
        .maybeSingle();
      
      setActiveSession(data || null);
      if (!data) {
        setShowClosedWarning(true);
      } else {
        setShowClosedWarning(false);
      }
    } catch (err) {
      console.error('Error checking session:', err);
    } finally {
      setCheckingSession(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, servRes, custRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('services').select('*').order('name'),
        supabase.from('customers').select('id, name, balance').order('name')
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (servRes.data) setServices(servRes.data);
      if (custRes.data) setCustomers(custRes.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);
    if (configured) {
      fetchData();
      checkCashSession();
    }
  }, [fetchData, checkCashSession]);

  const addToCart = (item: any, isService = false) => {
    if (!activeSession) {
      setShowClosedWarning(true);
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.product.id === item.id);
      if (existing) {
        if (!isService && item.stock !== undefined && existing.quantity >= item.stock) {
          toast.error('Stock insuficiente');
          return prev;
        }
        return prev.map(i => i.product.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      toast.success(`${item.name} añadido`, { duration: 1000, position: 'bottom-center' });
      return [...prev, { product: { ...item, isService }, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (!item.product.isService && item.product.stock !== undefined && newQty > item.product.stock) {
          toast.error('Stock insuficiente');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const surchargeAmount = (subtotal * surchargePercent) / 100;
  const cartTotal = subtotal - discountAmount + surchargeAmount;

  const handleAddCustomer = async () => {
    if (!newCustomer.name) {
      toast.error('El nombre es obligatorio');
      return;
    }
    try {
      const { data, error } = await supabase.from('customers').insert([{
        name: newCustomer.name,
        phone: newCustomer.phone,
        balance: 0
      }]).select();

      if (error) throw error;
      
      toast.success('Cliente creado');
      setShowCustomerModal(false);
      setNewCustomer({ name: '', phone: '' });
      
      // Refrescar lista y seleccionar al nuevo cliente
      await fetchData();
      if (data && data[0]) {
        setSelectedCustomerId(data[0].id);
      }
    } catch (err) { 
      toast.error('Error al crear cliente'); 
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    if (!activeSession) {
      toast.error('La caja debe estar abierta');
      return;
    }
    if (paymentMethod === 'cuenta_corriente' && !selectedCustomerId) {
      toast.error('Seleccioná un cliente');
      return;
    }

    setIsProcessing(true);
    try {
      const { error: saleError } = await supabase
        .from('sales')
        .insert([{
          total: cartTotal,
          items: cart.map(i => ({ 
            id: i.product.id, 
            name: i.product.name, 
            price: i.product.price, 
            quantity: i.quantity, 
            isService: i.product.isService 
          })),
          payment_method: paymentMethod,
          customer_id: paymentMethod === 'cuenta_corriente' ? selectedCustomerId : null,
          created_at: new Date().toISOString()
        }]);

      if (saleError) throw saleError;

      for (const item of cart) {
        if (!item.product.isService) {
          const prod = products.find(p => p.id === item.product.id);
          if (prod) {
            const newStock = prod.stock - item.quantity;
            await supabase.from('products').update({ stock: newStock }).eq('id', prod.id);
            await supabase.from('stock_movements').insert([{
              product_id: prod.id,
              quantity: -item.quantity,
              type: 'sale',
              reason: `Venta POS #${paymentMethod}`
            }]);
          }
        }
      }

      if (paymentMethod === 'cuenta_corriente') {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (customer) {
          await supabase.from('customers').update({ balance: customer.balance + cartTotal }).eq('id', selectedCustomerId);
        }
      }

      toast.success('Venta realizada con éxito');
      setCart([]);
      setDiscountPercent(0);
      setSurchargePercent(0);
      setShowCheckout(false);
      setShowMobileCart(false);
      await fetchData();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const CartContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
        <h2 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest text-sm">
          <ShoppingCart size={18} className="text-pink-500" /> Carrito ({cart.length})
        </h2>
        <button onClick={() => setCart([])} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest">Vaciar</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-30">
            <ShoppingCart size={48} />
            <p className="text-xs font-bold uppercase tracking-widest">Vacío</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.product.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-xs truncate">{item.product.name}</p>
                <p className="text-pink-500 font-black text-sm">${formatPrice(item.product.price)}</p>
              </div>
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100">
                <button onClick={() => updateQuantity(item.product.id, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-400"><Minus size={14} /></button>
                <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-400"><Plus size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-6 border-t space-y-4 bg-white">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Subtotal</span>
            <span>${formatPrice(subtotal)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between text-xs font-bold text-red-500 uppercase tracking-widest">
              <span>Descuento ({discountPercent}%)</span>
              <span>-${formatPrice(discountAmount)}</span>
            </div>
          )}
          {surchargePercent > 0 && (
            <div className="flex justify-between text-xs font-bold text-blue-500 uppercase tracking-widest">
              <span>Recargo ({surchargePercent}%)</span>
              <span>+${formatPrice(surchargeAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-slate-50">
            <span className="text-slate-900 font-black uppercase tracking-widest text-xs">Total</span>
            <span className="text-3xl font-black text-slate-900">${formatPrice(cartTotal)}</span>
          </div>
        </div>
        <button onClick={() => setShowCheckout(true)} disabled={cart.length === 0 || isProcessing} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all disabled:opacity-50 active:scale-95">
          Cobrar Ahora
        </button>
      </div>
    </div>
  );

  if (!isConfigured) return <div className="p-6 bg-amber-50 rounded-2xl">Configurá Supabase</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] relative">
      {/* Status Bar */}
      <div className="absolute -top-12 left-0 right-0 flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeSession ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Caja: {checkingSession ? 'Verificando...' : activeSession ? 'Abierta' : 'Cerrada'}
          </span>
        </div>
        {!checkingSession && (
          activeSession ? (
            <button onClick={() => setShowCloseModal(true)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline flex items-center gap-1">
              <Power size={12} /> Cerrar Caja
            </button>
          ) : (
            <button onClick={() => setShowOpenModal(true)} className="text-[10px] font-black uppercase tracking-widest text-green-600 hover:underline flex items-center gap-1">
              <Play size={12} /> Abrir Caja
            </button>
          )
        )}
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto o servicio..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-pink-500 text-base" 
            />
          </div>
          <button onClick={() => setShowScanner(true)} className="p-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors shadow-md">
            <Barcode size={24} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <Scissors size={14} className="text-pink-500" /> Servicios Rápidos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {services.map(svc => (
              <button key={svc.id} onClick={() => addToCart(svc, true)} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-pink-300 hover:shadow-sm transition-all text-left active:scale-95">
                <p className="font-bold text-slate-800 text-xs line-clamp-1">{svc.name}</p>
                <p className="text-pink-500 font-black text-sm">${formatPrice(svc.price)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 pb-24 lg:pb-0">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Productos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
              <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock <= 0} className={`bg-white p-2 rounded-2xl border border-slate-200 hover:border-pink-300 hover:shadow-sm transition-all text-left active:scale-95 ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
                  {product.image_url ? <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingCart size={20} /></div>}
                </div>
                <p className="font-bold text-slate-800 text-xs line-clamp-2 h-8 leading-tight mb-1">{product.name}</p>
                <div className="flex justify-between items-end">
                  <p className="text-pink-500 font-black text-sm">${formatPrice(product.price)}</p>
                  <p className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${product.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>STK: {product.stock}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Cart Sidebar */}
      <div className="hidden lg:flex w-96 bg-white rounded-3xl border border-slate-200 flex-col shadow-sm overflow-hidden">
        <CartContent />
      </div>

      {/* Mobile Cart Summary Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div onClick={() => setShowMobileCart(true)} className="flex items-center gap-3 cursor-pointer">
          <div className="relative bg-pink-500 text-white p-3 rounded-2xl">
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cart.length}
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Carrito</p>
            <p className="text-xl font-black text-slate-900">${formatPrice(cartTotal)}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowMobileCart(true)}
          className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
        >
          Ver Carrito
        </button>
      </div>

      {/* Mobile Cart Modal */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end">
          <div className="bg-white w-full rounded-t-[2.5rem] h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col">
            <div className="flex justify-center p-2">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" onClick={() => setShowMobileCart(false)} />
            </div>
            <div className="flex-1 overflow-hidden">
              <CartContent />
            </div>
            <button 
              onClick={() => setShowMobileCart(false)}
              className="absolute top-4 right-4 p-2 text-slate-400"
            >
              <ChevronDown size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Modales de Caja */}
      {showOpenModal && <OpenCashModal onClose={() => setShowOpenModal(false)} onSuccess={checkCashSession} />}
      {showCloseModal && <CashClosingModal expectedCash={activeSession?.opening_balance || 0} sessionId={activeSession?.id} onClose={() => setShowCloseModal(false)} onSuccess={checkCashSession} />}
      
      {/* Modal Caja Cerrada Warning */}
      {!checkingSession && showClosedWarning && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Power size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Caja Cerrada</h3>
                <p className="text-slate-500 font-medium mt-2">Debes abrir la caja para poder realizar ventas y servicios.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => { setShowOpenModal(true); setShowClosedWarning(false); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all active:scale-95">
                  Abrir Caja Ahora
                </button>
                <button onClick={() => setShowClosedWarning(false)} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600">
                  Continuar Cerrada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showScanner && <Scanner onScan={(code) => { setShowScanner(false); const p = products.find(x => x.ean === code); if(p) addToCart(p); else toast.error('No encontrado'); }} onClose={() => setShowScanner(false)} />}
      
      {showCheckout && (
        <div className="fixed inset-0 z-[120] bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Finalizar Venta</h3>
              <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total a cobrar</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">${formatPrice(cartTotal)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descuento %</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input type="number" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} className="w-full pl-9 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none font-bold text-sm" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recargo %</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input type="number" value={surchargePercent} onChange={e => setSurchargePercent(Number(e.target.value))} className="w-full pl-9 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-sm" placeholder="0" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {['efectivo', 'tarjeta', 'cuenta_corriente'].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m as any)} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${paymentMethod === m ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                    {m === 'efectivo' ? <DollarSign size={24} /> : m === 'tarjeta' ? <CreditCard size={24} /> : <Users size={24} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">{m.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
              {paymentMethod === 'cuenta_corriente' && (
                <div className="flex gap-2">
                  <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="flex-1 px-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-pink-500 bg-slate-50 font-bold text-sm">
                    <option value="">Elegir cliente...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} (${formatPrice(c.balance)})</option>)}
                  </select>
                  <button 
                    onClick={() => setShowCustomerModal(true)}
                    className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                    title="Agregar nuevo cliente"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              )}
            </div>
            <div className="p-8 bg-slate-50/50 border-t">
              <button onClick={handleCheckout} disabled={isProcessing} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-base hover:bg-pink-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50">
                {isProcessing ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <>Confirmar Pago <DollarSign size={20} /></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Nuevo Cliente</h3>
              <button onClick={() => setShowCustomerModal(false)} className="p-2 text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-4">
              <input type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-bold" placeholder="Nombre Completo" />
              <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500/20 outline-none font-bold" placeholder="WhatsApp" />
              <button onClick={handleAddCustomer} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95">Crear Cliente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTerminal;