/**
 * seed-database.ts
 * Script para poblar la base de datos con categorías y productos de ejemplo
 * 
 * Ejecución: npx tsx seed-database.ts
 */

import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno desde .env.local
const supabaseUrl = 'https://pygrobxheswyltsgyzfd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z3JvYnhoZXN3eWx0c2d5emZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkzMDYyOSwiZXhwIjoyMDgzNTA2NjI5fQ.vKPGZ2bJFfUKBxU4hJQRKXp1bX8z7Y9pL2mN3qR8sT0';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Definir categorías
const categories = [
  {
    name: 'Camisas',
    slug: 'camisas',
    description: 'Camisas premium de diseño elegante y materiales de alta calidad',
    display_order: 1,
    is_active: true
  },
  {
    name: 'Pantalones',
    slug: 'pantalones',
    description: 'Pantalones de corte impecable para el hombre moderno',
    display_order: 2,
    is_active: true
  },
  {
    name: 'Trajes',
    slug: 'trajes',
    description: 'Trajes completos para ocasiones especiales y eventos formales',
    display_order: 3,
    is_active: true
  },
  {
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Complementos y accesorios premium para completar tu look',
    display_order: 4,
    is_active: true
  }
];

async function seedDatabase() {
  console.log('🌱 Iniciando población de base de datos...\n');

  try {
    // 1. Insertar categorías
    console.log('📁 Insertando categorías...');

    // Primero, verificar si ya existen categorías
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('slug');

    const existingSlugs = new Set(existingCategories?.map(c => c.slug) || []);
    const categoriesToInsert = categories.filter(cat => !existingSlugs.has(cat.slug));

    let insertedCategories;
    if (categoriesToInsert.length > 0) {
      const { data, error: categoriesError } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select();

      if (categoriesError) {
        console.error('Error detallado:', categoriesError);
        throw new Error(`Error al insertar categorías: ${categoriesError.message}`);
      }

      insertedCategories = data;
      console.log(`✅ ${data?.length || 0} nuevas categorías insertadas`);
    } else {
      console.log('✅ Categorías ya existen, omitiendo inserción');
    }

    // Obtener todas las categorías para el mapa
    const { data: allCategories } = await supabase
      .from('categories')
      .select('*');

    if (!allCategories || allCategories.length === 0) {
      throw new Error('No se pudieron obtener las categorías');
    }

    console.log(`✅ Total de categorías en BD: ${allCategories.length}`);

    // Crear un mapa de slug -> id para productos
    const categoryMap = new Map();
    allCategories.forEach(cat => {
      categoryMap.set(cat.slug, cat.id);
    });

    // 2. Definir productos de ejemplo
    const products = [
      // CAMISAS (5 productos)
      {
        name: 'Camisa Oxford Premium',
        slug: 'camisa-oxford-premium',
        description: 'Camisa Oxford de algodón 100% egipcio con acabado premium. Perfecta para cualquier ocasión, desde la oficina hasta eventos formales. Corte regular con cuello tradicional.',
        price_cents: 8999,
        stock: 45,
        category_id: categoryMap.get('camisas'),
        color: 'Blanco',
        material: 'Algodón egipcio 100%',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        sku: 'SHIRT-001',
        featured: true,
        is_active: true
      },
      {
        name: 'Camisa Lino Azul Celeste',
        slug: 'camisa-lino-azul-celeste',
        description: 'Camisa de lino premium en tono azul celeste. Ideal para temporadas cálidas, ofrece transpirabilidad máxima y un look sofisticado. Corte slim fit.',
        price_cents: 9499,
        stock: 30,
        category_id: categoryMap.get('camisas'),
        color: 'Azul Celeste',
        material: 'Lino 100%',
        sizes: ['S', 'M', 'L', 'XL'],
        sku: 'SHIRT-002',
        featured: true,
        is_active: true
      },
      {
        name: 'Camisa Negra Slim Fit',
        slug: 'camisa-negra-slim-fit',
        description: 'Camisa negra de corte ajustado en algodón premium. Diseño minimalista y elegante, perfecta para eventos nocturnos y ocasiones especiales.',
        price_cents: 7999,
        stock: 50,
        category_id: categoryMap.get('camisas'),
        color: 'Negro',
        material: 'Algodón peinado',
        sizes: ['S', 'M', 'L', 'XL'],
        sku: 'SHIRT-003',
        featured: false,
        is_active: true
      },
      {
        name: 'Camisa Rayas Verticales',
        slug: 'camisa-rayas-verticales',
        description: 'Camisa a rayas verticales en azul marino y blanco. Diseño clásico atemporal con corte regular. Tejido de alta densidad y acabado anti-arrugas.',
        price_cents: 8499,
        stock: 35,
        category_id: categoryMap.get('camisas'),
        color: 'Azul marino/Blanco',
        material: 'Algodón popelín',
        sizes: ['M', 'L', 'XL', 'XXL'],
        sku: 'SHIRT-004',
        featured: false,
        is_active: true
      },
      {
        name: 'Camisa Denim Premium',
        slug: 'camisa-denim-premium',
        description: 'Camisa de mezclilla premium en lavado medio. Versátil y duradera, combina perfectamente con looks casuales y smart casual.',
        price_cents: 9999,
        stock: 28,
        category_id: categoryMap.get('camisas'),
        color: 'Azul denim',
        material: 'Denim lavado',
        sizes: ['S', 'M', 'L', 'XL'],
        sku: 'SHIRT-005',
        featured: true,
        is_active: true
      },

      // PANTALONES (4 productos)
      {
        name: 'Pantalón Chino Beige',
        slug: 'pantalon-chino-beige',
        description: 'Pantalón chino en tono beige neutro. Corte slim fit con acabado premium. Perfecto para looks business casual y elegancia diaria.',
        price_cents: 11999,
        stock: 40,
        category_id: categoryMap.get('pantalones'),
        color: 'Beige',
        material: 'Algodón stretch',
        sizes: ['30', '32', '34', '36', '38'],
        sku: 'PANT-001',
        featured: true,
        is_active: true
      },
      {
        name: 'Pantalón Vestir Negro',
        slug: 'pantalon-vestir-negro',
        description: 'Pantalón de vestir negro en lana mezcla. Corte clásico con raya frontal. Ideal para eventos formales y uso de oficina.',
        price_cents: 13999,
        stock: 32,
        category_id: categoryMap.get('pantalones'),
        color: 'Negro',
        material: 'Lana mezcla',
        sizes: ['30', '32', '34', '36', '38', '40'],
        sku: 'PANT-002',
        featured: true,
        is_active: true
      },
      {
        name: 'Jeans Premium Oscuro',
        slug: 'jeans-premium-oscuro',
        description: 'Jeans de mezclilla premium en lavado oscuro. Corte regular con detalles sutiles. Durable y versátil para uso diario.',
        price_cents: 12999,
        stock: 55,
        category_id: categoryMap.get('pantalones'),
        color: 'Azul oscuro',
        material: 'Denim premium',
        sizes: ['30', '32', '34', '36', '38'],
        sku: 'PANT-003',
        featured: false,
        is_active: true
      },
      {
        name: 'Pantalón Gris Marengo',
        slug: 'pantalon-gris-marengo',
        description: 'Pantalón gris marengo de corte moderno. Tejido técnico con resistencia a arrugas. Perfecto para viajes y uso profesional.',
        price_cents: 11499,
        stock: 38,
        category_id: categoryMap.get('pantalones'),
        color: 'Gris marengo',
        material: 'Poliéster técnico',
        sizes: ['30', '32', '34', '36', '38'],
        sku: 'PANT-004',
        featured: false,
        is_active: true
      },

      // TRAJES (4 productos)
      {
        name: 'Traje Completo Navy',
        slug: 'traje-completo-navy',
        description: 'Traje completo en azul marino. Corte italiano slim fit con solapas de muesca. Incluye chaqueta y pantalón. Ideal para bodas y eventos formales.',
        price_cents: 49999,
        stock: 15,
        category_id: categoryMap.get('trajes'),
        color: 'Azul marino',
        material: 'Lana Super 120',
        sizes: ['48', '50', '52', '54'],
        sku: 'SUIT-001',
        featured: true,
        is_active: true
      },
      {
        name: 'Traje Gris Carbón',
        slug: 'traje-gris-carbon',
        description: 'Traje gris carbón de tres piezas. Incluye chaleco. Corte clásico británico. El traje definitivo para el caballero moderno.',
        price_cents: 59999,
        stock: 10,
        category_id: categoryMap.get('trajes'),
        color: 'Gris carbón',
        material: 'Lana virgen',
        sizes: ['48', '50', '52', '54', '56'],
        sku: 'SUIT-002',
        featured: true,
        is_active: true
      },
      {
        name: 'Traje Negro Esmoquin',
        slug: 'traje-negro-esmoquin',
        description: 'Esmoquin negro de gala con solapas de satén. Corte smoking clásico. Para eventos de etiqueta y ocasiones especiales.',
        price_cents: 69999,
        stock: 8,
        category_id: categoryMap.get('trajes'),
        color: 'Negro',
        material: 'Lana mohair',
        sizes: ['48', '50', '52', '54'],
        sku: 'SUIT-003',
        featured: false,
        is_active: true
      },
      {
        name: 'Traje Marrón Tweed',
        slug: 'traje-marron-tweed',
        description: 'Traje marrón en tejido tweed. Estilo campestre británico con corte regular. Perfecto para eventos informales de otoño e invierno.',
        price_cents: 54999,
        stock: 12,
        category_id: categoryMap.get('trajes'),
        color: 'Marrón',
        material: 'Tweed lana',
        sizes: ['48', '50', '52', '54'],
        sku: 'SUIT-004',
        featured: false,
        is_active: true
      },

      // ACCESORIOS (3 productos)
      {
        name: 'Corbata Seda Azul',
        slug: 'corbata-seda-azul',
        description: 'Corbata de seda pura en azul midnight con textura diagonal. Ancho clásico de 8cm. Confeccionada a mano en Italia.',
        price_cents: 4999,
        stock: 60,
        category_id: categoryMap.get('accesorios'),
        color: 'Azul midnight',
        material: 'Seda 100%',
        sizes: ['Única'],
        sku: 'ACC-001',
        featured: true,
        is_active: true
      },
      {
        name: 'Cinturón Cuero Negro',
        slug: 'cinturon-cuero-negro',
        description: 'Cinturón de cuero genuino italiano negro. Hebilla plateada de diseño minimalista. Ancho 3.5cm. Versátil para uso formal e informal.',
        price_cents: 7999,
        stock: 45,
        category_id: categoryMap.get('accesorios'),
        color: 'Negro',
        material: 'Cuero italiano',
        sizes: ['85', '90', '95', '100', '105'],
        sku: 'ACC-002',
        featured: false,
        is_active: true
      },
      {
        name: 'Pañuelo Bolsillo Seda',
        slug: 'panuelo-bolsillo-seda',
        description: 'Pañuelo de bolsillo en seda estampada. Diseño paisley en tonos azules y blancos. El toque final perfecto para tu traje.',
        price_cents: 3499,
        stock: 70,
        category_id: categoryMap.get('accesorios'),
        color: 'Azul/Blanco',
        material: 'Seda estampada',
        sizes: ['Única'],
        sku: 'ACC-003',
        featured: false,
        is_active: true
      }
    ];

    // 3. Insertar productos
    console.log('\n📦 Insertando productos...');

    // Verificar productos existentes
    const { data: existingProducts } = await supabase
      .from('products')
      .select('slug');

    const existingProductSlugs = new Set(existingProducts?.map(p => p.slug) || []);
    const productsToInsert = products.filter(p => !existingProductSlugs.has(p.slug));

    let insertedProducts;
    if (productsToInsert.length > 0) {
      const { data, error: productsError } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select();

      if (productsError) {
        console.error('Error detallado:', productsError);
        throw new Error(`Error al insertar productos: ${productsError.message}`);
      }

      insertedProducts = data;
      console.log(`✅ ${data?.length || 0} nuevos productos insertados`);
    } else {
      console.log('✅ Productos ya existen, omitiendo inserción');
    }

    // Obtener todos los productos
    const { data: allProducts } = await supabase
      .from('products')
      .select('featured');

    console.log(`✅ Total de productos en BD: ${allProducts?.length || 0}`);
    const featuredCount = allProducts?.filter(p => p.featured).length || 0;

    // 4. Resumen
    console.log('\n📊 Resumen:');
    console.log(`   - Categorías: ${allCategories.length}`);
    console.log(`   - Productos: ${allProducts?.length || 0}`);
    console.log(`   - Productos destacados: ${featuredCount}`);

    console.log('\n🎉 ¡Base de datos poblada exitosamente!');
    console.log('💡 Ahora puedes visitar http://localhost:3000 para ver los productos\n');

  } catch (error) {
    console.error('\n❌ Error durante la población de datos:', error);
    process.exit(1);
  }
}

// Ejecutar
seedDatabase();
