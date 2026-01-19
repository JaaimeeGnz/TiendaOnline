@echo off
REM Script para ejecutar la migración de newsletter y descuentos en Supabase
REM Uso: setup-newsletter.cmd

echo.
echo 🚀 Iniciando setup del sistema de Newsletter y Descuentos...
echo.

REM Verificar que el archivo SQL existe
if not exist "docs\newsletter_schema.sql" (
    echo ❌ Error: No se encontró docs\newsletter_schema.sql
    exit /b 1
)

echo 📋 Esquema SQL detectado
echo.

echo ⚠️  INSTRUCCIONES PARA EJECUTAR LA MIGRACIÓN:
echo.
echo 1. Ve a https://app.supabase.com
echo 2. Selecciona tu proyecto
echo 3. SQL Editor → New Query
echo 4. Abre el archivo: docs\newsletter_schema.sql
echo 5. Copia TODO el contenido
echo 6. Pégalo en el SQL Editor de Supabase
echo 7. Haz clic en 'Run' o presiona Ctrl+Enter
echo.
echo Las siguientes tablas se crearán:
echo   ✓ newsletter_subscribers
echo   ✓ discount_codes
echo   ✓ discount_code_usage
echo.
echo ✅ Una vez completado, el sistema estará listo!
echo.
echo 📚 Lee la documentación: docs\NEWSLETTER_DISCOUNT_SYSTEM.md
echo.
pause
