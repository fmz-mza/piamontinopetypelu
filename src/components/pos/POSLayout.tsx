"use client";

import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { ShoppingCart, Package, DollarSign, Menu, X } from 'lucide-react';

const tabs = [
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart, path: '/pos' },
  { id: 'stock', label: 'Stock', icon: Package, path: '/pos/stock' },
  { id: 'gestion', label: 'Gestión', icon: DollarSign, path: '/pos/gestion' },
];

const POSLayout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentTab = location.pathname === '/pos' ? 'ventas' : 
    location.pathname === '/pos/stock' ? 'stock' : 'gestion';

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-bold text-slate-800">POS</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    currentTab === tab.id
                      ? 'bg-pink-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <Link
                to="/admin"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Admin
              </Link>
              <button
                className="md:hidden p-2 text-slate-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                    currentTab === tab.id
                      ? 'bg-pink-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default POSLayout;