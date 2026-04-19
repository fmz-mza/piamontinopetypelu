import React from 'react';
import { Dog, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-orange-500 p-2 rounded-xl">
                <Dog className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight">PET<span className="text-orange-500">STYLE</span></span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Tu tienda de confianza para el cuidado integral de tus mascotas. Calidad, amor y profesionalismo en cada servicio.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-orange-500">Enlaces</h4>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Inicio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Peluquería</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tienda Online</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Limpieza</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-orange-500">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="bg-slate-800 p-3 rounded-xl hover:bg-orange-500 transition-all"><Instagram size={20} /></a>
              <a href="#" className="bg-slate-800 p-3 rounded-xl hover:bg-orange-500 transition-all"><Facebook size={20} /></a>
              <a href="#" className="bg-slate-800 p-3 rounded-xl hover:bg-orange-500 transition-all"><Twitter size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
          <p>© 2024 PetStyle Shop. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;