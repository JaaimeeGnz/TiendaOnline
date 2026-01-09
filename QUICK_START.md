# 🚀 Quick Start Guide - FashionMarket

## En 5 Minutos

### 1️⃣ Clonar y Instalar

```bash
cd fashionmarket
npm install
```

### 2️⃣ Crear Proyecto Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Sign up gratuito
3. Create new project
4. Esperar a que se inicialice (2-3 min)

### 3️⃣ Obtener Credenciales

En Supabase Dashboard:
1. Settings → API
2. Copiar:
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon public key` → `PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 4️⃣ Configurar .env.local

```bash
cp .env.example .env.local
```

Editar `.env.local`:

```env
PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
PUBLIC_PRODUCTS_BUCKET=products-images
PUBLIC_SITE_URL=http://localhost:3000
```

### 5️⃣ Ejecutar SQL

1. En Supabase → SQL Editor
2. New Query
3. Copiar todo de `docs/supabase_schema.sql`
4. Pegar y ejecutar (Ctrl+Enter)

### 6️⃣ Crear Bucket Storage

Seguir: `docs/SUPABASE_STORAGE_SETUP.md`

O rápidamente:
1. Storage → Create new bucket
2. Name: `products-images`
3. Public bucket: ✅ ON
4. Create

### 7️⃣ Iniciar Dev

```bash
npm run dev
```

Abrir: http://localhost:3000

---

## 📍 URLs Principales (Dev)

| URL | Descripción |
|-----|-----------|
| `http://localhost:3000` | Homepage pública |
| `http://localhost:3000/productos` | Catálogo |
| `http://localhost:3000/admin/login` | Login admin |

---

## 🧪 Crear Datos de Prueba

### Via Dashboard

1. Supabase → SQL Editor
2. Ejecutar:

```sql
INSERT INTO products (
  name, slug, description, price_cents, stock, 
  category_id, color, material, sku, featured
)
SELECT 
  'Camisa de Lino Premium',
  'camisa-lino-premium',
  'Camisa de lino 100% transpirable, perfecta para verano',
  7999,
  15,
  categories.id,
  'Blanco',
  'Lino',
  'SHIRT-002',
  false
FROM categories 
WHERE slug = 'camisas'
LIMIT 1;
```

### Via Admin Panel

1. Ir a `/admin/login`
2. Crear usuario en Supabase (Auth → Users → Add user)
3. Usar esas credenciales para login
4. `/admin/productos/nuevo`
5. Rellenar formulario

---

## 🔍 Troubleshooting Rápido

### Error: "SUPABASE_URL not configured"
**Fix**: Verificar `.env.local` tiene `PUBLIC_` prefix

### Error: "Storage bucket not found"
**Fix**: Bucket debe existir en Supabase Storage con exacto nombre `products-images`

### Error: "Connection refused"
**Fix**: Asegurar que Supabase projet está activo (no paused)

### Las imágenes no cargan
**Fix**: 
1. Storage → products-images → Settings
2. Public bucket: ON
3. MIME types: `image/*`

### Admin no deja login
**Fix**:
1. Supabase → Auth → Users
2. Crear nuevo usuario con email/password
3. Usar esas credenciales

---

## 📊 Estructura de Datos Rápida

### Tablas Principales

```
categories
├── id (UUID)
├── name (string unique)
├── slug (string unique)
└── description (text)

products
├── id (UUID)
├── name (string)
├── slug (string unique)
├── price_cents (integer)
├── stock (integer)
├── category_id (UUID → categories)
├── images (array of URLs)
├── sizes (array)
├── is_active (boolean)
└── featured (boolean)
```

---

## 🎨 Colores Disponibles (Tailwind)

```tsx
// Uso en componentes:
<div className="bg-primary-800">Azul marino</div>
<div className="text-accent-gold">Dorado</div>
<div className="border-neutral-gray_dark">Gris carbón</div>
```

Paleta completa en `tailwind.config.mjs`

---

## 🛒 Probar Carrito

1. Ir a producto
2. Seleccionar talla
3. Click "Añadir al carrito"
4. Click ícono carrito (arriba derecha)
5. Verificar que se guarda en localStorage

En console:
```javascript
// Ver carrito en localStorage
console.log(localStorage.getItem('fashionmarket_cart'))

// Acceder a Nano Store
import { cartStore } from './src/stores/cart'
console.log(cartStore.get())
```

---

## 🚀 Siguientes Pasos

### Inmediatos
- [ ] Configurar todas las variables .env
- [ ] Ejecutar SQL schema
- [ ] Crear bucket storage
- [ ] Hacer npm install
- [ ] npm run dev
- [ ] Probar en http://localhost:3000

### Próximos (Fase 2)
- [ ] Crear usuarios admin en Supabase Auth
- [ ] Subir primeros productos con imágenes
- [ ] Integrar Stripe para pagos
- [ ] Crear página de checkout

### Tercera Fase
- [ ] Búsqueda y filtros dinámicos
- [ ] Sistema de órdenes
- [ ] Emails transaccionales

---

## 📞 Documentación Completa

Consultar estos archivos:

1. **README.md** - Overview técnico completo
2. **docs/ARCHITECTURE_SUMMARY.md** - Decisiones de diseño
3. **docs/supabase_schema.sql** - BD (ejecutar en Supabase)
4. **docs/SUPABASE_STORAGE_SETUP.md** - Storage paso a paso

---

## 💡 Tips Profesionales

### Para Desarrollo

```bash
# Hot reload automático
npm run dev

# Build final
npm run build

# Previsualizar build
npm run preview

# Tipo-check
npm run astro -- check
```

### En Supabase

- Usar **SQL editor** para queries complejas
- Usar **Table editor** para CRUD simple
- Ver **Logs** en Settings para debugging

### En Código

- Componentes `.astro` son estáticos (más rápido)
- Componentes `.tsx` dentro de `islands/` son interactivos
- Usar `client:load` solo si necesitas JavaScript
- Imports tipados en `env.d.ts`

---

## 🎯 Checklist de Lanzamiento

- [ ] ✅ Variables .env configuradas
- [ ] ✅ SQL schema ejecutado en Supabase
- [ ] ✅ Bucket products-images creado
- [ ] ✅ npm install completado
- [ ] ✅ npm run dev funciona
- [ ] ✅ Admin login funciona
- [ ] ✅ Crear usuario admin en Supabase Auth
- [ ] ✅ Subir primer producto vía admin
- [ ] ✅ Producto visible en /productos
- [ ] ✅ Carrito guarda items

---

¡Listo! **FashionMarket** está preparado para iniciar. 🚀

Si algo no funciona, ver **Troubleshooting Rápido** arriba.

Cualquier pregunta → consultar la **Documentación Completa** en `docs/`

---

**Versión**: 1.0.0 Fundacional  
**Última actualización**: Enero 2026  
**Estado**: ✅ Listo para desarrollo
