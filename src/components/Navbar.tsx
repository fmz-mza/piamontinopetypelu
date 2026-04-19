import React, { useState, useEffect } from 'react';
import { Dog, ShoppingBag, Menu, Heart } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed w-full z-50 px-4 sm:px-8 py-6">
      <nav className={`mx-auto max-w-7xl transition-all duration-500 rounded-[2rem] px-6 py-4 flex justify-between items-center ${
        isScrolled 
          ? 'bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/20' 
          : 'bg-transparent'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-orange-500 to-amber-400 p-2.5 rounded-2xl shadow-lg shadow-orange-200 rotate-3">
            <Dog className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">
            PET<span className="text-orange-500">STYLE</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-10 font-bold text-[13px] uppercase tracking-[0.15em] text-slate-500">
          <a href="#servicios" className="hover:text-orange-500 transition-all hover:scale-105">Servicios</a>
          <a href="#productos" className="hover:text-orange-500 transition-all hover:scale-105">Tienda</a>
          <a href="#limpieza" className="hover:text-orange-500 transition-all hover:scale-105">Limpieza</a>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-3 text-slate-400 hover:text-orange-500 transition-colors relative">
            <Heart size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="bg-slate-900 text-white px-7 py-3.5 rounded-2xl font-bold text-sm hover:bg-orange-500 transition-all shadow-xl hover:shadow-orange-200 active:scale-95">
            Contacto
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;