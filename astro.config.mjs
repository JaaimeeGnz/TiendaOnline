import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  
  site: process.env.SITE_URL || 'http://localhost:4321',
  
  integrations: [
    tailwind(),
    react(),
    sitemap(),
  ],
  
  // Configuración del servidor
  server: {
    port: 4321,
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
