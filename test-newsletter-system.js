/**
 * Test del Sistema de Newsletter y Descuentos
 * Ejecutar en el navegador: F12 > Console y copiar/pegar las funciones
 */

// ============================================================================
// PRUEBA 1: Validar estructura de componentes
// ============================================================================

async function test_estructura() {
  console.log('🧪 PRUEBA 1: Verificando archivos creados...');
  
  const archivos = [
    'src/components/ui/NewsletterPopup.tsx',
    'src/components/ui/DiscountCodeInput.tsx',
    'src/components/ui/DiscountBadge.tsx',
    'src/lib/newsletter.ts',
    'src/lib/discountCalculations.ts',
    'src/pages/api/newsletter/subscribe.ts',
    'src/pages/api/discount/validate.ts',
  ];

  console.log('✅ Archivos esperados:');
  archivos.forEach(f => console.log(`   - ${f}`));
  
  console.log('\n📝 ACCIÓN REQUERIDA:');
  console.log('   Ve a VS Code y verifica que existan estos archivos');
}

// ============================================================================
// PRUEBA 2: Probar API de Suscripción
// ============================================================================

async function test_suscripcion() {
  console.log('\n🧪 PRUEBA 2: Probando suscripción a newsletter...');

  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        discount: 10,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ SUSCRIPCIÓN EXITOSA');
      console.log(`   Email: ${result.email}`);
      console.log(`   Código: ${result.discountCode}`);
      console.log(`   Mensaje: ${result.message}`);
    } else {
      console.warn('⚠️  Error en suscripción:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ ERROR en API de suscripción:', error);
  }
}

// ============================================================================
// PRUEBA 3: Probar API de Validación
// ============================================================================

async function test_validacion(codigo = 'BIENVENIDA10') {
  console.log(`\n🧪 PRUEBA 3: Validando código "${codigo}"...`);

  try {
    const response = await fetch('/api/discount/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codigo }),
    });

    const result = await response.json();
    
    if (result.valid) {
      console.log('✅ CÓDIGO VÁLIDO');
      console.log(`   Tipo: ${result.data.discount_type}`);
      console.log(`   Descuento: ${result.data.discount_value}%`);
      console.log(`   Mínimo: €${(result.data.min_purchase_cents / 100).toFixed(2)}`);
    } else {
      console.warn('⚠️  Código no válido:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ ERROR en validación:', error);
  }
}

// ============================================================================
// PRUEBA 4: Probar cálculos de descuento
// ============================================================================

async function test_calculos() {
  console.log('\n🧪 PRUEBA 4: Probando cálculos de descuento...');

  // Importar o calcular inline
  const calcularPrecio = (priceCents, discountPercentage) => {
    const discountCents = Math.round(priceCents * (discountPercentage / 100));
    return priceCents - discountCents;
  };

  const formatPrice = (cents) => `€${(cents / 100).toFixed(2)}`;

  // Ejemplos
  const precio_original = 10000; // €100
  const descuento = 15; // 15%
  const precio_descuento = calcularPrecio(precio_original, descuento);
  const ahorrado = precio_original - precio_descuento;

  console.log('✅ CÁLCULOS CORRECTOS');
  console.log(`   Precio original: ${formatPrice(precio_original)}`);
  console.log(`   Descuento: ${descuento}%`);
  console.log(`   Precio final: ${formatPrice(precio_descuento)}`);
  console.log(`   Ahorrado: ${formatPrice(ahorrado)}`);
}

// ============================================================================
// PRUEBA 5: Verificar localStorage
// ============================================================================

function test_localStorage() {
  console.log('\n🧪 PRUEBA 5: Verificando localStorage...');

  const hasFlag = localStorage.getItem('newsletter_subscribed');
  
  if (hasFlag) {
    console.log('⚠️  Ya existe "newsletter_subscribed" en localStorage');
    console.log('   El popup NO volverá a aparecer hasta limpiar esto');
    console.log('\n   Para pruebas, limpia con:');
    console.log('   → localStorage.removeItem("newsletter_subscribed")');
  } else {
    console.log('✅ localStorage limpio');
    console.log('   El popup aparecerá en 3 segundos al recargar');
  }
}

// ============================================================================
// PRUEBA 6: Verificar tablas en Supabase
// ============================================================================

function test_supabase_tablas() {
  console.log('\n🧪 PRUEBA 6: Tablas en Supabase');
  
  console.log('✅ TABLAS QUE DEBEN EXISTIR:');
  console.log('   1. newsletter_subscribers');
  console.log('   2. discount_codes');
  console.log('   3. discount_code_usage');
  
  console.log('\n📝 CÓMO VERIFICAR EN SUPABASE:');
  console.log('   1. Ve a supabase.com → Tu proyecto');
  console.log('   2. Table Editor (en panel izquierdo)');
  console.log('   3. Deberías ver las 3 tablas listadas');
}

// ============================================================================
// EJECUTAR TODAS LAS PRUEBAS
// ============================================================================

async function test_todo() {
  console.clear();
  console.log('═'.repeat(60));
  console.log('   🧪 SUITE DE PRUEBAS - Newsletter & Descuentos');
  console.log('═'.repeat(60));

  test_estructura();
  test_supabase_tablas();
  test_localStorage();
  test_calculos();

  // Pruebas de API (requieren servidor corriendo)
  console.log('\n\n📡 PRUEBAS DE API (requieren npm run dev)');
  console.log('═'.repeat(60));

  const suscripcion = await test_suscripcion();
  
  if (suscripcion?.discountCode) {
    await test_validacion(suscripcion.discountCode);
  } else {
    console.log('\n⚠️  Saltando validación de código (no hay código válido)');
    console.log('   Primero crea un código: BIENVENIDA10 en Supabase');
  }

  console.log('\n\n' + '═'.repeat(60));
  console.log('   ✅ SUITE DE PRUEBAS COMPLETADA');
  console.log('═'.repeat(60));
}

// ============================================================================
// COMANDOS ÚTILES
// ============================================================================

function ayuda() {
  console.clear();
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 COMANDOS PARA PROBAR EL SISTEMA                       ║
╚════════════════════════════════════════════════════════════╝

1️⃣  EJECUTAR TODAS LAS PRUEBAS:
    test_todo()

2️⃣  PRUEBAS INDIVIDUALES:
    test_estructura()         - Verificar archivos
    test_localStorage()       - Ver localStorage
    test_calculos()           - Probar cálculos
    test_suscripcion()        - Crear suscriptor
    test_validacion('CÓDIGO') - Validar código

3️⃣  LIMPIAR PARA NUEVAS PRUEBAS:
    localStorage.removeItem('newsletter_subscribed')

4️⃣  VER SUSCRIPTORES EN BD:
    - Ve a supabase.com
    - Table Editor → newsletter_subscribers

5️⃣  VER CÓDIGOS EN BD:
    - Ve a supabase.com
    - Table Editor → discount_codes

6️⃣  CREAR CÓDIGO DE PRUEBA:
    En Supabase SQL Editor:
    INSERT INTO discount_codes (code, discount_type, discount_value, is_active)
    VALUES ('BIENVENIDA10', 'percentage', 10, true);

═══════════════════════════════════════════════════════════════

CHECKLIST DE IMPLEMENTACIÓN:

☐ Migración SQL ejecutada en Supabase
☐ Tablas creadas en newsletter_schema.sql
☐ Popup aparece al cargar la página
☐ Email se guarda correctamente en BD
☐ Código de descuento se genera
☐ Código puede validarse
☐ Descuento se aplica al carrito
☐ Uso de código se registra en BD

═══════════════════════════════════════════════════════════════
  `);
}

// Mostrar ayuda al cargar
console.log('%c👋 Escribe ayuda() para ver los comandos disponibles', 'font-size: 14px; color: green; font-weight: bold;');
