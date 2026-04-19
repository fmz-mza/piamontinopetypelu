"use client";

import React from 'react';
import { Scissors, Droplets, Heart, Sparkles } from 'lucide-react';

const services = [
  {
    title: "Peluquería Pro",
    desc: "Peluquería de alta gama más de 15 años de experiencia",
    icon: <Scissors size={28} />,
    className: "md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white",
    iconBg: "bg-orange-500"
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
    className: "md:col-span-2 bg-orange-500 text-white",
    iconBg: "bg-white/20"
  }
];

const Services = () => {
  return (
    <section id="servicios" className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-xl">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Más que una tienda, <br /><span className="text-orange-500">un estilo de vida.</span></h2>
            <p className="text-lg text-slate-500 font-medium">Diseñamos experiencias únicas para que la convivencia con tu mascota sea perfecta.</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-2xl flex space-x-2">
            <button className="px-6 py-3 bg-white shadow-sm rounded-xl font-bold text-sm">Nuestros Servicios</button>
            <button className="px-6 py-3 text-slate-400 font-bold text-sm hover:text-slate-600">Ver Galería</button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className={`${s.className} p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-slate-100/50`}>
              <div className={`${s.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                <div className="text-white">{s.icon}</div>
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{s.title}</h3>
              <p className={`${s.className.includes('text-white') ? 'text-white/70' : 'text-slate-500'} text-lg leading-relaxed`}>
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