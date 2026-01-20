-- ============================================================================
-- Crear tabla ORDERS para guardar pedidos de clientes
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  customer_email TEXT NOT NULL,  -- OBLIGATORIO - se usa para filtrar
  items JSONB NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  shipping_address JSONB,
  payment_status TEXT DEFAULT 'completed',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ============================================================================
-- Habilitar RLS (Row Level Security)
-- ============================================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Los clientes pueden ver sus propios pedidos por correo
-- Sin RLS por ahora porque filtramos por cliente_email manualmente en el backend
CREATE POLICY "Anyone can read orders for their email"
  ON orders FOR SELECT
  USING (true);

-- Usuarios no pueden actualizar pedidos directamente (solo sistema)
CREATE POLICY "Orders are read-only for users"
  ON orders FOR UPDATE
  USING (false);

-- Usuarios no pueden eliminar pedidos
CREATE POLICY "Orders cannot be deleted"
  ON orders FOR DELETE
  USING (false);

-- ============================================================================
-- OPCIONAL: Crear tabla para líneas de orden (si quieres más detalle)
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_brand TEXT,
  quantity INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
