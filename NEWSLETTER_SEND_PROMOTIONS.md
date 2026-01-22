# 📬 Guía Práctica - Enviar Emails Promocionales

## 🎯 Casos de Uso

### 1️⃣ Promocionar un Producto Específico

**Escenario:** Acabas de recibir nuevas zapatillas y quieres alertar a todos tus suscriptores.

**Comando:**
```bash
curl -X POST http://localhost:3001/api/newsletter/promotional \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Qué sucede:**
- Se obtiene el producto de la BD
- Se envía email individual a cada suscriptor
- Cada email muestra: imagen, nombre, precio, botón "Ver Producto"
- El suscriptor recibe notificación personalizada

**Respuesta:**
```json
{
  "success": true,
  "message": "Emails promocionales enviados a 157 suscriptores",
  "sent": 157,
  "total": 157
}
```

---

### 2️⃣ Enviar Newsletter con Múltiples Productos

**Escenario:** Black Friday - Quieres destacar tus 5 mejores productos.

**Comando:**
```bash
curl -X POST http://localhost:3001/api/newsletter/send-promotion \
  -H "Content-Type: application/json" \
  -d '{
    "title": "¡Black Friday en JGMarket! Hasta 50% de descuento",
    "description": "Vive la experiencia del Black Friday con nuestras ofertas exclusivas. Descubre zapatillas premium y ropa deportiva a precios increíbles. Válido hasta fin de mes.",
    "productIds": [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003",
      "550e8400-e29b-41d4-a716-446655440004"
    ]
  }'
```

**Qué sucede:**
- Se crea un newsletter elegante con hasta 6 productos
- Cada producto tiene su imagen, nombre, precio y botón
- Se envía a todos los suscriptores activos
- Diseño responsive (funciona en móvil)

**Respuesta:**
```json
{
  "success": true,
  "message": "Newsletter enviado a 157 de 157 suscriptores",
  "sent": 157,
  "total": 157
}
```

---

### 3️⃣ Usar Productos Destacados (Featured)

**Escenario:** No quieres especificar productos, solo quieres enviar los "featured".

**Comando:**
```bash
curl -X POST http://localhost:3001/api/newsletter/send-promotion \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nuestros Productos Recomendados",
    "description": "Estos son los productos que nuestros clientes más aman. ¡Descúbrelos y encuentra tu favorito!"
  }'
```

**Nota:** Sin `productIds`, se usan automáticamente los productos con `featured = true`.

---

## 🛠️ Integración en Panel de Admin

### Opción 1: Formulario Web (Recomendado)

Crear una página en `src/pages/admin/newsletter.astro`:

```astro
---
import AdminLayout from '../../layouts/AdminLayout.astro';
---

<AdminLayout title="Newsletter Admin">
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-8">Enviar Newsletter</h1>
    
    <form id="newsletterForm" class="bg-white p-8 rounded-lg shadow">
      <div class="mb-6">
        <label class="block text-sm font-bold mb-2">Título</label>
        <input type="text" id="title" name="title" required class="w-full border p-2 rounded" />
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-bold mb-2">Descripción</label>
        <textarea id="description" name="description" rows="3" required class="w-full border p-2 rounded"></textarea>
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-bold mb-2">Productos</label>
        <select id="products" name="products" multiple class="w-full border p-2 rounded">
          <!-- Populado por JavaScript desde API -->
        </select>
      </div>
      
      <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded font-bold">
        Enviar Newsletter
      </button>
    </form>
    
    <div id="message" class="mt-6"></div>
  </div>
  
  <script>
    document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const productIds = Array.from(document.getElementById('products').selectedOptions)
        .map(o => o.value);
      
      const response = await fetch('/api/newsletter/send-promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          productIds: productIds.length > 0 ? productIds : undefined
        })
      });
      
      const data = await response.json();
      const messageEl = document.getElementById('message');
      
      if (response.ok) {
        messageEl.innerHTML = `<div class="bg-green-100 text-green-800 p-4 rounded">
          ✅ ${data.message}
        </div>`;
      } else {
        messageEl.innerHTML = `<div class="bg-red-100 text-red-800 p-4 rounded">
          ❌ Error: ${data.error}
        </div>`;
      }
    });
  </script>
</AdminLayout>
```

---

## 📧 Plantillas de Email por Ocasión

### 🎄 Navidad
```javascript
{
  "title": "¡Ofertas Navideñas en JGMarket!",
  "description": "Regala estilo estas navidades. Descubre nuestras colecciones premium de zapatillas y ropa deportiva. ¡Envío gratis en compras mayores a 50€!"
}
```

### 🌞 Verano
```javascript
{
  "title": "¡Colección de Verano 2024!",
  "description": "Prepárate para el verano con nuestras nuevas colecciones. Zapatillas ligeras, ropa transpirable y accesorios para el buen tiempo."
}
```

### 🎁 Aniversario
```javascript
{
  "title": "¡5 Años de JGMarket! Celebra con Nosotros",
  "description": "Por 5 años de confianza, te regalamos descuentos especiales. Acceso exclusivo a nuestros productos premium."
}
```

### 🚀 Lanzamiento Nuevo Producto
```javascript
{
  "title": "Acaba de Llegar: Nuevas Zapatillas XXX",
  "description": "Presentamos la colección más esperada del año. Tecnología de punta, diseño exclusivo, comodidad sin compromiso."
}
```

---

## 📊 Estadísticas y Análisis

### Obtener Estadísticas de Suscriptores

```bash
curl http://localhost:3001/api/newsletter/stats
```

Respuesta:
```json
{
  "totalSubscribers": 157,
  "codesUsed": 42,
  "codesUnused": 115
}
```

---

## ⏰ Automatización (Futuro)

### Publicar Newsletter Automáticamente

```javascript
// Ejemplo con cron job
schedule.scheduleJob('0 9 * * 1', async () => {
  // Enviar newsletter cada lunes a las 9 AM
  await fetch('/api/newsletter/send-promotion', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Ofertas de la Semana',
      description: 'Los mejores descuentos de la semana en tu bandeja'
    })
  });
});
```

---

## 🔒 Seguridad

### Validaciones Incluidas
- ✅ Solo suscriptores activos reciben emails
- ✅ Validación de emails
- ✅ Límite de 6 productos por newsletter
- ✅ IDs de productos validados

### Recomendaciones
- ✅ Proteger endpoint con autenticación (verificar role admin)
- ✅ Rate limiting (máximo 5 newsletters/hora)
- ✅ Registrar quién envió cada newsletter
- ✅ Permitir desuscripción en cada email

---

## 🎓 Más Información

Ver documentación completa en:
- `NEWSLETTER_IMPLEMENTATION.md`
- `NEWSLETTER_TEST_GUIDE.md`
- `docs/NEWSLETTER_DISCOUNT_SYSTEM.md`

---

**¡Listo para promocionar! 🚀**
