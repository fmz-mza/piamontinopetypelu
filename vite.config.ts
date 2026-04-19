import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Usamos './' para que las rutas sean relativas y funcionen en la vista previa y en GitHub Pages
  base: './',
})