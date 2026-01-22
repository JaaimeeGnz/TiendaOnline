@echo off
REM 📧 Script de Prueba - Newsletter API (Windows)
REM Ejecutar desde PowerShell: .\test-newsletter.ps1

echo.
echo ========================================
echo 1 - PROBAR SUSCRIPCION
echo ========================================
echo.

powershell -Command "
$body = @{
    email = 'test@ejemplo.com'
    discount = 10
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3001/api/newsletter/subscribe' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $body | ConvertTo-Json | Write-Host
"

echo.
echo Verifica tu email para el mensaje de bienvenida
echo.

REM ==========================================
REM 2 - ENVIAR EMAIL DE PRUEBA
REM ==========================================
echo.
echo ========================================
echo 2 - ENVIAR EMAIL DE PRUEBA
echo ========================================
echo.

powershell -Command "
$body = @{
    email = 'test@ejemplo.com'
    testCode = 'SAVE202601TEST'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3001/api/newsletter/test-email' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $body | ConvertTo-Json | Write-Host
"

echo.

REM ==========================================
REM 3 - ENVIAR PROMOCION DE PRODUCTO
REM ==========================================
echo.
echo ========================================
echo 3 - ENVIAR PROMOCION DE PRODUCTO
echo ========================================
echo Nota: Reemplaza UUID_DEL_PRODUCTO con ID real
echo.

powershell -Command "
$body = @{
    productId = '550e8400-e29b-41d4-a716-446655440000'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3001/api/newsletter/promotional' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $body | ConvertTo-Json | Write-Host
"

echo.

REM ==========================================
REM 4 - ENVIAR NEWSLETTER MASIVO
REM ==========================================
echo.
echo ========================================
echo 4 - ENVIAR NEWSLETTER MASIVO
echo ========================================
echo.

powershell -Command "
$body = @{
    title = 'Nuevos Productos Disponibles!'
    description = 'Descubre nuestras ultimas novedades en zapatillas y ropa deportiva premium.'
    productIds = @(
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002'
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3001/api/newsletter/send-promotion' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $body | ConvertTo-Json | Write-Host
"

echo.
echo ========================================
echo TODOS LOS TESTS COMPLETADOS
echo ========================================
echo.
pause
