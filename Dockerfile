# ============================================
# Dockerfile - FashionMarket (Astro 5 + Node.js)
# Multi-stage build para optimización
# ============================================

# Etapa 1: Dependencias
FROM node:22-alpine AS deps
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

# Etapa 2: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar todas las dependencias (incluidas dev para build)
COPY package.json package-lock.json* ./
RUN npm ci 2>/dev/null || npm install

# Copiar código fuente
COPY . .

# Variables de entorno necesarias para build (se inyectan en build-time)
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PUBLIC_STRIPE_KEY
ARG PUBLIC_CLOUDINARY_CLOUD_NAME

ENV PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}
ENV PUBLIC_SUPABASE_ANON_KEY=${PUBLIC_SUPABASE_ANON_KEY}
ENV PUBLIC_STRIPE_KEY=${PUBLIC_STRIPE_KEY}
ENV PUBLIC_CLOUDINARY_CLOUD_NAME=${PUBLIC_CLOUDINARY_CLOUD_NAME}

# Build de la aplicación
RUN npm run build

# Etapa 3: Producción
FROM node:22-alpine AS runner
WORKDIR /app

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 astro

# Copiar solo los archivos necesarios para producción
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Variables de entorno de runtime
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Cambiar a usuario no-root
USER astro

# Exponer puerto
EXPOSE 4321

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4321/ || exit 1

# Iniciar la aplicación
CMD ["node", "./dist/server/entry.mjs"]
