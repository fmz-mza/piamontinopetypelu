"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Plus, Minus, Trash2, Barcode, Search, ShoppingCart, DollarSign, CreditCard, X, AlertCircle, Users, Scissors, ChevronUp } from 'lucide-react';
import Scanner from '../shared/Scanner';
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
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    if (isSupabaseConfigured()) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
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
      toast.error(`Error al cargar datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (code: string) => {
    setShowScanner(false);
    const product = products.find(p => p.ean === code);
    if (product) {
      if (product.stock <= 0) {
        toast.error('Producto sin stock');
        return;
      }
      addToCart(product);
    } else {
      toast.error('Producto no encontrado');
    }
  };

  const addToCart = (item: any, isService = false) => {
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

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    if (paymentMethod === 'cuenta_corriente' && !selectedCustomerId) {
      toast.error('Seleccioná un cliente');
      return;
    }

    setIsProcessing(true);
    try {
      const { data: saleData, error: saleError } = await supabase
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
        }])
        .select();

      if (saleError) throw saleError;

      for (const item of cart) {
        if (!item.product.isService) {
          const prod = products.find(p => p.id === item.product.id);
          if (prod) {
            const { error: stockError } = await supabase
              .from('products')
              .update({ stock: prod.stock - item.quantity })
              .eq('id', prod.id);
          }
        }
      }

      if (paymentMethod === 'cuenta_corriente') {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (customer) {
          const { error: custError } = await supabase
            .from('customers')
            .update({ balance: customer.balance + cartTotal })
            .eq('id', selectedCustomerId);
          if (custError) throw custError;
        }
      }

      toast.success('Venta realizada con éxito');
      setCart([]);
      setShowCheckout(false);
      setShowMobileCart(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error al procesar venta:', err);
      toast.error(`Error al procesar: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ean?.includes(searchTerm)
  );

  if (!isConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-amber-800 mb-2">Supabase no configurado</h3>
            <p className="text-amber-700 text-sm">Configurá las variables de entorno para usar el terminal de ventas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] relative">
      {/* Main Area: Products & Services */}
      <div className="flex-1 flex flex-col min-h-0 pb-20 lg:pb-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-pink-500 text-base" 
            />
          </div>
          <button 
            onClick={() => setShowScanner(true)} 
            className="p-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors shadow-md"
          >
            <Barcode size={24} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <Scissors size={14} className="text-pink-500" /> Servicios Rápidos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {services.map(svc => (
              <button 
                key={svc.id} 
                onClick={() => addToCart(svc, true)} 
                className="p-3 bg-white border border-slate-200 rounded-xl hover:border-pink-300 hover:shadow-sm transition-all text-left active:scale-95"
              >
                <p className="font-bold text-slate-800 text-xs line-clamp-1">{svc.name}</p>
                <p className="text-pink-500 font-black text-sm">${svc.price.toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Productos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
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
                  <p className="text-pink-500 font-black text-sm">${product.price.toFixed(2)}</p>
                  <p className="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">STK: {product.stock}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar Cart */}
      <div className="hidden lg:flex w-96 bg-white rounded-3xl border border-slate-200 flex-col shadow-sm overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest text-sm">
            <ShoppingCart size={18} className="text-pink-500" /> Carrito ({cart.length})
          </h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-[10px] text-red-500 font-black uppercase hover:underline">Vaciar</button>
          )}
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
                  <p className="text-pink-500 font-black text-sm">${item.product.price.toFixed(2)}</p>
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
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Total a cobrar</span>
            <span className="text-3xl font-black text-slate-900">${cartTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => setShowCheckout(true)} 
            disabled={cart.length === 0 || isProcessing} 
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-pink-500 transition-all disabled:opacity-50 active:scale-95"
          >
            Cobrar Ahora
          </button>
        </div>
      </div>

      {/* Mobile Floating Cart Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 z-40">
        <button 
          onClick={() => setShowMobileCart(true)}
          disabled={cart.length === 0}
          className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between active:scale-95 transition-transform disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Total</p>
              <p className="text-xl font-black leading-none">${cartTotal.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs">
            Ver Carrito <ChevronUp size={18} />
          </div>
        </button>
      </div>

      {/* Mobile Cart Drawer */}
      {showMobileCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest text-sm">
                Tu Compra ({cart.length})
              </h2>
              <button onClick={() => setShowMobileCart(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{item.product.name}</p>
                    <p className="text-pink-500 font-black text-base">${item.product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-100">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400"><Minus size={16} /></button>
                    <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400"><Plus size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t bg-white space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Total</span>
                <span className="text-3xl font-black text-slate-900">${cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => setShowCheckout(true)}
                className="w-full py-5 bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest text-base shadow-xl active:scale-95"
              >
                Continuar al Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {showScanner && <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      
      {showCheckout && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Finalizar Venta</h3>
              <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total a cobrar</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">${cartTotal.toFixed(2)}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'efectivo', icon: DollarSign, label: 'Efectivo' },
                  { id: 'tarjeta', icon: CreditCard, label: 'Tarjeta' },
                  { id: 'cuenta_corriente', icon: Users, label: 'Cta. Cte.' }
                ].map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setPaymentMethod(m.id as any)} 
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${paymentMethod === m.id ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    <m.icon size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'cuenta_corriente' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Cliente</label>
                  <select 
                    value={selectedCustomerId} 
                    onChange={(e) => setSelectedCustomerId(e.target.value)} 
                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 outline-none focus:border-pink-500 bg-slate-50 font-bold text-sm appearance-none"
                  >
                    <option value="">Elegir cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (Saldo: ${c.balance.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="p-8 bg-slate-50/50 border-t">
              <button 
                onClick={handleCheckout} 
                disabled={isProcessing}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-base hover:bg-pink-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Confirmar Pago <DollarSign size={20} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTerminal;