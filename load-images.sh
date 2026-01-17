#!/bin/bash

# Script para ejecutar el SQL de imágenes en Supabase
# Uso: ./load-images.sh

echo "🚀 FashionMarket - Cargar Imágenes en la Base de Datos"
echo "========================================================"
echo ""
echo "Este script requiere:"
echo "  1. supabase-cli instalado"
echo "  2. Variables de entorno configuradas"
echo ""

# Verificar si supabase-cli está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ supabase-cli no está instalado"
    echo "Instala con: npm install -g supabase"
    exit 1
fi

echo "✅ supabase-cli detectado"
echo ""

# Opciones
echo "Opciones:"
echo "1. Ejecutar SQL en Supabase (requiere credentials)"
echo "2. Ver archivo SQL"
echo "3. Copiar archivo SQL al portapapeles"
echo ""
read -p "Elige opción (1-3): " option

case $option in
    1)
        echo "Ejecutando SQL en Supabase..."
        # Este paso requiere que la URL y KEY estén en .env
        if [ -f "docs/seed_with_images.sql" ]; then
            echo "✅ Archivo SQL encontrado"
            echo ""
            echo "Abre Supabase Dashboard:"
            echo "  1. Ve a: https://app.supabase.com"
            echo "  2. Selecciona tu proyecto"
            echo "  3. SQL Editor → New Query"
            echo "  4. Pega el contenido del archivo:"
            cat docs/seed_with_images.sql | head -20
            echo "  ..."
            echo "  5. Click Run"
        else
            echo "❌ Archivo docs/seed_with_images.sql no encontrado"
            exit 1
        fi
        ;;
    2)
        echo "Abriendo archivo SQL..."
        cat docs/seed_with_images.sql
        ;;
    3)
        echo "Copiando al portapapeles..."
        if command -v xclip &> /dev/null; then
            cat docs/seed_with_images.sql | xclip -selection clipboard
            echo "✅ Copiado al portapapeles (Linux)"
        elif command -v pbcopy &> /dev/null; then
            cat docs/seed_with_images.sql | pbcopy
            echo "✅ Copiado al portapapeles (Mac)"
        else
            echo "⚠️  No se puede copiar automáticamente en Windows"
            echo "Copia manualmente desde: docs/seed_with_images.sql"
        fi
        ;;
    *)
        echo "Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "✨ Proceso completado"
