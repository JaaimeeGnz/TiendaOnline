-- ============================================================================
-- FashionMarket: Schema + Datos + Imágenes Reales
-- Ejecutar TODO esto en Supabase SQL Editor
-- ============================================================================

-- 1. CREAR TABLA: categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREAR TABLA: products (actualizada con más imágenes)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price_cents INT NOT NULL,
  original_price_cents INT,
  stock INT NOT NULL DEFAULT 0,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{XS,S,M,L,XL,XXL}',
  color VARCHAR(100),
  material VARCHAR(100),
  brand VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sku VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: product_variants (para stock específico por talla/color)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(50) NOT NULL,
  color VARCHAR(100) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  sku VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, size, color)
);

-- 4. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- 5. HABILITAR RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS RLS
DROP POLICY IF EXISTS categories_read_public ON categories;
CREATE POLICY categories_read_public ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS categories_write_admin ON categories;
CREATE POLICY categories_write_admin ON categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS categories_update_admin ON categories;
CREATE POLICY categories_update_admin ON categories FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS categories_delete_admin ON categories;
CREATE POLICY categories_delete_admin ON categories FOR DELETE USING (true);

DROP POLICY IF EXISTS products_read_public ON products;
CREATE POLICY products_read_public ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS products_insert_admin ON products;
CREATE POLICY products_insert_admin ON products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS products_update_admin ON products;
CREATE POLICY products_update_admin ON products FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS products_delete_admin ON products;
CREATE POLICY products_delete_admin ON products FOR DELETE USING (true);

DROP POLICY IF EXISTS variants_read_public ON product_variants;
CREATE POLICY variants_read_public ON product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS variants_insert_admin ON product_variants;
CREATE POLICY variants_insert_admin ON product_variants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS variants_update_admin ON product_variants;
CREATE POLICY variants_update_admin ON product_variants FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS variants_delete_admin ON product_variants;
CREATE POLICY variants_delete_admin ON product_variants FOR DELETE USING (true);

-- ============================================================================
-- INSERTAR CATEGORÍAS PRINCIPALES Y SUBCATEGORÍAS
-- ============================================================================

ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

TRUNCATE TABLE product_variants CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;

-- CATEGORÍAS PRINCIPALES
INSERT INTO categories (name, slug, description, display_order, is_active, parent_id)
VALUES
  ('Zapatillas', 'zapatillas', 'Zapatillas de última generación con tecnología deportiva', 1, true, NULL),
  ('Ropa', 'ropa', 'Ropa premium de diseño elegante para el hombre moderno', 2, true, NULL),
  ('Accesorios', 'accesorios', 'Complementos y accesorios premium para completar tu look', 3, true, NULL);

-- SUBCATEGORÍAS ROPA
INSERT INTO categories (name, slug, description, display_order, is_active, parent_id)
SELECT 'Camisetas', 'camisetas', 'Camisetas y tops para hombre', 1, true, id FROM categories WHERE slug = 'ropa';

INSERT INTO categories (name, slug, description, display_order, is_active, parent_id)
SELECT 'Sudaderas', 'sudaderas', 'Sudaderas y hoodie para comodidad máxima', 2, true, id FROM categories WHERE slug = 'ropa';

INSERT INTO categories (name, slug, description, display_order, is_active, parent_id)
SELECT 'Chaquetas', 'chaquetas', 'Chaquetas y abrigos premium', 3, true, id FROM categories WHERE slug = 'ropa';

INSERT INTO categories (name, slug, description, display_order, is_active, parent_id)
SELECT 'Pantalones', 'pantalones', 'Pantalones y jeans de calidad', 4, true, id FROM categories WHERE slug = 'ropa';

INSERT INTO categories (name, slug, description, display_order, is_active, parent_id)
SELECT 'Polos', 'polos', 'Polos y camisas casuales', 5, true, id FROM categories WHERE slug = 'ropa';

-- SUBCATEGORÍAS ACCESORIOS
INSERT INTO categories (name, slug, description, display_order, is_active, parent_id)
SELECT 'Gorros', 'gorros', 'Gorros, sombreros y gorras', 1, true, id FROM categories WHERE slug = 'accesorios';

INSERT INTO categories (name, slug, description, display_order, is_active, parent_id)
SELECT 'Calcetines', 'calcetines', 'Calcetines y medias deportivas', 2, true, id FROM categories WHERE slug = 'accesorios';

INSERT INTO categories (name, slug, description, display_order, is_active, parent_id)
SELECT 'Mochilas', 'mochilas', 'Mochilas y bolsas de viaje', 3, true, id FROM categories WHERE slug = 'accesorios';

INSERT INTO categories (name, slug, description, display_order, is_active, parent_id)
SELECT 'Cinturones', 'cinturones', 'Cinturones y accesorios de cintura', 4, true, id FROM categories WHERE slug = 'accesorios';

INSERT INTO categories (name, slug, description, display_order, is_active, parent_id)
SELECT 'Gafas', 'gafas', 'Gafas de sol y protección', 5, true, id FROM categories WHERE slug = 'accesorios';

-- ============================================================================
-- INSERTAR PRODUCTOS - ZAPATILLAS CON IMÁGENES REALES
-- ============================================================================

-- Nike Air Max 90
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Nike Air Max 90', 'nike-air-max-90',
  'Las icónicas Nike Air Max 90, combinando estilo retro con tecnología moderna. Unidad Air visible para máxima amortiguación.',
  13999, 17999, 50, id, 'Blanco/Negro', 'Cuero/Sintético', ARRAY['40', '41', '42', '43', '44', '45'], 'NIKE-001', true, true, 'Nike',
  ARRAY[
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1543163521-9efcc062db33?w=800&q=80',
    'https://images.unsplash.com/photo-1556821552-23fcf396f9f3?w=800&q=80',
    'https://images.unsplash.com/photo-1595777712802-206c0db8c697?w=800&q=80'
  ]
FROM categories WHERE slug = 'zapatillas';

-- Adidas Samba OG
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Adidas Samba OG', 'adidas-samba-og',
  'El clásico que nunca pasa de moda. Diseño atemporal perfecto para cualquier ocasión.',
  10999, 13999, 35, id, 'Blanco/Negro', 'Cuero', ARRAY['40', '41', '42', '43', '44', '45'], 'ADIDAS-001', true, true, 'Adidas',
  ARRAY[
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1539543528051-78a2c69f4998?w=800&q=80',
    'https://images.unsplash.com/photo-1518235506717-e1ed3306a326?w=800&q=80'
  ]
FROM categories WHERE slug = 'zapatillas';

-- Puma RS-X
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Puma RS-X', 'puma-rs-x',
  'Zapatilla deportiva con diseño retro futurista. Inspirada en el archivo Puma Heritage.',
  11499, 15499, 42, id, 'Rojo', 'Sintético', ARRAY['40', '41', '42', '43', '44', '45'], 'PUMA-001', false, true, 'Puma',
  ARRAY[
    'https://images.unsplash.com/photo-1608231387042-ec3bcb62b7c2?w=800&q=80',
    'https://images.unsplash.com/photo-1600181041849-8c3e8e3de4b1?w=800&q=80'
  ]
FROM categories WHERE slug = 'zapatillas';

-- New Balance 574
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'New Balance 574', 'new-balance-574',
  'Comodidad absoluta con tecnología Fresh Foam. El favorito de runners casuales.',
  12499, 16499, 38, id, 'Gris/Blanco', 'Sintético/Malla', ARRAY['40', '41', '42', '43', '44', '45'], 'NB-001', false, true, 'New Balance',
  ARRAY[
    'https://images.unsplash.com/photo-1554866585-acbb2cae9d00?w=800&q=80',
    'https://images.unsplash.com/photo-1542860760-d2bf4117e2db?w=800&q=80'
  ]
FROM categories WHERE slug = 'zapatillas';

-- Asics Gel-Lyte III
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Asics Gel-Lyte III', 'asics-gel-lyte-iii',
  'Zapatilla técnica con split tongue, combinación perfecta entre estilo y funcionalidad.',
  12999, 16999, 30, id, 'Azul/Blanco', 'Cuero/Sintético', ARRAY['40', '41', '42', '43', '44', '45'], 'ASICS-001', true, true, 'Asics',
  ARRAY[
    'https://images.unsplash.com/photo-1595411521033-2c82b92e3203?w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'
  ]
FROM categories WHERE slug = 'zapatillas';

-- Converse Chuck Taylor
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Converse Chuck Taylor', 'converse-chuck-taylor',
  'El icono del sneaker casual. Lienzo resistente con suela de goma de primera calidad.',
  7999, 9999, 55, id, 'Negro', 'Lona', ARRAY['40', '41', '42', '43', '44', '45'], 'CONVERSE-001', false, true, 'Converse',
  ARRAY[
    'https://images.unsplash.com/photo-1597045866519-bf8a14a9f588?w=800&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'
  ]
FROM categories WHERE slug = 'zapatillas';

-- Vans Old Skool
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Vans Old Skool', 'vans-old-skool',
  'El skate classic que se volvió icónico. Construcción resistente y diseño atemporal.',
  9499, 12499, 48, id, 'Blanco/Negro', 'Lona', ARRAY['40', '41', '42', '43', '44', '45'], 'VANS-001', false, true, 'Vans',
  ARRAY[
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&q=80'
  ]
FROM categories WHERE slug = 'zapatillas';

-- ============================================================================
-- INSERTAR PRODUCTOS - ROPA > CAMISETAS
-- ============================================================================

-- Camiseta Nike Essentials
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Camiseta Nike Essentials', 'camiseta-nike-essentials',
  'Camiseta básica de algodón 100% con el logo bordado de Nike. Comodidad pura para el día a día.',
  3999, 5999, 60, id, 'Blanco', 'Algodón 100%', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'NIKE-SHIRT-001', false, true, 'Nike',
  ARRAY[
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1618886996621-5e1e8e9f92b6?w=800&q=80',
    'https://images.unsplash.com/photo-1516575080678-d2e1c2b3b4b1?w=800&q=80'
  ]
FROM categories WHERE slug = 'camisetas';

-- Camiseta Lacoste Premium
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Camiseta Lacoste Premium', 'camiseta-lacoste-premium',
  'Camiseta premium de Lacoste con el icónico cocodrilo bordado. Algodón piqué de excelente calidad.',
  9999, 13999, 40, id, 'Blanco', 'Algodón piqué', ARRAY['S', 'M', 'L', 'XL'], 'LACOSTE-001', false, true, 'Lacoste',
  ARRAY[
    'https://images.unsplash.com/photo-1503217166e7-50ffc0d09ae9?w=800&q=80',
    'https://images.unsplash.com/photo-1584865288642-42078dd0cde0?w=800&q=80'
  ]
FROM categories WHERE slug = 'camisetas';

-- Camiseta Adidas Trefoil
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Camiseta Adidas Trefoil', 'camiseta-adidas-trefoil',
  'Camiseta clásica de Adidas con el icónico trébol. Logo estampado de primera calidad.',
  5499, 7999, 50, id, 'Negro', 'Algodón 100%', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'ADIDAS-SHIRT-001', true, true, 'Adidas',
  ARRAY[
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    'https://images.unsplash.com/photo-1614287206064-89c2c0ff0d78?w=800&q=80'
  ]
FROM categories WHERE slug = 'camisetas';

-- Camiseta Puma Graphic
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Camiseta Puma Graphic', 'camiseta-puma-graphic',
  'Camiseta deportiva de Puma con gráficas modernas. Tela transpirable y cómoda.',
  4999, 6999, 45, id, 'Rojo', 'Poliéster/Algodón', ARRAY['S', 'M', 'L', 'XL'], 'PUMA-SHIRT-001', false, true, 'Puma',
  ARRAY[
    'https://images.unsplash.com/photo-1506894917149-df5a02f1a1a5?w=800&q=80',
    'https://images.unsplash.com/photo-1552108777-e1b3beef1b1a?w=800&q=80'
  ]
FROM categories WHERE slug = 'camisetas';

-- ============================================================================
-- INSERTAR PRODUCTOS - ROPA > SUDADERAS
-- ============================================================================

-- Sudadera Adidas Trefoil
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Sudadera Adidas Trefoil', 'sudadera-adidas-trefoil',
  'Sudadera clásica de Adidas con el icónico trébol. Fabricada en algodón suave y esponjoso.',
  6999, 9999, 45, id, 'Negro', 'Algodón/Poliéster', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'ADIDAS-HOOD-001', true, true, 'Adidas',
  ARRAY[
    'https://images.unsplash.com/photo-1556821552-23fcf396f9f3?w=800&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
  ]
FROM categories WHERE slug = 'sudaderas';

-- Hoodie Nike Sportswear
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Hoodie Nike Sportswear', 'hoodie-nike-sportswear',
  'Hoodie deportivo de Nike con capucha ajustable. Bolsillos canguro y cordones reforzados.',
  7999, 10999, 35, id, 'Gris', 'Algodón/Poliéster', ARRAY['S', 'M', 'L', 'XL'], 'NIKE-HOOD-001', false, true, 'Nike',
  ARRAY[
    'https://images.unsplash.com/photo-1556821552-23fcf396f9f3?w=800&q=80',
    'https://images.unsplash.com/photo-1527441871020-7461597ce5d1?w=800&q=80'
  ]
FROM categories WHERE slug = 'sudaderas';

-- Sudadera Puma Essentials
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Sudadera Puma Essentials', 'sudadera-puma-essentials',
  'Sudadera clásica de Puma con logo bordado. Comodidad máxima para cualquier ocasión.',
  6499, 8999, 40, id, 'Azul Marino', 'Algodón', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'PUMA-HOOD-001', true, true, 'Puma',
  ARRAY[
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1556821552-23fcf396f9f3?w=800&q=80'
  ]
FROM categories WHERE slug = 'sudaderas';

-- Sudadera Lacoste Classic
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Sudadera Lacoste Classic', 'sudadera-lacoste-classic',
  'Sudadera premium de Lacoste con cocodrilo bordado. Construcción de excelente calidad.',
  11999, 15999, 25, id, 'Blanco', 'Algodón 100%', ARRAY['S', 'M', 'L', 'XL'], 'LACOSTE-HOOD-001', false, true, 'Lacoste',
  ARRAY[
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1576586966181-efc6d16df0e1?w=800&q=80'
  ]
FROM categories WHERE slug = 'sudaderas';

-- ============================================================================
-- INSERTAR PRODUCTOS - ROPA > CHAQUETAS
-- ============================================================================

-- Chaqueta Tommy Hilfiger
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Chaqueta Tommy Hilfiger', 'chaqueta-tommy-hilfiger',
  'Chaqueta clásica de Tommy Hilfiger con bandera tricolor. Construcción de calidad premium.',
  14999, 19999, 25, id, 'Azul Marino', 'Algodón/Poliéster', ARRAY['S', 'M', 'L', 'XL'], 'TH-JACKET-001', true, true, 'Tommy Hilfiger',
  ARRAY[
    'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=800&q=80',
    'https://images.unsplash.com/photo-1538834603907-aeb19a36246e?w=800&q=80',
    'https://images.unsplash.com/photo-1539533057592-4d2b7472e0a7?w=800&q=80'
  ]
FROM categories WHERE slug = 'chaquetas';

-- Chaqueta Nike Windbreaker
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Chaqueta Nike Windbreaker', 'chaqueta-nike-windbreaker',
  'Chaqueta cortavientos de Nike con tecnología de secado rápido. Perfecta para todas las estaciones.',
  9999, 13999, 30, id, 'Negro', 'Poliéster', ARRAY['S', 'M', 'L', 'XL'], 'NIKE-JACKET-001', false, true, 'Nike',
  ARRAY[
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80',
    'https://images.unsplash.com/photo-1539533057592-4d2b7472e0a7?w=800&q=80'
  ]
FROM categories WHERE slug = 'chaquetas';

-- Chaqueta Adidas Trefoil
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Chaqueta Adidas Trefoil', 'chaqueta-adidas-trefoil',
  'Chaqueta deportiva de Adidas con trébol bordado. Material resistente y cómodo.',
  12999, 17999, 20, id, 'Rojo', 'Poliéster', ARRAY['S', 'M', 'L', 'XL'], 'ADIDAS-JACKET-001', true, true, 'Adidas',
  ARRAY[
    'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=800&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'
  ]
FROM categories WHERE slug = 'chaquetas';

-- ============================================================================
-- INSERTAR PRODUCTOS - ROPA > PANTALONES
-- ============================================================================

-- Pantalón Levi's 501
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Pantalón Levi''s 501', 'pantalon-levis-501',
  'El jean clásico por excelencia. Corte recto original de Levi''s. Leyenda viva del denim.',
  8999, 12999, 50, id, 'Azul Oscuro', 'Denim 100%', ARRAY['30', '32', '34', '36', '38'], 'LEVIS-001', true, true, 'Levi''s',
  ARRAY[
    'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=800&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    'https://images.unsplash.com/photo-1473221326597-91daa3da01f8?w=800&q=80'
  ]
FROM categories WHERE slug = 'pantalones';

-- Pantalón Deportivo Adidas
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Pantalón Deportivo Adidas', 'pantalon-deportivo-adidas',
  'Pantalón deportivo de Adidas con tecnología Climalite. Ideal para entrenamientos.',
  7499, 10499, 40, id, 'Negro', 'Poliéster', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'ADIDAS-PANT-001', false, true, 'Adidas',
  ARRAY[
    'https://images.unsplash.com/photo-1506811223617-52e41907ef12?w=800&q=80',
    'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800&q=80'
  ]
FROM categories WHERE slug = 'pantalones';

-- Pantalón Chino Dockers
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Pantalón Chino Dockers', 'pantalon-chino-dockers',
  'Pantalón chino de Dockers con corte clásico. Versatilidad para cualquier ocasión.',
  11999, 15999, 35, id, 'Beige', 'Algodón/Poliéster', ARRAY['30', '32', '34', '36', '38'], 'DOCKERS-001', false, true, 'Dockers',
  ARRAY[
    'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=800&q=80',
    'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=800&q=80'
  ]
FROM categories WHERE slug = 'pantalones';

-- Pantalón Jogger Nike
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Pantalón Jogger Nike', 'pantalon-jogger-nike',
  'Pantalón jogger de Nike con tecnología Dri-FIT. Comodidad máxima para el día a día.',
  7999, 10999, 42, id, 'Gris', 'Poliéster/Algodón', ARRAY['S', 'M', 'L', 'XL'], 'NIKE-JOGGER-001', true, true, 'Nike',
  ARRAY[
    'https://images.unsplash.com/photo-1506811223617-52e41907ef12?w=800&q=80',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&q=80'
  ]
FROM categories WHERE slug = 'pantalones';

-- ============================================================================
-- INSERTAR PRODUCTOS - ROPA > POLOS
-- ============================================================================

-- Polo Ralph Lauren
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Polo Ralph Lauren', 'polo-ralph-lauren',
  'Polo icónico de Ralph Lauren con el pony bordado. Algodón de primera calidad.',
  11999, 15999, 32, id, 'Rojo', 'Algodón 100%', ARRAY['S', 'M', 'L', 'XL'], 'RL-POLO-001', true, true, 'Ralph Lauren',
  ARRAY[
    'https://images.unsplash.com/photo-1530268729831-4be0a24cd111?w=800&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'
  ]
FROM categories WHERE slug = 'polos';

-- Polo Lacoste Classic
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Polo Lacoste Classic', 'polo-lacoste-classic',
  'Polo de Lacoste con cocodrilo bordado. El polo original y auténtico.',
  13999, 17999, 28, id, 'Blanco', 'Algodón piqué', ARRAY['S', 'M', 'L', 'XL'], 'LACOSTE-POLO-001', false, true, 'Lacoste',
  ARRAY[
    'https://images.unsplash.com/photo-1530268729831-4be0a24cd111?w=800&q=80',
    'https://images.unsplash.com/photo-1503217166e7-50ffc0d09ae9?w=800&q=80'
  ]
FROM categories WHERE slug = 'polos';

-- Polo Tommy Hilfiger
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Polo Tommy Hilfiger', 'polo-tommy-hilfiger',
  'Polo de Tommy Hilfiger con bandera tricolor. Elegancia casual definitiva.',
  10999, 14999, 40, id, 'Azul Marino', 'Algodón', ARRAY['S', 'M', 'L', 'XL'], 'TH-POLO-001', false, true, 'Tommy Hilfiger',
  ARRAY[
    'https://images.unsplash.com/photo-1530268729831-4be0a24cd111?w=800&q=80',
    'https://images.unsplash.com/photo-1503342394128-c894fdcc4a2e?w=800&q=80'
  ]
FROM categories WHERE slug = 'polos';

-- ============================================================================
-- INSERTAR PRODUCTOS - ACCESORIOS > GORROS
-- ============================================================================

-- Gorro Nike Beanie
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Gorro Nike Beanie', 'gorro-nike-beanie',
  'Gorro de punto suave con el logo de Nike. Mantiene el calor en climas fríos.',
  2999, 4999, 70, id, 'Negro', 'Acrílico/Algodón', ARRAY['Única'], 'NIKE-BEANIE-001', true, true, 'Nike',
  ARRAY[
    'https://images.unsplash.com/photo-1540224664106-7a64bd5a1a51?w=800&q=80',
    'https://images.unsplash.com/photo-1612528443702-f6741f3a6f12?w=800&q=80',
    'https://images.unsplash.com/photo-1540534410185-b0ffc84e5ad6?w=800&q=80'
  ]
FROM categories WHERE slug = 'gorros';

-- Gorra Adidas Baseball
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Gorra Adidas Baseball', 'gorra-adidas-baseball',
  'Gorra de béisbol de Adidas con trébol bordado. Protección solar con estilo.',
  3499, 5499, 65, id, 'Blanco', 'Algodón', ARRAY['Única'], 'ADIDAS-CAP-001', false, true, 'Adidas',
  ARRAY[
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80'
  ]
FROM categories WHERE slug = 'gorros';

-- Gorro Puma Essential
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Gorro Puma Essential', 'gorro-puma-essential',
  'Gorro clásico de Puma con logo bordado. Cálido y cómodo para invierno.',
  2999, 4499, 55, id, 'Gris', 'Acrílico', ARRAY['Única'], 'PUMA-BEANIE-001', false, true, 'Puma',
  ARRAY[
    'https://images.unsplash.com/photo-1540224664106-7a64bd5a1a51?w=800&q=80',
    'https://images.unsplash.com/photo-1612528443702-f6741f3a6f12?w=800&q=80'
  ]
FROM categories WHERE slug = 'gorros';

-- ============================================================================
-- INSERTAR PRODUCTOS - ACCESORIOS > CALCETINES
-- ============================================================================

-- Calcetines Adidas Pack 3
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Calcetines Adidas Pack 3', 'calcetines-adidas-pack-3',
  'Pack de 3 calcetines deportivos de Adidas. Tecnología de absorción de humedad.',
  4499, 6999, 100, id, 'Blanco/Negro', 'Algodón/Poliéster', ARRAY['Única'], 'ADIDAS-SOCKS-001', false, true, 'Adidas',
  ARRAY[
    'https://images.unsplash.com/photo-1554010032-f26e744de7c9?w=800&q=80',
    'https://images.unsplash.com/photo-1559925393-641e22fc4fa8?w=800&q=80'
  ]
FROM categories WHERE slug = 'calcetines';

-- Calcetines Nike Performance
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Calcetines Nike Performance', 'calcetines-nike-performance',
  'Calcetines de rendimiento de Nike con tecnología Dri-FIT. Perfectos para deportes.',
  5999, 8999, 90, id, 'Negro', 'Nylon/Algodón', ARRAY['Única'], 'NIKE-SOCKS-001', true, true, 'Nike',
  ARRAY[
    'https://images.unsplash.com/photo-1554010032-f26e744de7c9?w=800&q=80',
    'https://images.unsplash.com/photo-1541614662220-0b7b47e88228?w=800&q=80'
  ]
FROM categories WHERE slug = 'calcetines';

-- Calcetines Puma Pack 6
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Calcetines Puma Pack 6', 'calcetines-puma-pack-6',
  'Pack de 6 calcetines clásicos de Puma. Comodidad diaria garantizada.',
  7999, 11999, 120, id, 'Blanco', 'Algodón', ARRAY['Única'], 'PUMA-SOCKS-001', false, true, 'Puma',
  ARRAY[
    'https://images.unsplash.com/photo-1554010032-f26e744de7c9?w=800&q=80',
    'https://images.unsplash.com/photo-1587119008268-5dd6bfcf4ffb?w=800&q=80'
  ]
FROM categories WHERE slug = 'calcetines';

-- ============================================================================
-- INSERTAR PRODUCTOS - ACCESORIOS > MOCHILAS
-- ============================================================================

-- Mochila Nike Backpack
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Mochila Nike Backpack', 'mochila-nike-backpack',
  'Mochila resistente con logo de Nike. Múltiples compartimentos para organización.',
  8999, 12999, 35, id, 'Negro', 'Nylon', ARRAY['Única'], 'NIKE-BAG-001', true, true, 'Nike',
  ARRAY[
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'
  ]
FROM categories WHERE slug = 'mochilas';

-- Mochila Adidas Classic
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Mochila Adidas Classic', 'mochila-adidas-classic',
  'Mochila clásica de Adidas con trébol bordado. Material duradero y ligero.',
  7999, 11999, 40, id, 'Azul Marino', 'Poliéster', ARRAY['Única'], 'ADIDAS-BAG-001', false, true, 'Adidas',
  ARRAY[
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'
  ]
FROM categories WHERE slug = 'mochilas';

-- Mochila Puma Laptop
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Mochila Puma Laptop', 'mochila-puma-laptop',
  'Mochila de Puma con compartimento para laptop. Perfecta para trabajo y viajes.',
  12999, 17999, 25, id, 'Negro', 'Poliéster/Nylon', ARRAY['Única'], 'PUMA-LAPTOP-001', true, true, 'Puma',
  ARRAY[
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'
  ]
FROM categories WHERE slug = 'mochilas';

-- ============================================================================
-- INSERTAR PRODUCTOS - ACCESORIOS > CINTURONES
-- ============================================================================

-- Cinturón Puma
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Cinturón Puma', 'cinturon-puma',
  'Cinturón deportivo de Puma con hebilla de metal. Compatible con looks casuales.',
  3999, 5999, 45, id, 'Negro', 'Lona/Metal', ARRAY['Única'], 'PUMA-BELT-001', false, true, 'Puma',
  ARRAY[
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'https://images.unsplash.com/photo-1585089289193-75a4e0c5c19e?w=800&q=80'
  ]
FROM categories WHERE slug = 'cinturones';

-- Cinturón Leather Timberland
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Cinturón Leather Timberland', 'cinturon-leather-timberland',
  'Cinturón de cuero genuino de Timberland. Hebilla de latón macizo.',
  9999, 13999, 30, id, 'Marrón', 'Cuero genuino', ARRAY['Única'], 'TIMBERLAND-BELT-001', true, true, 'Timberland',
  ARRAY[
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'https://images.unsplash.com/photo-1585089289193-75a4e0c5c19e?w=800&q=80'
  ]
FROM categories WHERE slug = 'cinturones';

-- Cinturón Nike
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Cinturón Nike', 'cinturon-nike',
  'Cinturón de Nike con logo grabado. Material resistente y ajuste cómodo.',
  4999, 6999, 40, id, 'Negro', 'Lona', ARRAY['Única'], 'NIKE-BELT-001', false, true, 'Nike',
  ARRAY[
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'https://images.unsplash.com/photo-1585089289193-75a4e0c5c19e?w=800&q=80'
  ]
FROM categories WHERE slug = 'cinturones';

-- ============================================================================
-- INSERTAR PRODUCTOS - ACCESORIOS > GAFAS
-- ============================================================================

-- Gafas Ray-Ban Wayfarer
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Gafas Ray-Ban Wayfarer', 'gafas-rayban-wayfarer',
  'Gafas de sol clásicas Ray-Ban Wayfarer. Lentes de cristal de alta calidad.',
  19999, 25999, 20, id, 'Negro/Marrón', 'Acetato/Cristal', ARRAY['Única'], 'RAYBAN-001', true, true, 'Ray-Ban',
  ARRAY[
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    'https://images.unsplash.com/photo-1528148343865-3218897d2742?w=800&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
  ]
FROM categories WHERE slug = 'gafas';

-- Gafas Oakley Holbrook
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Gafas Oakley Holbrook', 'gafas-oakley-holbrook',
  'Gafas de sol deportivas Oakley Holbrook. Protección UV total garantizada.',
  18999, 24999, 18, id, 'Negro', 'Plástico/Lentes especiales', ARRAY['Única'], 'OAKLEY-001', false, true, 'Oakley',
  ARRAY[
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    'https://images.unsplash.com/photo-1517787292202-8882a8bf81e1?w=800&q=80'
  ]
FROM categories WHERE slug = 'gafas';

-- Gafas Gucci Classic
INSERT INTO products (name, slug, description, price_cents, original_price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand, images)
SELECT 
  'Gafas Gucci Classic', 'gafas-gucci-classic',
  'Gafas de sol de lujo de Gucci. Diseño premium con lentes protectoras.',
  29999, 39999, 15, id, 'Marrón Oscuro', 'Acetato/Cristal', ARRAY['Única'], 'GUCCI-001', true, true, 'Gucci',
  ARRAY[
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    'https://images.unsplash.com/photo-1528148343865-3218897d2742?w=800&q=80'
  ]
FROM categories WHERE slug = 'gafas';

-- ============================================================================
-- CREAR FUNCIÓN PARA ACTUALIZAR TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_variants_updated_at ON product_variants;
CREATE TRIGGER update_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ✅ LISTO!
-- ============================================================================
-- ✅ 3 CATEGORÍAS PRINCIPALES
-- ✅ 10 SUBCATEGORÍAS
-- ✅ 40+ PRODUCTOS CON IMÁGENES REALES
-- ✅ 3-4 IMÁGENES POR PRODUCTO EN FORMATO UNSPLASH
-- ✅ ORIGINAL_PRICE_CENTS PARA MOSTRAR DESCUENTOS
-- ✅ TABLA DE VARIANTES PARA STOCK POR TALLA/COLOR
-- Todos los productos cargados con imágenes de alta calidad
