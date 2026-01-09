# 📦 Configuración Detallada de Supabase Storage

## Paso 1: Crear Bucket

### Via Dashboard

1. Acceder a **Supabase Dashboard** → tu proyecto
2. En el sidebar izquierdo: **Storage** → **Buckets**
3. Click en **Create new bucket**
4. Completar:
   - **Bucket name**: `products-images`
   - **Public bucket**: ✅ Activado (necesario para que públicos lean)
   - Click **Create**

### Via CLI (Alternativa)

```bash
# Si tienes supabase CLI instalado
supabase storage create-bucket products-images --public
```

---

## Paso 2: Configurar Políticas de Seguridad

### 2.1 Política de Lectura Pública (Read)

Acceder a **Storage** → **Bucket: products-images** → **Policies** → **Create policy**

```sql
-- Policy name: "Allow public read"
-- Target roles: anon, authenticated
-- For queries matching: ALL

CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'products-images');
```

**Resultado**: Cualquiera puede leer (descargar) las imágenes.

---

### 2.2 Política de Upload para Admin

```sql
-- Policy name: "Allow authenticated upload"
-- Target roles: authenticated
-- For queries matching: ALL

CREATE POLICY "Allow authenticated upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'products-images' 
  AND auth.role() = 'authenticated'
);
```

**Resultado**: Solo usuarios autenticados pueden subir imágenes.

---

### 2.3 Política de Actualización

```sql
-- Policy name: "Allow authenticated update"
-- Target roles: authenticated

CREATE POLICY "Allow authenticated update"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'products-images' 
  AND auth.role() = 'authenticated'
);
```

---

### 2.4 Política de Eliminación

```sql
-- Policy name: "Allow authenticated delete"
-- Target roles: authenticated

CREATE POLICY "Allow authenticated delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'products-images' 
  AND auth.role() = 'authenticated'
);
```

---

## Paso 3: Configurar Bucket Settings

1. **Storage** → **products-images** → **Settings**
2. Ajustar:

```yaml
Public bucket: ON
Allowed MIME types: 
  - image/jpeg
  - image/png
  - image/webp
  - image/*

Max upload file size: 5MB
```

---

## Paso 4: Subir Imágenes Programáticamente

### Desde el Frontend (React Component)

```typescript
// components/islands/ImageUpload.tsx
import { supabaseClient } from '../../lib/supabase';

export async function uploadProductImage(file: File, productId: string) {
  const fileName = `${productId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabaseClient.storage
    .from('products-images')
    .upload(fileName, file);

  if (error) throw error;

  // Obtener URL pública
  const { data: { publicUrl } } = supabaseClient.storage
    .from('products-images')
    .getPublicUrl(data.path);

  return publicUrl;
}
```

### Desde Admin (Form HTML)

```html
<!-- pages/admin/productos/nuevo.astro -->
<form method="POST" enctype="multipart/form-data">
  <input type="file" name="images" multiple accept="image/*" />
  <button type="submit">Subir y Crear Producto</button>
</form>
```

### Manejo en API Route (SSR)

```typescript
// pages/api/admin/products.ts
import { supabaseServer } from '../../../lib/supabase';

export async function POST({ request }) {
  const formData = await request.formData();
  const files = formData.getAll('images');
  
  const imageUrls = [];
  
  for (const file of files) {
    const fileName = `${Date.now()}-${file.name}`;
    
    await supabaseServer.storage
      .from('products-images')
      .upload(fileName, file);
    
    const url = `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/products-images/${fileName}`;
    imageUrls.push(url);
  }
  
  // Guardar producto con URLs
  await supabaseServer
    .from('products')
    .insert({
      name: formData.get('name'),
      images: imageUrls,
      // ... más campos
    });
}
```

---

## Paso 5: Obtener URLs de Imágenes

### Dos formas:

#### 1. URL Directa (Pública)

```typescript
// Construcción manual
const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/products-images/${fileName}`;
```

#### 2. Método getPublicUrl()

```typescript
const { data } = supabaseClient.storage
  .from('products-images')
  .getPublicUrl('path/to/image.jpg');

console.log(data.publicUrl); 
// https://your-project.supabase.co/storage/v1/object/public/products-images/path/to/image.jpg
```

---

## Paso 6: Eliminar Imágenes

### Cuando se elimina un producto:

```typescript
async function deleteProduct(productId: string) {
  // 1. Obtener producto para sus imágenes
  const { data: product } = await supabaseClient
    .from('products')
    .select('images')
    .eq('id', productId)
    .single();

  // 2. Eliminar archivos de storage
  if (product.images?.length) {
    const filePaths = product.images.map(url => {
      // Extraer path de URL
      return url.split('/products-images/')[1];
    });
    
    await supabaseClient.storage
      .from('products-images')
      .remove(filePaths);
  }

  // 3. Eliminar producto de BD
  await supabaseClient
    .from('products')
    .delete()
    .eq('id', productId);
}
```

---

## Estructura de Carpetas en Storage

**Recomendada**:

```
products-images/
├── product-uuid-1/
│   ├── 1704067200000-main.jpg
│   ├── 1704067205000-detail1.jpg
│   └── 1704067210000-detail2.jpg
├── product-uuid-2/
│   ├── 1704067300000-main.jpg
│   └── 1704067305000-detail1.jpg
└── temp/
    └── uploads-temporales/
```

---

## 🚨 Troubleshooting

### Problema: "Storage error: CORS policy"

**Solución**: Asegurar que en bucket settings está activado `Public bucket`

### Problema: "Bucket not found"

**Solución**: Verificar que el nombre es exactamente `products-images`

### Problema: "Permission denied"

**Solución**: Verificar que:
1. Hay sesión autenticada
2. Las políticas RLS están configuradas
3. El usuario tiene `auth.role() = 'authenticated'`

### Problema: Imágenes muy lentas

**Solución**: Implementar compresión en frontend:

```typescript
// Antes de subir
import imageCompression from 'browser-image-compression';

const compressed = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
});
```

---

## Observar Storage en Dashboard

Para ver los archivos subidos:

1. **Supabase Dashboard** → **Storage** → **products-images**
2. Verás lista de carpetas/archivos
3. Click en archivo → **Copy public URL**

---

## Generación de URLs en Base de Datos

**Opción 1**: Guardar solo el `fileName` (recomendado)

```sql
UPDATE products 
SET images = ARRAY[
  'product-uuid-1/1704067200000-main.jpg'
]
WHERE id = 'product-uuid-1';
```

**Opción 2**: Guardar URLs completas

```sql
UPDATE products 
SET images = ARRAY[
  'https://your-project.supabase.co/storage/v1/object/public/products-images/product-uuid-1/1704067200000-main.jpg'
]
WHERE id = 'product-uuid-1';
```

**Recomendación**: Opción 1 es más flexible (permite cambiar el dominio sin actualizar BD).

---

## 📋 Checklist de Configuración

- [ ] Bucket `products-images` creado
- [ ] `Public bucket` activado
- [ ] Políticas RLS configuradas (Read, Insert, Update, Delete)
- [ ] MIME types: `image/*` permitidos
- [ ] Max upload size: 5MB
- [ ] Variables de entorno (.env.local) completas
- [ ] SDK de Supabase inicializado en `lib/supabase.ts`
- [ ] Formulario de upload con drag-and-drop
- [ ] URL pública visible en dashboard

---

¡Listo! Ahora tu aplicación puede subir, almacenar y servir imágenes de productos.
