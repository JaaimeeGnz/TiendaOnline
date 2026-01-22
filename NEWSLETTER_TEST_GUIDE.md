# ✅ Guía de Prueba - Sistema de Newsletter

## 🧪 Paso 1: Probar Suscripción en el Frontend

### Ubicación
El formulario se encuentra en el **footer de cualquier página** del sitio.

### Pasos
1. Abre http://localhost:3001
2. Desplázate al footer (abajo de la página)
3. Busca la sección "SUSCRÍBETE A NUESTRA NEWSLETTER"
4. Ingresa un email válido (ej: `tu@email.com`)
5. Haz click en el botón "SUSCRIBIR"

### Resultado Esperado
- ✅ El botón cambia a "Suscribiendo..."
- ✅ Aparece un mensaje verde de confirmación
- ✅ Se muestra el código de descuento generado
- ✅ El email se vacía
- ✅ Recibes un email de bienvenida en tu bandeja

---

## 📧 Paso 2: Verificar Email de Bienvenida

El email debe llegar a la dirección registrada con:
- ✅ Logo de JGMarket
- ✅ Código de descuento en grande
- ✅ Mensaje de bienvenida personalizado
- ✅ Información sobre validez del código

**Nota:** Si usas Brevo (Sendinblue), verifica que la API Key esté configurada en `.env.local`:
```
BREVO_API_KEY=tu_api_key_aqui
```

---

## 🔧 Paso 3: Pruebas de API (Usando cURL o Postman)

### a) Enviar Email de Prueba

```bash
curl -X POST http://localhost:3001/api/newsletter/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tuEmail@gmail.com",
    "testCode": "SAVE202601TEST"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "messageId": "123456"
}
```

---

### b) Enviar Promoción de un Producto

Primero, obtén el ID de un producto desde tu base de datos Supabase:

```bash
curl -X POST http://localhost:3001/api/newsletter/promotional \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "AQUI_VA_EL_ID_DEL_PRODUCTO"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Emails promocionales enviados a X suscriptores",
  "sent": 5,
  "total": 5
}
```

---

### c) Enviar Newsletter Masivo

```bash
curl -X POST http://localhost:3001/api/newsletter/send-promotion \
  -H "Content-Type: application/json" \
  -d '{
    "title": "¡Nuevos Productos Disponibles!",
    "description": "Descubre nuestras últimas novedades en zapatillas y ropa deportiva premium.",
    "productIds": ["uuid-1", "uuid-2", "uuid-3"]
  }'
```

Si NO especificas `productIds`, usará los productos marcados como "featured".

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Newsletter enviado a X de Y suscriptores",
  "sent": 5,
  "total": 5
}
```

---

## 🔍 Paso 4: Verificar Datos en Supabase

### Tabla: newsletter_subscribers

Abre tu panel de Supabase y verifica:
1. Ve a "SQL Editor"
2. Ejecuta:

```sql
SELECT * FROM newsletter_subscribers;
```

Deberías ver:
- ✅ Tu email en la tabla
- ✅ Un código de descuento único (ej: SAVE202601ABC)
- ✅ discount_percentage = 10
- ✅ is_active = true
- ✅ subscribed_at = fecha actual

---

## 🐛 Solucionar Problemas

### El formulario no responde
1. Abre la consola del navegador (F12)
2. Verifica que no haya errores de JavaScript
3. Revisa Network tab para ver si la request se envía

### No llega email de bienvenida
1. Verifica que `BREVO_API_KEY` esté en `.env.local`
2. Revisa la consola del servidor (terminal)
3. Intenta con `/api/newsletter/test-email` para verificar Brevo

### El código no aparece
1. Verifica en Supabase que el registro se creó
2. Revisa que `sendNewsletterWelcomeEmail()` se llamó
3. Comprueba logs del servidor

### Error "Product not found" en promotional
1. Verifica que el `productId` sea válido
2. Asegúrate que el producto esté marcado como `is_active = true`

---

## 📊 Caso de Prueba Completo

### Escenario
Quieres validar que:
1. El formulario funciona
2. Se guarda el email en BD
3. Se genera el código
4. Se envía el email

### Pasos
```
1. Email: test@example.com → Click "Suscribir"
2. Ver confirmación con código (ej: SAVE202601XYZ)
3. Ir a Supabase → newsletter_subscribers
4. Verificar que existe el registro con ese email
5. Revisar bandeja de test@example.com
6. Confirmar recepción de email con el código
```

---

## 🎯 Checklist de Validación

- [ ] Formulario muestra input y botón
- [ ] Validación rechaza emails inválidos
- [ ] Aceptar emails válidos
- [ ] Mostrar código de descuento
- [ ] Email llega a la bandeja
- [ ] Base de datos tiene el registro
- [ ] API test-email funciona
- [ ] Puede enviar promociones
- [ ] Newsletter masivo funciona

---

## 📱 Próximas Pruebas (Opcional)

- [ ] Probar en mobile (responsive)
- [ ] Probar múltiples emails
- [ ] Probar suscripción duplicada (debería devolver código existente)
- [ ] Probar con emails especiales (caracteres acentos, etc)

---

**¡Listo! El sistema está completo y funcionando. 🚀**

Cualquier duda, revisa los logs en la terminal o en la consola del navegador.
