-- =============================================
-- TABLA: Ofertas Flash (flash_offers)
-- =============================================
-- Control de ofertas flash con temporizador desde admin
-- EJECUTAR EN SUPABASE SQL EDITOR
-- =============================================

CREATE TABLE IF NOT EXISTS flash_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL DEFAULT '¡OFERTA FLASH!',
  subtitle VARCHAR(500) DEFAULT 'Descuentos por tiempo limitado',
  is_active BOOLEAN NOT NULL DEFAULT false,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  discount_percentage INT DEFAULT 20,
  product_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solo puede haber UNA oferta flash activa a la vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_flash_offers_active 
  ON flash_offers (is_active) WHERE is_active = true;

-- RLS
ALTER TABLE flash_offers ENABLE ROW LEVEL SECURITY;

-- Lectura pública (todos pueden ver las ofertas activas)
CREATE POLICY "flash_offers_select_all" ON flash_offers
  FOR SELECT USING (true);

-- Solo service_role puede insertar/actualizar/eliminar
CREATE POLICY "flash_offers_insert_admin" ON flash_offers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "flash_offers_update_admin" ON flash_offers
  FOR UPDATE USING (true);

CREATE POLICY "flash_offers_delete_admin" ON flash_offers
  FOR DELETE USING (true);

-- Insertar una oferta flash de ejemplo (desactivada por defecto)
INSERT INTO flash_offers (title, subtitle, is_active, ends_at, discount_percentage)
VALUES (
  '⚡ FLASH SALE ⚡',
  'Ofertas exclusivas por tiempo limitado',
  false,
  NOW() + INTERVAL '24 hours',
  25
);
