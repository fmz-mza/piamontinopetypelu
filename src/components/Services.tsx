import React from 'react';
import { Scissors, Droplets, Heart, ShieldCheck } from 'lucide-react';

const services = [
  {
    title: "Peluquería Canina",
    desc: "Cortes de raza, baños terapéuticos y spa para que luzcan increíbles.",
    icon: <Scissors size={32} />,
    color: "bg-blue-500",
    light: "bg-blue-50"
  },
  {
    title: "Artículos de Limpieza",
    desc: "Productos especializados para mantener tu hogar impecable y libre de olores.",
    icon: <Droplets size={32} />,
    color: "bg-emerald-500",
    light: "bg-emerald-50"
  },
  {
    title: "Cuidado Integral",
    desc: "Asesoramiento personalizado para la salud y bienestar de tu mascota.",
    icon: <Heart size={32} />,
    color: "bg-rose-500",
    light: "bg-rose-50"
  },
  {
    title: "Garantía de Calidad",
    desc: "Solo trabajamos con las mejores marcas del mercado internacional.",
    icon: <ShieldCheck size={32} />,
    color: "bg-orange-500",
    light: "bg-orange-50"
  }
];

const Services = () => {
  return (
    <section id="servicios" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Servicios Profesionales</h2>
          <p className="text-slate-500">Nos especializamos en el cuidado estético y la higiene del hogar para dueños de mascotas exigentes.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group border border-slate-100">
              <div className={`${s.light} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <div className={`text-white p-3 rounded-xl ${s.color}`}>
                  {s.icon}
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;