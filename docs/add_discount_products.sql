-- ============================================================================
-- SCRIPT: Agregar Productos con Rebaja/Descuento
-- ============================================================================
-- Este script actualiza productos existentes para agregarles descuento
-- Los productos con descuento aparecerán automáticamente en la sección REBAJAS

-- ============================================================================
-- OPCIÓN 1: ACTUALIZAR PRODUCTOS EXISTENTES CON DESCUENTO
-- ============================================================================
-- Esto agrega descuento a algunos productos existentes

UPDATE products 
SET original_price_cents = CASE 
    WHEN slug = 'converse-chuck-taylor' THEN 9999
    WHEN slug = 'vans-old-skool' THEN 12499
    WHEN slug = 'puma-rs-x' THEN 14999
    WHEN slug = 'new-balance-574' THEN 16999
    WHEN slug = 'adidas-ultraboost' THEN 18999
    WHEN slug = 'nike-air-max-90' THEN 17499
    WHEN slug = 'converse-platform' THEN 11999
    WHEN slug = 'timberland-boots' THEN 24999
    ELSE original_price_cents
END
WHERE slug IN (
    'converse-chuck-taylor',
    'vans-old-skool', 
    'puma-rs-x',
    'new-balance-574',
    'adidas-ultraboost',
    'nike-air-max-90',
    'converse-platform',
    'timberland-boots'
);

-- ============================================================================
-- OPCIÓN 2: AGREGAR NUEVOS PRODUCTOS CON REBAJA
-- ============================================================================
-- Si prefieres agregar productos completamente nuevos con rebaja

INSERT INTO products (
  name, slug, description, price_cents, original_price_cents, stock, 
  category_id, color, material, sizes, sku, featured, is_active, brand
)
SELECT 
  'Nike Air Max 270 - OUTLET', 'nike-air-max-270-outlet',
  'Air Max legendario con descuento especial. Últimas unidades en stock.',
  9999, 15999, 25, id, 'Negro/Gris', 'Sintético', 
  ARRAY['40', '41', '42', '43', '44', '45'], 'NIKE-270-OUTLET', true, true, 'Nike'
FROM categories WHERE slug = 'zapatillas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, description, price_cents, original_price_cents, stock, 
  category_id, color, material, sizes, sku, featured, is_active, brand
)
SELECT 
  'Adidas Stan Smith - BLACK FRIDAY', 'adidas-stan-smith-bf',
  'El clásico Adidas con descuento de Black Friday. Ahora a mitad de precio.',
  6499, 12999, 40, id, 'Blanco/Negro', 'Cuero sintético', 
  ARRAY['40', '41', '42', '43', '44', '45'], 'ADIDAS-SS-BF', true, true, 'Adidas'
FROM categories WHERE slug = 'zapatillas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, description, price_cents, original_price_cents, stock, 
  category_id, color, material, sizes, sku, featured, is_active, brand
)
SELECT 
  'Puma Future Rider - SALE', 'puma-future-rider-sale',
  'Zapatilla deportiva retro con gran descuento. Stock limitado.',
  7999, 13999, 20, id, 'Rojo/Negro', 'Sintético', 
  ARRAY['40', '41', '42', '43', '44', '45'], 'PUMA-FR-SALE', true, true, 'Puma'
FROM categories WHERE slug = 'zapatillas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, description, price_cents, original_price_cents, stock, 
  category_id, color, material, sizes, sku, featured, is_active, brand
)
SELECT 
  'Fila Disruptor II - CLEARANCE', 'fila-disruptor-ii-clearance',
  'Zapatilla trendy con descuento por fin de temporada.',
  5999, 11999, 35, id, 'Blanco', 'Sintético', 
  ARRAY['40', '41', '42', '43', '44', '45'], 'FILA-DISRUPT-CLEAR', true, true, 'Fila'
FROM categories WHERE slug = 'zapatillas'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- VERIFICAR RESULTADOS
-- ============================================================================

-- Ver todos los productos con rebaja (donde original_price_cents > price_cents)
SELECT 
  name,
  slug,
  price_cents as precio_actual,
  original_price_cents as precio_original,
  ROUND(((original_price_cents - price_cents)::numeric / original_price_cents * 100), 0) as descuento_porcentaje,
  stock
FROM products
WHERE original_price_cents > price_cents AND is_active = true
ORDER BY descuento_porcentaje DESC;

-- Contar cuántos productos hay en rebaja
SELECT COUNT(*) as productos_en_rebaja
FROM products
WHERE original_price_cents > price_cents AND is_active = true;
