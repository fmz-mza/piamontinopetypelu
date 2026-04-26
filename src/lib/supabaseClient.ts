"use client";

import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback defaults for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vzlywsihzocvfzyyzzah.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bHl3c2loem9jdmZ6eXl6emFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTcyMzUsImV4cCI6MjA5MjE5MzIzNX0.IVa-kD2wiqwDcewGyUeDdoxmthfsFdCyiPGglMKoWPo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
};