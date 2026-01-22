#!/bin/bash
# 📧 Script de Prueba - Newsletter API

# ==========================================
# 1️⃣ PROBAR SUSCRIPCIÓN
# ==========================================
echo "📧 Probando suscripción..."
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "discount": 10
  }' | jq .

echo ""
echo "✅ Verifica tu email para el mensaje de bienvenida"
echo ""

# ==========================================
# 2️⃣ ENVIAR EMAIL DE PRUEBA
# ==========================================
echo "📧 Enviando email de prueba..."
curl -X POST http://localhost:3001/api/newsletter/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "testCode": "SAVE202601TEST"
  }' | jq .

echo ""

# ==========================================
# 3️⃣ ENVIAR PROMOCIÓN DE PRODUCTO
# ==========================================
echo "📧 Enviando promoción de producto..."
echo "Nota: Reemplaza UUID_DEL_PRODUCTO con ID real"
curl -X POST http://localhost:3001/api/newsletter/promotional \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "550e8400-e29b-41d4-a716-446655440000"
  }' | jq .

echo ""

# ==========================================
# 4️⃣ ENVIAR NEWSLETTER MASIVO
# ==========================================
echo "📧 Enviando newsletter masivo..."
curl -X POST http://localhost:3001/api/newsletter/send-promotion \
  -H "Content-Type: application/json" \
  -d '{
    "title": "¡Nuevos Productos Disponibles!",
    "description": "Descubre nuestras últimas novedades en zapatillas y ropa deportiva premium.",
    "productIds": [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ]
  }' | jq .

echo ""
echo "✅ Todos los tests completados"
