import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Cambiamos './' por el nombre del repositorio para asegurar que las rutas sean absolutas y correctas en GitHub Pages
  base: '/piamontinopetypelu/',
})