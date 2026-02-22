-- =============================================
-- STORED PROCEDURES: Gestión Atómica de Stock
-- =============================================
-- Funciones PL/pgSQL para manejar el stock de forma atómica,
-- evitando race conditions con SELECT ... FOR UPDATE.
--
-- EJECUTAR ESTE SQL EN SUPABASE SQL EDITOR
-- =============================================

-- 1. DECREMENT_STOCK: Reduce stock de forma atómica al comprar
-- Usa SELECT ... FOR UPDATE para bloquear la fila y evitar race conditions
-- Retorna TRUE si se pudo decrementar, FALSE si no hay stock suficiente
CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id UUID,
  p_size VARCHAR,
  p_quantity INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INT;
  v_row_id UUID;
BEGIN
  -- Bloquear la fila con FOR UPDATE para evitar race conditions
  SELECT id, stock INTO v_row_id, v_current_stock
  FROM product_sizes
  WHERE product_id = p_product_id AND size = p_size
  FOR UPDATE;

  -- Si no existe la talla, retornar false
  IF v_row_id IS NULL THEN
    RAISE NOTICE 'No se encontró talla % para producto %', p_size, p_product_id;
    RETURN FALSE;
  END IF;

  -- Verificar stock suficiente
  IF v_current_stock < p_quantity THEN
    RAISE NOTICE 'Stock insuficiente: disponible=%, solicitado=%', v_current_stock, p_quantity;
    RETURN FALSE;
  END IF;

  -- Decrementar stock
  UPDATE product_sizes
  SET stock = stock - p_quantity,
      updated_at = NOW()
  WHERE id = v_row_id;

  -- Actualizar stock total del producto
  UPDATE products
  SET stock = (
    SELECT COALESCE(SUM(stock), 0)
    FROM product_sizes
    WHERE product_id = p_product_id
  )
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$;

-- 2. INCREMENT_STOCK: Restaura stock de forma atómica (devoluciones/cancelaciones)
CREATE OR REPLACE FUNCTION increment_stock(
  p_product_id UUID,
  p_size VARCHAR,
  p_quantity INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row_id UUID;
BEGIN
  -- Bloquear la fila con FOR UPDATE
  SELECT id INTO v_row_id
  FROM product_sizes
  WHERE product_id = p_product_id AND size = p_size
  FOR UPDATE;

  -- Si no existe la talla, intentar crearla
  IF v_row_id IS NULL THEN
    INSERT INTO product_sizes (product_id, size, stock)
    VALUES (p_product_id, p_size, p_quantity)
    ON CONFLICT (product_id, size) DO UPDATE SET
      stock = product_sizes.stock + p_quantity,
      updated_at = NOW();
  ELSE
    -- Incrementar stock
    UPDATE product_sizes
    SET stock = stock + p_quantity,
        updated_at = NOW()
    WHERE id = v_row_id;
  END IF;

  -- Actualizar stock total del producto
  UPDATE products
  SET stock = (
    SELECT COALESCE(SUM(stock), 0)
    FROM product_sizes
    WHERE product_id = p_product_id
  )
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$;

-- 3. PROCESS_CHECKOUT_STOCK: Procesa todos los items de un pedido atómicamente
-- Si algún item no tiene stock, hace ROLLBACK de todo
CREATE OR REPLACE FUNCTION process_checkout_stock(
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_size VARCHAR;
  v_quantity INT;
  v_current_stock INT;
  v_row_id UUID;
  v_index INT := 0;
  v_failed_item TEXT;
BEGIN
  -- Iterar sobre cada item del pedido
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_size := v_item->>'size';
    v_quantity := (v_item->>'quantity')::INT;

    -- Bloquear la fila con FOR UPDATE
    SELECT id, stock INTO v_row_id, v_current_stock
    FROM product_sizes
    WHERE product_id = v_product_id AND size = v_size
    FOR UPDATE;

    -- Verificar que existe la talla
    IF v_row_id IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', format('Talla %s no disponible para el producto', v_size),
        'failed_index', v_index
      );
    END IF;

    -- Verificar stock suficiente
    IF v_current_stock < v_quantity THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', format('Stock insuficiente para talla %s: disponible=%s, solicitado=%s', v_size, v_current_stock, v_quantity),
        'failed_index', v_index
      );
    END IF;

    -- Decrementar stock
    UPDATE product_sizes
    SET stock = stock - v_quantity,
        updated_at = NOW()
    WHERE id = v_row_id;

    -- Actualizar stock total del producto
    UPDATE products
    SET stock = (
      SELECT COALESCE(SUM(ps.stock), 0)
      FROM product_sizes ps
      WHERE ps.product_id = v_product_id
    )
    WHERE id = v_product_id;

    v_index := v_index + 1;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'items_processed', v_index);
END;
$$;

-- 4. Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, VARCHAR, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, VARCHAR, INT) TO anon;
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, VARCHAR, INT) TO service_role;

GRANT EXECUTE ON FUNCTION increment_stock(UUID, VARCHAR, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_stock(UUID, VARCHAR, INT) TO anon;
GRANT EXECUTE ON FUNCTION increment_stock(UUID, VARCHAR, INT) TO service_role;

GRANT EXECUTE ON FUNCTION process_checkout_stock(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION process_checkout_stock(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION process_checkout_stock(JSONB) TO service_role;
