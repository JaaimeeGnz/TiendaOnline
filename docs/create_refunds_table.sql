-- ============================================
-- TABLA DE DEVOLUCIONES (refunds)
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Crear tabla refunds
CREATE TABLE IF NOT EXISTS refunds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'processed' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  refund_amount_cents INTEGER NOT NULL DEFAULT 0,
  returned_items JSONB DEFAULT '[]'::jsonb,
  refund_method VARCHAR(50) DEFAULT 'original_payment' CHECK (refund_method IN ('original_payment', 'store_credit')),
  credit_note_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  refund_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_customer_email ON refunds(customer_email);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- Deshabilitar RLS para admin
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede insertar (el API valida)
CREATE POLICY "Allow all operations on refunds" ON refunds
  FOR ALL USING (true) WITH CHECK (true);

-- Función para generar número de factura de abono (si no existe)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM invoices;
  RETURN 'FAC-' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
