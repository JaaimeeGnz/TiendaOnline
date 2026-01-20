## 📧 Email de Confirmación de Pedidos - Implementado

Se ha implementado el sistema de envío de emails de confirmación de pedidos con **Brevo**.

### 🔧 Cambios Realizados

#### 1. Función en `src/lib/email.ts`
- ✅ **`sendOrderConfirmationEmail()`**: Nueva función que envía email con detalles del pedido
  - Muestra número de pedido formateado (Pedido #PED-XXXXXX)
  - Lista de artículos con cantidades y precios
  - Desglose de subtotal, envío y total
  - Diseño profesional con branding de JGMarket

#### 2. Endpoint `src/pages/api/email/send-order-confirmation.ts`
- ✅ Nuevo endpoint para enviar emails de confirmación
- Recibe: email, orderNumber, items, subtotal, shipping, total
- Retorna: success, messageId

#### 3. Integración en Checkout
- ✅ `src/pages/api/stripe/checkout.ts` ahora:
  - Guarda el pedido en Supabase
  - Obtiene el `order_number` de la respuesta
  - Automáticamente envía email de confirmación
  - Incluye manejo de errores para cada paso

### 🚀 Flujo Completo

```
1. Usuario hace checkout
   ↓
2. Se crea sesión de Stripe
   ↓
3. Se guarda orden en Supabase (retorna order_number)
   ↓
4. Se envía email de confirmación con Brevo
   ↓
5. Se redirige a página de éxito con session_id
```

### ⚠️ IMPORTANTE: Ejecutar Migración SQL

Para que el sistema funcione correctamente, debes ejecutar la migración SQL en Supabase:

**En Supabase → SQL Editor → Nuevo Query:**

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number SERIAL UNIQUE;
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
```

**Esto:**
- ✅ Agrega columna `order_number` con auto-incremento
- ✅ Crea índice para optimizar búsquedas
- ✅ Permite que los emails muestren "Pedido #PED-000001"

### 📝 Ejemplo de Email Enviado

El email incluye:
- ✅ Número de pedido: **Pedido #PED-000001**
- ✅ Email de contacto
- ✅ Tabla con artículos pedidos
- ✅ Desglose de precios (subtotal, envío, total)
- ✅ Diseño responsive y profesional
- ✅ Logo y branding de JGMarket

### 🔍 Logs para Debuggear

En la consola de desarrollo verás:

```
📧 Enviando email de confirmación de pedido a: usuario@email.com
✅ Email de confirmación enviado
📧 Resultado de email de confirmación: { success: true, messageId: '...' }
```

### 🧪 Prueba Rápida

1. Ejecuta la migración SQL en Supabase
2. Recarga el navegador
3. Haz un pedido de prueba
4. Deberías recibir email con Pedido #PED-XXXXXX

### 📚 Archivos Modificados

- `src/lib/email.ts` - Nueva función `sendOrderConfirmationEmail()`
- `src/pages/api/stripe/checkout.ts` - Integración de envío de emails
- `src/pages/api/email/send-order-confirmation.ts` - Nuevo endpoint
- `docs/add_order_number.sql` - Migración SQL (⚠️ EJECUTAR MANUALMENTE)

---

**Estado:** ✅ Listo para usar (después de ejecutar migración SQL)
