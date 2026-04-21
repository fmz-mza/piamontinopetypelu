"use client";

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface LandingContent {
  section: string;
  key: string;
  value: string;
}

const defaultContent: LandingContent[] = [
  { section: 'hero', key: 'title', value: 'Cuidado con alma y estilo.' },
  { section: 'hero', key: 'subtitle', value: 'Tu mascota feliz, tu casa radiante. En Piamontino encontrás el equilibrio perfecto: nutrición, accesorios y peluquería de primer nivel, junto a una selección exclusiva de artículos de limpieza.' },
  { section: 'hero', key: 'cta_text', value: 'Ver Servicios' },
  { section: 'services', key: 'title', value: 'Más que una tienda, un estilo de vida.' },
  { section: 'services', key: 'subtitle', value: 'Diseñamos experiencias únicas para que la convivencia con tu mascota sea perfecta.' },
  { section: 'products', key: 'title', value: 'Nuestra Tienda' },
  { section: 'products', key: 'subtitle', value: 'Los favoritos de la comunidad para este mes.' },
  { section: 'about', key: 'title', value: 'Pasión por lo que hacemos.' },
  { section: 'about', key: 'description', value: 'En Piamontino, entendemos que tu mascota es parte de tu familia. Por eso, dedicamos cada día a brindar un servicio de excelencia, combinando nuestra experiencia en peluquería canina con una selección premium de productos para su bienestar y el cuidado de tu hogar.' },
  { section: 'contact', key: 'whatsapp_number', value: '5492610000000' },
];

const LandingEditor: React.FC = () => {
  const [content, setContent] = useState<LandingContent[]>(defaultContent);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    if (isSupabaseConfigured()) {
      fetchContent();
    }
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('section, key, value');

      if (error) throw error;

      if (data && data.length > 0) {
        // Combinar con defaultContent para asegurar que todas las keys existan
        const merged = [...defaultContent];
        data.forEach(item => {
          const index = merged.findIndex(m => m.section === item.section && m.key === item.key);
          if (index !== -1) {
            merged[index] = item;
          } else {
            merged.push(item);
          }
        });
        setContent(merged);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      toast.error('Error al cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section: string, key: string, value: string) => {
    setContent(prev => 
      prev.map(item => 
        item.section === section && item.key === key 
          ? { ...item, value } 
          : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const item of content) {
        const { error } = await supabase
          .from('landing_content')
          .upsert({
            section: item.section,
            key: item.key,
            value: item.value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'section,key'
          });

        if (error) throw error;
      }
      toast.success('Contenido guardado correctamente');
    } catch (err) {
      console.error('Error saving content:', err);
      toast.error('Error al guardar el contenido');
    } finally {
      setSaving(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-amber-800 mb-2">Supabase no configurado</h3>
            <p className="text-amber-700 text-sm mb-4">
              Para editar el contenido de la landing page, necesitás configurar las variables de entorno.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sections = ['hero', 'services', 'products', 'about', 'contact'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Editor de Inicio</h1>
          <p className="text-slate-500">Actualizá el contenido de tu landing page</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchContent}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-pink-500" size={32} />
        </div>
      ) : (
        <div className="grid gap-6">
          {sections.map(section => (
            <div key={section} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2 capitalize">
                <span className={`w-2 h-2 rounded-full ${
                  section === 'hero' ? 'bg-pink-500' : 
                  section === 'services' ? 'bg-blue-500' : 
                  section === 'products' ? 'bg-green-500' : 
                  section === 'contact' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                Sección {section === 'contact' ? 'Contacto' : section}
              </h2>
              <div className="space-y-4">
                {content.filter(c => c.section === section).map(item => (
                  <div key={`${item.section}-${item.key}`}>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5 capitalize">
                      {item.key.replace('_', ' ')}
                    </label>
                    {item.key === 'subtitle' || item.key === 'description' ? (
                      <textarea
                        value={item.value}
                        onChange={(e) => handleChange(item.section, item.key, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => handleChange(item.section, item.key, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                        placeholder={item.key === 'whatsapp_number' ? 'Ej: 5492610000000' : ''}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandingEditor;