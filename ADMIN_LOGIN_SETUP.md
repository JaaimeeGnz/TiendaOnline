
# 🔐 Sistema de Login Administrador

## ¿Qué cambió?

Ahora el sistema de autenticación tiene una funcionalidad especial: **cuando inicies sesión con el correo `Jaimechipiona2006@gmail.com`, serás redirigido automáticamente al panel de administrador** en lugar de ir a la página de productos.

---

## 📝 Instrucciones de Uso

### Acceso como Usuario Normal
1. Ve a [http://localhost:3000/auth](http://localhost:3000/auth)
2. Ingresa cualquier correo que **NO sea** `Jaimechipiona2006@gmail.com`
3. Ingresa la contraseña
4. **Serás redirigido a `/productos`** (tienda normal)

### Acceso como Administrador
1. Ve a [http://localhost:3000/auth](http://localhost:3000/auth) o directamente a [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Ingresa el correo: **`Jaimechipiona2006@gmail.com`**
3. Ingresa la contraseña correcta
4. **Serás redirigido a `/admin`** (panel administrativo)

---

## 🔧 Cambios Realizados

### 1. Componente AuthForm (`src/components/auth/AuthForm.tsx`)
```tsx
// ANTES:
setTimeout(() => {
  window.location.href = '/productos';
}, 1500);

// AHORA:
const isAdmin = email.toLowerCase() === 'jaimechipiona2006@gmail.com';
setTimeout(() => {
  window.location.href = isAdmin ? '/admin' : '/productos';
}, 1500);
```

**¿Qué hace?**
- Verifica si el email corresponde al administrador
- Si es admin → redirige a `/admin`
- Si es usuario normal → redirige a `/productos`

### 2. API Endpoint (`src/pages/api/admin/login.ts`) - NUEVO
```typescript
// Validar que el correo sea el del administrador
const adminEmail = 'jaimechipiona2006@gmail.com';
if (email.toLowerCase() !== adminEmail) {
  return redirect('/admin/login?error=invalid');
}
```

**¿Qué hace?**
- Valida que SOLO el correo del admin pueda acceder al panel
- Rechaza cualquier otro correo con error
- Proporciona seguridad adicional en el servidor

---

## ✅ Validaciones

El sistema incluye múltiples capas de seguridad:

1. **Client-side** (AuthForm):
   - Verifica el email antes de redirigir
   - Solo el email correcto va a `/admin`

2. **Server-side** (API):
   - Valida el email nuevamente
   - Rechaza intentos con otros emails

---

## 🚀 Próximas Mejoras Opcionales

### 1. Autenticación por rol en Base de Datos
```sql
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Protección de Rutas
```typescript
// Verificar en /admin/index.astro
const session = await getSession();
if (!session) {
  return redirect('/auth');
}
if (session.user.email !== 'jaimechipiona2006@gmail.com') {
  return redirect('/productos');
}
```

### 3. Múltiples Administradores
```typescript
const adminEmails = [
  'jaimechipiona2006@gmail.com',
  'otro.admin@fashionmarket.com',
  'tercer.admin@fashionmarket.com'
];

const isAdmin = adminEmails.includes(email.toLowerCase());
```

---

## 🧪 Pruebas Sugeridas

### Test 1: Login como Admin
```
1. Abre: http://localhost:3000/auth
2. Email: jaimechipiona2006@gmail.com
3. Contraseña: [contraseña registrada]
4. Resultado esperado: Redirige a /admin ✅
```

### Test 2: Login como Usuario
```
1. Abre: http://localhost:3000/auth
2. Email: usuario@example.com (DIFERENTE al admin)
3. Contraseña: [contraseña registrada]
4. Resultado esperado: Redirige a /productos ✅
```

### Test 3: Email Incorrecto en Admin
```
1. Abre: http://localhost:3000/admin/login
2. Email: otro@email.com
3. Contraseña: cualquiera
4. Resultado esperado: Error "Email o contraseña incorrectos" ✅
```

---

## 📂 Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/auth/AuthForm.tsx` | Lógica de redirección según email |
| `src/pages/api/admin/login.ts` | **NUEVO** - Validación de email del admin |

---

## 🔒 Seguridad

⚠️ **Nota Importante:**
- Actualmente la validación solo usa el email
- Para producción, implementa autenticación con roles en BD
- Usa tokens JWT seguros
- Implementa CSRF protection
- Valida sesiones en backend

---

## 📞 Troubleshooting

### "Problema: Login no redirige a admin"
**Solución:**
- Verifica que escribes el email correctamente: `jaimechipiona2006@gmail.com`
- Asegúrate de que NO hay espacios adicionales
- Verifica que la contraseña es correcta

### "Problema: El email correcto no funciona"
**Solución:**
- Ejecuta: `npm run build`
- Reinicia el servidor
- Limpia cookies del navegador (Ctrl+Shift+Supr)

### "Problema: Otros usuarios también van a admin"
**Solución:**
- Verifica que el AuthForm contiene la verificación del email
- Revisa que la comparación es case-insensitive: `.toLowerCase()`

---

## 📊 Estructura de Acceso

```
┌─────────────────────┐
│  Página de Login    │
│  /auth              │
└──────────┬──────────┘
           │
           ├─ Email: jaimechipiona2006@gmail.com
           │  Password: Correcta
           │  ↓
           └─→ /admin (Panel Administrativo) ✅
           
           ├─ Email: otra@email.com
           │  Password: Correcta
           │  ↓
           └─→ /productos (Tienda Normal) ✅
           
           ├─ Email: jaimechipiona2006@gmail.com
           │  Password: Incorrecta
           │  ↓
           └─→ Error (Mostrar mensaje) ✅
```

---

## 🎉 ¡Listo!

El sistema de autenticación con acceso administrador está configurado y funcionando. 

**Próximo paso:** Prueba con el email `jaimechipiona2006@gmail.com` para acceder al panel admin.

