-- ============================================================================
-- Crear tabla INVOICES para facturas (normales y abonos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) NOT NULL UNIQUE, -- Ej: FAC-2026-001
  order_id UUID REFERENCES orders(id) ON DELETE RESTRICT,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  
  -- Tipo de factura
  type TEXT NOT NULL CHECK (type IN ('invoice', 'credit_note')), -- 'invoice' = factura normal, 'credit_note' = factura de abono
  
  -- Montos
  subtotal_cents INTEGER NOT NULL,
  tax_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL, -- Positivo para facturas, negativo para abonos
  
  -- Referencia
  reference_invoice_id UUID REFERENCES invoices(id), -- Si es abono, referencia la factura original
  reason TEXT, -- Motivo del abono (devolucion, error, etc)
  
  -- Datos
  items JSONB NOT NULL, -- Array de items facturados
  
  -- Estado
  status TEXT DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled')),
  
  -- Timestamps
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_issued_at ON invoices(issued_at);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(type);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_reference ON invoices(reference_invoice_id);

-- ============================================================================
-- Habilitar RLS (Row Level Security)
-- ============================================================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Los clientes pueden ver sus propias facturas
CREATE POLICY "Customers can view their invoices"
  ON invoices FOR SELECT
  USING (customer_email = current_user_email() OR auth.role() = 'authenticated');

-- Solo admins pueden crear facturas
CREATE POLICY "Only admins can create invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Solo admins pueden actualizar facturas
CREATE POLICY "Only admins can update invoices"
  ON invoices FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- Crear tabla REFUNDS para registrar devoluciones y reembolsos
-- ============================================================================

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  credit_note_id UUID REFERENCES invoices(id), -- Referencia a la factura de abono
  
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  
  -- Detalles de la devolución
  reason TEXT NOT NULL, -- Ej: "Talla incorrecta", "Defecto en prenda", etc
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  
  -- Monto
  refund_amount_cents INTEGER NOT NULL, -- Cantidad a reembolsar
  
  -- Productos devueltos
  returned_items JSONB NOT NULL, -- Array con items devueltos
  
  -- Datos de reembolso
  refund_method TEXT DEFAULT 'original_payment' CHECK (refund_method IN ('original_payment', 'store_credit')), -- Método de reembolso
  refund_date TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_invoice_id ON refunds(invoice_id);
CREATE INDEX IF NOT EXISTS idx_refunds_customer_email ON refunds(customer_email);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_requested_at ON refunds(requested_at);

-- ============================================================================
-- Habilitar RLS en REFUNDS
-- ============================================================================

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Los clientes pueden ver sus devoluciones
CREATE POLICY "Customers can view their refunds"
  ON refunds FOR SELECT
  USING (customer_email = current_user_email() OR auth.role() = 'authenticated');

-- Solo admins pueden crear/actualizar devoluciones
CREATE POLICY "Only admins can manage refunds"
  ON refunds FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update refunds"
  ON refunds FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCIÓN para generar números de factura automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  count INTEGER;
  invoice_number TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  count := (SELECT COUNT(*) + 1 FROM invoices WHERE invoice_number LIKE 'FAC-' || year || '-%');
  invoice_number := 'FAC-' || year || '-' || LPAD(count::TEXT, 4, '0');
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIÓN para generar números de abono automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_credit_note_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  count INTEGER;
  credit_note_number TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  count := (SELECT COUNT(*) + 1 FROM invoices WHERE invoice_number LIKE 'NOT-' || year || '-%' AND type = 'credit_note');
  credit_note_number := 'NOT-' || year || '-' || LPAD(count::TEXT, 4, '0');
  RETURN credit_note_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS para actualizar updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_refunds_updated_at ON refunds;
CREATE TRIGGER update_refunds_updated_at
  BEFORE UPDATE ON refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista: Facturas con detalles del pedido
CREATE OR REPLACE VIEW invoices_with_order_details AS
SELECT
  i.id,
  i.invoice_number,
  i.type,
  i.customer_email,
  i.customer_name,
  i.total_cents,
  i.status,
  i.issued_at,
  o.id as order_id,
  o.session_id,
  o.created_at as order_date
FROM invoices i
LEFT JOIN orders o ON i.order_id = o.id;

-- Vista: Devoluciones activas
CREATE OR REPLACE VIEW active_refunds AS
SELECT
  r.id,
  r.order_id,
  r.customer_email,
  r.customer_name,
  r.reason,
  r.status,
  r.refund_amount_cents,
  r.requested_at,
  i.invoice_number
FROM refunds r
LEFT JOIN invoices i ON r.invoice_id = i.id
WHERE r.status IN ('pending', 'approved');

-- ============================================================================
-- FUNCIÓN para procesar devolución (crear factura de abono)
-- ============================================================================

CREATE OR REPLACE FUNCTION process_refund(
  p_refund_id UUID,
  p_approve BOOLEAN
)
RETURNS TABLE (
  refund_id UUID,
  credit_note_id UUID,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_refund RECORD;
  v_credit_note_id UUID;
  v_invoice_number TEXT;
BEGIN
  -- Obtener datos de la devolución
  SELECT * INTO v_refund FROM refunds WHERE id = p_refund_id;
  
  IF v_refund IS NULL THEN
    RETURN QUERY SELECT p_refund_id, NULL::UUID, FALSE, 'Devolución no encontrada';
    RETURN;
  END IF;
  
  -- Si se aprueba, crear factura de abono
  IF p_approve THEN
    v_invoice_number := generate_credit_note_number();
    
    INSERT INTO invoices (
      invoice_number,
      order_id,
      customer_email,
      customer_name,
      type,
      subtotal_cents,
      tax_cents,
      total_cents,
      reference_invoice_id,
      reason,
      items,
      status
    )
    SELECT
      v_invoice_number,
      v_refund.order_id,
      v_refund.customer_email,
      v_refund.customer_name,
      'credit_note',
      -ABS(v_refund.refund_amount_cents),
      0,
      -ABS(v_refund.refund_amount_cents),
      v_refund.invoice_id,
      v_refund.reason,
      v_refund.returned_items,
      'issued'
    RETURNING id INTO v_credit_note_id;
    
    -- Actualizar devolución
    UPDATE refunds 
    SET 
      status = 'approved',
      approved_at = NOW(),
      credit_note_id = v_credit_note_id
    WHERE id = p_refund_id;
    
    RETURN QUERY SELECT p_refund_id, v_credit_note_id, TRUE, 'Devolución aprobada y factura de abono creada';
  ELSE
    -- Rechazar devolución
    UPDATE refunds 
    SET status = 'rejected'
    WHERE id = p_refund_id;
    
    RETURN QUERY SELECT p_refund_id, NULL::UUID, TRUE, 'Devolución rechazada';
  END IF;
END;
$$ LANGUAGE plpgsql;
