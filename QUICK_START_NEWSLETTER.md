# 🚀 Guía Rápida - Newsletter & Códigos de Descuento

## ⚡ Setup Rápido en 5 Minutos

### Paso 1: Ejecutar Migración SQL (1 min)

```bash
# Windows
.\setup-newsletter.cmd

# Linux/Mac
chmod +x setup-newsletter.sh
./setup-newsletter.sh
```

O hacerlo manualmente:

1. Ve a [supabase.com](https://supabase.com) → Tu Proyecto
2. **SQL Editor** → **New Query**
3. Abre `docs/newsletter_schema.sql` y copia TODO
4. Pega en el editor
5. Click en **Run** (o Ctrl+Enter)

✅ **Hecho!** Las tablas están creadas

### Paso 2: El Popup Aparece Automáticamente

El popup ya está configurado en `src/pages/index.astro`:

```astro
<NewsletterPopup client:load discount={10} />
```

- Aparece 3 segundos después de cargar
- Los usuarios pueden desuscribirse con localStorage
- Genera código único automáticamente

### Paso 3: Aplicar Código en Carrito

En tu página de carrito, agrega:

```astro
import DiscountCodeInput from "../components/ui/DiscountCodeInput.tsx";

<DiscountCodeInput
  onApply={(code, discount) => {
    // Aplicar descuento al total
    console.log(`${code}: ${discount}% descuento`);
  }}
/>
```

## 📊 Ver Datos en Supabase

### Suscriptores

```sql
SELECT email, discount_code, subscribed_at 
FROM newsletter_subscribers 
ORDER BY subscribed_at DESC;
```

### Códigos de Descuento

```sql
SELECT code, discount_value, times_used, is_active 
FROM discount_codes 
ORDER BY created_at DESC;
```

### Uso de Códigos

```sql
SELECT c.code, du.email, du.created_at 
FROM discount_code_usage du
JOIN discount_codes c ON du.code_id = c.id
ORDER BY du.created_at DESC;
```

## 🎯 Crear Códigos Manualmente

### Vía Base de Datos (Recomendado para Admin)

```sql
INSERT INTO discount_codes (code, discount_type, discount_value, valid_from, valid_until, max_uses, is_active)
VALUES (
  'VERANO2025',           -- código
  'percentage',           -- tipo: porcentaje o fixed_amount
  20,                     -- 20% de descuento
  NOW(),                  -- válido desde ahora
  NOW() + INTERVAL '30 days', -- válido 30 días
  500,                    -- máximo 500 usos
  true                    -- activo
);
```

### Descuentos por Cantidad

```sql
-- Primeros 100: 15%
INSERT INTO discount_codes (code, discount_type, discount_value, max_uses)
VALUES ('PRONTO15', 'percentage', 15, 100);

-- Siguientes 100: 10%
INSERT INTO discount_codes (code, discount_type, discount_value, max_uses)
VALUES ('PRONTO10', 'percentage', 10, 100);
```

### Descuento por Compra Mínima

```sql
-- €50 de compra = 10% de descuento
INSERT INTO discount_codes (code, discount_type, discount_value, min_purchase_cents)
VALUES ('MIN50EUROS', 'percentage', 10, 5000);
```

## 💻 API para Desarrolladores

### Validar Código

```javascript
const response = await fetch('/api/discount/validate', {
  method: 'POST',
  body: JSON.stringify({ code: 'VERANO2025' })
});

const { valid, data } = await response.json();

if (valid) {
  console.log(`Descuento: ${data.discount_value}%`);
  console.log(`Mínimo: €${data.min_purchase_cents / 100}`);
}
```

### Procesar Compra con Descuento

```javascript
import { calculateDiscountedPrice } from '@/lib/discountCalculations';

const originalPrice = 10000; // €100
const discount = 20; // 20%

const finalPrice = calculateDiscountedPrice(originalPrice, discount);
console.log(`Precio final: €${finalPrice / 100}`); // €80
```

### Calcular Total del Carrito

```javascript
import { calculateCartTotal } from '@/lib/discountCalculations';

const items = [
  { priceCents: 5000, quantity: 2 },  // €50 x2
  { priceCents: 3000, quantity: 1 }   // €30 x1
];

const total = calculateCartTotal(items, 15); // 15% descuento

console.log(total);
// {
//   subtotal: '€130.00',
//   discount: '€19.50',
//   total: '€110.50'
// }
```

## 🎨 Personalizar Popup

### Cambiar Descuento Inicial

En `src/pages/index.astro`:

```astro
<NewsletterPopup client:load discount={15} /> <!-- 15% en lugar de 10% -->
```

### Cambiar Texto

En `src/components/ui/NewsletterPopup.tsx`, línea ~71:

```tsx
<h2 className="text-2xl font-bold text-gray-900 mb-2">
  ¡Obtén {discount}% de descuento!  {/* ← Cambiar aquí */}
</h2>
```

### Cambiar Colores

```tsx
// Botón del popup
className="w-full bg-blue-600..." // Cambiar bg-blue-600 a bg-red-600, etc.

// Overlay
className="fixed inset-0 bg-black bg-opacity-50..." // Cambiar opacidad
```

### Cambiar Tiempo de Aparición

```tsx
// En useEffect de NewsletterPopup.tsx:
const timer = setTimeout(() => {
  setIsOpen(true);
}, 3000); // Cambiar 3000ms (3 seg) a otro valor
```

## 📈 Casos de Uso Comunes

### Black Friday - Descuento Progresivo

```sql
-- Hora 1-4: 20%
INSERT INTO discount_codes VALUES (default, 'BLACKFRIDAY20', 'percentage', 20, NOW(), NOW() + '4 hours'::interval, 200, true, 'admin');

-- Hora 5-8: 30%
INSERT INTO discount_codes VALUES (default, 'BLACKFRIDAY30', 'percentage', 30, NOW() + '4 hours'::interval, NOW() + '8 hours'::interval, 200, true, 'admin');

-- Hora 9+: 50%
INSERT INTO discount_codes VALUES (default, 'BLACKFRIDAY50', 'percentage', 50, NOW() + '8 hours'::interval, NOW() + '24 hours'::interval, 100, true, 'admin');
```

### Newsletter Semanal

```sql
-- Lunes
INSERT INTO discount_codes VALUES (default, 'LUNES05', 'percentage', 5, NOW(), NOW() + '1 day'::interval, null, true, 'admin');

-- Viernes
INSERT INTO discount_codes VALUES (default, 'VIERNES15', 'percentage', 15, NOW(), NOW() + '1 day'::interval, null, true, 'admin');
```

### Referrals

```sql
-- Usuario A refiere a Usuario B
INSERT INTO discount_codes VALUES (default, 'REFERRAL_' || user_b_id, 'percentage', 10, NOW(), NOW() + '30 days'::interval, 1, true, 'admin');
```

## 🧪 Prueba Local

### 1. Probar Suscripción

```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","discount":10}'
```

### 2. Validar Código

```bash
curl -X POST http://localhost:3000/api/discount/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"SAVE2025ABCD"}'
```

## ❓ Preguntas Frecuentes

**P: ¿El popup aparece cada vez que entra el usuario?**
R: No, se guarda en localStorage. Limpia localStorage para que vuelva a aparecer.

**P: ¿Se pueden combinar múltiples códigos?**
R: No, por diseño solo uno activo. Puedes modificar si lo necesitas.

**P: ¿Dónde ven los usuarios su código?**
R: Se muestra en el popup después de suscribirse, y pueden copiarlo al portapapeles.

**P: ¿Cómo expiro un código?**
R: Establece `valid_until` en el pasado, o actualiza `is_active = false`.

**P: ¿Puedo ver quién usó cada código?**
R: Sí, en tabla `discount_code_usage`, con email y fecha.

## 📚 Archivos Importantes

- `docs/newsletter_schema.sql` - Esquema de base de datos
- `src/lib/newsletter.ts` - Lógica de suscripción
- `src/components/ui/NewsletterPopup.tsx` - Componente del popup
- `src/pages/api/newsletter/subscribe.ts` - API de suscripción
- `src/pages/api/discount/validate.ts` - API de validación
- `docs/NEWSLETTER_DISCOUNT_SYSTEM.md` - Documentación completa

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| Popup no aparece | Verifica `client:load` en index.astro |
| Código no valida | Revisa `is_active` y fechas en BD |
| Email duplicado | Usa `ON CONFLICT DO NOTHING` en query |
| Descuento no se aplica | Verifica que frontend envía código a API |

## 🎓 Próximos Pasos

1. ✅ Setup inicial (hecho)
2. ⬜ Probar en desarrollo
3. ⬜ Integrar con carrito
4. ⬜ Crear panel admin
5. ⬜ Lanzar primera campaña
