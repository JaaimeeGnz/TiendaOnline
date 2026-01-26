# 🚀 GUÍA RÁPIDA: Activar Funcionalidades de Cuenta

## 📌 Resumen
Los botones en `/account` ahora están totalmente funcionales. Solo necesitas ejecutar un script SQL en Supabase para crear las tablas necesarias.

## ⚡ Pasos Rápidos

### 1️⃣ Crear las Tablas en Supabase

1. Abre tu consola de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Haz clic en **New Query**
5. Copia y pega TODO el contenido de este archivo:
   ```
   docs/addresses_orders_schema.sql
   ```
6. Haz clic en **Run** (botón de ejecución)
7. ✅ Las tablas están creadas!

### 2️⃣ Reinicia tu servidor (Opcional)

Si estaba ejecutándose:
```bash
npm run dev
```

## ✨ ¡Listo! Las funcionalidades funcionan

Ahora cuando accedas a `/account` verás que:

✅ **Editar Perfil** - Abre un modal para cambiar tu nombre de usuario
✅ **Cambiar Contraseña** - Abre un modal para cambiar tu contraseña
✅ **Cambiar Correo** - Abre un modal para cambiar tu email
✅ **Agregar Dirección** - Abre un modal para guardar direcciones de envío
✅ **Eliminar Cuenta** - Abre un modal con confirmación para eliminar tu cuenta

## 📝 Notas Importantes

- La eliminación de cuenta es **irreversible** - elimina todo
- Las direcciones se requieren para procesar pedidos
- El cambio de email enviará un enlace de confirmación
- Todas las acciones están protegidas por RLS (Row Level Security)

## 🔒 Seguridad

- Solo puedes ver/modificar TUS propios datos
- Las contraseñas se manejan a través de Supabase Auth
- Los cambios de email requieren confirmación
- La eliminación de cuenta requiere confirmación explícita

## 🐛 Si Algo No Funciona

1. **Verifica que SQL se ejecutó sin errores** en Supabase
2. **Reinicia el servidor**: `npm run dev`
3. **Limpia caché del navegador**: Ctrl+Shift+Delete
4. **Comprueba autenticación**: Inicia sesión nuevamente

## 📞 ¿Qué Tablas se Crearon?

```sql
CREATE TABLE addresses  ← Direcciones de envío
CREATE TABLE orders     ← Pedidos de usuarios
```

Ambas con:
- ✅ RLS habilitado (Row Level Security)
- ✅ Triggers para `updated_at` automático
- ✅ Índices para rendimiento
- ✅ Foreign keys a `auth.users`

---

**¡Eso es todo! Tu sistema de cuenta está listo.** 🎉

Para más detalles, mira `ACCOUNT_FEATURES_IMPLEMENTATION.md`
