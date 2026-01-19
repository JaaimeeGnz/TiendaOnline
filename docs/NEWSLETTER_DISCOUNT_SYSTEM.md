# 📧 Sistema de Newsletter y Códigos de Descuento

## Descripción General

Sistema completo de suscripción a newsletter con códigos de descuento funcionales, conectado con Supabase. Los usuarios se suscriben a través de un popup elegante y reciben un código de descuento personalizado que pueden usar en sus compras.

## 🚀 Características

✅ **Popup de Suscripción**
- Se muestra automáticamente 3 segundos después de cargar la página
- Diseño moderno y responsivo
- No se repite si ya se suscribió (localStorage)

✅ **Códigos de Descuento Funcionales**
- Generación automática de códigos únicos
- Validación en tiempo real
- Descuentos por porcentaje
- Límites de uso configurables
- Fechas de validez personalizables

✅ **Gestión de Suscriptores**
- Almacenamiento de emails en Supabase
- Tracking de códigos utilizados
- Estadísticas de uso

✅ **Panel de Control Admin**
- Crear nuevos códigos manualmente
- Ver estadísticas de suscriptores
- Gestionar códigos existentes
- Desactivar códigos

## 📁 Estructura de Archivos

```
src/
├── components/ui/
│   ├── NewsletterPopup.tsx          # Componente del popup
│   ├── DiscountCodeInput.tsx        # Input para aplicar códigos
│   └── DiscountBadge.tsx            # Badge de descuento
├── lib/
│   ├── newsletter.ts                # Lógica de newsletter
│   └── discountCalculations.ts      # Utilidades de cálculo
├── pages/
│   ├── api/
│   │   ├── newsletter/
│   │   │   └── subscribe.ts         # Endpoint de suscripción
│   │   ├── discount/
│   │   │   └── validate.ts          # Validación de códigos
│   │   └── admin/
│   │       ├── newsletter.ts        # Stats de suscriptores
│   │       ├── discount-codes.ts    # CRUD de códigos
│   │       └── discount-codes/[id].ts
│   └── index.astro                  # Página principal (con popup)
└── docs/
    └── newsletter_schema.sql        # Esquema de BD

```

## 🔧 Instalación

### 1. Ejecutar Migración en Supabase

```sql
-- Copiar el contenido de: docs/newsletter_schema.sql
-- Ejecutar en la SQL Console de Supabase
```

O hacerlo directamente desde la interfaz:

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. SQL Editor → New Query
3. Copia el contenido de `docs/newsletter_schema.sql`
4. Ejecuta

### 2. Verificar Tablas Creadas

Las siguientes tablas deben existir en tu BD:

- `newsletter_subscribers` - Suscriptores y sus códigos
- `discount_codes` - Códigos de descuento
- `discount_code_usage` - Registro de usos

### 3. Componente Popup en Todas las Páginas (Opcional)

Si quieres mostrar el popup en más páginas:

```astro
import NewsletterPopup from "../components/ui/NewsletterPopup.tsx";

<!-- Al final del layout o página -->
<NewsletterPopup client:load discount={10} />
```

## 📖 Uso

### Para Usuarios

1. El popup aparece automáticamente 3 segundos después de cargar la página
2. El usuario ingresa su email
3. Recibe un código de descuento personalizado
4. El código se guarda en localStorage para no repetir
5. En el carrito, puede aplicar el código con `DiscountCodeInput`

### Para Admin

#### Crear un Código de Descuento Manualmente

```typescript
const response = await fetch('/api/admin/discount-codes', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'BLACKFRIDAY2025',
    discount_type: 'percentage',
    discount_value: 25,
    valid_until: '2025-02-01',
    max_uses: 100,
    min_purchase_cents: 5000
  })
});
```

#### Obtener Estadísticas

```typescript
const response = await fetch('/api/admin/newsletter', {
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  }
});

const stats = await response.json();
console.log(stats.stats); // { totalSubscribers, codesUsed, codesUnused }
```

## 🎯 Componentes

### NewsletterPopup

```astro
<NewsletterPopup 
  client:load 
  discount={10}  <!-- Porcentaje de descuento -->
/>
```

### DiscountCodeInput

Muestra un input para aplicar códigos de descuento:

```astro
import DiscountCodeInput from "../components/ui/DiscountCodeInput.tsx";

<DiscountCodeInput
  onApply={(code, discount) => {
    console.log(`Aplicado: ${code} (${discount}%)`);
  }}
  onRemove={() => console.log('Removido')}
/>
```

### DiscountBadge

Muestra el descuento aplicado:

```astro
import DiscountBadge from "../components/ui/DiscountBadge.tsx";

<DiscountBadge 
  discountPercentage={15}
  originalPrice={5999}
  showSavings={true}
/>
```

## 🧮 Utilidades de Cálculo

### calculateDiscountedPrice

```typescript
import { calculateDiscountedPrice } from '../lib/discountCalculations';

const original = 10000; // €100 en céntimos
const discounted = calculateDiscountedPrice(original, 15);
// Result: 8500 (€85)
```

### calculateCartTotal

```typescript
import { calculateCartTotal } from '../lib/discountCalculations';

const total = calculateCartTotal(
  [
    { priceCents: 5000, quantity: 2 },
    { priceCents: 3000, quantity: 1 }
  ],
  10 // 10% descuento
);
// Result: { subtotal: '€130.00', discount: '€13.00', total: '€117.00' }
```

## 🛡️ Seguridad

### Políticas RLS

Todas las tablas tienen políticas RLS:

- **Lectura Pública**: Códigos válidos se pueden leer sin autenticación
- **Escritura Admin**: Solo usuarios autenticados pueden crear/modificar
- **Inserción Pública**: Suscriptores pueden registrarse sin cuenta

### Validación

- Validación de email con regex
- Verificación de fecha de validez
- Control de límites de uso
- Compra mínima requerida

## 📊 Esquema de BD

### newsletter_subscribers

```sql
id              UUID PRIMARY KEY
email           VARCHAR(255) UNIQUE
discount_code   VARCHAR(50) UNIQUE
discount_percentage INT
is_active       BOOLEAN
subscribed_at   TIMESTAMP
used_at         TIMESTAMP (NULL si no usado)
```

### discount_codes

```sql
id              UUID PRIMARY KEY
code            VARCHAR(50) UNIQUE
discount_type   VARCHAR(20) -- 'percentage' o 'fixed_amount'
discount_value  INT -- Porcentaje o céntimos
valid_from      TIMESTAMP
valid_until     TIMESTAMP (NULL = sin expiración)
max_uses        INT (NULL = ilimitado)
times_used      INT
min_purchase_cents INT
is_active       BOOLEAN
created_by      VARCHAR(255)
```

### discount_code_usage

```sql
id              UUID PRIMARY KEY
code_id         UUID (FK)
email           VARCHAR(255)
order_id        UUID
amount_saved_cents INT
created_at      TIMESTAMP
```

## 🔌 API Endpoints

### Suscripción

`POST /api/newsletter/subscribe`

```json
{
  "email": "usuario@example.com",
  "discount": 10
}
```

Response:
```json
{
  "success": true,
  "message": "¡Bienvenido! Usa el código SAVE2025ABCD...",
  "discountCode": "SAVE2025ABCD"
}
```

### Validación de Código

`POST /api/discount/validate`

```json
{
  "code": "SAVE2025ABCD"
}
```

Response:
```json
{
  "valid": true,
  "data": {
    "discount_type": "percentage",
    "discount_value": 10,
    "min_purchase_cents": 0
  }
}
```

### Admin - Newsletter Stats

`GET /api/admin/newsletter`

Headers: `Authorization: Bearer ADMIN_TOKEN`

Response:
```json
{
  "subscribers": [...],
  "stats": {
    "totalSubscribers": 150,
    "codesUsed": 42,
    "codesUnused": 108
  }
}
```

### Admin - Crear Código

`POST /api/admin/discount-codes`

Headers: `Authorization: Bearer ADMIN_TOKEN`

```json
{
  "code": "SUMMER2025",
  "discount_type": "percentage",
  "discount_value": 20,
  "valid_until": "2025-09-01",
  "max_uses": 500
}
```

## 🎨 Personalización

### Cambiar Colores del Popup

Edita [NewsletterPopup.tsx](../src/components/ui/NewsletterPopup.tsx):

```tsx
// Cambiar color de botón
className="w-full bg-blue-600 text-white..." 
// Por:
className="w-full bg-red-600 text-white..."
```

### Cambiar Tiempos

```tsx
// En NewsletterPopup.tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setIsOpen(true);
  }, 3000); // Cambiar de 3000 (3 seg) a lo que necesites
```

### Cambiar Descuento Inicial

En `index.astro`:

```astro
<NewsletterPopup client:load discount={15} /> <!-- Cambiar a 15% -->
```

## 📈 Ejemplos de Casos de Uso

### Campaña de Black Friday

```typescript
// Crear código con límite
await fetch('/api/admin/discount-codes', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'BLACKFRIDAY50',
    discount_type: 'percentage',
    discount_value: 50,
    valid_from: '2025-11-28',
    valid_until: '2025-11-29',
    max_uses: 1000
  })
});
```

### Newsletter Semanal con Descuentos

Generar códigos nuevos cada semana:
- Lunes: 5% descuento
- Miércoles: 10% descuento
- Viernes: 15% descuento

### Descuento por Compra Mínima

```typescript
{
  code: 'MIN50EUROS',
  discount_value: 10,
  min_purchase_cents: 5000 // €50 mínimo
}
```

## 🐛 Solución de Problemas

### El popup no aparece

- Verificar que `client:load` esté en el componente
- Revisar que localStorage no tenga `newsletter_subscribed`
- Abrir consola del navegador (F12) y buscar errores

### El código no se valida

- Verificar que el código esté activo en la BD
- Revisar fechas de validez (valid_from, valid_until)
- Comprobar límite de usos (max_uses)

### El descuento no se aplica

- Asegurar que el frontend está calculando correctamente
- Verificar que el endpoint `/api/discount/validate` retorna el descuento
- Revisar que `calculateDiscountedPrice` recibe valores en céntimos

## 📞 Soporte

Para preguntas o issues, consulta la documentación de:
- [Supabase Docs](https://supabase.com/docs)
- [Astro Docs](https://docs.astro.build)
- [React Docs](https://react.dev)
