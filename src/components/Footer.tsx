"use client";

import React from 'react';
import { Instagram, Facebook, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-6 bg-white p-3 rounded-3xl">
              <img 
                src={logo} 
                alt="Piamontino Logo" 
                className="h-28 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Peluquería de alta gama y petshop especializado, con más de 15 años de experiencia. Cuidamos a tu mascota como si fuera nuestra, con productos de primera línea y mucho amor, TE ESPERAMOS!!
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-pink-500">Contacto</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li className="flex items-center space-x-3">
                <MapPin size={18} className="text-pink-500" />
                <span>Tandil 462 Dorrego Mendoza, Argentina</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-pink-500" />
                <span>Solicitá tu turno por WhatsApp</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-pink-500">Comunidad</h4>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/piamontinopetypelu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-800 p-3 rounded-xl hover:bg-pink-600 transition-all"
              >
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-slate-800 p-3 rounded-xl hover:bg-blue-600 transition-all">
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
          <p>© 2026 Piamontino Pet & Pelu. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;