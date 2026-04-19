import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, ShieldCheck, Scissors } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#fafafa]">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-amber-50/50 -skew-x-12 translate-x-20 z-0" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-white border border-slate-100 px-5 py-2.5 rounded-full mb-8 shadow-sm">
              <Scissors size={16} className="text-amber-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Peluquería Canina de Autor</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.95] mb-8 tracking-tighter">
              Cuidado con <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">alma y estilo.</span>
            </h1>
            
            <p className="text-xl text-slate-500 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              En Piamontino transformamos el momento del baño en una experiencia de bienestar total para tu mejor amigo.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <button className="group relative px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-200">
                <span className="relative z-10 flex items-center">
                  Ver Servicios <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-amber-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=pet${i}`} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" alt="Pet" />
                  ))}
                </div>
                <p className="text-sm font-bold text-slate-400">Clientes felices</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative"
          >
            <div className="relative z-10">
              <div className="rounded-[4rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.1)] border-[12px] border-white rotate-2 hover:rotate-0 transition-transform duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800" 
                  alt="Piamontino Pet" 
                  className="w-full h-[600px] object-cover"
                />
              </div>
              
              <div className="absolute -bottom-10 -left-10 bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl z-20 border border-white flex items-center space-x-5 animate-bounce-slow">
                <div className="bg-amber-500 p-4 rounded-2xl text-white shadow-lg shadow-amber-100">
                  <Star size={28} fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">Calidad Premium</p>
                  <p className="text-xs text-slate-400">Atención personalizada</p>
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