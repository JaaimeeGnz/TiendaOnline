-- ============================================================================
-- TABLA: newsletter_subscribers
-- Almacena los suscriptores a la newsletter
-- ============================================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  discount_code VARCHAR(50) NOT NULL UNIQUE,
  discount_percentage INT NOT NULL DEFAULT 10, -- Descuento en porcentaje
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: discount_codes
-- Almacena todos los códigos de descuento funcionales
-- ============================================================================
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_percentage INT NOT NULL DEFAULT 10,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' o 'fixed_amount'
  discount_value INT NOT NULL, -- Valor en céntimos si es fixed_amount, o porcentaje si es percentage
  
  -- Validez del código
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Límites de uso
  max_uses INT, -- NULL = ilimitado
  times_used INT DEFAULT 0,
  min_purchase_cents INT, -- Compra mínima en céntimos
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(255), -- Email del admin que lo creó
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: discount_code_usage
-- Registro de uso de códigos de descuento
-- ============================================================================
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  order_id UUID,
  amount_saved_cents INT, -- Cantidad ahorrada en céntimos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_code ON newsletter_subscribers(discount_code);
CREATE INDEX IF NOT EXISTS idx_discount_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_active ON discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_usage_code ON discount_code_usage(code_id);
CREATE INDEX IF NOT EXISTS idx_usage_email ON discount_code_usage(email);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;

-- newsletter_subscribers: Lectura pública para validar código, admin puede escribir
CREATE POLICY newsletter_read_public ON newsletter_subscribers
  FOR SELECT
  USING (true);

CREATE POLICY newsletter_insert ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY newsletter_update_admin ON newsletter_subscribers
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- discount_codes: Lectura pública (válidos), admin puede escribir
CREATE POLICY discount_read_public ON discount_codes
  FOR SELECT
  USING (is_active = true AND valid_from <= CURRENT_TIMESTAMP AND (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP));

CREATE POLICY discount_read_admin ON discount_codes
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY discount_insert_admin ON discount_codes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY discount_update_admin ON discount_codes
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY discount_delete_admin ON discount_codes
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- discount_code_usage: Lectura para admin, inserción pública
CREATE POLICY usage_insert ON discount_code_usage
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY usage_read_admin ON discount_code_usage
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCIÓN: Generar código de descuento único
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_unique_discount_code()
RETURNS VARCHAR AS $$
DECLARE
  v_code VARCHAR(50);
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generar código aleatorio (ej: SAVE2025ABCD)
    v_code := 'SAVE' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYY') || 
              UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4));
    
    -- Verificar si ya existe
    SELECT EXISTS(SELECT 1 FROM discount_codes WHERE code = v_code) INTO v_exists;
    
    IF NOT v_exists THEN
      RETURN v_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_discount_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_newsletter_timestamp ON newsletter_subscribers;
CREATE TRIGGER update_newsletter_timestamp
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

DROP TRIGGER IF EXISTS update_discount_timestamp ON discount_codes;
CREATE TRIGGER update_discount_timestamp
  BEFORE UPDATE ON discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_updated_at();

-- Actualizar times_used cuando se registra un uso
CREATE OR REPLACE FUNCTION increment_discount_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE discount_codes
  SET times_used = times_used + 1
  WHERE id = NEW.code_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_usage ON discount_code_usage;
CREATE TRIGGER increment_usage
  AFTER INSERT ON discount_code_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_discount_usage();
