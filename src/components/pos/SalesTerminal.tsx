"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Plus, Minus, Trash2, Barcode, Search, ShoppingCart, DollarSign, CreditCard, X, AlertCircle, Users, Scissors } from 'lucide-react';
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
      // 1. Registrar la venta
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

      // 2. Actualizar stock de productos
      for (const item of cart) {
        if (!item.product.isService) {
          const prod = products.find(p => p.id === item.product.id);
          if (prod) {
            const { error: stockError } = await supabase
              .from('products')
              .update({ stock: prod.stock - item.quantity })
              .eq('id', prod.id);
            
            if (stockError) console.error(`Error actualizando stock de ${prod.name}:`, stockError);
          }
        }
      }

      // 3. Actualizar saldo de cliente si es Cta. Cte.
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
      await fetchData();
    } catch (err: any) {
      console.error('Error al procesar venta:', err);
      toast.error(`Error al procesar: ${err.message || 'Verificá las tablas en Supabase'}`);
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
            <p className="text-amber-700 text-sm">
              Configurá las variables de entorno para usar el terminal de ventas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar productos por nombre o EAN..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-pink-500" 
            />
          </div>
          <button 
            onClick={() => setShowScanner(true)} 
            className="px-4 py-2.5 bg-pink-500 text-white rounded-xl flex items-center gap-2 hover:bg-pink-600 transition-colors"
          >
            <Barcode size={18} /> 
            <span className="hidden sm:inline">Escanear</span>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Scissors size={16} className="text-pink-500" /> Servicios Rápidos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {services.map(svc => (
              <button 
                key={svc.id} 
                onClick={() => addToCart(svc, true)} 
                className="p-3 bg-white border border-slate-200 rounded-xl hover:border-pink-300 hover:shadow-sm transition-all text-left"
              >
                <p className="font-bold text-slate-800 text-sm line-clamp-1">{svc.name}</p>
                <p className="text-pink-500 font-black">${svc.price.toLocaleString()}</p>
              </button>
            ))}
            {services.length === 0 && (
              <p className="text-xs text-slate-400 col-span-full italic">No hay servicios configurados</p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Productos en Stock</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <button 
                key={product.id} 
                onClick={() => addToCart(product)} 
                disabled={product.stock <= 0}
                className={`bg-white p-3 rounded-xl border border-slate-200 hover:border-pink-300 hover:shadow-sm transition-all text-left ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2">
                  {product.image_url ? (
                    <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingCart size={24} />
                    </div>
                  )}
                </div>
                <p className="font-medium text-slate-800 text-sm line-clamp-1">{product.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-pink-500 font-bold">${product.price.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">Stock: {product.stock}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart size={20} className="text-pink-500" /> Carrito ({cart.length})
          </h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs text-red-500 font-bold hover:underline">Vaciar</button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <ShoppingCart size={40} className="opacity-20" />
              <p className="text-sm">El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{item.product.name}</p>
                  <p className="text-pink-500 font-bold text-sm">${item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.product.id, -1)} 
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product.id, 1)} 
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t space-y-4 bg-slate-50/50 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Total</span>
            <span className="text-2xl font-black text-slate-800">${cartTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => setShowCheckout(true)} 
            disabled={cart.length === 0 || isProcessing} 
            className="w-full py-4 bg-pink-500 text-white rounded-xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
          >
            Finalizar Venta
          </button>
        </div>
      </div>

      {showScanner && <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Confirmar Venta</h3>
              <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-center py-4">
                <p className="text-slate-500 text-sm">Total a pagar</p>
                <p className="text-4xl font-black text-slate-800">${cartTotal.toFixed(2)}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'efectivo', icon: DollarSign, label: 'Efectivo' },
                  { id: 'tarjeta', icon: CreditCard, label: 'Tarjeta' },
                  { id: 'cuenta_corriente', icon: Users, label: 'Cta. Cte.' }
                ].map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setPaymentMethod(m.id as any)} 
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${paymentMethod === m.id ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    <m.icon size={20} />
                    <span className="text-[10px] font-bold uppercase">{m.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'cuenta_corriente' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Seleccionar Cliente</label>
                  <select 
                    value={selectedCustomerId} 
                    onChange={(e) => setSelectedCustomerId(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-pink-500 bg-slate-50"
                  >
                    <option value="">Elegir cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (Saldo: ${c.balance.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <button 
                onClick={handleCheckout} 
                disabled={isProcessing}
                className="w-full py-4 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Confirmar Venta'
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