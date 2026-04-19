import React from 'react';
import { Quote } from 'lucide-react';

const reviews = [
  {
    name: "Carla Méndez",
    pet: "Dueña de Max (Golden)",
    text: "La peluquería es increíble. Max siempre sale feliz y oliendo delicioso. ¡Súper recomendados!",
    img: "https://i.pravatar.cc/150?u=carla"
  },
  {
    name: "Roberto Ruiz",
    pet: "Dueño de Luna (Gato)",
    text: "Los productos de limpieza que venden son los únicos que realmente eliminan el olor. Muy buena atención.",
    img: "https://i.pravatar.cc/150?u=roberto"
  }
];

const Reviews = () => {
  return (
    <section className="py-24 bg-orange-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10">
        <Quote size={300} className="text-white" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-4xl font-black text-white text-center mb-16">Lo que dicen los Pet-Lovers</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-2xl">
              <p className="text-slate-600 italic mb-8 text-lg">"{r.text}"</p>
              <div className="flex items-center space-x-4">
                <img src={r.img} alt={r.name} className="w-14 h-14 rounded-2xl object-cover" />
                <div>
                  <h4 className="font-black text-slate-800">{r.name}</h4>
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">{r.pet}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;