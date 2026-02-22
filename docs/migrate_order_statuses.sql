-- ============================================
-- Migración de estados de pedidos
-- De: pending → processing → completed
-- A:  pending → paid → shipped → delivered
-- ============================================

-- Migrar pedidos con estado 'processing' a 'paid'
UPDATE orders SET status = 'paid' WHERE status = 'processing';

-- Migrar pedidos con estado 'completed' a 'delivered'  
UPDATE orders SET status = 'delivered' WHERE status = 'completed';

-- Verificar la migración
SELECT status, COUNT(*) as total FROM orders GROUP BY status ORDER BY status;

-- NOTA: Los estados válidos ahora son:
-- 'pending'   → Pendiente (recién creado)
-- 'paid'      → Pagado (pago confirmado)
-- 'shipped'   → Enviado (en camino)
-- 'delivered' → Entregado (recibido por cliente)
-- 'cancelled' → Cancelado
