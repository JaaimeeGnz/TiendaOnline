# 🎉 Sistema Newsletter - JGMarket

## ¿Qué es esto?

Un sistema completo para que tu tienda recopile emails de suscriptores y les envíe promociones automáticamente.

---

## 🚀 Quick Start (2 minutos)

### 1. Ver en Vivo
```bash
npm run dev
# Abre http://localhost:3001
```

### 2. Ir al Footer
Desplázate al final de cualquier página y busca:
```
SUSCRÍBETE A NUESTRA NEWSLETTER
```

### 3. Suscribirse
- Email: `tu@email.com`
- Click: "SUSCRIBIR"
- ✅ Recibirás código de descuento

### 4. Revisar Email
Busca en tu bandeja el email de bienvenida con el código

---

## 📁 Documentación Completa

### Para Entender el Sistema
- **`NEWSLETTER_IMPLEMENTATION.md`** - ¿Cómo fue implementado?
- **`NEWSLETTER_COMPLETE_SUMMARY.md`** - Resumen ejecutivo

### Para Probar
- **`NEWSLETTER_TEST_GUIDE.md`** - Guía paso a paso
- **`NEWSLETTER_CHECKLIST.md`** - Checklist de validación

### Para Enviar Promociones
- **`NEWSLETTER_SEND_PROMOTIONS.md`** - Cómo enviar emails

### Scripts de Prueba
- **`test-newsletter.sh`** - Para Linux/Mac
- **`test-newsletter.cmd`** - Para Windows

---

## 🎯 Funcionalidades

### Para Clientes ✅
- Formulario interactivo en footer
- Validación de email en tiempo real
- Código de descuento único al suscribirse
- Email de bienvenida automático
- Recibir promociones de productos

### Para Admin ✅
- API para enviar promoción de 1 producto
- API para enviar newsletter masivo
- API para probar configuración de email
- Estadísticas de suscriptores

---

## 📊 Estructura de Archivos

```
fashionmarket/
├── src/
│   ├── components/islands/
│   │   └── NewsletterForm.tsx ✨ NUEVO
│   ├── pages/api/newsletter/
│   │   ├── subscribe.ts (modificado)
│   │   ├── promotional.ts ✨ NUEVO
│   │   ├── send-promotion.ts ✨ NUEVO
│   │   └── test-email.ts ✨ NUEVO
│   ├── lib/
│   │   ├── email.ts (expandido)
│   │   └── newsletter.ts (mejorado)
│   └── layouts/
│       └── PublicLayout.astro (actualizado)
├── NEWSLETTER_*.md (4 guías)
├── test-newsletter.sh
├── test-newsletter.cmd
└── ...
```

---

## 🔧 APIs

### Suscribirse
```bash
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "usuario@gmail.com",
  "discount": 10
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "¡Bienvenido! Usa el código SAVE202601XYZ para obtener 10% de descuento",
  "discountCode": "SAVE202601XYZ"
}
```

---

### Enviar Email Promocional
```bash
POST /api/newsletter/promotional
Content-Type: application/json

{
  "productId": "uuid-del-producto"
}
```

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

### Enviar Newsletter
```bash
POST /api/newsletter/send-promotion
Content-Type: application/json

{
  "title": "¡Nuevas Ofertas!",
  "description": "Descubre nuestros productos destacados",
  "productIds": ["uuid1", "uuid2", "uuid3"]
}
```

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

### Email de Prueba
```bash
POST /api/newsletter/test-email
Content-Type: application/json

{
  "email": "tu@email.com",
  "testCode": "SAVE202601TEST"
}
```

---

## 📧 Emails que se Envían

### 1. Email de Bienvenida
- **Cuándo:** Al suscribirse
- **Contenido:** Código de descuento único
- **Validez:** 30 días

### 2. Email Promocional
- **Cuándo:** Manualmente desde admin
- **Contenido:** 1 producto con imagen y precio
- **Público:** Todos los suscriptores activos

### 3. Newsletter Masivo
- **Cuándo:** Manualmente desde admin
- **Contenido:** Hasta 6 productos
- **Público:** Todos los suscriptores activos

---

## 🗄️ Base de Datos

### Tabla: newsletter_subscribers
```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  discount_code VARCHAR(50) UNIQUE,
  discount_percentage INT DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## ⚙️ Configuración

### Variables de Entorno Requeridas

```bash
# .env.local

# Email Service (Brevo)
BREVO_API_KEY=xxxxxxxxxxxxxxxxxxxxx

# Supabase
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxxx

# Site
PUBLIC_SITE_URL=http://localhost:3001
```

---

## 📋 Requisitos

- ✅ Node.js 18+
- ✅ npm o yarn
- ✅ Supabase (gratis)
- ✅ Brevo API Key (gratis)
- ✅ Astro 5+

---

## 🧪 Pruebas

### Probar en el Navegador
1. Abre http://localhost:3001
2. Scroll al footer
3. Ingresa email y click "Suscribir"
4. Verifica confirmación y código

### Probar APIs con cURL
```bash
# Windows (desde PowerShell)
.\test-newsletter.cmd

# Linux/Mac
bash test-newsletter.sh
```

---

## 🎓 Más Información

Para conocer detalles técnicos, lee:

| Documento | Para Qué |
|-----------|----------|
| `NEWSLETTER_IMPLEMENTATION.md` | Entender la arquitectura |
| `NEWSLETTER_TEST_GUIDE.md` | Probar funcionalidades |
| `NEWSLETTER_SEND_PROMOTIONS.md` | Enviar emails |
| `NEWSLETTER_CHECKLIST.md` | Validar todo funcione |

---

## 🚨 Troubleshooting

### El formulario no responde
1. Abre DevTools (F12)
2. Ve a Console
3. Busca errores de JavaScript

### No llega el email
1. Verifica `BREVO_API_KEY` en `.env.local`
2. Prueba con `/api/newsletter/test-email`
3. Revisa logs en terminal

### Error "Product not found"
1. Verifica que el UUID sea válido
2. Confirma que el producto exista en BD
3. Asegúrate que está marcado como `is_active`

---

## 🎯 Próximos Pasos

### Corto Plazo
- [ ] Proteger endpoints con autenticación
- [ ] Panel de admin para newsletters
- [ ] Confirmar suscripción por email

### Mediano Plazo
- [ ] Automatización de campañas
- [ ] Segmentación de suscriptores
- [ ] Analytics y tracking

### Largo Plazo
- [ ] A/B Testing
- [ ] Machine Learning recomendaciones
- [ ] Integración con CRM

---

## 📞 Soporte

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| "API Key no configurada" | Agregar `BREVO_API_KEY` a `.env.local` |
| "Product not found" | Verificar UUID y que esté activo |
| "No hay suscriptores" | Normal, agrega más pruebas primero |
| Email no llega | Revisar spam, o probar con test-email |

---

## 📊 Estadísticas

- **Componentes:** 1 nuevo
- **APIs:** 4 nuevas/mejoradas
- **Librerías:** 2 expandidas
- **Documentación:** 5 archivos
- **Líneas de código:** 500+

---

## ✨ Características

- ✅ Formulario interactivo
- ✅ Validación email
- ✅ Códigos de descuento únicos
- ✅ Emails automáticos
- ✅ Promociones masivas
- ✅ API REST
- ✅ Base de datos
- ✅ Totalmente funcional

---

## 📄 Licencia

Este proyecto es parte de JGMarket.

---

## 🎉 ¡Listo!

Todo está configurado y funcionando. Ahora puedes:

1. 🎯 Recopilar emails de clientes
2. 📧 Enviar promociones automáticas
3. 💰 Aumentar ventas con descuentos
4. 📈 Crecer tu negocio

**¡Mucho éxito! 🚀**

---

**Versión:** 1.0  
**Fecha:** 21 de enero de 2026  
**Estado:** ✅ Producción

Para más información, consulta la documentación en los archivos `NEWSLETTER_*.md`
