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

interface Customer {
  id: string;
  name: string;
  balance: number;
}

interface CartItem {
  product: Partial<Product> & { id: string; name: string; price: number };
  quantity: number;
}

const QUICK_SERVICES = [
  { id: 'svc_pelu_ch', name: 'Peluquería Chica', price: 15000 },
  { id: 'svc_pelu_md', name: 'Peluquería Mediana', price: 20000 },
  { id: 'svc_pelu_gr', name: 'Peluquería Grande', price: 25000 },
  { id: 'svc_banio', name: 'Baño Higiénico', price: 10000 },
];

const SalesTerminal: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'cuenta_corriente'>('efectivo');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    if (isSupabaseConfigured()) {
      fetchProducts();
      fetchCustomers();
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('name');

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
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, balance')
        .order('name');
      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
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

  const addToCart = (product: Partial<Product> & { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (product.stock !== undefined && existing.quantity >= product.stock) {
          toast.error('Stock insuficiente');
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (item.product.stock !== undefined && newQty > item.product.stock) {
            toast.error('Stock insuficiente');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cuenta_corriente' && !selectedCustomerId) {
      toast.error('Seleccioná un cliente para cuenta corriente');
      return;
    }

    try {
      const items = cart.map(item => ({
        product_id: item.product.id.startsWith('svc_') ? null : item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      const { error: saleError } = await supabase
        .from('sales')
        .insert([{
          total: cartTotal,
          items,
          payment_method: paymentMethod,
          customer_id: paymentMethod === 'cuenta_corriente' ? selectedCustomerId : null
        }]);

      if (saleError) throw saleError;

      // Update stock for physical products only
      for (const item of cart) {
        if (!item.product.id.startsWith('svc_') && item.product.stock !== undefined) {
          const newStock = item.product.stock - item.quantity;
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product.id);
        }
      }

      // Update customer balance if account charge
      if (paymentMethod === 'cuenta_corriente') {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (customer) {
          await supabase
            .from('customers')
            .update({ balance: customer.balance + cartTotal })
            .eq('id', selectedCustomerId);
        }
      }

      toast.success('Venta registrada correctamente');
      setCart([]);
      setShowCheckout(false);
      fetchProducts();
      fetchCustomers();
    } catch (err) {
      console.error('Error processing sale:', err);
      toast.error('Error al procesar la venta');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-amber-800 mb-2">Supabase no configurado</h3>
            <p className="text-amber-700 text-sm">
              Configurá las variables de entorno para usar el POS.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Products Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="px-4 py-2.5 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            <Barcode size={18} />
            <span className="hidden sm:inline">Escanear</span>
          </button>
        </div>

        {/* Quick Services */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Scissors size={16} className="text-pink-500" />
            Servicios Rápidos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_SERVICES.map(svc => (
              <button
                key={svc.id}
                onClick={() => addToCart(svc)}
                className="p-3 bg-white border border-slate-200 rounded-xl hover:border-pink-300 hover:bg-pink-50 transition-all text-left group"
              >
                <p className="text-xs font-bold text-slate-400 group-hover:text-pink-400 transition-colors">SERVICIO</p>
                <p className="font-bold text-slate-800 text-sm line-clamp-1">{svc.name}</p>
                <p className="text-pink-500 font-black">${svc.price.toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Productos</h3>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No hay productos disponibles
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-3 rounded-xl border border-slate-200 hover:border-pink-300 hover:shadow-md transition-all text-left"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingCart size={24} />
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-slate-800 text-sm line-clamp-1">{product.name}</p>
                  <p className="text-pink-500 font-bold">${product.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white rounded-2xl border border-slate-200 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart size={20} className="text-pink-500" />
            Carrito ({cart.length})
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ShoppingCart size={40} className="mx-auto mb-2 opacity-30" />
              <p>El carrito está vacío</p>
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
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Total</span>
            <span className="text-2xl font-black text-slate-800">${cartTotal.toFixed(2)}</span>
          </div>
          
          <button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finalizar Venta
          </button>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <Scanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Confirmar Venta</h3>
              <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-center py-4">
                <p className="text-slate-500 text-sm">Total a pagar</p>
                <p className="text-4xl font-black text-slate-800">${cartTotal.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'efectivo'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <DollarSign size={20} className={paymentMethod === 'efectivo' ? 'text-pink-500' : 'text-slate-400'} />
                  <span className={`text-xs font-medium ${paymentMethod === 'efectivo' ? 'text-pink-600' : 'text-slate-600'}`}>
                    Efectivo
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'tarjeta'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CreditCard size={20} className={paymentMethod === 'tarjeta' ? 'text-pink-500' : 'text-slate-400'} />
                  <span className={`text-xs font-medium ${paymentMethod === 'tarjeta' ? 'text-pink-600' : 'text-slate-600'}`}>
                    Tarjeta
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod('cuenta_corriente')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'cuenta_corriente'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Users size={20} className={paymentMethod === 'cuenta_corriente' ? 'text-pink-500' : 'text-slate-400'} />
                  <span className={`text-xs font-medium ${paymentMethod === 'cuenta_corriente' ? 'text-pink-600' : 'text-slate-600'}`}>
                    Cta. Cte.
                  </span>
                </button>
              </div>

              {paymentMethod === 'cuenta_corriente' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-600">Seleccionar Cliente</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none"
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
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors"
              >
                Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTerminal;