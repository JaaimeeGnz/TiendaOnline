-- ============================================================================
-- Script para añadir soporte de Items de Pedido con referencia a Productos
-- ============================================================================

-- 1. Crear la tabla 'order_items' 
-- Esta tabla permite que un pedido (order) tenga múltiples productos.
-- Se vincula a la tabla 'orders' y a la tabla 'products'.

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vinculación con el Pedido
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Vinculación con el Producto (Lo que pediste)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Datos del producto al momento de la compra (Snapshot)
  -- Guardamos estos datos aquí por si el producto cambia de precio o nombre en el futuro
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  price_cents INTEGER NOT NULL, -- Precio unitario en centavos
  total_cents INTEGER NOT NULL, -- (price_cents * quantity)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- 3. Habilitar seguridad (RLS)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede ver items (por ahora, filtrado por backend)
CREATE POLICY "Public read access" ON order_items FOR SELECT USING (true);

-- Comentario para el usuario:
-- Esta estructura es la recomendada ("Normalización"). 
-- En lugar de meter una lista gigante en una columna de la tabla 'orders',
-- creamos filas individuales en 'order_items' vinculadas al 'order_id'.
-- Así si un pedido tiene 10 productos, habrá 10 filas aquí con el mismo order_id.
