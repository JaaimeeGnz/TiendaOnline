import { supabaseClient } from './src/lib/supabase';

async function testSupabaseConnection() {
  try {
    console.log('🔍 Probando conexión a Supabase...\n');

    // Test 1: Verificar conexión básica
    console.log('1️⃣  Verificando conexión...');
    const { data: categories, error: catError } = await supabaseClient
      .from('categories')
      .select('*')
      .limit(1);

    if (catError) {
      console.error('❌ Error:', catError.message);
      return;
    }
    console.log('✅ Conexión exitosa\n');

    // Test 2: Contar categorías
    console.log('2️⃣  Verificando categorías...');
    const { count: catCount, error: catCountError } = await supabaseClient
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (!catCountError) {
      console.log(`✅ Categorías encontradas: ${catCount}`);
    }

    // Test 3: Contar productos
    console.log('3️⃣  Verificando productos...');
    const { count: prodCount, error: prodCountError } = await supabaseClient
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (!prodCountError) {
      console.log(`✅ Productos encontrados: ${prodCount}`);
    }

    // Test 4: Obtener datos de ejemplo
    console.log('\n4️⃣  Datos de ejemplo:\n');
    const { data: allProducts } = await supabaseClient
      .from('products')
      .select('name, price_cents, stock')
      .limit(3);

    if (allProducts && allProducts.length > 0) {
      console.log('📦 Productos:');
      allProducts.forEach((prod: any) => {
        console.log(`   - ${prod.name}: €${(prod.price_cents / 100).toFixed(2)} (Stock: ${prod.stock})`);
      });
    } else {
      console.log('⚠️  No hay productos aún. Necesitas ejecutar el schema SQL.');
    }

    console.log('\n✅ Conexión a Supabase configurada correctamente!');
  } catch (error: any) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabaseConnection();
}

export { testSupabaseConnection };
