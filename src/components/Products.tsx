import React from 'react';
import { ShoppingBag, Star } from 'lucide-react';

const products = [
  {
    name: "Alimento Premium Adulto",
    price: "$45.00",
    tag: "Comida",
    img: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Arnés de Cuero Ajustable",
    price: "$28.50",
    tag: "Accesorios",
    img: "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Limpiador Enzimático",
    price: "$15.90",
    tag: "Limpieza",
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Juguete Interactivo",
    price: "$12.00",
    tag: "Accesorios",
    img: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400"
  }
];

const Products = () => {
  return (
    <section id="productos" className="py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Nuestra Tienda</h2>
            <p className="text-slate-500">Los favoritos de la comunidad para este mes.</p>
          </div>
          <button className="text-orange-500 font-bold flex items-center hover:underline">
            Ver todo el catálogo <ShoppingBag size={20} className="ml-2" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 bg-slate-100">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800">
                  {p.tag}
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">{p.name}</h4>
                  <div className="flex text-orange-400 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <p className="text-xl font-black text-orange-500">{p.price}</p>
                </div>
                <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-orange-500 transition-colors shadow-lg">
                  <ShoppingBag size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;