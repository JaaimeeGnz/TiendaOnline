# 🔧 Configuración de Supabase - Instrucciones Manuales

## ✅ Credenciales Configuradas

Tu proyecto está conectado a Supabase con las siguientes credenciales:

- **URL**: https://pygrobxheswyltsgyzfd.supabase.co
- **Anon Key**: Configurada en `.env.local`
- **Service Role Key**: Configurada en `.env.local`

## 🗄️ Paso 1: Ejecutar Schema SQL

### Opción A: Portal de Supabase (Recomendado)

1. Abre [Supabase Dashboard](https://app.supabase.com)
2. Ve a tu proyecto **TiendaOnline**
3. Navega a **SQL Editor** (en el sidebar izquierdo)
4. Haz clic en **+ New Query**
5. Copia el contenido de `docs/supabase_schema.sql`
6. Pega en el editor
7. Haz clic en **Run** (botón azul)

Esto creará:
- ✅ Tabla `categories` (categorías)
- ✅ Tabla `products` (productos)
- ✅ Índices para optimización
- ✅ Políticas RLS de seguridad
- ✅ Datos de ejemplo
- ✅ Triggers para timestamps
- ✅ Vista `products_with_category`

### Opción B: Línea de Comandos

```bash
# Con psql (si tienes PostgreSQL instalado)
psql -h db.pygrobxheswyltsgyzfd.supabase.co \
     -U postgres \
     -d postgres \
     -f docs/supabase_schema.sql
```

## 🪣 Paso 2: Crear Storage Bucket

1. En Supabase Dashboard, ve a **Storage** (en el sidebar)
2. Haz clic en **+ New Bucket**
3. **Nombre**: `products-images`
4. **Privacy**: Marca **Public bucket**
5. Haz clic en **Create bucket**

Esto permite que los usuarios descarguen imágenes de productos.

## 🔐 Paso 3: Configurar Políticas de Storage (RLS)

1. En la lista de buckets, selecciona `products-images`
2. Ve a la pestaña **Policies**
3. Haz clic en **New Policy**

### Para Lectura Pública:
- **Policy Name**: `Allow public read`
- **Operation**: SELECT
- **Target roles**: public
- **Expression**: `true`
- Click **Save**

### Para Escritura de Admin:
- **Policy Name**: `Allow authenticated upload`
- **Operation**: INSERT
- **Target roles**: authenticated
- **Expression**: `true`
- Click **Save**

## 📝 Paso 4: Verificar Datos

Ejecuta esta query en SQL Editor para verificar que todo se creó correctamente:

```sql
-- Ver categorías
SELECT * FROM categories;

-- Ver productos
SELECT * FROM products;

-- Ver vista con categorías
SELECT * FROM products_with_category;
```

Deberías ver:
- 4 categorías (Camisas, Pantalones, Trajes, Accesorios)
- 1 producto de ejemplo (Camisa Oxford Premium)

## 🚀 Paso 5: Probar la Conexión en tu App

```bash
# En el directorio del proyecto
npm run dev
```

Visita: http://localhost:3000

Deberías ver:
- ✅ Página de inicio cargando
- ✅ Catálogo de productos
- ✅ Carrito funcional

## 🐛 Solución de Problemas

### Error: "No puedo conectarme a Supabase"
- Verifica que `.env.local` tiene las credenciales correctas
- Asegúrate de que las variables están expuestas con `PUBLIC_`

### Error: "Tabla no existe"
- Verifica que ejecutaste todo el SQL schema sin errores
- Comprueba en SQL Editor que las tablas existen

### Error: "Acceso denegado" en Storage
- Verifica que el bucket `products-images` está marcado como público
- Comprueba las políticas de RLS

## 📋 Checklist de Configuración

- [ ] ✅ Credenciales en `.env.local`
- [ ] ✅ Schema SQL ejecutado
- [ ] ✅ Tablas creadas (categories, products)
- [ ] ✅ Bucket `products-images` creado
- [ ] ✅ Políticas RLS configuradas
- [ ] ✅ Servidor dev ejecutándose sin errores
- [ ] ✅ Datos de ejemplo visibles en el catálogo

---

**Fecha de configuración**: 2025-01-09
**Status**: 🟢 Listo para desarrollo
