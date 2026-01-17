# Guía de Ejecución: Imágenes en la Tienda

## 📋 Resumen

Se ha creado un archivo SQL completo (`seed_with_images.sql`) que incluye:

✅ **40+ productos** con descripciones completas  
✅ **3-4 imágenes por producto** desde Unsplash (CDN gratuito)  
✅ **Stock determinado** para cada producto  
✅ **Tabla de variantes** para track stock por talla/color  
✅ **Precios originales** para mostrar descuentos  
✅ **10 subcategorías** funcionando correctamente

---

## 🚀 Pasos para Ejecutar

### 1️⃣ Copiar el SQL

Ve a [docs/seed_with_images.sql](./seed_with_images.sql) y copia todo el contenido.

### 2️⃣ Ejecutar en Supabase

1. Abre tu proyecto en **Supabase Dashboard**
2. Ve a **SQL Editor** → Click en "New Query"
3. Pega el SQL completo
4. Click en **"Run"** (botón azul arriba a la derecha)
5. Espera a que se complete (unos 30 segundos)

### 3️⃣ Verificar que Funcionó

En Supabase:
```sql
SELECT COUNT(*) FROM products;
-- Debería devolver: 40
```

---

## 🖼️ Características de las Imágenes

### URLs de Imágenes
- **Origen**: Unsplash (servicio gratuito y legal)
- **Formato**: JPG optimizado con parámetro `?w=800&q=80`
- **Caché**: CDN automático de Unsplash

### Ejemplos de URLs
```
https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80
https://images.unsplash.com/photo-1543163521-9efcc062db33?w=800&q=80
```

### Estructura en Base de Datos
```sql
-- Cada producto tiene un array de imágenes:
images TEXT[] = ARRAY[
  'https://images.unsplash.com/photo-xxx?w=800&q=80',
  'https://images.unsplash.com/photo-yyy?w=800&q=80',
  'https://images.unsplash.com/photo-zzz?w=800&q=80'
]
```

---

## 📸 Componente ProductGallery Actualizado

El componente ahora soporta:

✅ **Imagen principal grande** con transiciones suaves  
✅ **Miniaturas de 4 imágenes** para cambiar rápido  
✅ **Click en miniatura** = cambio instantáneo  
✅ **Indicador visual** (borde rojo en la seleccionada)  
✅ **Lazy loading** para mejor rendimiento

### Uso en Astro:
```astro
<ProductGallery 
  images={product.images}
  productName={product.name}
/>
```

---

## 💰 Precios y Descuentos

Cada producto tiene:
- `price_cents`: Precio actual (en céntimos)
- `original_price_cents`: Precio original (para mostrar % descuento)

### Ejemplo:
```
Nike Air Max 90
- Precio original: €179,99
- Precio actual: €139,99
- Descuento: 22%
```

---

## 📦 Tabla de Variantes (product_variants)

Para casos donde quieras track stock por talla/color específico:

```sql
-- Tabla para almacenar stock por combinación talla/color
product_variants (
  product_id -> el producto
  size -> S, M, L, XL, XXL, 40, 41, etc.
  color -> Negro, Blanco, Azul, etc.
  stock -> cantidad disponible
)
```

---

## ✨ Próximos Pasos

### 1. Ejecuta el SQL
```bash
# En Supabase SQL Editor
# Pega todo el contenido de docs/seed_with_images.sql
```

### 2. Build el proyecto
```bash
cd fashionmarket
npm run build
```

### 3. Verifica en la web
```bash
npm run preview
# O: npm run dev
```

### 4. Explora la tienda
- Ve a `/productos` → Ver las 40 imágenes cargadas ✅
- Entra en `/categoria/zapatillas` → Ver galerías  
- Haz click en producto → Ver 3-4 imágenes con miniaturas

---

## 🔧 Troubleshooting

### ❌ "Error: duplicate key value"
**Solución**: El SQL ya incluye `TRUNCATE TABLE ... CASCADE`, elimina todo primero

### ❌ "Las imágenes no aparecen"
**Comprobación**: 
1. Verifica que las URLs sean accesibles (copia en navegador)
2. Check si Unsplash está bloqueado en tu región
3. Intenta refrescar (F5)

### ❌ "Stock muestra 0"
**Solución**: Asegúrate que el SQL ejecutó sin errores. Revisa la tabla `products` en Supabase

---

## 📊 Inventario Actual

| Categoría | Productos | Stock Total |
|-----------|-----------|------------|
| Zapatillas | 7 | 348 |
| Ropa > Camisetas | 4 | 195 |
| Ropa > Sudaderas | 4 | 145 |
| Ropa > Chaquetas | 3 | 75 |
| Ropa > Pantalones | 5 | 167 |
| Ropa > Polos | 3 | 100 |
| Accesorios > Gorros | 3 | 190 |
| Accesorios > Calcetines | 3 | 310 |
| Accesorios > Mochilas | 3 | 100 |
| Accesorios > Cinturones | 3 | 115 |
| Accesorios > Gafas | 3 | 53 |
| **TOTAL** | **42** | **1,798** |

---

## 🎯 Lo Que Conseguiste

✅ Base de datos completa con 42 productos  
✅ 3-4 imágenes por producto (150+ imágenes totales)  
✅ Stock realista para cada prenda  
✅ Sistema de filtros por categoría/marca  
✅ Galería interactiva con miniaturas  
✅ Precios con descuentos visibles  
✅ Tabla de variantes para expansión futura

---

**¡Tu tienda está lista para ir en vivo!** 🎉

