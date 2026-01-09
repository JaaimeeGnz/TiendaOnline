#!/bin/bash

# FashionMarket - Setup Verification Script
# Verifica que todos los archivos fundacionales están en su lugar

echo "🏢 FashionMarket - Verificación de Instalación"
echo "================================================"
echo ""

MISSING=0

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
        MISSING=$((MISSING + 1))
    fi
}

# Función para verificar directorio
check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1/"
    else
        echo "❌ $1/"
        MISSING=$((MISSING + 1))
    fi
}

echo "📁 Directorios:"
check_dir "public/fonts"
check_dir "src/components/ui"
check_dir "src/components/product"
check_dir "src/components/islands"
check_dir "src/layouts"
check_dir "src/lib"
check_dir "src/pages/productos"
check_dir "src/pages/categoria"
check_dir "src/pages/admin/productos"
check_dir "src/stores"
check_dir "docs"

echo ""
echo "📄 Configuración:"
check_file "package.json"
check_file "astro.config.mjs"
check_file "tailwind.config.mjs"
check_file "tsconfig.json"
check_file ".env.example"
check_file ".gitignore"
check_file "src/env.d.ts"
check_file "src/middleware.ts"

echo ""
echo "🛠️ Librerías:"
check_file "src/lib/supabase.ts"
check_file "src/lib/utils.ts"

echo ""
echo "🎯 Stores:"
check_file "src/stores/cart.ts"

echo ""
echo "🏠 Layouts:"
check_file "src/layouts/BaseLayout.astro"
check_file "src/layouts/PublicLayout.astro"
check_file "src/layouts/AdminLayout.astro"

echo ""
echo "🧩 Componentes UI:"
check_file "src/components/ui/Button.astro"

echo ""
echo "📦 Componentes de Producto:"
check_file "src/components/product/ProductCard.astro"
check_file "src/components/product/ProductGallery.astro"

echo ""
echo "⚛️ React Islands:"
check_file "src/components/islands/AddToCartButton.tsx"

echo ""
echo "📄 Páginas Públicas:"
check_file "src/pages/index.astro"
check_file "src/pages/productos/index.astro"
check_file "src/pages/productos/[slug].astro"
check_file "src/pages/categoria/[slug].astro"

echo ""
echo "🔐 Páginas Admin:"
check_file "src/pages/admin/login.astro"
check_file "src/pages/admin/index.astro"
check_file "src/pages/admin/productos/index.astro"
check_file "src/pages/admin/productos/nuevo.astro"

echo ""
echo "📚 Documentación:"
check_file "README.md"
check_file "docs/supabase_schema.sql"
check_file "docs/SUPABASE_STORAGE_SETUP.md"
check_file "docs/ARCHITECTURE_SUMMARY.md"

echo ""
echo "================================================"
if [ $MISSING -eq 0 ]; then
    echo "✅ ¡TODOS LOS ARCHIVOS PRESENTES!"
    echo ""
    echo "Próximos pasos:"
    echo "1. npm install"
    echo "2. Crear proyecto en supabase.com"
    echo "3. npm run dev"
    echo "4. Abrir http://localhost:3000"
else
    echo "❌ Faltan $MISSING archivo(s)"
fi
echo ""
