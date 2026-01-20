-- ============================================================================
-- SCRIPT DE MIGRACIÓN: Actualizar tabla ORDERS
-- ============================================================================

-- PASO 1: Borrar TODAS las políticas viejas
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Orders are read-only for users" ON orders;
DROP POLICY IF EXISTS "Orders cannot be deleted" ON orders;
DROP POLICY IF EXISTS "read_all_orders" ON orders;
DROP POLICY IF EXISTS "update_disabled" ON orders;
DROP POLICY IF EXISTS "delete_disabled" ON orders;

-- PASO 2: Remover la columna user_id completamente (si existe)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS "orders_user_id_fkey";
ALTER TABLE orders DROP COLUMN IF EXISTS user_id;

-- PASO 3: Asegurar que customer_email NO sea nulo
UPDATE orders SET customer_email = 'unknown@example.com' WHERE customer_email IS NULL;
ALTER TABLE orders ALTER COLUMN customer_email SET NOT NULL;

-- PASO 4: Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- PASO 5: Crear nuevas políticas RLS simplificadas
CREATE POLICY "read_all_orders" ON orders FOR SELECT USING (true);
CREATE POLICY "update_disabled" ON orders FOR UPDATE USING (false);
CREATE POLICY "delete_disabled" ON orders FOR DELETE USING (false);

-- ✅ ¡LISTO! La tabla está lista para guardar pedidos sin user_id
