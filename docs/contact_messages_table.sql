-- Limpiar tabla anterior si existe
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP FUNCTION IF EXISTS update_contact_messages_updated_at() CASCADE;

-- Tabla para guardar los mensajes de contacto/reportes
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' NOT NULL, -- 'new', 'read', 'resolved', 'spam'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_notes TEXT,
    assigned_to UUID
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER contact_messages_updated_at_trigger
BEFORE UPDATE ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION update_contact_messages_updated_at();

-- Habilitar Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy para que CUALQUIERA pueda insertar sus mensajes (sin autenticación)
CREATE POLICY "Allow anyone insert messages" ON contact_messages
    FOR INSERT
    WITH CHECK (true);

-- Policy para que CUALQUIERA pueda leer todos los mensajes (temporalmente)
-- TODO: Cambiar a política más restrictiva cuando se implemente autenticación de admin
CREATE POLICY "Allow read all messages" ON contact_messages
    FOR SELECT
    USING (true);

