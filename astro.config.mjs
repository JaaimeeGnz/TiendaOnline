import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'middleware',
  }),
  
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
