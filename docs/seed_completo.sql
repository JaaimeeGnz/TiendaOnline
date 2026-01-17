-- ============================================================================
-- FashionMarket: Schema + Datos Completos
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

-- 2. CREAR TABLA: products
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

-- 3. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 4. HABILITAR RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS
DROP POLICY IF EXISTS categories_read_public ON categories;
CREATE POLICY categories_read_public ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS categories_write_admin ON categories;
CREATE POLICY categories_write_admin ON categories
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS categories_update_admin ON categories;
CREATE POLICY categories_update_admin ON categories
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS categories_delete_admin ON categories;
CREATE POLICY categories_delete_admin ON categories
  FOR DELETE USING (true);

DROP POLICY IF EXISTS products_read_public ON products;
CREATE POLICY products_read_public ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS products_insert_admin ON products;
CREATE POLICY products_insert_admin ON products
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS products_update_admin ON products;
CREATE POLICY products_update_admin ON products
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS products_delete_admin ON products;
CREATE POLICY products_delete_admin ON products
  FOR DELETE USING (true);

-- ============================================================================
-- INSERTAR CATEGORÍAS PRINCIPALES Y SUBCATEGORÍAS
-- ============================================================================

-- Agregar columna parent_id si no existe
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Limpiar datos existentes (truncate con cascade)
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
-- INSERTAR PRODUCTOS - ZAPATILLAS
-- ============================================================================

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Nike Air Max 90', 'nike-air-max-90',
  'Las icónicas Nike Air Max 90, combinando estilo retro con tecnología moderna. Unidad Air visible para máxima amortiguación.',
  13999, 50, id, 'Blanco/Negro', 'Cuero/Sintético', ARRAY['40', '41', '42', '43', '44', '45'], 'NIKE-001', true, true, 'Nike'
FROM categories WHERE slug = 'zapatillas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Adidas Samba OG', 'adidas-samba-og',
  'El clásico que nunca pasa de moda. Diseño atemporal perfecto para cualquier ocasión.',
  10999, 35, id, 'Blanco/Negro', 'Cuero', ARRAY['40', '41', '42', '43', '44', '45'], 'ADIDAS-001', true, true, 'Adidas'
FROM categories WHERE slug = 'zapatillas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Puma RS-X', 'puma-rs-x',
  'Zapatilla deportiva con diseño retro futurista. Inspirada en el archivo Puma Heritage.',
  11499, 42, id, 'Rojo', 'Sintético', ARRAY['40', '41', '42', '43', '44', '45'], 'PUMA-001', false, true, 'Puma'
FROM categories WHERE slug = 'zapatillas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'New Balance 574', 'new-balance-574',
  'Comodidad absoluta con tecnología Fresh Foam. El favorito de runners casuales.',
  12499, 38, id, 'Gris/Blanco', 'Sintético/Malla', ARRAY['40', '41', '42', '43', '44', '45'], 'NB-001', false, true, 'New Balance'
FROM categories WHERE slug = 'zapatillas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Asics Gel-Lyte III', 'asics-gel-lyte-iii',
  'Zapatilla técnica con split tongue, combinación perfecta entre estilo y funcionalidad.',
  12999, 30, id, 'Azul/Blanco', 'Cuero/Sintético', ARRAY['40', '41', '42', '43', '44', '45'], 'ASICS-001', true, true, 'Asics'
FROM categories WHERE slug = 'zapatillas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Converse Chuck Taylor', 'converse-chuck-taylor',
  'El icono del sneaker casual. Lienzo resistente con suela de goma de primera calidad.',
  7999, 55, id, 'Negro', 'Lona', ARRAY['40', '41', '42', '43', '44', '45'], 'CONVERSE-001', false, true, 'Converse'
FROM categories WHERE slug = 'zapatillas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Vans Old Skool', 'vans-old-skool',
  'El skate classic que se volvió icónico. Construcción resistente y diseño atemporal.',
  9499, 48, id, 'Blanco/Negro', 'Lona', ARRAY['40', '41', '42', '43', '44', '45'], 'VANS-001', false, true, 'Vans'
FROM categories WHERE slug = 'zapatillas';

-- ============================================================================
-- INSERTAR PRODUCTOS - ROPA > CAMISETAS
-- ============================================================================

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Camiseta Nike Essentials', 'camiseta-nike-essentials',
  'Camiseta básica de algodón 100% con el logo bordado de Nike. Comodidad pura para el día a día.',
  3999, 60, id, 'Blanco', 'Algodón 100%', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'NIKE-SHIRT-001', false, true, 'Nike'
FROM categories WHERE slug = 'camisetas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Camiseta Lacoste Premium', 'camiseta-lacoste-premium',
  'Camiseta premium de Lacoste con el icónico cocodrilo bordado. Algodón piqué de excelente calidad.',
  9999, 40, id, 'Blanco', 'Algodón piqué', ARRAY['S', 'M', 'L', 'XL'], 'LACOSTE-001', false, true, 'Lacoste'
FROM categories WHERE slug = 'camisetas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Camiseta Adidas Trefoil', 'camiseta-adidas-trefoil',
  'Camiseta clásica de Adidas con el icónico trébol. Logo estampado de primera calidad.',
  5499, 50, id, 'Negro', 'Algodón 100%', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'ADIDAS-SHIRT-001', true, true, 'Adidas'
FROM categories WHERE slug = 'camisetas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Camiseta Puma Graphic', 'camiseta-puma-graphic',
  'Camiseta deportiva de Puma con gráficas modernas. Tela transpirable y cómoda.',
  4999, 45, id, 'Rojo', 'Poliéster/Algodón', ARRAY['S', 'M', 'L', 'XL'], 'PUMA-SHIRT-001', false, true, 'Puma'
FROM categories WHERE slug = 'camisetas';

-- ============================================================================
-- INSERTAR PRODUCTOS - ROPA > SUDADERAS
-- ============================================================================

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Sudadera Adidas Trefoil', 'sudadera-adidas-trefoil',
  'Sudadera clásica de Adidas con el icónico trébol. Fabricada en algodón suave y esponjoso.',
  6999, 45, id, 'Negro', 'Algodón/Poliéster', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'ADIDAS-HOOD-001', true, true, 'Adidas'
FROM categories WHERE slug = 'sudaderas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Hoodie Nike Sportswear', 'hoodie-nike-sportswear',
  'Hoodie deportivo de Nike con capucha ajustable. Bolsillos canguro y cordones reforzados.',
  7999, 35, id, 'Gris', 'Algodón/Poliéster', ARRAY['S', 'M', 'L', 'XL'], 'NIKE-HOOD-001', false, true, 'Nike'
FROM categories WHERE slug = 'sudaderas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Sudadera Puma Essentials', 'sudadera-puma-essentials',
  'Sudadera clásica de Puma con logo bordado. Comodidad máxima para cualquier ocasión.',
  6499, 40, id, 'Azul Marino', 'Algodón', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'PUMA-HOOD-001', true, true, 'Puma'
FROM categories WHERE slug = 'sudaderas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Sudadera Lacoste Classic', 'sudadera-lacoste-classic',
  'Sudadera premium de Lacoste con cocodrilo bordado. Construcción de excelente calidad.',
  11999, 25, id, 'Blanco', 'Algodón 100%', ARRAY['S', 'M', 'L', 'XL'], 'LACOSTE-HOOD-001', false, true, 'Lacoste'
FROM categories WHERE slug = 'sudaderas';

-- ============================================================================
-- INSERTAR PRODUCTOS - ROPA > CHAQUETAS
-- ============================================================================

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Chaqueta Tommy Hilfiger', 'chaqueta-tommy-hilfiger',
  'Chaqueta clásica de Tommy Hilfiger con bandera tricolor. Construcción de calidad premium.',
  14999, 25, id, 'Azul Marino', 'Algodón/Poliéster', ARRAY['S', 'M', 'L', 'XL'], 'TH-JACKET-001', true, true, 'Tommy Hilfiger'
FROM categories WHERE slug = 'chaquetas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Chaqueta Nike Windbreaker', 'chaqueta-nike-windbreaker',
  'Chaqueta cortavientos de Nike con tecnología de secado rápido. Perfecta para todas las estaciones.',
  9999, 30, id, 'Negro', 'Poliéster', ARRAY['S', 'M', 'L', 'XL'], 'NIKE-JACKET-001', false, true, 'Nike'
FROM categories WHERE slug = 'chaquetas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Chaqueta Adidas Trefoil', 'chaqueta-adidas-trefoil',
  'Chaqueta deportiva de Adidas con trébol bordado. Material resistente y cómodo.',
  12999, 20, id, 'Rojo', 'Poliéster', ARRAY['S', 'M', 'L', 'XL'], 'ADIDAS-JACKET-001', true, true, 'Adidas'
FROM categories WHERE slug = 'chaquetas';

-- ============================================================================
-- INSERTAR PRODUCTOS - ROPA > PANTALONES
-- ============================================================================

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Pantalón Levi''s 501', 'pantalon-levis-501',
  'El jean clásico por excelencia. Corte recto original de Levi''s. Leyenda viva del denim.',
  8999, 50, id, 'Azul Oscuro', 'Denim 100%', ARRAY['30', '32', '34', '36', '38'], 'LEVIS-001', true, true, 'Levi''s'
FROM categories WHERE slug = 'pantalones';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Pantalón Deportivo Adidas', 'pantalon-deportivo-adidas',
  'Pantalón deportivo de Adidas con tecnología Climalite. Ideal para entrenamientos.',
  7499, 40, id, 'Negro', 'Poliéster', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 'ADIDAS-PANT-001', false, true, 'Adidas'
FROM categories WHERE slug = 'pantalones';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Pantalón Chino Dockers', 'pantalon-chino-dockers',
  'Pantalón chino de Dockers con corte clásico. Versatilidad para cualquier ocasión.',
  11999, 35, id, 'Beige', 'Algodón/Poliéster', ARRAY['30', '32', '34', '36', '38'], 'DOCKERS-001', false, true, 'Dockers'
FROM categories WHERE slug = 'pantalones';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Pantalón Jogger Nike', 'pantalon-jogger-nike',
  'Pantalón jogger de Nike con tecnología Dri-FIT. Comodidad máxima para el día a día.',
  7999, 42, id, 'Gris', 'Poliéster/Algodón', ARRAY['S', 'M', 'L', 'XL'], 'NIKE-JOGGER-001', true, true, 'Nike'
FROM categories WHERE slug = 'pantalones';

-- ============================================================================
-- INSERTAR PRODUCTOS - ROPA > POLOS
-- ============================================================================

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Polo Ralph Lauren', 'polo-ralph-lauren',
  'Polo icónico de Ralph Lauren con el pony bordado. Algodón de primera calidad.',
  11999, 32, id, 'Rojo', 'Algodón 100%', ARRAY['S', 'M', 'L', 'XL'], 'RL-POLO-001', true, true, 'Ralph Lauren'
FROM categories WHERE slug = 'polos';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Polo Lacoste Classic', 'polo-lacoste-classic',
  'Polo de Lacoste con cocodrilo bordado. El polo original y auténtico.',
  13999, 28, id, 'Blanco', 'Algodón piqué', ARRAY['S', 'M', 'L', 'XL'], 'LACOSTE-POLO-001', false, true, 'Lacoste'
FROM categories WHERE slug = 'polos';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Polo Tommy Hilfiger', 'polo-tommy-hilfiger',
  'Polo de Tommy Hilfiger con bandera tricolor. Elegancia casual definitiva.',
  10999, 40, id, 'Azul Marino', 'Algodón', ARRAY['S', 'M', 'L', 'XL'], 'TH-POLO-001', false, true, 'Tommy Hilfiger'
FROM categories WHERE slug = 'polos';

-- ============================================================================
-- INSERTAR PRODUCTOS - ACCESORIOS > GORROS
-- ============================================================================

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Gorro Nike Beanie', 'gorro-nike-beanie',
  'Gorro de punto suave con el logo de Nike. Mantiene el calor en climas fríos.',
  2999, 70, id, 'Negro', 'Acrílico/Algodón', ARRAY['Única'], 'NIKE-BEANIE-001', true, true, 'Nike'
FROM categories WHERE slug = 'gorros';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Gorra Adidas Baseball', 'gorra-adidas-baseball',
  'Gorra de béisbol de Adidas con trébol bordado. Protección solar con estilo.',
  3499, 65, id, 'Blanco', 'Algodón', ARRAY['Única'], 'ADIDAS-CAP-001', false, true, 'Adidas'
FROM categories WHERE slug = 'gorros';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Gorro Puma Essential', 'gorro-puma-essential',
  'Gorro clásico de Puma con logo bordado. Cálido y cómodo para invierno.',
  2999, 55, id, 'Gris', 'Acrílico', ARRAY['Única'], 'PUMA-BEANIE-001', false, true, 'Puma'
FROM categories WHERE slug = 'gorros';

-- ============================================================================
-- INSERTAR PRODUCTOS - ACCESORIOS > CALCETINES
-- ============================================================================

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Calcetines Adidas Pack 3', 'calcetines-adidas-pack-3',
  'Pack de 3 calcetines deportivos de Adidas. Tecnología de absorción de humedad.',
  4499, 100, id, 'Blanco/Negro', 'Algodón/Poliéster', ARRAY['Única'], 'ADIDAS-SOCKS-001', false, true, 'Adidas'
FROM categories WHERE slug = 'calcetines';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Calcetines Nike Performance', 'calcetines-nike-performance',
  'Calcetines de rendimiento de Nike con tecnología Dri-FIT. Perfectos para deportes.',
  5999, 90, id, 'Negro', 'Nylon/Algodón', ARRAY['Única'], 'NIKE-SOCKS-001', true, true, 'Nike'
FROM categories WHERE slug = 'calcetines';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Calcetines Puma Pack 6', 'calcetines-puma-pack-6',
  'Pack de 6 calcetines clásicos de Puma. Comodidad diaria garantizada.',
  7999, 120, id, 'Blanco', 'Algodón', ARRAY['Única'], 'PUMA-SOCKS-001', false, true, 'Puma'
FROM categories WHERE slug = 'calcetines';

-- ============================================================================
-- INSERTAR PRODUCTOS - ACCESORIOS > MOCHILAS
-- ============================================================================

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Mochila Nike Backpack', 'mochila-nike-backpack',
  'Mochila resistente con logo de Nike. Múltiples compartimentos para organización.',
  8999, 35, id, 'Negro', 'Nylon', ARRAY['Única'], 'NIKE-BAG-001', true, true, 'Nike'
FROM categories WHERE slug = 'mochilas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Mochila Adidas Classic', 'mochila-adidas-classic',
  'Mochila clásica de Adidas con trébol bordado. Material duradero y ligero.',
  7999, 40, id, 'Azul Marino', 'Poliéster', ARRAY['Única'], 'ADIDAS-BAG-001', false, true, 'Adidas'
FROM categories WHERE slug = 'mochilas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Mochila Puma Laptop', 'mochila-puma-laptop',
  'Mochila de Puma con compartimento para laptop. Perfecta para trabajo y viajes.',
  12999, 25, id, 'Negro', 'Poliéster/Nylon', ARRAY['Única'], 'PUMA-LAPTOP-001', true, true, 'Puma'
FROM categories WHERE slug = 'mochilas';

-- ============================================================================
-- INSERTAR PRODUCTOS - ACCESORIOS > CINTURONES
-- ============================================================================

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Cinturón Puma', 'cinturon-puma',
  'Cinturón deportivo de Puma con hebilla de metal. Compatible con looks casuales.',
  3999, 45, id, 'Negro', 'Lona/Metal', ARRAY['Única'], 'PUMA-BELT-001', false, true, 'Puma'
FROM categories WHERE slug = 'cinturones';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Cinturón Leather Timberland', 'cinturon-leather-timberland',
  'Cinturón de cuero genuino de Timberland. Hebilla de latón macizo.',
  9999, 30, id, 'Marrón', 'Cuero genuino', ARRAY['Única'], 'TIMBERLAND-BELT-001', true, true, 'Timberland'
FROM categories WHERE slug = 'cinturones';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Cinturón Nike', 'cinturon-nike',
  'Cinturón de Nike con logo grabado. Material resistente y ajuste cómodo.',
  4999, 40, id, 'Negro', 'Lona', ARRAY['Única'], 'NIKE-BELT-001', false, true, 'Nike'
FROM categories WHERE slug = 'cinturones';

-- ============================================================================
-- INSERTAR PRODUCTOS - ACCESORIOS > GAFAS
-- ============================================================================

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Gafas Ray-Ban Wayfarer', 'gafas-rayban-wayfarer',
  'Gafas de sol clásicas Ray-Ban Wayfarer. Lentes de cristal de alta calidad.',
  19999, 20, id, 'Negro/Marrón', 'Acetato/Cristal', ARRAY['Única'], 'RAYBAN-001', true, true, 'Ray-Ban'
FROM categories WHERE slug = 'gafas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Gafas Oakley Holbrook', 'gafas-oakley-holbrook',
  'Gafas de sol deportivas Oakley Holbrook. Protección UV total garantizada.',
  18999, 18, id, 'Negro', 'Plástico/Lentes especiales', ARRAY['Única'], 'OAKLEY-001', false, true, 'Oakley'
FROM categories WHERE slug = 'gafas';

INSERT INTO products (name, slug, description, price_cents, stock, category_id, color, material, sizes, sku, featured, is_active, brand)
SELECT 
  'Gafas Gucci Classic', 'gafas-gucci-classic',
  'Gafas de sol de lujo de Gucci. Diseño premium con lentes protectoras.',
  29999, 15, id, 'Marrón Oscuro', 'Acetato/Cristal', ARRAY['Única'], 'GUCCI-001', true, true, 'Gucci'
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

-- ============================================================================
-- ✅ LISTO!
-- ============================================================================
-- ✅ 3 CATEGORÍAS PRINCIPALES
-- ✅ 10 SUBCATEGORÍAS
-- ✅ 40+ PRODUCTOS CON MARCAS REALES
-- ✅ FILTRADO POR CATEGORÍA, SUBCATEGORÍA Y MARCA
-- Puedes ver los productos en tu página ahora
