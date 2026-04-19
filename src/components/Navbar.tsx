import React, { useState, useEffect } from 'react';
import { Dog, ShoppingCart, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-200">
            <Dog className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800">PET<span className="text-orange-500">STYLE</span></span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 font-bold text-sm uppercase tracking-widest text-slate-600">
          <a href="#servicios" className="hover:text-orange-500 transition-colors">Servicios</a>
          <a href="#productos" className="hover:text-orange-500 transition-colors">Tienda</a>
          <a href="#limpieza" className="hover:text-orange-500 transition-colors">Limpieza</a>
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-orange-500 transition-all shadow-lg hover:shadow-orange-200 active:scale-95">
            Contacto
          </button>
        </div>

        <div className="md:hidden">
          <Menu size={28} className="text-slate-800" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;