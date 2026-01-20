-- ============================================================================
-- AGREGAR NÚMERO DE PEDIDO BONITO A LA TABLA ORDERS
-- ============================================================================

-- 1. Agregar columna order_number (será un número secuencial bonito)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number SERIAL UNIQUE;

-- 2. Crear índice
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- SELECT id, order_number, session_id, customer_email, status, created_at FROM orders ORDER BY order_number DESC LIMIT 10;
