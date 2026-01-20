-- ============================================================================
-- DESACTIVAR RLS en las nuevas tablas para que funcionen sin problemas
-- ============================================================================

-- Desactivar RLS en user_favorites
ALTER TABLE user_favorites DISABLE ROW LEVEL SECURITY;

-- Desactivar RLS en user_cart
ALTER TABLE user_cart DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- NOTA: Las tablas existen pero RLS está desactivado
-- Esto permite que funcione localStorage sin interferencias
-- ============================================================================
