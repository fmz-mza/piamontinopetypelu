"use client";

import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, Package, Menu, X, MessageSquare, Scissors, Calendar } from 'lucide-react';

const tabs = [
  { id: 'inicio', label: 'Inicio', icon: Home, path: '/admin' },
  { id: 'catalogo', label: 'Catálogo', icon: Package, path: '/admin/catalogo' },
  { id: 'servicios', label: 'Servicios', icon: Scissors, path: '/admin/servicios' },
  { id: 'turnos', label: 'Turnos', icon: Calendar, path: '/admin/turnos' },
  { id: 'resenas', label: 'Reseñas', icon: MessageSquare, path: '/admin/resenas' },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentTab = 
    location.pathname === '/admin/catalogo' ? 'catalogo' : 
    location.pathname === '/admin/servicios' ? 'servicios' :
    location.pathname === '/admin/turnos' ? 'turnos' :
    location.pathname === '/admin/resenas' ? 'resenas' : 'inicio';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-bold text-slate-800">Admin</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    currentTab === tab.id
                      ? 'bg-pink-50 text-pink-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <Link to="/pos" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Ir a POS</Link>
              <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {tabs.map((tab) => (
                <Link key={tab.id} to={tab.path} onClick={() => setMobileMenuOpen(false)} className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${currentTab === tab.id ? 'bg-pink-50 text-pink-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;