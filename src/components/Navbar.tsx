"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram, LayoutDashboard, ShoppingCart, Scissors, ShoppingBag, Users } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import BookingModal from './shared/BookingModal';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    
    // Si no estamos en la home, primero navegamos a la home
    if (location.pathname !== '/') {
      navigate('/');
      // Esperamos un momento a que cargue la home antes de scrollear
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { name: 'Peluquería', id: 'servicios', icon: Scissors },
    { name: 'Boutique', id: 'productos', icon: ShoppingBag },
    { name: 'Nosotros', id: 'nosotros', icon: Users },
  ];

  const adminLinks = [
    { name: 'Admin', to: '/admin', icon: LayoutDashboard },
    { name: 'POS', to: '/pos', icon: ShoppingCart },
  ];

  return (
    <>
      <div className="fixed w-full z-50 px-4 sm:px-8 py-6">
        <nav className={`mx-auto max-w-7xl transition-all duration-500 rounded-[2rem] px-6 py-3 flex justify-between items-center ${
          isScrolled || isMobileMenuOpen
            ? 'bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/20' 
            : 'bg-transparent'
        }`}>
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="Piamontino Logo" 
                className="h-12 sm:h-16 w-auto object-contain mix-blend-multiply transition-transform hover:scale-105"
              />
            </Link>
            
            {/* Desktop Admin Links */}
            <div className="hidden lg:flex items-center space-x-4">
              {adminLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.to} 
                  className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-pink-500 transition-colors"
                >
                  <link.icon size={14} />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-10 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-500">
            {navLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={() => scrollToSection(link.id)}
                className="hover:text-pink-500 transition-all uppercase tracking-[0.2em]"
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <a 
              href="https://www.instagram.com/piamontinopetypelu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:block p-3 text-slate-400 hover:text-pink-500 transition-colors"
            >
              <Instagram size={22} />
            </a>
            <button 
              onClick={() => setIsBookingOpen(true)}
              className="hidden sm:block bg-slate-900 text-white px-7 py-3.5 rounded-2xl font-bold text-sm hover:bg-pink-500 transition-all shadow-xl active:scale-95"
            >
              Reservar Turno
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 text-slate-600 hover:text-pink-500 transition-colors md:hidden"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 mx-auto max-w-7xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-top duration-300">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {adminLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-3xl hover:bg-pink-50 transition-colors group"
                  >
                    <link.icon size={24} className="text-slate-400 group-hover:text-pink-500 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-pink-600">{link.name}</span>
                  </Link>
                ))}
              </div>

              <div className="space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.id)}
                    className="w-full flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                      <link.icon size={20} />
                    </div>
                    <span className="font-bold text-slate-700">{link.name}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsBookingOpen(true);
                }}
                className="w-full bg-pink-500 text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-pink-100 active:scale-95 transition-all"
              >
                Reservar Turno
              </button>
            </div>
          </div>
        )}
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />
    </>
  );
};

export default Navbar;