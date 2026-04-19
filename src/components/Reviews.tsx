import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';

const reviews = [
  {
    name: "Mariana González",
    time: "Hace 2 semanas",
    text: "Excelente atención en la peluquería. Mi caniche quedó hermoso y lo trataron con mucho amor. Los productos de limpieza que compré también son de 10, realmente quitan el olor.",
    rating: 5,
    img: "https://i.pravatar.cc/150?u=mariana"
  },
  {
    name: "Juan Pablo Sosa",
    time: "Hace 1 mes",
    text: "La mejor tienda de la zona. Tienen variedad de marcas de comida que no se consiguen en otros lados. El envío a domicilio fue súper rápido. Muy recomendables.",
    rating: 5,
    img: "https://i.pravatar.cc/150?u=juan"
  },
  {
    name: "Lucía Fernández",
    time: "Hace 3 días",
    text: "Llevé a mi gato para un baño y salió súper tranquilo. Se nota que saben lo que hacen. Además, el local está impecable y huele muy bien.",
    rating: 5,
    img: "https://i.pravatar.cc/150?u=lucia"
  }
];

const Reviews = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center space-x-2 mb-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Maps_icon_%282020%29.svg" 
              alt="Google Maps" 
              className="w-6 h-6"
            />
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Reseñas en Google</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4">Lo que dicen nuestros clientes</h2>
          <div className="flex items-center space-x-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <span className="font-bold text-slate-700">4.9 / 5.0</span>
            <span className="text-slate-400">(+150 reseñas)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <img src={r.img} alt={r.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center">
                      {r.name}
                      <CheckCircle2 size={14} className="ml-1 text-blue-500" />
                    </h4>
                    <p className="text-xs text-slate-400">{r.time}</p>
                  </div>
                </div>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
                  alt="Google" 
                  className="w-5 h-5 opacity-20"
                />
              </div>
              
              <div className="flex text-amber-400 mb-4">
                {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              
              <p className="text-slate-600 text-sm leading-relaxed flex-grow italic">
                "{r.text}"
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="text-blue-600 font-bold hover:underline flex items-center mx-auto">
            Ver todas las reseñas en Google Maps
          </button>
        </div>
      </div>
    </section>
  );
};

export default Reviews;