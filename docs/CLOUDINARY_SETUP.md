# Guía de Configuración de Cloudinary

## Información de tu cuenta

```
Cloud Name: dqwjtfqxc
API Key: 512627185662728
API Secret: u3yfGYdysGY9onVuhzsAubXN9u0
```

## ¿Qué es Cloudinary?

Cloudinary es una plataforma de gestión de medios en la nube que te permite:
- ✅ Subir y almacenar imágenes
- ✅ Optimizar automáticamente imágenes
- ✅ Servir imágenes desde CDN global
- ✅ Transformar imágenes bajo demanda
- ✅ Comprimir y convertir formatos

## Integración en FashionMarket

### 1. Variables de Entorno

Las variables están configuradas en `.env.local`:

```env
PUBLIC_CLOUDINARY_CLOUD_NAME=dqwjtfqxc
CLOUDINARY_API_KEY=512627185662728
CLOUDINARY_API_SECRET=u3yfGYdysGY9onVuhzsAubXN9u0
```

### 2. Subir Imágenes de Productos

En la página `/admin/productos/nuevo`, usa el botón **"📷 Subir Imágenes con Cloudinary"**:

1. Haz clic en el botón
2. Selecciona imágenes de tu computadora
3. Las imágenes se subirán automáticamente a Cloudinary
4. Se mostrarán en la vista previa
5. Al guardar el producto, las URLs se almacenan en Supabase

### 3. Usar URLs de Cloudinary

Las imágenes se guardan como URLs HTTPS en la base de datos:

```
https://res.cloudinary.com/dqwjtfqxc/image/upload/v1234567890/fashionmarket/products/image.webp
```

### 4. Optimización Automática

Cloudinary optimiza automáticamente:
- ✅ Formato WebP para navegadores modernos
- ✅ Compresión automática
- ✅ Redimensionamiento responsivo
- ✅ Caché global CDN

## Pasos para crear un Preset de Upload (opcional)

Si quieres upload sin servidor, crea un preset en Cloudinary:

1. Ve a tu [Dashboard de Cloudinary](https://cloudinary.com/console)
2. Settings → Upload
3. Create upload preset
4. Nombre: `fashionmarket_products`
5. Folder: `fashionmarket/products`
6. Signing Mode: Unsigned
7. Guardar

Luego en el componente, cambia:
```jsx
uploadPreset: 'fashionmarket_products'
```

## Límites de la Cuenta Gratuita

- 25 GB de almacenamiento
- 25 GB de transferencia mensual
- Transformaciones ilimitadas
- API calls: 500,000/mes

## Monitorar Uso

Visita: https://cloudinary.com/console/dashboard

## Eliminar Imágenes

Las imágenes se pueden eliminar manualmente desde el dashboard, o programáticamente con:

```typescript
import { deleteProductImage } from '@/lib/cloudinary';

await deleteProductImage('fashionmarket/products/image-id');
```

## Soporte

- Documentación: https://cloudinary.com/documentation
- API Reference: https://cloudinary.com/documentation/cloudinary_references
