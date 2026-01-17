# 📷 Cómo Agregar Fotos a Productos

## 🚀 Forma Rápida

1. **Ve a Admin → Productos**
   ```
   http://localhost:3001/admin/productos
   ```

2. **Haz clic en "📷 Agregar Fotos"**
   - Se abrirá una página con instrucciones
   - Te mostrará qué productos necesitan fotos

3. **Haz clic en "Editar" en el producto**
   - Se abrirá el formulario de edición

4. **Baja hasta "Agregar nuevas imágenes"**
   - Haz clic en "📷 Subir Imágenes con Cloudinary"
   - Se abrirá el widget de Cloudinary

5. **Arrastra o selecciona imágenes**
   - Formatos: JPG, PNG, WebP
   - Máximo 5MB por imagen
   - Puedes subir múltiples a la vez

6. **Espera a que suban**
   - Verás una vista previa de cada imagen

7. **Haz clic en "Guardar Cambios"**
   - ¡Listo! El producto tendrá las fotos

## 📋 Pasos Detallados

### Paso 1: Acceder a la gestión de fotos

```
Admin Panel → Productos → 📷 Agregar Fotos
```

O directo:
```
http://localhost:3001/admin/productos/fotos-masivo
```

### Paso 2: Ver productos sin fotos

La página te mostrará:
- ✅ Total de productos
- ❌ Productos sin fotos (en rojo)
- ✅ Productos con fotos (en verde)

### Paso 3: Editar un producto

Haz clic en cualquier producto sin fotos para editarlo.

### Paso 4: Subir imágenes

En la página de edición:
1. Busca la sección "Agregar nuevas imágenes"
2. Haz clic en el botón azul "📷 Subir Imágenes con Cloudinary"
3. En la ventana que aparezca:
   - **Opción A**: Arrastra imágenes desde tu carpeta
   - **Opción B**: Haz clic para seleccionar archivos
   - **Opción C**: Pega URLs de imágenes

### Paso 5: Esperar carga

Cloudinary mostrará:
- Barra de progreso
- Vista previa de cada imagen
- Cuando termine, verás las imágenes en la lista

### Paso 6: Guardar producto

- Desplázate al final del formulario
- Haz clic en "Guardar Cambios"
- Se redirigirá a la lista de productos
- ¡Listo! El producto ahora tiene fotos

## 💡 Consejos

### Imágenes de Calidad
- ✅ Usa imágenes de alta resolución (al menos 1000x1000px)
- ✅ Formatos recomendados: JPG (fotos) o PNG (con transparencia)
- ✅ Tamaño máximo: 5MB por archivo (Cloudinary comprime automáticamente)

### Mejor Presentación
- 📐 Usa imágenes cuadradas (1:1) para consistencia
- 🎨 Sube múltiples ángulos del producto (frente, costado, detalle)
- 💾 La primera imagen será la "imagen principal"

### Performance
- ⚡ Cloudinary optimiza automáticamente
- 🌍 Se sirve desde CDN global (muy rápido)
- 📱 Responsive en cualquier dispositivo

## 🛠️ Solución de Problemas

### "No se puede seleccionar el archivo"
- Asegúrate que sea JPG, PNG o WebP
- Archivo menor a 5MB
- Prueba con otro navegador

### "La imagen no se carga en la tienda"
- Espera unos segundos, Cloudinary necesita tiempo
- Recarga la página (F5)
- Borra caché del navegador (Ctrl+Shift+Delete)

### "Guardó pero las fotos desaparecieron"
- Asegúrate de hacer clic en "Guardar Cambios"
- Las fotos deben estar en la vista previa antes de guardar

### "Quiero eliminar una foto"
- En la página de edición, hoverea la foto
- Aparecerá una "X" roja para eliminarla
- Guarda los cambios

## 🔄 Flujo Completo

```
1. Ir a /admin/productos
   ↓
2. Haz clic en "📷 Agregar Fotos"
   ↓
3. Ve la lista de productos sin fotos
   ↓
4. Haz clic en "Editar" en un producto
   ↓
5. Baja a "Agregar nuevas imágenes"
   ↓
6. Haz clic en "📷 Subir Imágenes con Cloudinary"
   ↓
7. El widget se abre → Arrastra imágenes
   ↓
8. Espera a que carguen → Ves vista previa
   ↓
9. Haz clic en "Guardar Cambios"
   ↓
10. ¡Producto actualizado con fotos! ✅
```

## 📚 Recursos

- **Guía completa**: `CLOUDINARY_INTEGRATION.md`
- **Setup**: `CLOUDINARY_SETUP.md`
- **Dashboard Cloudinary**: https://cloudinary.com/console

## 💬 Preguntas Frecuentes

**¿Puedo subir muchas imágenes a la vez?**
Sí, el widget de Cloudinary permite múltiples archivos.

**¿Qué pasa si subo imágenes muy grandes?**
Cloudinary las comprime automáticamente manteniendo calidad.

**¿Se pueden cambiar las imágenes después?**
Sí, edita el producto nuevamente y carga nuevas imágenes.

**¿Dónde se guardan las imágenes?**
En los servidores de Cloudinary. Las URLs se almacenan en Supabase.

**¿Hay límite de imágenes por producto?**
No, puedes subir todas las que quieras (estás limitado por tu plan en Cloudinary).

---

**Última actualización**: 15 de enero de 2026  
**Estado**: ✅ LISTO PARA USAR
