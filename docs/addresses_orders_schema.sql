-- ============================================================================
-- TABLA: addresses (Direcciones de envío)
-- Esta tabla almacena las direcciones de envío de los usuarios
-- ============================================================================

-- 1. Crear tabla de direcciones
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  street VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL,
  apartment VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, id)
);

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);

-- 3. Habilitar RLS en la tabla addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para la tabla addresses
-- Política de lectura: Los usuarios solo pueden leer sus propias direcciones
CREATE POLICY addresses_read_own ON addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política de inserción: Los usuarios solo pueden crear sus propias direcciones
CREATE POLICY addresses_insert_own ON addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política de actualización: Los usuarios solo pueden actualizar sus propias direcciones
CREATE POLICY addresses_update_own ON addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política de eliminación: Los usuarios solo pueden eliminar sus propias direcciones
CREATE POLICY addresses_delete_own ON addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_addresses_updated_at();

-- ============================================================================
-- TABLA: orders (Pedidos)
-- Esta tabla almacena los pedidos realizados por los usuarios
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  total_cents INT NOT NULL, -- Total en céntimos
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  payment_method VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 3. Habilitar RLS en la tabla orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para la tabla orders
CREATE POLICY orders_read_own ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY orders_insert_own ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY orders_update_own ON orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Trigger para actualizar updated_at en orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- ============================================================================
-- COMENTARIOS
-- ============================================================================
COMMENT ON TABLE addresses IS 'Tabla de direcciones de envío de usuarios';
COMMENT ON TABLE orders IS 'Tabla de pedidos realizados por usuarios';
