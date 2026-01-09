-- ============================================================================
-- FashionMarket: Schema de Base de Datos PostgreSQL para Supabase
-- ============================================================================

-- 1. TABLA: categories
-- Almacena las categorías de productos (Camisas, Pantalones, Trajes, etc.)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: products
-- Almacena los productos de la tienda
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price_cents INT NOT NULL, -- Precio en céntimos (ej: 5999 = 59.99€)
  stock INT NOT NULL DEFAULT 0,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  
  -- Array de URLs de imágenes almacenadas en Supabase Storage
  images TEXT[] DEFAULT '{}',
  
  -- Información adicional
  sizes TEXT[] DEFAULT '{XS,S,M,L,XL,XXL}', -- Tallas disponibles
  color VARCHAR(100),
  material VARCHAR(100),
  
  -- Meta información
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sku VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Índices para optimización
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 4. POLÍTICAS RLS (Row Level Security)
-- Habilitar RLS en ambas tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS CATEGORIES
-- ============================================================================

-- Política de lectura pública: Todos pueden leer las categorías
CREATE POLICY categories_read_public ON categories
  FOR SELECT
  USING (true);

-- Política de escritura/actualización solo para admin
-- (El admin se autenticará a través de JWT con rol específico)
CREATE POLICY categories_write_admin ON categories
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY categories_update_admin ON categories
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY categories_delete_admin ON categories
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- POLÍTICAS PRODUCTS
-- ============================================================================

-- Política de lectura pública: Todos pueden leer los productos activos
CREATE POLICY products_read_public ON products
  FOR SELECT
  USING (is_active = true);

-- Política de lectura para usuarios autenticados: ver todos los productos
CREATE POLICY products_read_admin ON products
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política de escritura solo para admin
CREATE POLICY products_insert_admin ON products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY products_update_admin ON products
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY products_delete_admin ON products
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- DATOS DE EJEMPLO
-- ============================================================================

-- Insertar categorías de ejemplo
INSERT INTO categories (name, slug, description, display_order)
VALUES
  ('Camisas', 'camisas', 'Camisas premium de diseño elegante', 1),
  ('Pantalones', 'pantalones', 'Pantalones de alta calidad para hombre', 2),
  ('Trajes', 'trajes', 'Trajes completos para ocasiones especiales', 3),
  ('Accesorios', 'accesorios', 'Complementos y accesorios premium', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insertar productos de ejemplo (sin imágenes reales)
INSERT INTO products (
  name, slug, description, price_cents, stock, category_id, 
  color, material, sku, featured
)
SELECT
  'Camisa Oxford Premium', 'camisa-oxford-premium',
  'Camisa Oxford de algodón 100% con acabado premium. Perfecta para cualquier ocasión.',
  8999, 45, categories.id, 'Blanco', 'Algodón', 'SHIRT-001', true
FROM categories WHERE slug = 'camisas'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- FUNCIÓN PARA ACTUALIZAR timestamp updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar updated_at
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
-- VISTAS Y FUNCIONES ÚTILES
-- ============================================================================

-- Vista: Productos con información de categoría
CREATE OR REPLACE VIEW products_with_category AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.description,
  p.price_cents,
  p.stock,
  p.images,
  p.sizes,
  p.color,
  p.material,
  p.featured,
  c.name as category_name,
  c.slug as category_slug
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;
