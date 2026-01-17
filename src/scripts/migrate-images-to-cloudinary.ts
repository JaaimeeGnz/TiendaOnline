/**
 * Script para migrar imágenes existentes a Cloudinary
 * Uso: npx ts-node src/scripts/migrate-images-to-cloudinary.ts
 */

import fs from 'fs';
import path from 'path';
import { uploadProductImage } from '../lib/cloudinary';
import { supabaseClient } from '../lib/supabase';

async function migrateImagesToCloudinary() {
  try {
    console.log('🖼️  Iniciando migración de imágenes a Cloudinary...\n');

    // Obtener todos los productos
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('id, name, images')
      .not('images', 'is', null);

    if (productsError) {
      throw new Error(`Error obteniendo productos: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      console.log('❌ No hay productos con imágenes para migrar');
      return;
    }

    console.log(`📦 Encontrados ${products.length} productos con imágenes\n`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      console.log(`\n📷 Procesando: ${product.name}`);

      if (!product.images || product.images.length === 0) {
        console.log('  ⏭️  Sin imágenes, saltando...');
        skippedCount++;
        continue;
      }

      const cloudinaryUrls: string[] = [];

      for (const imageUrl of product.images) {
        try {
          // Si la imagen ya es de Cloudinary, no migrar
          if (imageUrl.includes('cloudinary.com')) {
            console.log(`  ✅ Ya está en Cloudinary: ${imageUrl.substring(0, 50)}...`);
            cloudinaryUrls.push(imageUrl);
            continue;
          }

          // Descargar imagen
          console.log(`  ⬇️  Descargando: ${imageUrl.substring(0, 50)}...`);
          const response = await fetch(imageUrl);
          const buffer = await response.arrayBuffer();
          const fileBuffer = Buffer.from(buffer);

          // Obtener nombre de archivo
          const fileName = path.basename(new URL(imageUrl).pathname) || 'image.jpg';

          // Subir a Cloudinary
          console.log(`  📤 Subiendo a Cloudinary...`);
          const result = await uploadProductImage(fileBuffer, fileName);

          if (result && result.secure_url) {
            cloudinaryUrls.push(result.secure_url);
            console.log(`  ✅ Migrado: ${result.secure_url.substring(0, 50)}...`);
          }
        } catch (error) {
          console.error(`  ❌ Error migrando imagen: ${error}`);
        }
      }

      // Actualizar producto con nuevas URLs
      if (cloudinaryUrls.length > 0) {
        const { error: updateError } = await supabaseClient
          .from('products')
          .update({ images: cloudinaryUrls })
          .eq('id', product.id);

        if (updateError) {
          console.error(`  ❌ Error actualizando producto: ${updateError.message}`);
        } else {
          console.log(`  ✅ Producto actualizado con ${cloudinaryUrls.length} imágenes`);
          migratedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log(`\n\n✨ Migración completada:`);
    console.log(`  ✅ Productos migrados: ${migratedCount}`);
    console.log(`  ⏭️  Productos saltados: ${skippedCount}`);
    console.log(`  📊 Total: ${migratedCount + skippedCount}`);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateImagesToCloudinary();
}

export { migrateImagesToCloudinary };
