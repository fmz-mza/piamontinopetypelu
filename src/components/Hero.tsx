import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} className="text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Nueva Colección 2024</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
              Todo lo que tu <span className="text-orange-500">mejor amigo</span> necesita.
            </h1>
            <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Desde peluquería canina profesional hasta los mejores accesorios y artículos de limpieza. Cuidamos a tu mascota como si fuera nuestra.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button className="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center group">
                Ver Tienda
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto bg-white border-2 border-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                Nuestros Servicios
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800" 
                alt="Happy Dog" 
                className="w-full h-[500px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl z-20 flex items-center space-x-4 border border-slate-50">
              <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Peluquería</p>
                <p className="text-lg font-black text-slate-800">¡Cupos Libres!</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;