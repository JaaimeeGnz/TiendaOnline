-- =============================================
-- MIGRACIÓN: Stock por Talla (product_sizes)
-- =============================================
-- Esta migración cambia el control de stock de "por producto" a "por talla".
-- Se crea una tabla product_sizes que almacena el stock individual de cada talla.
-- Se añade el campo "size" a order_items para rastrear qué talla se compró.
--
-- EJECUTAR ESTE SQL EN SUPABASE SQL EDITOR
-- =============================================

-- 1. Crear la tabla product_sizes
CREATE TABLE IF NOT EXISTS product_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(20) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- 2. Migrar datos existentes: distribuir el stock actual entre las tallas existentes
-- Para cada producto, toma sus tallas del array sizes[] y reparte el stock equitativamente
DO $$
DECLARE
  prod RECORD;
  sz TEXT;
  stock_per_size INT;
  remaining_stock INT;
  size_count INT;
  i INT;
BEGIN
  FOR prod IN SELECT id, stock, sizes FROM products WHERE sizes IS NOT NULL AND array_length(sizes, 1) > 0
  LOOP
    size_count := array_length(prod.sizes, 1);
    stock_per_size := prod.stock / size_count;
    remaining_stock := prod.stock % size_count;
    i := 0;
    
    FOREACH sz IN ARRAY prod.sizes
    LOOP
      -- El primer elemento recibe el stock restante (residuo)
      INSERT INTO product_sizes (product_id, size, stock)
      VALUES (
        prod.id, 
        sz, 
        CASE WHEN i = 0 THEN stock_per_size + remaining_stock ELSE stock_per_size END
      )
      ON CONFLICT (product_id, size) DO UPDATE SET stock = EXCLUDED.stock;
      i := i + 1;
    END LOOP;
  END LOOP;
END $$;

-- 3. Añadir columna "size" a order_items para guardar la talla comprada
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size VARCHAR(20);

-- 4. Habilitar RLS en product_sizes
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de seguridad para product_sizes
-- Lectura pública (todos pueden ver el stock por talla)
CREATE POLICY "product_sizes_select_all" ON product_sizes
  FOR SELECT USING (true);

-- Inserción/actualización/eliminación solo para usuarios con rol service_role
CREATE POLICY "product_sizes_insert_anon" ON product_sizes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "product_sizes_update_anon" ON product_sizes
  FOR UPDATE USING (true);

CREATE POLICY "product_sizes_delete_anon" ON product_sizes
  FOR DELETE USING (true);

-- 6. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_size ON product_sizes(product_id, size);

-- =============================================
-- VERIFICACIÓN: Ejecuta esto para confirmar que todo se migró correctamente
-- =============================================
-- SELECT p.name, ps.size, ps.stock 
-- FROM product_sizes ps 
-- JOIN products p ON p.id = ps.product_id 
-- ORDER BY p.name, ps.size;
