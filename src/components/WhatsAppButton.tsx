"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const WhatsAppButton = () => {
  // Número por defecto por si la base de datos está vacía inicialmente
  const [phone, setPhone] = useState('5492610000000');

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchWhatsApp();
    }
  }, []);

  const fetchWhatsApp = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('value')
        .eq('section', 'contact')
        .eq('key', 'whatsapp_number')
        .single();

      if (data && data.value) {
        setPhone(data.value);
      }
    } catch (err) {
      console.error('Error fetching WhatsApp number:', err);
    }
  };

  if (!phone) return null;

  // Limpiar el número de caracteres no numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  return (
    <a
      href={`https://wa.me/${cleanPhone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={32} fill="currentColor" />
      <span className="absolute right-full mr-4 bg-white text-slate-800 px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-100">
        ¡Chateá con nosotros!
      </span>
    </a>
  );
};

export default WhatsAppButton;