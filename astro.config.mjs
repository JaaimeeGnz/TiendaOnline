import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  // Output estático por defecto (Astro 5.0)
  // Las rutas /admin serán renderizadas bajo demanda
  output: 'static',
  
  integrations: [
    tailwind(),
    react(),
  ],
  
  // Configuración del servidor
  server: {
    port: 3000,
    host: true,
  },
  
  // Configuración de build
  build: {
    // Usar formato moderno
    format: 'directory',
  },
  
  // Optimizaciones de imagen
  image: {
    domains: ['supabase.co'],
  },
});
