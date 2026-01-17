-- ============================================================================
-- SQL de Ejemplo: Cómo Añadir Más Productos Manualmente
-- ============================================================================

-- PATRÓN BÁSICO PARA AÑADIR UN PRODUCTO

-- 1. OPCIÓN SIMPLE (sin descuento)
INSERT INTO products (
  name, 
  slug, 
  description, 
  price_cents, 
  stock, 
  category_id, 
  color, 
  material, 
  sizes, 
  sku, 
  brand, 
  images
)
SELECT 
  'Nombre del Producto',
  'slug-del-producto',
  'Descripción completa del producto...',
  9999,  -- Precio en céntimos (€99,99)
  50,    -- Stock disponible
  id,    -- ID de la categoría (obtenido del WHERE)
  'Color',
  'Material',
  ARRAY['S', 'M', 'L', 'XL'],  -- Tallas disponibles
  'SKU-001',
  'Marca',
  ARRAY[
    'https://images.unsplash.com/photo-xxx?w=800&q=80',
    'https://images.unsplash.com/photo-yyy?w=800&q=80'
  ]
FROM categories WHERE slug = 'nombre-de-categoria';

-- ============================================================================

-- 2. OPCIÓN CON DESCUENTO
INSERT INTO products (
  name, 
  slug, 
  description, 
  price_cents,           -- Precio actual
  original_price_cents,  -- Precio original (para descuento)
  stock, 
  category_id, 
  color, 
  material, 
  sizes, 
  sku, 
  featured,  -- true si quieres que aparezca en inicio
  brand, 
  images
)
SELECT 
  'Producto en Oferta',
  'producto-en-oferta',
  'Este producto tiene descuento especial',
  7999,    -- €79,99 (precio actual)
  12999,   -- €129,99 (precio original) = 38% descuento
  35,
  id,
  'Negro',
  'Algodón',
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  'SKU-002',
  true,    -- Featured
  'Nike',
  ARRAY[
    'https://images.unsplash.com/photo-aaa?w=800&q=80',
    'https://images.unsplash.com/photo-bbb?w=800&q=80',
    'https://images.unsplash.com/photo-ccc?w=800&q=80'
  ]
FROM categories WHERE slug = 'camisetas';

-- ============================================================================

-- 3. AÑADIR VARIANTES DE STOCK (por talla/color)
-- Primero, obtén el product_id del producto que acabas de crear:

WITH latest_product AS (
  SELECT id FROM products WHERE slug = 'producto-en-oferta'
)
INSERT INTO product_variants (product_id, size, color, stock, sku)
SELECT 
  p.id,
  'S',
  'Negro',
  10,
  'SKU-002-S-BK'
FROM latest_product p
UNION ALL
SELECT 
  p.id,
  'M',
  'Negro',
  15,
  'SKU-002-M-BK'
FROM latest_product p
UNION ALL
SELECT 
  p.id,
  'L',
  'Negro',
  8,
  'SKU-002-L-BK'
FROM latest_product p;

-- ============================================================================

-- 4. CATEGORÍAS DISPONIBLES (para usar en WHERE slug = '...')

-- Principales:
-- - zapatillas
-- - ropa
-- - accesorios

-- Subcategorías de Ropa:
-- - camisetas
-- - sudaderas
-- - chaquetas
-- - pantalones
-- - polos

-- Subcategorías de Accesorios:
-- - gorros
-- - calcetines
-- - mochilas
-- - cinturones
-- - gafas

-- ============================================================================

-- 5. EJEMPLOS DE TALLAS SEGÚN CATEGORÍA

-- Para Zapatillas y Ropa baja:
ARRAY['40', '41', '42', '43', '44', '45']

-- Para Ropa (Camisetas, Sudaderas, etc.):
ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL']

-- Para Ropa baja (Pantalones):
ARRAY['30', '32', '34', '36', '38', '40']

-- Para Accesorios (Gorros, Calcetines):
ARRAY['Única']

-- ============================================================================

-- 6. CÓMO OBTENER URLs DE IMÁGENES

-- Opción 1: Unsplash (recomendado)
-- https://unsplash.com
-- Copiar foto → Click derecho → Copiar enlace
-- Formato: https://images.unsplash.com/photo-{ID}?w=800&q=80

-- Opción 2: Pexels
-- https://www.pexels.com

-- Opción 3: Pixabay
-- https://pixabay.com

-- ============================================================================

-- 7. ACTUALIZAR UN PRODUCTO EXISTENTE

-- Cambiar precio:
UPDATE products 
SET price_cents = 11999
WHERE slug = 'nike-air-max-90';

-- Cambiar stock:
UPDATE products 
SET stock = 100
WHERE slug = 'nike-air-max-90';

-- Cambiar descripción:
UPDATE products 
SET description = 'Nueva descripción...'
WHERE slug = 'nike-air-max-90';

-- Añadir imagen:
UPDATE products 
SET images = array_append(images, 'https://images.unsplash.com/photo-nueva?w=800&q=80')
WHERE slug = 'nike-air-max-90';

-- ============================================================================

-- 8. ELIMINAR UN PRODUCTO

DELETE FROM products WHERE slug = 'nombre-del-producto';
-- Las variantes se eliminarán automáticamente por CASCADE

-- ============================================================================

-- 9. VER TODOS LOS PRODUCTOS

SELECT 
  id,
  name,
  slug,
  price_cents,
  original_price_cents,
  stock,
  brand,
  array_length(images, 1) as num_images
FROM products
ORDER BY created_at DESC;

-- ============================================================================

-- 10. CALCULAR DESCUENTOS AUTOMÁTICAMENTE

-- Ver productos con descuento:
SELECT 
  name,
  price_cents as precio_actual,
  original_price_cents as precio_original,
  ROUND((1 - (price_cents::float / original_price_cents)) * 100) as descuento_porcentaje
FROM products
WHERE original_price_cents IS NOT NULL 
  AND original_price_cents > price_cents
ORDER BY descuento_porcentaje DESC;

-- ============================================================================

-- 11. BUSCAR PRODUCTOS POR MARCA

SELECT name, brand, price_cents, stock
FROM products
WHERE brand = 'Nike'
ORDER BY price_cents DESC;

-- ============================================================================

-- 12. STOCK POR CATEGORÍA

SELECT 
  c.name as categoria,
  COUNT(p.id) as productos,
  SUM(p.stock) as stock_total,
  ROUND(SUM(p.stock) * 100 / (SELECT SUM(stock) FROM products), 2) as porcentaje
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
WHERE c.parent_id IS NULL
GROUP BY c.id, c.name
ORDER BY stock_total DESC;

-- ============================================================================

-- NOTAS IMPORTANTES

-- 1. price_cents siempre en céntimos:
--    €99,99 → 9999 (cents)
--    €10,50 → 1050 (cents)

-- 2. Images es un array TEXT:
--    ARRAY['url1', 'url2', 'url3']

-- 3. Sizes es un array TEXT:
--    ARRAY['S', 'M', 'L', 'XL']

-- 4. Siempre incluir descripción clara

-- 5. SKU único por producto

-- 6. Si featured=true, aparece en inicio

-- 7. Las variantes se crean DESPUÉS del producto

-- 8. Timestamps se crean automáticamente

-- ============================================================================
