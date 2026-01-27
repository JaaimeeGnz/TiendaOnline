-- Agregar columna customer_email a la tabla orders
-- Esta columna almacenará el correo del cliente para compras de invitados y usuarios registrados

ALTER TABLE orders
ADD COLUMN customer_email VARCHAR(255);

-- Crear índice en customer_email para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
