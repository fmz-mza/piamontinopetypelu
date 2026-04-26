"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Plus, Minus, Trash2, Barcode, Search, ShoppingCart, DollarSign, CreditCard, X, AlertCircle, Users, Scissors, ChevronUp, Power, Play, Percent, ChevronDown, ArrowRightLeft } from 'lucide-react';
import Scanner from '../shared/Scanner';
import OpenCashModal from './OpenCashModal';
import CashClosingModal from './CashClosingModal';
import toast from 'react-hot-toast';
import SaleDetailModal from './SaleDetailModal'; // Importar el nuevo modal// ... (todas las importaciones y tipos previos permanecen igual) ...

const SalesTerminal: React.FC = () => {
  // ... (todos los estados y hooks previos) ...
  const [showSaleModal, setShowSaleModal] = useState(false); // Nuevo estado para el modal de detalle
  const [viewingSale, setViewingSale] = useState<Sale | null>(null); // Venta que se mostrará en el modal

  // ... (el resto de los hooks y funciones) ...

  // Modificar la función que maneja el clic en el ojo  const handleViewSale = (sale: Sale) => {
    setViewingSale(sale);
    setShowSaleModal(true);
  };

  // ... (dentro del render de la tabla de productos, reemplazar el botón de ojo) ...
  {filteredProducts.map(product => (
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

  {/* Reemplazar el botón de ojo en la tabla de ventas recientes */}
  {filteredData.sales.slice(0, 8).map(sale => (
    <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Eye size={14} />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">{new Date(sale.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{sale.payment_method.replace('_', ' ')}</p>
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

  {/* Renderizar el modal de detalle de venta cuando corresponda */}
  {showSaleModal && (
    <SaleDetailModal 
      isOpen={showSaleModal} 
      onClose={() => setShowSaleModal(false)} 
      sale={viewingSale} 
    />
  )}

  // ... (el resto del componente permanece sin cambios) ...
};

export default SalesTerminal;