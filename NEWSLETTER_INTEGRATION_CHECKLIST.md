# 🎯 Integración Newsletter + Descuentos - Checklist Final

## ✅ FASE 1: Implementación Base (Completada)

- ✅ Esquema SQL creado (`docs/newsletter_schema.sql`)
- ✅ Tablas: `newsletter_subscribers`, `discount_codes`, `discount_code_usage`
- ✅ Funciones y triggers automáticos
- ✅ Políticas RLS de seguridad

## ✅ FASE 2: Componentes React (Completada)

- ✅ `NewsletterPopup.tsx` - Popup de suscripción
- ✅ `DiscountCodeInput.tsx` - Input para aplicar códigos
- ✅ `DiscountBadge.tsx` - Mostrar descuentos activos
- ✅ `CartSummaryWithDiscount.tsx` - Carrito integrado

## ✅ FASE 3: APIs (Completada)

- ✅ `POST /api/newsletter/subscribe` - Suscribirse
- ✅ `POST /api/discount/validate` - Validar código
- ✅ `GET /api/admin/newsletter` - Stats de admin
- ✅ `POST /api/admin/discount-codes` - Crear código
- ✅ `PATCH /api/admin/discount-codes/[id]` - Actualizar
- ✅ `DELETE /api/admin/discount-codes/[id]` - Eliminar

## ✅ FASE 4: Utilidades (Completada)

- ✅ `newsletter.ts` - Lógica de newsletter
- ✅ `discountCalculations.ts` - Cálculos de precios

## 🔧 FASE 5: Configuración Requerida (HACER AHORA)

### 5.1 Ejecutar Migración SQL en Supabase

**Estado:** ❌ POR HACER

```
1. Ve a supabase.com → Tu Proyecto
2. SQL Editor → New Query
3. Abre: docs/newsletter_schema.sql
4. Copia TODO
5. Pega en el editor
6. Run (Ctrl+Enter)
```

**Verificar:**
- En Table Editor deberías ver 3 nuevas tablas

### 5.2 Verificar Variables de Entorno

**Estado:** ✅ VERIFICAR

En `.env`:
```
PUBLIC_SUPABASE_URL=https://...supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

### 5.3 Iniciar Desarrollo

**Estado:** ❌ POR HACER

```bash
npm run dev
# Esperar a que compile
# Abrir http://localhost:3000
# Esperar 3 segundos - verás el popup!
```

## 📋 FASE 6: Pruebas (HACER)

### 6.1 Prueba del Popup

- [ ] Popup aparece 3 segundos después de cargar
- [ ] Se puede cerrar con X
- [ ] Se puede cerrar con overlay
- [ ] El overlay tiene opacidad

### 6.2 Prueba de Suscripción

- [ ] Ingreso email válido
- [ ] Click en "Obtener mi código"
- [ ] Espero respuesta
- [ ] Veo código de descuento
- [ ] Puedo copiar código
- [ ] Popup se cierra después de 5 segundos
- [ ] Popup NO aparece nuevamente (localStorage)

### 6.3 Prueba de Base de Datos

En Supabase:
- [ ] Email aparece en `newsletter_subscribers`
- [ ] Código aparece en `newsletter_subscribers`
- [ ] Nuevo código aparece en `discount_codes`

### 6.4 Prueba de Validación

```bash
# En consola del navegador:
await fetch('/api/discount/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'SAVE2025ABC' })
}).then(r => r.json()).then(console.log)
```

Debe retornar: `{ valid: true, data: {...} }`

### 6.5 Prueba de Carrito

- [ ] `DiscountCodeInput` aparece en carrito
- [ ] Puedo ingresar código
- [ ] Se valida
- [ ] Se aplica el descuento
- [ ] Se actualiza el total

## 🎨 FASE 7: Personalización (OPCIONAL)

### 7.1 Cambiar Descuento Inicial

En `src/pages/index.astro`:
```astro
<NewsletterPopup client:load discount={15} /> <!-- Cambiar 15 -->
```

### 7.2 Cambiar Colores

En `src/components/ui/NewsletterPopup.tsx`:
- Busca: `className="w-full bg-blue-600"`
- Cambiar colores Tailwind según necesites

### 7.3 Cambiar Textos

En `src/components/ui/NewsletterPopup.tsx`:
- Línea ~71: Título del popup
- Línea ~74: Descripción
- Línea ~109: Botón principal

### 7.4 Cambiar Tiempo de Aparición

En `src/components/ui/NewsletterPopup.tsx` línea ~45:
```tsx
const timer = setTimeout(() => {
  setIsOpen(true);
}, 3000); // Cambiar a 5000, 10000, etc.
```

## 📊 FASE 8: Crear Primeros Códigos

### Opción A: En Supabase UI (Recomendado)

1. Supabase → Table Editor → `discount_codes`
2. Insert Row
3. Completa:
   - code: `BIENVENIDA10`
   - discount_type: `percentage`
   - discount_value: `10`
   - is_active: `true`
   - valid_until: Vacío (sin expiración)

### Opción B: Con SQL

```sql
INSERT INTO discount_codes (code, discount_type, discount_value, is_active)
VALUES ('BIENVENIDA10', 'percentage', 10, true);
```

### Crear Algunos Códigos de Ejemplo

```sql
-- Código de bienvenida
INSERT INTO discount_codes (code, discount_type, discount_value, is_active)
VALUES ('BIENVENIDA10', 'percentage', 10, true);

-- Descuento por referral
INSERT INTO discount_codes (code, discount_type, discount_value, is_active)
VALUES ('REFERRAL15', 'percentage', 15, true);

-- Black Friday
INSERT INTO discount_codes (code, discount_type, discount_value, valid_until, max_uses, is_active)
VALUES ('BLACKFRIDAY50', 'percentage', 50, NOW() + INTERVAL '2 days', 100, true);
```

## 🔗 FASE 9: Integración con Páginas Existentes

### 9.1 Newsletter Popup en Todas Partes

Crear un layout wrapper:

```astro
<!-- src/layouts/MainLayout.astro -->
---
import NewsletterPopup from "../components/ui/NewsletterPopup.tsx";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";

interface Props {
  title?: string;
}

const { title = "FashionMarket" } = Astro.props;
---

<!DOCTYPE html>
<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <Header />
    <slot />
    <Footer />
    <NewsletterPopup client:load discount={10} />
  </body>
</html>
```

Luego en cada página:
```astro
import MainLayout from "../layouts/MainLayout.astro";

<MainLayout>
  <!-- Contenido de la página -->
</MainLayout>
```

### 9.2 Descuentos en Carrito

En tu página de carrito:

```astro
---
import CartSummaryWithDiscount from "../components/CartSummaryWithDiscount";
---

<CartSummaryWithDiscount 
  client:load
  items={cartItems}
/>
```

### 9.3 Badge de Descuento en Productos

```astro
import DiscountBadge from "../components/ui/DiscountBadge.tsx";

<!-- En cada producto con descuento -->
{product.discount > 0 && (
  <DiscountBadge
    discountPercentage={product.discount}
    originalPrice={product.price}
    showSavings={true}
  />
)}
```

## 🚀 FASE 10: Deploy a Producción

### 10.1 Configurar Producción

1. Variables de entorno en tu host (Vercel, Netlify, etc.)
2. Base de datos Supabase (ya lista)
3. Políticas RLS (ya configuradas)

### 10.2 Build

```bash
npm run build
npm run preview # Probar build local
```

### 10.3 Deploy

```bash
# Vercel
vercel

# O tu host favorito
# (Vercel detectará Astro automáticamente)
```

## 📈 FASE 11: Monitoreo y Métricas

### Ver Suscriptores

En Supabase:
```sql
SELECT COUNT(*) as total_suscriptores 
FROM newsletter_subscribers 
WHERE is_active = true;
```

### Ver Códigos Más Usados

```sql
SELECT code, times_used, discount_value
FROM discount_codes
ORDER BY times_used DESC
LIMIT 10;
```

### Ver Ingresos Generados por Descuentos

```sql
SELECT 
  c.code,
  COUNT(*) as usos,
  SUM(du.amount_saved_cents) as total_ahorrado_cents
FROM discount_code_usage du
JOIN discount_codes c ON du.code_id = c.id
GROUP BY c.code
ORDER BY usos DESC;
```

## 🐛 Troubleshooting

### El popup no aparece

```javascript
// En consola del navegador:
localStorage.removeItem('newsletter_subscribed');
location.reload(); // Recargar página
```

### El email no se guarda

1. Verificar que Supabase RLS permite INSERT anónimo
2. Ver consola del navegador (F12) para errores
3. Verificar en Supabase que la tabla existe

### El código no valida

1. Verificar que `is_active = true`
2. Verificar que `valid_from` es anterior a ahora
3. Verificar que `valid_until` es posterior (o NULL)

### El descuento no se aplica

1. Verificar que `DiscountCodeInput` está en la página
2. Verificar que `calculateDiscountedPrice` usa céntimos
3. Verificar en consola que el endpoint retorna el descuento

## 📝 Documentación de Referencia

- [QUICK_START_NEWSLETTER.md](./QUICK_START_NEWSLETTER.md) - Guía rápida
- [docs/NEWSLETTER_DISCOUNT_SYSTEM.md](./docs/NEWSLETTER_DISCOUNT_SYSTEM.md) - Docs completas
- [NEWSLETTER_SYSTEM_READY.md](./NEWSLETTER_SYSTEM_READY.md) - Overview
- [test-newsletter-system.js](./test-newsletter-system.js) - Tests en navegador

## 🎯 Estados de Completude

```
BASE DE DATOS:     ✅ Completado
COMPONENTES:       ✅ Completado
APIs:              ✅ Completado
UTILIDADES:        ✅ Completado
DOCUMENTACIÓN:     ✅ Completado
MIGRACIÓN SQL:     ⏳ POR EJECUTAR
PRUEBAS:           ⏳ POR HACER
PERSONALIZACIÓN:   ⏳ OPCIONAL
INTEGRACIÓN:       ⏳ POR HACER
DEPLOY:            ⏳ LUEGO
```

## 🎓 Próximos Pasos Inmediatos

1. **Ejecutar migración SQL** en Supabase (archivos listos)
2. **Iniciar npm run dev** y probar popup
3. **Crear primeros códigos** de descuento
4. **Probar suscripción** con email real
5. **Verificar datos** en Supabase
6. **Integrar en carrito** cuando esté listo

---

**¡Todo está listo! Solo ejecuta la migración SQL y comienza a probar.** 🚀
