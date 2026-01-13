-- ============================================================================
-- JGMarket: Script de Seed para Productos Deportivos
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- Primero, limpiar datos existentes (opcional)
-- DELETE FROM products;
-- DELETE FROM categories;

-- 1. INSERTAR CATEGORÍAS
INSERT INTO categories (name, slug, description, display_order, is_active)
VALUES
  ('Zapatillas', 'zapatillas', 'Lo último en sneakers y calzado deportivo', 1, true),
  ('Ropa', 'ropa', 'Camisetas, sudaderas, pantalones y más', 2, true),
  ('Accesorios', 'accesorios', 'Gorras, mochilas, calcetines y complementos', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- 2. INSERTAR PRODUCTOS - ZAPATILLAS

-- Nike Air Max 90
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Nike Air Max 90',
  'nike-air-max-90',
  'Las icónicas Nike Air Max 90, combinando estilo retro con tecnología moderna. Unidad Air visible para máxima amortiguación.',
  13999,
  16999,
  25,
  id,
  'Nike',
  'Blanco/Negro',
  'Cuero sintético',
  ARRAY['40', '41', '42', '43', '44', '45'],
  'NIKE-AM90-001',
  true,
  true
FROM categories WHERE slug = 'zapatillas'
ON CONFLICT (slug) DO NOTHING;

-- Adidas Samba OG
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Adidas Samba OG',
  'adidas-samba-og',
  'El clásico que nunca pasa de moda. Diseño atemporal perfecto para cualquier ocasión.',
  10999,
  12999,
  30,
  id,
  'Adidas',
  'Negro/Blanco',
  'Cuero',
  ARRAY['39', '40', '41', '42', '43', '44'],
  'ADI-SAMBA-001',
  true,
  true
FROM categories WHERE slug = 'zapatillas'
ON CONFLICT (slug) DO NOTHING;

-- Nike Dunk Low
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Nike Dunk Low Panda',
  'nike-dunk-low-panda',
  'Las míticas Nike Dunk Low en colorway Panda. El must-have de la temporada.',
  11999,
  NULL,
  18,
  id,
  'Nike',
  'Blanco/Negro',
  'Cuero',
  ARRAY['40', '41', '42', '43', '44'],
  'NIKE-DUNK-001',
  true,
  true
FROM categories WHERE slug = 'zapatillas'
ON CONFLICT (slug) DO NOTHING;

-- Jordan 1 Mid
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Jordan 1 Mid Chicago',
  'jordan-1-mid-chicago',
  'Un clásico del basketball llevado al streetwear. Colorway Chicago inconfundible.',
  14999,
  17999,
  12,
  id,
  'Jordan',
  'Rojo/Blanco/Negro',
  'Cuero',
  ARRAY['40', '41', '42', '43', '44', '45'],
  'JOR-1M-001',
  true,
  true
FROM categories WHERE slug = 'zapatillas'
ON CONFLICT (slug) DO NOTHING;

-- New Balance 550
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'New Balance 550',
  'new-balance-550',
  'Diseño retro-basketball con el confort característico de New Balance.',
  12999,
  14999,
  22,
  id,
  'New Balance',
  'Blanco/Gris',
  'Cuero',
  ARRAY['40', '41', '42', '43', '44'],
  'NB-550-001',
  false,
  true
FROM categories WHERE slug = 'zapatillas'
ON CONFLICT (slug) DO NOTHING;

-- Puma Suede Classic
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Puma Suede Classic',
  'puma-suede-classic',
  'El icono del streetwear desde 1968. Ante premium y estilo atemporal.',
  7999,
  9999,
  35,
  id,
  'Puma',
  'Negro',
  'Ante',
  ARRAY['40', '41', '42', '43', '44', '45'],
  'PUMA-SC-001',
  false,
  true
FROM categories WHERE slug = 'zapatillas'
ON CONFLICT (slug) DO NOTHING;

-- 3. INSERTAR PRODUCTOS - ROPA

-- Nike Tech Fleece Hoodie
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Nike Tech Fleece Hoodie',
  'nike-tech-fleece-hoodie',
  'La sudadera con capucha Tech Fleece de Nike. Calidez sin volumen extra.',
  10999,
  12999,
  40,
  id,
  'Nike',
  'Negro',
  'Algodón/Poliéster',
  ARRAY['S', 'M', 'L', 'XL'],
  'NIKE-TFH-001',
  true,
  true
FROM categories WHERE slug = 'ropa'
ON CONFLICT (slug) DO NOTHING;

-- Adidas Originals Trefoil Tee
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Adidas Trefoil Tee',
  'adidas-trefoil-tee',
  'Camiseta clásica con el icónico logo Trefoil. Algodón 100% suave.',
  2999,
  NULL,
  60,
  id,
  'Adidas',
  'Blanco',
  'Algodón',
  ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'ADI-TT-001',
  false,
  true
FROM categories WHERE slug = 'ropa'
ON CONFLICT (slug) DO NOTHING;

-- Nike Joggers
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Nike Sportswear Club Joggers',
  'nike-sportswear-joggers',
  'Joggers cómodos para uso diario. Felpa suave y corte regular.',
  5499,
  6999,
  45,
  id,
  'Nike',
  'Gris',
  'Algodón/Poliéster',
  ARRAY['S', 'M', 'L', 'XL'],
  'NIKE-JOG-001',
  false,
  true
FROM categories WHERE slug = 'ropa'
ON CONFLICT (slug) DO NOTHING;

-- Jordan Jumpman Hoodie
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Jordan Jumpman Hoodie',
  'jordan-jumpman-hoodie',
  'Sudadera con capucha Jumpman. Estilo basketball para tu día a día.',
  8999,
  10999,
  28,
  id,
  'Jordan',
  'Rojo',
  'Felpa',
  ARRAY['S', 'M', 'L', 'XL'],
  'JOR-JH-001',
  true,
  true
FROM categories WHERE slug = 'ropa'
ON CONFLICT (slug) DO NOTHING;

-- The North Face Jacket
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'The North Face 1996 Retro Nuptse',
  'tnf-1996-nuptse',
  'La icónica chaqueta Nuptse con relleno de plumón 700. Máximo calor, mínimo peso.',
  29999,
  34999,
  15,
  id,
  'The North Face',
  'Negro',
  'Nylon/Plumón',
  ARRAY['S', 'M', 'L', 'XL'],
  'TNF-NUP-001',
  true,
  true
FROM categories WHERE slug = 'ropa'
ON CONFLICT (slug) DO NOTHING;

-- 4. INSERTAR PRODUCTOS - ACCESORIOS

-- Nike Heritage Cap
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Nike Heritage86 Cap',
  'nike-heritage-cap',
  'Gorra clásica con logo Swoosh bordado. Cierre ajustable.',
  2499,
  NULL,
  50,
  id,
  'Nike',
  'Negro',
  'Algodón',
  ARRAY['Única'],
  'NIKE-CAP-001',
  false,
  true
FROM categories WHERE slug = 'accesorios'
ON CONFLICT (slug) DO NOTHING;

-- Adidas Backpack
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Adidas Classic Backpack',
  'adidas-classic-backpack',
  'Mochila versátil con compartimento para portátil. Perfecta para el día a día.',
  4499,
  5499,
  35,
  id,
  'Adidas',
  'Negro',
  'Poliéster reciclado',
  ARRAY['Única'],
  'ADI-BP-001',
  false,
  true
FROM categories WHERE slug = 'accesorios'
ON CONFLICT (slug) DO NOTHING;

-- Nike Socks 3-Pack
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Nike Everyday Crew Socks 3-Pack',
  'nike-crew-socks-3pack',
  'Pack de 3 calcetines deportivos. Amortiguación y transpirabilidad.',
  1499,
  1999,
  80,
  id,
  'Nike',
  'Blanco',
  'Algodón/Poliéster',
  ARRAY['38-42', '42-46'],
  'NIKE-SOC-001',
  false,
  true
FROM categories WHERE slug = 'accesorios'
ON CONFLICT (slug) DO NOTHING;

-- Jordan Crossbody Bag
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, brand, color, material, sizes, sku, featured, is_active)
SELECT 
  'Jordan Crossbody Bag',
  'jordan-crossbody-bag',
  'Bolso bandolera con logo Jumpman. Compacto y funcional.',
  3499,
  NULL,
  25,
  id,
  'Jordan',
  'Negro',
  'Nylon',
  ARRAY['Única'],
  'JOR-CB-001',
  false,
  true
FROM categories WHERE slug = 'accesorios'
ON CONFLICT (slug) DO NOTHING;

-- Verificar inserción
SELECT 
  c.name as categoria,
  COUNT(p.id) as total_productos
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name
ORDER BY c.display_order;
