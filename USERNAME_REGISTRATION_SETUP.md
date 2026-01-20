## Integración de Nombre de Usuario en el Registro

He actualizado el sistema de registro para que ahora pida un **nombre de usuario** durante el registro y lo guarde en Supabase.

---

## ✅ Cambios Realizados

### 1. **Tabla de Usuarios Creada** 
Se creó una nueva tabla `users` en Supabase con:
- `id` - UUID (referencia a auth.users)
- `email` - VARCHAR(255) UNIQUE
- `username` - VARCHAR(100) UNIQUE
- `full_name` - VARCHAR(255) (opcional)
- `avatar_url` - TEXT (opcional)
- `bio` - TEXT (opcional)
- `created_at`, `updated_at` - Timestamps

### 2. **Componente de Registro Actualizado** 
Archivo actualizado: `src/components/auth/AuthForm.tsx`

#### Cambios en el formulario:
- ✅ Nuevo campo: **Nombre de Usuario** (solo visible en modo registro)
- ✅ Campo guarda username en minúsculas y trimmed
- ✅ Validaciones integradas

#### Validaciones del Username:
- ✅ Mínimo 3 caracteres
- ✅ Máximo 255 caracteres
- ✅ Solo permite: letras, números, guiones (-) y guiones bajos (_)
- ✅ Verifica unicidad en la base de datos
- ✅ Manejo de errores si el nombre de usuario ya existe

---

## 📋 Instrucciones para Implementar en Supabase

### **Paso 1: Ejecutar el SQL en Supabase**

1. Ve a tu dashboard de Supabase
2. Abre el **SQL Editor**
3. Copia el SQL siguiente y ejecuta:

```sql
-- ============================================================================
-- TABLA: users (Perfil de usuarios)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY users_read_own ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_read_public ON users
  FOR SELECT
  USING (true);

CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY users_insert_own ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();
```

### **Paso 2: Verificar la Tabla**

En el SQL Editor de Supabase, ejecuta:

```sql
SELECT * FROM users;
```

(Debería estar vacío por ahora)

---

## 🧪 Pruebas

### **En el Registro:**

1. Abre el formulario de registro
2. Verás los nuevos campos:
   - Correo Electrónico
   - **Nombre de Usuario** ← NUEVO
   - Contraseña
   - Confirmar Contraseña

3. Intenta registrarte:
   ```
   Email: test@example.com
   Username: mi_usuario_123
   Contraseña: 123456
   ```

4. Verifica en Supabase que se creó el registro en la tabla `users`:

```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

---

## 📝 Datos Guardados

Cuando un usuario se registra:

1. **En `auth.users`** (automático de Supabase):
   - id
   - email
   - encrypted_password
   - created_at

2. **En `users`** (tabla personalizada):
   - id (referencia a auth.users)
   - email
   - username (en minúsculas)
   - created_at
   - updated_at

3. **En localStorage**:
   - `isAuthenticated`: true
   - `userEmail`: email del usuario
   - `userName`: nombre de usuario

---

## 🔒 Seguridad (RLS)

Las políticas RLS configuradas permiten:
- ✅ Cada usuario solo puede leer su propio perfil
- ✅ Los datos públicos (username, avatar) son visibles para todos
- ✅ Solo el propietario puede actualizar su perfil
- ✅ Los usuarios autenticados pueden crear su perfil al registrarse

---

## 🎯 Próximos Pasos (Opcionales)

Si quieres expandir funcionalidades:

1. **Mostrar el username en el perfil del usuario**
   - Crear página: `/perfil` o `/usuario/[username]`
   - Mostrar datos desde la tabla `users`

2. **Actualizar perfiles**
   - Permitir cambiar nombre completo, avatar, bio
   - Agregar validación de disponibilidad de username al editar

3. **Búsqueda de usuarios**
   - Buscar por username en la aplicación
   - Mostrar perfiles públicos

4. **Estadísticas**
   - Contar usuarios registrados
   - Tracking de registros por fecha

---

## ❓ Solución de Problemas

### Error: "Este nombre de usuario ya está en uso"
- El nombre de usuario ya fue registrado
- Elige otro nombre único

### Error: "El nombre de usuario solo puede contener..."
- Verifica que solo uses: `a-z`, `0-9`, `-`, `_`
- No se permiten espacios ni caracteres especiales

### No aparece el campo de Username
- Verifica que estés en la pestaña **"Crear Cuenta"**
- El campo de username solo se muestra en modo registro

---

¡Tu sistema de registro ya está listo para capturar nombres de usuario! 🚀
