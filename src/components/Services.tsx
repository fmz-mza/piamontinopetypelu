"use client";

import React, { useState, useEffect } from 'react';
import { Scissors, Droplets, Heart, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ServicesContent {
  title: string;
  subtitle: string;
}

const defaultContent: ServicesContent = {
  title: 'Más que una tienda, un estilo de vida.',
  subtitle: 'Diseñamos experiencias únicas para que la convivencia con tu mascota sea perfecta.'
};

const Services = () => {
  const [content, setContent] = useState<ServicesContent>(defaultContent);
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
        .eq('section', 'services');

      if (error) throw error;

      if (data && data.length > 0) {
        const contentMap: Record<string, string> = {};
        data.forEach(item => {
          contentMap[item.key] = item.value;
        });
        setContent({
          title: contentMap.title || defaultContent.title,
          subtitle: contentMap.subtitle || defaultContent.subtitle
        });
      }
    } catch (err) {
      console.error('Error fetching services content:', err);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      title: "Peluquería Pro",
      desc: "Peluquería de alta gama más de 15 años de experiencia",
      icon: <Scissors size={28} />,
      className: "md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white",
      iconBg: "bg-pink-500"
    },
    {
      title: "Hogar Limpio",
      desc: "Donde encontrarás artículos de limpieza indispensables para toda tu familia",
      icon: <Droplets size={28} />,
      className: "bg-white",
      iconBg: "bg-blue-500"
    },
    {
      title: "Bienestar",
      desc: "Cuidado preventivo alimentos premium, recetados, fuentes de agua con filtro, pipetas y más...",
      icon: <Heart size={28} />,
      className: "bg-white",
      iconBg: "bg-rose-500"
    },
    {
      title: "Spa Day",
      desc: "Masajes y aromaterapia para mascotas estresadas.",
      icon: <Sparkles size={28} />,
      className: "md:col-span-2 bg-pink-500 text-white",
      iconBg: "bg-white/20"
    }
  ];

  return (
    <section id="servicios" className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tighter">
              {content.title.split(' ').map((word, i) => (
                <span key={i} className={content.title.toLowerCase().includes('estilo de vida') && i >= content.title.split(' ').length - 3 ? 'text-pink-500' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h2>
            <p className="text-base text-slate-500 font-medium">{content.subtitle}</p>
          </div>
          <div className="bg-slate-50 p-1.5 rounded-2xl flex space-x-1">
            <button className="px-5 py-2.5 bg-white shadow-sm rounded-xl font-bold text-xs">Nuestros Servicios</button>
            <button className="px-5 py-2.5 text-slate-400 font-bold text-xs hover:text-slate-600">Ver Galería</button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <div key={i} className={`${s.className} p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer border border-slate-100/50`}>
              <div className={`${s.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                <div className="text-white">{s.icon}</div>
              </div>
              <h3 className="text-xl font-black mb-3 tracking-tight">{s.title}</h3>
              <p className={`${s.className.includes('text-white') ? 'text-white/70' : 'text-slate-500'} text-base leading-relaxed`}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;