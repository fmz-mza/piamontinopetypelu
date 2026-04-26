"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Scissors } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface HeroContent {
  title: string;
  subtitle: string;
  cta_text: string;
}

const defaultContent: HeroContent = {
  title: 'Cuidado con alma y estilo.',
  subtitle: 'Tu mascota feliz, tu casa radiante. En Piamontino encontrás el equilibrio perfecto: nutrición, accesorios y peluquería de primer nivel, junto a una selección exclusiva de artículos de limpieza.',
  cta_text: 'Ver Servicios'
};

const Hero = () => {
  const [content, setContent] = useState<HeroContent>(defaultContent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchContent();
    }
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('key, value')
        .eq('section', 'hero');

      if (error) throw error;

      if (data && data.length > 0) {
        const contentMap: Record<string, string> = {};
        data.forEach(item => {
          contentMap[item.key] = item.value;
        });
        setContent({
          title: contentMap.title || defaultContent.title,
          subtitle: contentMap.subtitle || defaultContent.subtitle,
          cta_text: contentMap.cta_text || defaultContent.cta_text
        });
      }
    } catch (err) {
      console.error('Error fetching hero content:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center pt-24 lg:pt-16 pb-12 overflow-hidden bg-[#fafafa]">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-amber-50/50 -skew-x-12 translate-x-20 z-0" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-white border border-slate-100 px-4 py-2 rounded-full mb-6 shadow-sm max-w-full">
              <Scissors size={14} className="text-pink-500 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-400 leading-tight">
                Petshop • Peluquería • Limpieza
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[0.95] mb-6 tracking-tighter">
              {content.title.split(' ').map((word, i) => (
                <span key={i} className={i === content.title.split(' ').length - 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {content.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
              <button className="w-full sm:w-auto group relative px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-bold text-base overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-200">
                <span className="relative z-10 flex items-center justify-center">
                  {content.cta_text} <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-pink-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=pet${i}`} className="w-10 h-10 rounded-full border-4 border-white shadow-sm" alt="Pet" />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-400">Clientes felices</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative w-full lg:w-auto"
          >
            <div className="relative z-10">
              <div className="rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.1)] border-[6px] sm:border-[10px] border-white rotate-2 hover:rotate-0 transition-transform duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800" 
                  alt="Piamontino Pet" 
                  className="w-full h-[300px] sm:h-[500px] object-cover"
                />
              </div>
              
              <div className="absolute -bottom-4 -left-4 sm:-bottom-8 sm:-left-8 bg-white/90 backdrop-blur-xl p-3 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl z-20 border border-white flex items-center space-x-3 sm:space-x-4 animate-bounce-slow">
                <div className="bg-pink-500 p-2 sm:p-3 rounded-xl text-white shadow-lg shadow-pink-100">
                  <Star size={18} className="sm:w-6 sm:h-6" fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-black text-slate-800">Calidad Premium</p>
                  <p className="text-[8px] sm:text-[10px] text-slate-400">Atención personalizada</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;