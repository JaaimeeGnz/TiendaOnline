# 📷 Integración Cloudinary - FashionMarket

## ✅ Configuración Completada

Tu cuenta de Cloudinary está configurada y lista para usar en FashionMarket.

### Credenciales

```
Cloud Name:    dqwjtfqxc
API Key:       512627185662728
API Secret:    u3yfGYdysGY9onVuhzsAubXN9u0
```

## 🚀 Cómo Usar

### 1. Subir Imágenes desde el Admin

1. Ve a `http://localhost:3001/admin/productos/nuevo`
2. Inicia sesión con tu cuenta admin
3. Completa los datos del producto
4. Haz clic en **"📷 Subir Imágenes con Cloudinary"**
5. El widget de Cloudinary se abrirá
6. Selecciona o arrastra las imágenes
7. Las imágenes se subirán automáticamente a Cloudinary
8. Las URLs se guardarán en Supabase cuando crees el producto

### 2. Características Incluidas

✅ **Widget de Upload**: Interfaz visual de Cloudinary
✅ **Múltiples Imágenes**: Sube varios archivos a la vez
✅ **Cropping**: Recorta imágenes si lo necesitas
✅ **Validación**: Solo JPG, PNG, WebP (máx 5MB)
✅ **Carpeta Automática**: Las imágenes van a `fashionmarket/products`
✅ **Optimización**: Cloudinary optimiza automáticamente
✅ **CDN Global**: Las imágenes se sirven desde el CDN más cercano

## 🔧 Archivos Creados

### Servicio Cloudinary
- **`src/lib/cloudinary.ts`** - Funciones para interactuar con Cloudinary
  - `generateUploadSignature()` - Genera firma para upload seguro
  - `getOptimizedImageUrl()` - Obtiene URL optimizada
  - `uploadProductImage()` - Sube imagen desde servidor
  - `deleteProductImage()` - Elimina imagen de Cloudinary

### Componentes
- **`src/components/islands/CloudinaryUpload.tsx`** - Widget de upload para React
  - Upload drag-and-drop
  - Vista previa de imágenes
  - Gestión de múltiples archivos

### API Endpoints
- **`src/pages/api/cloudinary/signature.ts`** - Genera firma para upload
- **`src/pages/api/admin/products.ts`** - Crea productos con imágenes

### Páginas Actualizadas
- **`src/pages/admin/productos/nuevo.astro`** - Formulario mejorado con CloudinaryUpload

### Documentación
- **`docs/CLOUDINARY_SETUP.md`** - Guía detallada

## 📊 Almacenamiento de Imágenes

Las URLs se guardan directamente en la tabla `products`:

```sql
-- Ejemplo de URL almacenada
https://res.cloudinary.com/dqwjtfqxc/image/upload/v1705334400/fashionmarket/products/1705334400-camisa.webp
```

## 🎨 Optimizaciones Automáticas

Cloudinary optimiza automáticamente:

- ✅ **Formato WebP** - Para navegadores modernos
- ✅ **Compresión** - Reduce tamaño sin perder calidad
- ✅ **Redimensionamiento** - Responsivo según el dispositivo
- ✅ **CDN Global** - Entrega rápida desde cualquier parte del mundo
- ✅ **Cache** - Caché inteligente de navegador

## 💾 Límites de Uso (Plan Gratuito)

- **Almacenamiento**: 25 GB
- **Transferencia**: 25 GB/mes
- **Transformaciones**: Ilimitadas
- **API Calls**: 500,000/mes
- **Administración**: Ilimitada

## 📈 Monitorear Uso

Visita tu dashboard: https://cloudinary.com/console/dashboard

Ahí puedes ver:
- Almacenamiento usado
- Transferencias del mes
- Rendimiento
- Estadísticas

## 🔒 Seguridad

- ✅ API Key solo en servidor (en `.env.local`)
- ✅ API Secret protegido
- ✅ Imágenes públicas accesibles por URL
- ✅ Validación de tipos en upload

## 🛠️ Ejemplos de Uso

### Subir imagen desde el servidor

```typescript
import { uploadProductImage } from '@/lib/cloudinary';

const buffer = fs.readFileSync('imagen.jpg');
const result = await uploadProductImage(buffer, 'imagen.jpg');
console.log(result.secure_url); // URL de la imagen
```

### Obtener URL optimizada

```typescript
import { getOptimizedImageUrl } from '@/lib/cloudinary';

const url = getOptimizedImageUrl('fashionmarket/products/image', {
  width: 300,
  height: 300,
  quality: 'auto',
  crop: 'fill'
});
```

### Eliminar imagen

```typescript
import { deleteProductImage } from '@/lib/cloudinary';

await deleteProductImage('fashionmarket/products/image-id');
```

## 📱 Flujo de Subida Actual

1. Usuario selecciona imagen en `/admin/productos/nuevo`
2. Widget de Cloudinary (client-side) sube la imagen
3. Cloudinary retorna la URL segura
4. URL se almacena en un campo oculto del formulario
5. Al guardar el producto, las URLs se envían a Supabase
6. El producto se crea con las imágenes

## 🔄 Próximas Mejoras Posibles

- [ ] Editar producto con nuevas imágenes
- [ ] Eliminar imágenes individuales al editar
- [ ] Cambiar orden de imágenes
- [ ] Crop y filtros avanzados
- [ ] Sincronizar imágenes con Supabase

## ❓ Preguntas Frecuentes

**¿Dónde se almacenan realmente las imágenes?**
En los servidores de Cloudinary, no en tu servidor. Las URLs se almacenan en Supabase.

**¿Puedo usar Cloudinary sin token?**
Sí, para uploads sin autenticación de servidor. Necesitas un "upload preset" unsigned.

**¿Qué pasa si supero los límites gratuitos?**
Cloudinary te notificará. Puedes actualizar a un plan de pago.

**¿Cómo cambio el formato de las imágenes?**
En `getOptimizedImageUrl()` cambia `format: 'webp'` por lo que quieras.

## 📞 Soporte

- [Documentación Cloudinary](https://cloudinary.com/documentation)
- [API Reference](https://cloudinary.com/documentation/cloudinary_references)
- [Dashboard](https://cloudinary.com/console)
