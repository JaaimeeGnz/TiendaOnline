-- ============================================================================
-- 🚀 EJECUTA ESTE SCRIPT EN SUPABASE PARA ACTIVAR LAS FUNCIONALIDADES
-- ============================================================================
-- 
-- INSTRUCCIONES:
-- 1. Abre https://supabase.com/dashboard
-- 2. Selecciona tu proyecto "JGMarket"
-- 3. Ve a SQL Editor → New Query
-- 4. Copia TODO este contenido (Ctrl+A, Ctrl+C)
-- 5. Pega en el editor (Ctrl+V)
-- 6. Haz clic en RUN (botón azul de ejecución)
-- 7. ¡Listo! Las tablas están creadas
--
-- ============================================================================

-- ============================================================================
-- TABLA 1: addresses (Direcciones de envío)
-- ============================================================================

-- Primero, eliminar la tabla si existe para evitar conflictos
DROP TABLE IF EXISTS addresses CASCADE;

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agregar constraint de foreign key después de crear la tabla
ALTER TABLE addresses
  ADD CONSTRAINT fk_addresses_user_id 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);

-- Habilitar RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores si existen
DROP POLICY IF EXISTS addresses_read_own ON addresses;
DROP POLICY IF EXISTS addresses_insert_own ON addresses;
DROP POLICY IF EXISTS addresses_update_own ON addresses;
DROP POLICY IF EXISTS addresses_delete_own ON addresses;

-- Políticas RLS
CREATE POLICY addresses_read_own ON addresses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY addresses_insert_own ON addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY addresses_update_own ON addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY addresses_delete_own ON addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
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
-- TABLA 2: orders (Pedidos)
-- ============================================================================

-- Primero, eliminar la tabla si existe para evitar conflictos
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  address_id UUID,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  total_cents INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agregar constraints de foreign key después de crear la tabla
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_user_id 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_address_id 
  FOREIGN KEY (address_id) 
  REFERENCES addresses(id) 
  ON DELETE SET NULL;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores si existen
DROP POLICY IF EXISTS orders_read_own ON orders;
DROP POLICY IF EXISTS orders_insert_own ON orders;
DROP POLICY IF EXISTS orders_update_own ON orders;

-- Políticas RLS
-- Los usuarios pueden ver sus propios pedidos
CREATE POLICY orders_read_own ON orders
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Permitir inserción desde el API (sin verificación de usuario)
CREATE POLICY orders_insert_api ON orders
  FOR INSERT
  WITH CHECK (true);

-- Los usuarios autenticados pueden actualizar sus propios pedidos
CREATE POLICY orders_update_own ON orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
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
-- ✅ FINALIZACION
-- ============================================================================
-- Si ves este mensaje en verde, todo se ejecutó correctamente:
-- "NOTICE: Relation "addresses" already exists, skipping..."
-- "NOTICE: Relation "orders" already exists, skipping..."
-- O una confirmación de que las tablas fueron creadas.
--
-- Las funcionalidades ahora están disponibles en /account
-- ============================================================================
