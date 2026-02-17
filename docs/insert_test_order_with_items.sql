-- ============================================================================
-- SCRIPT DE PRUEBA: INSERTAR UN PEDIDO CON ITEMS MANUALMENTE
-- ============================================================================

-- INSTRUCCIONES:
-- 1. Reemplaza 'jaime@gmail.com' con tu correo REAL de Supabase (si usas otro).
-- 2. Si conoces tu USER_ID (UUID) ponlo, si no, déjalo NULL (se buscará solo por email).

DO $$
DECLARE
    v_order_id UUID;
    v_product_id UUID;
    v_email TEXT := 'jaime@gmail.com'; -- CAMBIA ESTO SI ES NECESARIO
    v_user_id UUID := '31993dc5-a0f4-49a2-99b7-dd522c8ec25c'; -- CAMBIA ESTO SI ES NECESARIO O DEJALO NULL
BEGIN

    -- 1. Insertar el Pedido (Order)
    INSERT INTO orders (
        customer_email,
        user_id,
        session_id,
        order_number, -- Número único visible
        subtotal_cents,
        shipping_cents,
        total_cents,
        payment_status,
        status,
        items -- Lo mantenemos vacío o con un array simple por compatibilidad
    ) VALUES (
        v_email,
        v_user_id,
        'sess_TEST_' || floor(random() * 100000), -- ID de sesión falso
        'TEST-ORDER-' || floor(random() * 1000),
        5000, -- 50.00 EUR
        0,
        5000,
        'paid',
        'processing',
        '[]'::jsonb -- Array vacío en la columna items antigua
    ) RETURNING id INTO v_order_id;

    RAISE NOTICE 'Pedido creado con ID: %', v_order_id;

    -- 2. Insertar Items del Pedido (Order Items)
    -- Intentamos coger un producto real cualquiera de la tabla products, o NULL si no hay
    SELECT id INTO v_product_id FROM products LIMIT 1;

    INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        quantity,
        price_cents,
        total_cents
    ) VALUES 
    (
        v_order_id,
        v_product_id, -- Puede ser NULL si no hay productos
        'Producto de Prueba 1 (Zapatillas)',
        1,
        3000, -- 30.00 EUR
        3000
    ),
    (
        v_order_id,
        v_product_id,
        'Producto de Prueba 2 (Camiseta)',
        2,
        1000, -- 10.00 EUR (x2)
        2000
    );

    RAISE NOTICE 'Items insertados correctamente para el pedido %', v_order_id;
    
END $$;
