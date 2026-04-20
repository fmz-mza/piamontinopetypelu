"use client";

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, MapPin, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Review {
  id: string;
  name: string;
  time: string;
  text: string;
  rating: number;
  img: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchReviews();
    }
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">
              <MapPin size={18} className="text-pink-500" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Reseñas en Google</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4">Lo que dicen nuestros clientes</h2>
          <div className="flex items-center space-x-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
            </div>
            <span className="text-3xl font-black text-slate-900">5.0</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="animate-spin text-pink-500" size={32} />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <img src={r.img || `https://i.pravatar.cc/150?u=${r.id}`} alt={r.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 flex items-center">
                        {r.name}
                        <CheckCircle2 size={14} className="ml-1 text-pink-500" />
                      </h4>
                      <p className="text-xs text-slate-400">{r.time}</p>
                    </div>
                  </div>
                  <Star size={18} className="text-slate-200" fill="currentColor" />
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
        )}
        
        <div className="mt-12 text-center">
          <a 
            href="https://www.google.com/maps/place/Piamontino+Petshop+y+Peluquer%C3%ADa+Canina/@-32.9215956,-68.8508256,15z/data=!3m1!4b1!4m6!3m5!1s0x967e09f77137dc91:0xb7e78f5f5a5093cb!8m2!3d-32.921597!4d-68.8323716!16s%2Fg%2F11m5c4r05q?entry=ttu&g_ep=EgoyMDI2MDQxNS4wIKXMDSoASAFQAw%3D%3D" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-pink-500 font-bold hover:underline inline-flex items-center mx-auto"
          >
            Ver todas las reseñas en Google Maps
          </a>
        </div>
      </div>
    </section>
  );
};

export default Reviews;