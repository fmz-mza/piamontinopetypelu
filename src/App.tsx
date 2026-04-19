import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Landing Page Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Products from './components/Products';
import About from './components/About';
import Reviews from './components/Reviews';
import Footer from './components/Footer';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import LandingEditor from './components/admin/LandingEditor';
import ProductManager from './components/admin/ProductManager';

// POS Components
import POSLayout from './components/pos/POSLayout';
import SalesTerminal from './components/pos/SalesTerminal';
import InventoryManager from './components/pos/InventoryManager';
import AccountingDashboard from './components/pos/AccountingDashboard';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Products />
        <About />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<LandingEditor />} />
          <Route path="catalogo" element={<ProductManager />} />
        </Route>
        
        {/* POS Routes */}
        <Route path="/pos" element={<POSLayout />}>
          <Route index element={<SalesTerminal />} />
          <Route path="stock" element={<InventoryManager />} />
          <Route path="gestion" element={<AccountingDashboard />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;