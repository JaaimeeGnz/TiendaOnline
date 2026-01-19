# 🔧 Comandos Útiles - Newsletter & Descuentos

## 🚀 INICIACIÓN

### Clonar/Setup inicial
```bash
cd fashionmarket
npm install
npm run dev
```

## 🗄️ COMANDOS SUPABASE (SQL)

### Ver Suscriptores
```sql
SELECT email, discount_code, subscribed_at, is_active
FROM newsletter_subscribers
ORDER BY subscribed_at DESC;
```

### Ver Códigos de Descuento
```sql
SELECT code, discount_value, times_used, max_uses, is_active, valid_until
FROM discount_codes
ORDER BY created_at DESC;
```

### Ver Uso de Códigos
```sql
SELECT 
  c.code, 
  du.email, 
  du.created_at,
  du.amount_saved_cents
FROM discount_code_usage du
JOIN discount_codes c ON du.code_id = c.id
ORDER BY du.created_at DESC;
```

### Crear Código Simple
```sql
INSERT INTO discount_codes (code, discount_type, discount_value, is_active)
VALUES ('BIENVENIDA10', 'percentage', 10, true);
```

### Crear Código con Expiración
```sql
INSERT INTO discount_codes (code, discount_type, discount_value, valid_until, max_uses, is_active)
VALUES (
  'VERANO20',
  'percentage',
  20,
  NOW() + INTERVAL '30 days',
  500,
  true
);
```

### Desactivar Código
```sql
UPDATE discount_codes 
SET is_active = false 
WHERE code = 'OLDCODE';
```

### Contar Suscriptores
```sql
SELECT COUNT(*) as total
FROM newsletter_subscribers
WHERE is_active = true;
```

### Contar Códigos Usados
```sql
SELECT COUNT(DISTINCT email) as usuarios_con_descuento
FROM discount_code_usage;
```

### Ver Ingresos Generados por Descuentos
```sql
SELECT 
  c.code,
  COUNT(*) as usos,
  SUM(du.amount_saved_cents) as total_ahorrado_cents,
  (SUM(du.amount_saved_cents) / 100.0)::NUMERIC(10,2) as total_ahorrado_euros
FROM discount_code_usage du
JOIN discount_codes c ON du.code_id = c.id
GROUP BY c.code
ORDER BY usos DESC;
```

### Top 10 Códigos Más Usados
```sql
SELECT code, times_used, discount_value, is_active
FROM discount_codes
ORDER BY times_used DESC
LIMIT 10;
```

## 🌐 COMANDOS API (CURL)

### Suscribirse a Newsletter
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@example.com",
    "discount": 10
  }'
```

### Validar Código de Descuento
```bash
curl -X POST http://localhost:3000/api/discount/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BIENVENIDA10"
  }'
```

### Obtener Stats de Admin
```bash
curl -X GET http://localhost:3000/api/admin/newsletter \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Crear Código (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/discount-codes \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "NUEVOCOD25",
    "discount_type": "percentage",
    "discount_value": 25,
    "valid_until": "2025-02-01",
    "max_uses": 100
  }'
```

### Actualizar Código (Admin)
```bash
curl -X PATCH http://localhost:3000/api/admin/discount-codes/CODE_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discount_value": 30,
    "is_active": true
  }'
```

### Desactivar Código (Admin)
```bash
curl -X DELETE http://localhost:3000/api/admin/discount-codes/CODE_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🧪 TESTS EN NAVEGADOR (F12 Console)

### Ejecutar Suite Completa
```javascript
test_todo()
```

### Tests Individuales
```javascript
test_estructura()
test_localStorage()
test_calculos()
test_suscripcion()
test_validacion('BIENVENIDA10')
```

### Limpiar localStorage
```javascript
localStorage.removeItem('newsletter_subscribed')
location.reload()
```

### Ver localStorage
```javascript
console.table(localStorage)
```

### Probar Suscripción
```javascript
fetch('/api/newsletter/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    discount: 10
  })
}).then(r => r.json()).then(console.log)
```

### Probar Validación
```javascript
fetch('/api/discount/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'BIENVENIDA10' })
}).then(r => r.json()).then(console.log)
```

## 🎨 PERSONALIZACIÓN RÁPIDA

### Cambiar Descuento del Popup
**Archivo:** `src/pages/index.astro`
```astro
<!-- Cambiar de 10 a 15 -->
<NewsletterPopup client:load discount={15} />
```

### Cambiar Tiempo de Aparición
**Archivo:** `src/components/ui/NewsletterPopup.tsx`
```tsx
// Línea ~45: Cambiar 3000 (3 segundos) a otro valor
const timer = setTimeout(() => {
  setIsOpen(true);
}, 5000); // 5 segundos
```

### Cambiar Color del Botón
**Archivo:** `src/components/ui/NewsletterPopup.tsx`
```tsx
// Cambiar de azul a rojo
className="w-full bg-blue-600..."
// Por:
className="w-full bg-red-600..."
```

## 📦 GESTIÓN DE PROYECTOS

### Instalar Dependencias
```bash
npm install
```

### Compilar
```bash
npm run build
```

### Previsualizar Build
```bash
npm run preview
```

### Linter/Check de Errores
```bash
npm run astro check
```

## 🔍 DEBUGGING

### Ver Logs en Supabase
1. Ve a supabase.com → Tu Proyecto
2. Logs (Panel izquierdo)
3. Filtra por error, si necesario

### Ver Errores en Navegador
```javascript
// F12 → Console
// F12 → Network (ver requests)
// F12 → Storage (ver localStorage)
```

### Validar Email
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
console.log(emailRegex.test('test@example.com')); // true
```

### Ver Estado de la BD
```sql
-- Ver todas las políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
ORDER BY tablename;

-- Ver triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers;
```

## 📊 SCRIPTS ÚTILES

### Export de Suscriptores (CSV)
En Supabase Table Editor:
1. Click en tabla `newsletter_subscribers`
2. Click en ⋮ (menú)
3. Export → CSV

### Backup de Códigos
```sql
-- Exportar códigos activos
SELECT * FROM discount_codes WHERE is_active = true;
-- Luego: Copy → Export CSV
```

## 🚀 DEPLOYMENT

### Build para Producción
```bash
npm run build
```

### Deploy en Vercel
```bash
vercel
# Seguir instrucciones
```

### Deploy en Netlify
```bash
netlify deploy --prod
```

## 🆘 EMERGENCIAS

### Popup Roto
```bash
# Limpiar caché y recargar
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### BD Corrupta (Nuclear Option)
```bash
# Eliminar todas las tablas
DROP TABLE IF EXISTS discount_code_usage;
DROP TABLE IF EXISTS discount_codes;
DROP TABLE IF EXISTS newsletter_subscribers;

# Luego: Ejecutar newsletter_schema.sql nuevamente
```

### Reset Completo
```bash
# 1. Limpiar localStorage
localStorage.clear()

# 2. Eliminar datos en BD
DELETE FROM newsletter_subscribers;
DELETE FROM discount_codes;
DELETE FROM discount_code_usage;

# 3. Recargar página
location.reload()
```

## 📱 TESTING EN MÓVIL

### Local (con ngrok)
```bash
# Instalar ngrok
npm install -g ngrok

# En otra terminal
ngrok http 3000

# Usar la URL de ngrok en móvil
```

## 🎯 CHECKLIST RÁPIDO

```
🚀 Iniciación:
  ☐ npm install
  ☐ npm run dev
  ☐ Verificar popup en http://localhost:3000

📊 Base de Datos:
  ☐ Ejecutar docs/newsletter_schema.sql
  ☐ Verificar 3 tablas en Supabase
  ☐ Crear 3 códigos de prueba

🧪 Testing:
  ☐ Probar popup (F12 Console)
  ☐ Probar suscripción
  ☐ Validar código
  ☐ Verificar BD

🎨 Personalización:
  ☐ Cambiar colores
  ☐ Cambiar textos
  ☐ Cambiar descuento inicial

🚀 Deploy:
  ☐ npm run build
  ☐ Subir a producción
  ☐ Probar en vivo
```

---

## 💡 Tips Útiles

- Guarda accesos directos a:
  - Tu proyecto en supabase.com
  - http://localhost:3000
  - Tu host de deploy

- Los códigos se pueden reutilizar entre usuarios (por diseño)
- Máximo 500 caracteres para nombre de código
- Usa códigos descriptivos: `VERANO20`, `BLACKFRIDAY`, etc.

---

**¡Comandos listos! Copia y pega según necesites.** 🚀
