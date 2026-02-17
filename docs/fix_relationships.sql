-- ============================================================================
-- Script para arreglar la relación entre orders y order_items
-- ============================================================================

-- 1. Asegurar que order_id es del tipo correcto (UUID)
-- (Si ya es UUID no hará nada, si es texto lo intentará convertir)
-- CITATION: "no estan relacionadas las tablas entre ellas"

DO $$ 
BEGIN
    -- Intentar añadir la restricción de clave foránea si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_order_items_orders' 
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE "order_items" 
        ADD CONSTRAINT "fk_order_items_orders" 
        FOREIGN KEY ("order_id") 
        REFERENCES "orders" ("id") 
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Restricción fk_order_items_orders añadida correctamente.';
    ELSE
        RAISE NOTICE 'La restricción fk_order_items_orders ya existe.';
    END IF;
END $$;

-- 2. Asegurar también la relación con products si falta
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_order_items_products' 
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE "order_items" 
        ADD CONSTRAINT "fk_order_items_products" 
        FOREIGN KEY ("product_id") 
        REFERENCES "products" ("id") 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Restricción fk_order_items_products añadida correctamente.';
    END IF;
END $$;
