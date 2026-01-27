# 📧 Instrucciones: Agregar Columna customer_email a Orders

## Problema
La columna `customer_email` no existe aún en la tabla `orders` de Supabase.

## Solución
Ejecuta el siguiente SQL en Supabase SQL Editor.

### Pasos:
1. Ve a [Supabase](https://supabase.com)
2. Abre tu proyecto "tiendaOnline"
3. Ve a **SQL Editor** en el menú lateral
4. Haz clic en **New Query**
5. Copia y pega el siguiente código SQL:

```sql
-- Agregar columna customer_email a la tabla orders
ALTER TABLE orders
ADD COLUMN customer_email VARCHAR(255);

-- Crear índice en customer_email para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
```

6. Haz clic en **Run** (o presiona Ctrl+Enter)
7. ✅ Listo! La columna se ha creado

## Después de la migración:
- Las nuevas órdenes guardaran el `customer_email` directamente
- Los correos mostrados en `/admin/pedidos` serán exactos
- El sistema enviará notificaciones al correo correcto

## Nota
El código ya está preparado para usar esta columna. Solo falta ejecutar el SQL en Supabase.
