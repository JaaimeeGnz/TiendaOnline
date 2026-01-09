@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo FashionMarket - Setup Automatico
echo ========================================
echo.

REM Check if node_modules exists
if exist node_modules (
    echo ✓ node_modules ya existe
) else (
    echo Instalando dependencias...
    call npm install
    if !errorlevel! neq 0 (
        echo ✗ Error en npm install
        exit /b 1
    )
    echo ✓ Dependencias instaladas
)

echo.
echo ========================================
echo Setup Completado
echo ========================================
echo.
echo Proximos pasos:
echo 1. Editar .env.local con credenciales Supabase
echo 2. Ejecutar SQL de docs/supabase_schema.sql en Supabase
echo 3. Crear bucket products-images
echo 4. Ejecutar: npm run dev
echo.

pause
