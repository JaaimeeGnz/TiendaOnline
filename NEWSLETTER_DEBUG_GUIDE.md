# 🔧 Guía de Diagnóstico: Error al Suscribirse a Newsletter

## Pasos para Diagnosticar el Problema

### 1. **Abre la Consola del Navegador** (F12)
   - Ve a la sección **Console**
   - Aquí verás los mensajes de error detallados

### 2. **Prueba en la Consola del Navegador**
   
   Copia y pega esto en la consola (Console tab):

   ```javascript
   // Test 1: Verificar API
   async function testNewsletter() {
     const email = `test-${Date.now()}@example.com`;
     console.log('Testing newsletter subscription with:', email);
     
     const response = await fetch('/api/newsletter/subscribe', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, discount: 10 })
     });
     
     const data = await response.json();
     console.log('Response Status:', response.status);
     console.log('Response OK:', response.ok);
     console.log('Response Data:', data);
     return data;
   }
   
   // Ejecutar
   testNewsletter();
   ```

### 3. **Revisar el Endpoint de Debug**
   
   En el navegador, abre (en una nueva pestaña):
   ```
   http://localhost:3000/api/debug/newsletter-test
   ```
   
   Luego abre la consola (F12 > Console) y prueba:
   
   ```javascript
   const response = await fetch('/api/debug/newsletter-test', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ 
       email: 'test@example.com',
       action: 'full'
     })
   });
   
   const result = await response.json();
   console.log(JSON.stringify(result, null, 2));
   ```

## 🔍 Posibles Errores y Soluciones

### Error: "Email inválido"
- **Causa**: Formato de email incorrecto
- **Solución**: Usa un email con formato válido (ejemplo@email.com)

### Error: "Error en la suscripción"
- **Causa**: Problema con Supabase
- **Solución**: 
  - Verifica conexión a Internet
  - Revisa que las tablas existan en Supabase
  - Verifica credenciales en `.env.local`

### Error: "Error procesando tu suscripción"
- **Causa**: Error del servidor
- **Solución**:
  - Abre F12 > Console para ver error detallado
  - Verifica logs del servidor

### No aparece ningún mensaje
- **Causa**: Error en la red
- **Solución**:
  - Abre F12 > Network y busca la solicitud a `/api/newsletter/subscribe`
  - Verifica que tenga status 200
  - Revisa la respuesta (Response tab)

## 📋 Checklist de Configuración

- [ ] `.env.local` tiene `PUBLIC_SUPABASE_URL`
- [ ] `.env.local` tiene `PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env.local` tiene `BREVO_API_KEY`
- [ ] Las tablas existen en Supabase (newsletter_subscribers, discount_codes)
- [ ] El servidor está corriendo en puerto 3000
- [ ] NewsletterForm está en `client:load`

## 📞 Información para el Log

Cuando reportes el error, incluye:

1. **Consola del navegador** (F12 > Console):
   - Copia el mensaje de error completo

2. **Network tab** (F12 > Network):
   - El status code de la solicitud
   - La respuesta del servidor

3. **Log del servidor**:
   - Mensajes que aparecen en la terminal

4. **Email utilizado**:
   - El email que estabas usando
