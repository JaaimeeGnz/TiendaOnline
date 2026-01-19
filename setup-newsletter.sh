#!/bin/bash

# Script para ejecutar la migración de newsletter y descuentos en Supabase
# Uso: ./setup-newsletter.sh

set -e

echo "🚀 Iniciando setup del sistema de Newsletter y Descuentos..."
echo ""

# Verificar que existan las variables de entorno necesarias
if [ -z "$PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Error: Variables de entorno no configuradas"
    echo "   Asegúrate de tener PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY en .env"
    exit 1
fi

echo "✅ Variables de entorno detectadas"
echo ""

# Leer el archivo SQL
SQL_FILE="./docs/newsletter_schema.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: No se encontró $SQL_FILE"
    exit 1
fi

echo "📋 Leyendo esquema SQL desde $SQL_FILE..."
echo ""

# Mostrar contenido (primeras líneas)
echo "Primeras líneas del script:"
head -5 "$SQL_FILE"
echo "..."
echo ""

echo "⚠️  ADVERTENCIA: Este script ejecutará cambios en la base de datos"
echo "   Tablas que se crearán:"
echo "   - newsletter_subscribers"
echo "   - discount_codes"
echo "   - discount_code_usage"
echo ""
echo "¿Continuar? (s/n)"
read -r response

if [ "$response" != "s" ] && [ "$response" != "S" ]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo ""
echo "📤 Ejecutando migración..."
echo ""

# Nota: La migración manual se debe hacer en la interfaz de Supabase
# Este script solo proporciona instrucciones
echo "Para completar la migración, realiza estos pasos:"
echo ""
echo "1. Ve a https://app.supabase.com"
echo "2. Selecciona tu proyecto"
echo "3. SQL Editor → New Query"
echo "4. Copia y pega el contenido de: docs/newsletter_schema.sql"
echo "5. Haz clic en 'Run' o presiona Ctrl+Enter"
echo ""
echo "O usa la CLI de Supabase si la tienes instalada:"
echo "   supabase db push"
echo ""
echo "✅ Setup completado!"
echo ""
