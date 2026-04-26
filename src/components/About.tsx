"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Clock, Award } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AboutContent {
  title: string;
  description: string;
}

const defaultContent: AboutContent = {
  title: 'Pasión por lo que hacemos.',
  description: 'En Piamontino, entendemos que tu mascota es parte de tu familia. Por eso, dedicamos cada día a brindar un servicio de excelencia, combinando nuestra experiencia en peluquería canina con una selección premium de productos para su bienestar y el cuidado de tu hogar.'
};

const About = () => {
  const [content, setContent] = useState<AboutContent>(defaultContent);
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
        .eq('section', 'about');

      if (error) throw error;

      if (data && data.length > 0) {
        const contentMap: Record<string, string> = {};
        data.forEach(item => {
          contentMap[item.key] = item.value;
        });
        setContent({
          title: contentMap.title || defaultContent.title,
          description: contentMap.description || defaultContent.description
        });
      }
    } catch (err) {
      console.error('Error fetching about content:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: <Clock size={20} />, label: "15+ Años", sub: "De experiencia" },
    { icon: <Heart size={20} />, label: "1000+", sub: "Mascotas felices" },
    { icon: <Shield size={20} />, label: "Calidad", sub: "Garantizada" },
    { icon: <Award size={20} />, label: "Expertos", sub: "Certificados" }
  ];

  return (
    <section id="nosotros" className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800" 
                alt="Nuestra historia" 
                className="w-full h-[350px] sm:h-[450px] object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-pink-100 rounded-full -z-10 blur-3xl opacity-50" />
            <div className="absolute -top-8 -left-8 w-48 h-48 bg-blue-100 rounded-full -z-10 blur-3xl opacity-50" />
          </div>

          <div className="flex-1">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tighter">
              {content.title.split(' ').map((word, i) => (
                <span key={i} className={word.toLowerCase().includes('hacemos') ? 'text-pink-500' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h2>
            <p className="text-base text-slate-600 mb-8 leading-relaxed">
              {content.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-pink-500">{stat.icon}</div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{stat.label}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;