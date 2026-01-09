# 📑 Índice de Documentación - FashionMarket

## 🎯 Por Dónde Empezar

### 1. **[QUICK_START.md](QUICK_START.md)** ⚡ (5 minutos)
   - Setup rápido paso a paso
   - Configuración de variables .env
   - URLs principales
   - Troubleshooting básico

### 2. **[README.md](README.md)** 📖 (completa)
   - Stack tecnológico detallado
   - Estructura de carpetas explicada
   - Guía de instalación completa
   - Flujos de datos
   - Comandos de desarrollo

### 3. **[QUICK_START.md → Checklist](QUICK_START.md#-checklist-de-lanzamiento)** ✅
   - Verificar que todo funciona
   - Pasos de validación

---

## 🔧 Documentación Técnica

### Base de Datos

**[docs/supabase_schema.sql](docs/supabase_schema.sql)** 🗄️
- Schema completo PostgreSQL
- Tablas: `categories`, `products`
- Índices optimizados
- Políticas RLS
- Triggers y funciones
- Datos de ejemplo
- ⚠️ **EJECUTAR en Supabase SQL Editor**

### Storage de Imágenes

**[docs/SUPABASE_STORAGE_SETUP.md](docs/SUPABASE_STORAGE_SETUP.md)** 🪣
- Crear bucket `products-images`
- Configurar políticas de seguridad
- Subida programática
- Obtener URLs públicas
- Debugging de permisos
- Estructura de carpetas

### Arquitectura

**[docs/ARCHITECTURE_SUMMARY.md](docs/ARCHITECTURE_SUMMARY.md)** 🏗️
- Decisiones de diseño
- Por qué cada tecnología
- Seguridad implementada
- Roadmap de fases
- Características destacadas
- Aprendizajes clave

---

## 📁 Estructura del Proyecto

```
fashionmarket/
├── 📑 QUICK_START.md              ← Empieza aquí
├── 📖 README.md                   ← Overview técnico
├── 📋 [Este archivo]
│
├── 🔧 Configuración
│   ├── package.json
│   ├── astro.config.mjs           (output: 'hybrid')
│   ├── tailwind.config.mjs        (paleta personalizada)
│   ├── tsconfig.json
│   ├── .env.example               (COPIAR a .env.local)
│   └── .gitignore
│
├── 📚 Documentación
│   └── docs/
│       ├── supabase_schema.sql                (ejecutar en BD)
│       ├── SUPABASE_STORAGE_SETUP.md         (paso a paso)
│       └── ARCHITECTURE_SUMMARY.md            (decisiones)
│
├── 🎨 Public Assets
│   └── public/fonts/              (tipografías)
│
└── 💻 Código Fuente
    └── src/
        ├── components/
        │   ├── ui/                (Button, etc.)
        │   ├── product/           (ProductCard, Gallery)
        │   └── islands/           (AddToCartButton - React)
        │
        ├── layouts/
        │   ├── BaseLayout.astro
        │   ├── PublicLayout.astro
        │   └── AdminLayout.astro
        │
        ├── lib/
        │   ├── supabase.ts        (cliente + instancias)
        │   └── utils.ts           (funciones helper)
        │
        ├── pages/
        │   ├── index.astro                    (homepage)
        │   ├── productos/
        │   │   ├── index.astro               (catálogo)
        │   │   └── [slug].astro              (detalle)
        │   ├── categoria/
        │   │   └── [slug].astro              (filtrado)
        │   └── admin/
        │       ├── login.astro               (SSR)
        │       ├── index.astro               (dashboard)
        │       └── productos/
        │           ├── index.astro           (CRUD)
        │           └── nuevo.astro           (formulario)
        │
        ├── stores/
        │   └── cart.ts            (Nano Store carrito)
        │
        ├── middleware.ts          (protección /admin)
        ├── env.d.ts              (tipos de variables)
        └── [otros archivos]
```

---

## 🚀 Flujo de Trabajo Típico

### Para Empezar

```bash
1. Leer: QUICK_START.md
2. Ejecutar: npm install
3. Crear: Proyecto Supabase
4. Configurar: .env.local
5. Ejecutar: SQL en Supabase
6. Ejecutar: npm run dev
7. Abrir: http://localhost:3000
```

### Para Entender la Arquitectura

```bash
1. Leer: README.md (secciones 2-4)
2. Ver: docs/ARCHITECTURE_SUMMARY.md
3. Revisar: tailwind.config.mjs (paleta)
4. Revisar: src/layouts/PublicLayout.astro (nav pública)
5. Revisar: src/layouts/AdminLayout.astro (nav admin)
```

### Para Trabajar con Base de Datos

```bash
1. Ejecutar: SQL de docs/supabase_schema.sql
2. Leer: docs/SUPABASE_STORAGE_SETUP.md
3. Crear: bucket products-images
4. Configurar: políticas RLS
5. Probar: subir imagen en /admin/productos/nuevo
```

### Para Desarrollo Frontend

```bash
1. Crear componentes en: src/components/
2. Crear páginas en: src/pages/
3. Usar layouts: src/layouts/*.astro
4. Variables globales: tailwind.config.mjs
5. Funciones helper: src/lib/utils.ts
```

### Para Interactividad

```bash
1. Crear componente React en: src/components/islands/
2. Usar directiva: client:load (en Astro)
3. Interactuar con Nano Store: src/stores/cart.ts
4. Importar cliente: src/lib/supabase.ts
```

---

## 🔐 Configuración de Seguridad

### Variables de Entorno

```env
PUBLIC_SUPABASE_URL=...           ← Seguro mostrar
PUBLIC_SUPABASE_ANON_KEY=...      ← Seguro mostrar
SUPABASE_SERVICE_ROLE_KEY=...     ← NUNCA mostrar (solo server)
```

### Autenticación

```
/admin              → Protegido por middleware.ts
/admin/login        → Endpoint público
Otros /admin/*      → Redirige a /admin/login si no autenticado
```

### Base de Datos

```
Públicos leen:      is_active = true
Admins escriben:    auth.role() = 'authenticated'
Lectura pública:    RLS permite SELECT para todos
```

---

## 📊 Decisiones Clave

| Decisión | Razón |
|----------|-------|
| **Astro Híbrido** | SSG para velocidad + SSR para admin |
| **Supabase** | Todo en uno: BD + Auth + Storage |
| **Nano Stores** | Ligero, reactivo, perfecto para Astro |
| **Tailwind** | Utility-first, personalizable |
| **React Islands** | Solo JS donde se necesita |
| **RLS** | Seguridad en BD, no en aplicación |

---

## 🎓 Archivos Clave para Aprender

### Entender el Stack

1. **package.json** - Dependencias
2. **astro.config.mjs** - Configuración Astro (output: hybrid)
3. **tailwind.config.mjs** - Paleta y tipografías
4. **src/middleware.ts** - Autenticación

### Entender la Arquitectura

5. **src/layouts/BaseLayout.astro** - HTML base
6. **src/layouts/PublicLayout.astro** - Tienda pública
7. **src/layouts/AdminLayout.astro** - Panel admin
8. **src/stores/cart.ts** - Estado global

### Entender el Frontend

9. **src/pages/index.astro** - Homepage
10. **src/pages/productos/[slug].astro** - Detalle de producto
11. **src/components/islands/AddToCartButton.tsx** - Isla React
12. **src/pages/admin/productos/nuevo.astro** - Formulario

### Entender Supabase

13. **docs/supabase_schema.sql** - Tablas y RLS
14. **src/lib/supabase.ts** - Clientes (anon y service role)
15. **docs/SUPABASE_STORAGE_SETUP.md** - Storage y permisos

---

## 🧪 Testing Rápido

### Verificar que todo funciona

```bash
# 1. Estructura
bash verify-setup.sh

# 2. SQL
# Ejecutar docs/supabase_schema.sql en Supabase

# 3. Desarrollo
npm run dev

# 4. URLs
curl http://localhost:3000          # ✅ Homepage
curl http://localhost:3000/productos  # ✅ Catálogo
curl http://localhost:3000/admin/login  # ✅ Login
```

---

## 🚨 Troubleshooting por Tema

### Setup Inicial
→ Ver **QUICK_START.md** sección "Troubleshooting Rápido"

### Storage de Imágenes
→ Ver **docs/SUPABASE_STORAGE_SETUP.md** sección "Troubleshooting"

### Autenticación
→ Ver **README.md** sección "Flujo de Autenticación"

### Rendimiento
→ Ver **README.md** sección "Rendimiento"

---

## 📞 Recursos Externos

- [Documentación Astro](https://docs.astro.build)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Nano Stores](https://github.com/nanostores/nanostores)
- [TypeScript](https://www.typescriptlang.org/docs)

---

## ✨ Características Incluidas

✅ Arquitectura híbrida (SSG + SSR)  
✅ Autenticación con Supabase Auth  
✅ Base de datos PostgreSQL con RLS  
✅ Almacenamiento de imágenes en cloud  
✅ Carrito persistente con Nano Stores  
✅ Componentes React interactivos  
✅ Diseño responsivo y accesible  
✅ Paleta de colores personalizada  
✅ Documentación completa  
✅ Código listo para producción  

---

## 🔄 Roadmap

**Completado** (Fase 1 - Esta entrega)
- ✅ Arquitectura base
- ✅ Tienda pública SSG
- ✅ Panel admin SSR
- ✅ Carrito y estado
- ✅ Autenticación
- ✅ Documentación

**Próximo** (Fase 2)
- Integración Stripe
- Checkout completo
- Órdenes en BD

**Futuro** (Fases 3-5)
- Búsqueda/filtros
- Reviews de usuarios
- Emails
- Analytics
- Multi-divisa

---

## 📝 Notas Finales

Esta es una **arquitectura empresarial** lista para:
- ✅ Desarrollo inmediato
- ✅ Escalabilidad
- ✅ Seguridad
- ✅ Performance
- ✅ Mantenibilidad

Todo está documentado, tipado y siguiendo best practices.

**¡Bienvenido a FashionMarket! 🚀**

---

**Última actualización**: Enero 2026  
**Versión**: 1.0.0 Fundacional  
**Estado**: ✅ Listo para producción (sin pagos)
