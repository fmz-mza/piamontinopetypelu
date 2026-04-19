"use client";

import React, { useState, useEffect } from 'react';
import { Menu, Instagram } from 'lucide-react';
import logo from '../assets/logo.jpg';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed w-full z-50 px-4 sm:px-8 py-6">
      <nav className={`mx-auto max-w-7xl transition-all duration-500 rounded-[2rem] px-6 py-3 flex justify-between items-center ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/20' 
          : 'bg-transparent'
      }`}>
        <div className="flex items-center">
          <a href="https://fmz-mza.github.io/piamontinopetypelu/" className="flex items-center">
            <img 
              src={logo} 
              alt="Piamontino Logo" 
              className="h-24 w-auto object-contain mix-blend-multiply transition-transform hover:scale-105"
            />
          </a>
        </div>
        
        <div className="hidden md:flex items-center space-x-10 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-500">
          <a href="#servicios" className="hover:text-pink-500 transition-all">Peluquería</a>
          <a href="#productos" className="hover:text-pink-500 transition-all">Boutique</a>
          <a href="#nosotros" className="hover:text-pink-500 transition-all">Nosotros</a>
        </div>

        <div className="flex items-center space-x-4">
          <a 
            href="https://www.instagram.com/piamontinopetypelu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 text-slate-400 hover:text-pink-500 transition-colors"
          >
            <Instagram size={22} />
          </a>
          <button className="bg-slate-900 text-white px-7 py-3.5 rounded-2xl font-bold text-sm hover:bg-pink-500 transition-all shadow-xl active:scale-95">
            Reservar Turno
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;