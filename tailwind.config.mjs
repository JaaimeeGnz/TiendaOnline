/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Paleta personalizada: Minimalismo Sofisticado
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b', // Azul marino principal
          900: '#0f172a', // Muy oscuro
        },
        accent: {
          gold: '#d4af37',
          gold_muted: '#b8963a',
          leather: '#8b7355',
        },
        neutral: {
          white: '#fafaf8', // Blanco roto
          gray_light: '#f5f5f3',
          gray_medium: '#d3d3d1',
          gray_dark: '#4a4a48', // Gris carbón
          black: '#1a1a18',
        },
      },
      fontFamily: {
        // Tipografías elegantes
        serif: ['Playfair Display', 'ui-serif', 'Georgia', 'serif'], // Para títulos
        sans: ['Inter', 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'], // Para textos
      },
      spacing: {
        // Espaciado generoso para minimalismo
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      fontSize: {
        // Escala tipográfica refinada
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.5rem', { lineHeight: '3rem' }],
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        elevated: '0 20px 40px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
