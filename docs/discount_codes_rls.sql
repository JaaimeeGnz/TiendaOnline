-- Políticas RLS para discount_codes (newsletter/popup)
-- Ejecutar en Supabase SQL Editor

-- Limpiar políticas previas
DROP POLICY IF EXISTS discount_codes_read_public ON discount_codes;
DROP POLICY IF EXISTS discount_codes_insert_public ON discount_codes;

-- Permitir lectura pública (para verificar si un email ya existe)
CREATE POLICY discount_codes_read_public ON discount_codes
  FOR SELECT
  USING (true);

-- Permitir inserciones públicas (para crear códigos desde newsletter/popup)
CREATE POLICY discount_codes_insert_public ON discount_codes
  FOR INSERT
  WITH CHECK (true);
