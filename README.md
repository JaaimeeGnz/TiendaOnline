# FashionMarket - Arquitectura y Configuración

## 🎯 Descripción del Proyecto

**FashionMarket** es una tienda online de moda masculina premium construida con **Astro 5.0 en modo híbrido**, **Tailwind CSS** y **Supabase** como backend todo-en-uno.

### Características Clave:
- 🏪 **Tienda Pública (SSG)**: Catálogo de productos rápido y optimizado para SEO
- 🔐 **Panel Admin (SSR)**: Gestión de inventario protegida con autenticación
- 🛒 **Carrito Persistente**: Estado gestionado con Nano Stores
- 🖼️ **Galería de Imágenes**: Almacenadas en Supabase Storage
- 📱 **Diseño Responsivo**: Minimalismo sofisticado
- ⚡ **Rendimiento**: Output híbrido para máxima velocidad

---

## 📦 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Astro 5.0 (Hybrid Mode) + React |
| **Estilos** | Tailwind CSS |
| **Base de Datos** | Supabase (PostgreSQL) |
| **Autenticación** | Supabase Auth |
| **Storage** | Supabase Storage Buckets |
| **Estado** | Nano Stores |

---

## 🗂️ Estructura de Carpetas

```
fashionmarket/
├── public/
│   └── fonts/              # Tipografías personalizadas
├── src/
│   ├── components/
│   │   ├── ui/             # Componentes genéricos (Button, etc.)
│   │   ├── product/        # ProductCard, ProductGallery
│   │   └── islands/        # AddToCartButton (React isla)
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PublicLayout.astro
│   │   └── AdminLayout.astro
│   ├── lib/
│   │   ├── supabase.ts     # Cliente Supabase
│   │   └── utils.ts        # Funciones auxiliares
│   ├── pages/
│   │   ├── index.astro
│   │   ├── productos/
│   │   ├── categoria/
│   │   ├── admin/
│   │   └── api/            # Endpoints API routes (SSR)
│   ├── stores/
│   │   └── cart.ts         # Nano Store del carrito
│   ├── middleware.ts       # Auth middleware
│   └── env.d.ts
├── docs/
│   └── supabase_schema.sql
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 🚀 Guía de Instalación y Setup

### 1. Clonar y Instalar Dependencias

```bash
cd fashionmarket
npm install
```

### 2. Configurar Variables de Entorno

Copiar `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Completar con tus credenciales de Supabase:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PUBLIC_PRODUCTS_BUCKET=products-images
PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Crear Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Obtener las claves de conexión

### 4. Ejecutar Script SQL

En **Supabase > SQL Editor**, ejecutar el contenido de `docs/supabase_schema.sql`:

```sql
-- Copiar y pegar todo el contenido del archivo
```

Esto creará:
- Tablas: `categories`, `products`
- Índices para optimización
- Políticas RLS
- Funciones de triggers

---

## 🪣 Configuración de Supabase Storage

### Crear Bucket para Imágenes

1. **Supabase Dashboard > Storage**
2. Crear nuevo bucket: `products-images`
3. Configurar políticas:

#### Política de Lectura Pública

```sql
-- Permitir lectura pública de todas las imágenes
CREATE POLICY "Public Read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'products-images');
```

#### Política de Escritura para Admin

```sql
-- Solo usuarios autenticados pueden subir
CREATE POLICY "Admin Upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'products-images' 
  AND auth.role() = 'authenticated'
);
```

#### Política de Eliminación para Admin

```sql
-- Solo usuarios autenticados pueden eliminar
CREATE POLICY "Admin Delete" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'products-images' 
  AND auth.role() = 'authenticated'
);
```

### Configuración en Bucket

En **Settings** del bucket `products-images`:
- ✅ **Public bucket**: Activado (para lectura pública)
- ✅ **Allowed MIME types**: `image/*`
- ✅ **Max upload size**: 5MB por archivo

---

## 🔐 Flujo de Autenticación

### Para Clientes (Frontend)

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseClient = createClient(url, anonKey);

// Autenticación limitada por RLS
```

### Para Admin (Backend)

```typescript
// lib/supabase.ts
export const supabaseServer = createClient(url, serviceRoleKey);

// Acceso sin restricciones RLS
```

### Middleware de Protección

```typescript
// middleware.ts
// Redirige a /admin/login si no hay sesión
```

---

## 🛒 Nano Store del Carrito

### Estructura de Datos

```typescript
// stores/cart.ts
interface CartItem {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  size?: string;
  image_url?: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  lastUpdated: number;
}
```

### Funciones Principales

```typescript
// Añadir al carrito
addToCart(item, quantity);

// Quitar del carrito
removeFromCart(productId, size);

// Actualizar cantidad
updateCartItemQuantity(productId, quantity, size);

// Obtener total (en céntimos)
getCartTotal(); // => 25999

// Limpiar carrito
clearCart();
```

### Persistencia

El carrito se guarda en `localStorage` con clave `fashionmarket_cart` y se sincroniza automáticamente.

---

## ⚛️ Isla Interactiva: AddToCartButton

### Componente React (Cliente)

```tsx
// components/islands/AddToCartButton.tsx
import { addToCart } from '../../stores/cart';

export default function AddToCartButton({
  productId,
  productName,
  price,
  stock,
  selectedSize,
  // ...
}) {
  const handleAddToCart = () => {
    addToCart(cartItem, quantity);
    // Feedback visual...
  };
}
```

### Uso en Astro

```astro
<!-- pages/productos/[slug].astro -->
<AddToCartButton
  client:load
  productId={product.id}
  productName={product.name}
  price={product.price_cents}
  stock={product.stock}
  selectedSize={selectedSize}
/>
```

**`client:load`**: Hidrata el componente en el navegador incluso en SSG

---

## 🎨 Paleta de Colores Personalizada

Definida en `tailwind.config.mjs`:

```javascript
colors: {
  primary: {
    800: '#1e293b',  // Azul marino principal
    900: '#0f172a',  // Muy oscuro
  },
  accent: {
    gold: '#d4af37',          // Dorado mate
    leather: '#8b7355',       // Cuero
  },
  neutral: {
    white: '#fafaf8',         // Blanco roto
    gray_dark: '#4a4a48',     // Gris carbón
  }
}
```

### Tipografías

- **Serif**: Playfair Display (títulos)
- **Sans**: Inter (textos)

---

## 📋 Páginas Principales

### Públicas (SSG)

| Ruta | Descripción |
|------|-----------|
| `/` | Home con productos destacados |
| `/productos` | Listado completo de productos |
| `/productos/[slug]` | Detalle de producto con galería |
| `/categoria/[slug]` | Productos filtrados por categoría |

### Admin (SSR Protegido)

| Ruta | Descripción |
|------|-----------|
| `/admin/login` | Formulario de login |
| `/admin` | Dashboard con estadísticas |
| `/admin/productos` | Listado de productos |
| `/admin/productos/nuevo` | Crear nuevo producto |
| `/admin/productos/[id]` | Editar producto |

---

## 🔄 Flujo de Datos

### Tienda Pública

```
SSG (Build Time)
↓
supabaseClient.from('products').select() → HTML estático
↓
Browser → Carrito (Nano Store + localStorage)
```

### Panel Admin

```
SSR (Request Time)
↓
middleware → verificar auth
↓
Admin Layout + componentes Astro
↓
Operaciones CRUD con supabaseServer
```

---

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Ejecutar Astro CLI
npm run astro -- --help
```

---

## 📊 Base de Datos: Esquema Relacional

### Tabla `categories`

```sql
id (UUID primary key)
name (VARCHAR unique)
slug (VARCHAR unique)
description (TEXT)
display_order (INT)
created_at, updated_at (TIMESTAMP)
```

### Tabla `products`

```sql
id (UUID primary key)
name, slug (VARCHAR)
description (TEXT)
price_cents (INT)           -- 5999 = 59,99€
stock (INT)
category_id (UUID foreign key)
images (TEXT[])             -- Array de URLs
sizes (TEXT[])              -- [XS, S, M, L, XL, XXL]
color, material (VARCHAR)
sku (VARCHAR)
is_active, featured (BOOLEAN)
created_at, updated_at (TIMESTAMP)
```

---

## 🔒 Políticas RLS (Row Level Security)

**Lectura Pública**:
- Todos leen productos `is_active = true`
- Todos leen categorías

**Escritura Admin**:
- Solo usuarios autenticados (`auth.role() = 'authenticated'`)

En producción, añadir roles más específicos:

```sql
-- Ejemplo avanzado
CREATE POLICY "Admin Only" 
ON products 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);
```

---

## 🎯 Próximos Pasos (Fase 2)

- [ ] Integración de Stripe para pagos
- [ ] API de búsqueda y filtros dinámicos
- [ ] Panel de órdenes/pedidos
- [ ] Email transaccionales (SendGrid)
- [ ] Analytics e informes
- [ ] Sistema de comentarios/reviews
- [ ] Wishlist de usuarios
- [ ] Descuentos y cupones

---

## 📞 Soporte y Recursos

- [Documentación Astro](https://docs.astro.build)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Nano Stores](https://github.com/nanostores/nanostores)

---

## 📄 Licencia

© 2026 FashionMarket. Todos los derechos reservados.
