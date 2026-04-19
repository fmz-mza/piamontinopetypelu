import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, ShieldCheck } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#fafafa]">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-50/50 -skew-x-12 translate-x-20 z-0" />
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-blue-100/40 rounded-full blur-[100px] animate-pulse" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-white border border-slate-100 px-5 py-2.5 rounded-full mb-8 shadow-sm">
              <Sparkles size={18} className="text-orange-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Premium Pet Care 2024</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.95] mb-8 tracking-tighter">
              Amor puro, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">estilo único.</span>
            </h1>
            
            <p className="text-xl text-slate-500 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Elevamos el bienestar de tu mascota con servicios de peluquería de élite y productos seleccionados para un hogar impecable.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <button className="group relative px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-200">
                <span className="relative z-10 flex items-center">
                  Explorar Tienda <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" alt="User" />
                ))}
                <div className="w-12 h-12 rounded-full bg-orange-100 border-4 border-white flex items-center justify-center text-orange-600 font-bold text-xs">
                  +2k
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative"
          >
            <div className="relative z-10">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400 rounded-full flex items-center justify-center rotate-12 shadow-xl z-20 border-8 border-white">
                <div className="text-center text-white">
                  <p className="text-[10px] font-black uppercase">Desde</p>
                  <p className="text-2xl font-black">$19</p>
                </div>
              </div>
              
              <div className="rounded-[4rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.1)] border-[12px] border-white rotate-2 hover:rotate-0 transition-transform duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800" 
                  alt="Dog Spa" 
                  className="w-full h-[600px] object-cover"
                />
              </div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-10 -left-10 bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl z-20 border border-white flex items-center space-x-5 animate-bounce-slow">
                <div className="bg-green-500 p-4 rounded-2xl text-white shadow-lg shadow-green-100">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">Servicio Certificado</p>
                  <div className="flex text-amber-400 mt-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
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