"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Package } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  tag?: string;
  category?: string;
  image_url: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sectionContent, setSectionContent] = useState({
    title: "Nuestra Tienda",
    subtitle: "Los favoritos de la comunidad para este mes."
  });

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchProducts();
      fetchSectionContent();
    }
  }, []);

  const fetchSectionContent = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('key, value')
        .eq('section', 'products');

      if (error) throw error;
      if (data) {
        const contentMap: Record<string, string> = {};
        data.forEach(item => contentMap[item.key] = item.value);
        setSectionContent({
          title: contentMap.title || "Nuestra Tienda",
          subtitle: contentMap.subtitle || "Los favoritos de la comunidad para este mes."
        });
      }
    } catch (err) {
      console.error('Error fetching products section content:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(4)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <section id="productos" className="py-16 sm:py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">{sectionContent.title}</h2>
            <p className="text-slate-500 text-sm sm:text-base">{sectionContent.subtitle}</p>
          </div>
          <button className="text-pink-500 font-bold text-sm flex items-center hover:underline">
            Ver todo el catálogo <ShoppingBag size={18} className="ml-2" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
            <Package className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-500 text-sm">Próximamente más productos disponibles.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((p) => (
              <div key={p.id} className="group cursor-pointer">
                <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 bg-slate-100">
                  {p.image_url ? (
                    <img 
                      src={p.image_url} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Package size={40} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-800">
                    {p.category || 'Destacado'}
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{p.name}</h4>
                    <div className="flex text-pink-400 mb-1.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                    <p className="text-lg font-black text-pink-500">${formatPrice(p.price)}</p>
                  </div>
                  <button className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-pink-500 transition-colors shadow-lg">
                    <ShoppingBag size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;