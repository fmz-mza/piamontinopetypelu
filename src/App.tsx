import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Products from './components/Products';
import Reviews from './components/Reviews';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Products />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}

export default App;