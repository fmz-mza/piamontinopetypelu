import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vzlywsihzocvfzyyzzah.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bHl3c2loem9jdmZ6eXl6emFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTcyMzUsImV4cCI6MjA5MjE5MzIzNX0.IVa-kD2wiqwDcewGyUeDdoxmthfsFdCyiPGglMKoWPo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};