"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Clock, Award } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: <Clock size={24} />, label: "15+ Años", sub: "De experiencia" },
    { icon: <Heart size={24} />, label: "1000+", sub: "Mascotas felices" },
    { icon: <Shield size={24} />, label: "Calidad", sub: "Garantizada" },
    { icon: <Award size={24} />, label: "Expertos", sub: "Certificados" }
  ];

  return (
    <section id="nosotros" className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800" 
                alt="Nuestra historia" 
                className="w-full h-[500px] object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-100 rounded-full -z-10 blur-3xl opacity-50" />
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-100 rounded-full -z-10 blur-3xl opacity-50" />
          </div>

          <div className="flex-1">
            <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">
              Pasión por lo que <span className="text-pink-500">hacemos.</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              En Piamontino, entendemos que tu mascota es parte de tu familia. Por eso, dedicamos cada día a brindar un servicio de excelencia, combinando nuestra experiencia en peluquería canina con una selección premium de productos para su bienestar y el cuidado de tu hogar.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-pink-500">{stat.icon}</div>
                  <div>
                    <p className="font-black text-slate-900">{stat.label}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.sub}</p>
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