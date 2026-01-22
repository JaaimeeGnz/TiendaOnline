/**
 * Script para verificar la conectividad con Supabase y las tablas newsletter
 * Ejecutar: npx ts-node verify-newsletter.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyNewsletter() {
  console.log('🔍 Verificando configuración de Newsletter...\n');

  try {
    // Test 1: Verificar conexión a Supabase
    console.log('1️⃣  Verificando conexión a Supabase...');
    const { data: healthCheck, error: healthError } = await supabase.from('newsletter_subscribers').select('count', { count: 'exact' }).limit(0);
    if (healthError) {
      console.error('   ❌ Error:', healthError.message);
    } else {
      console.log('   ✅ Conexión OK');
    }

    // Test 2: Verificar tabla newsletter_subscribers
    console.log('\n2️⃣  Verificando tabla newsletter_subscribers...');
    const { data: subscribers, error: subError, count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .limit(5);

    if (subError) {
      console.error('   ❌ Error:', subError.message);
      console.log('   💡 Posiblemente la tabla no existe. Ejecuta el esquema SQL en Supabase.');
    } else {
      console.log(`   ✅ Tabla existe. Total registros: ${count}`);
      if (subscribers && subscribers.length > 0) {
        console.log(`   📋 Últimos registros:`);
        subscribers.forEach((sub: any) => {
          console.log(`      - ${sub.email} (Código: ${sub.discount_code})`);
        });
      }
    }

    // Test 3: Verificar tabla discount_codes
    console.log('\n3️⃣  Verificando tabla discount_codes...');
    const { data: codes, error: codeError, count: codeCount } = await supabase
      .from('discount_codes')
      .select('*', { count: 'exact' })
      .limit(5);

    if (codeError) {
      console.error('   ❌ Error:', codeError.message);
      console.log('   💡 Posiblemente la tabla no existe. Ejecuta el esquema SQL en Supabase.');
    } else {
      console.log(`   ✅ Tabla existe. Total códigos: ${codeCount}`);
      if (codes && codes.length > 0) {
        console.log(`   📋 Últimos códigos:`);
        codes.forEach((code: any) => {
          console.log(`      - ${code.code} (${code.discount_value}${code.discount_type === 'percentage' ? '%' : '¢'})`);
        });
      }
    }

    // Test 4: Intentar insertar un registro de prueba
    console.log('\n4️⃣  Probando inserción (con email de prueba)...');
    const testEmail = `test-${Date.now()}@verify.local`;
    const { data: inserted, error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: testEmail,
        discount_code: `TEST${Date.now()}`,
        discount_percentage: 10,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('   ❌ Error:', insertError.message);
      console.log('   Código:', insertError.code);
    } else {
      console.log('   ✅ Inserción OK');
      console.log(`   Email: ${inserted.email}`);
      console.log(`   Código: ${inserted.discount_code}`);

      // Intentar eliminar el registro de prueba
      const { error: deleteError } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('email', testEmail);

      if (deleteError) {
        console.warn('   ⚠️  Advertencia: No se pudo eliminar registro de prueba');
      } else {
        console.log('   ✅ Registro de prueba eliminado');
      }
    }

    console.log('\n✅ Verificación completada');
  } catch (error: any) {
    console.error('❌ Error general:', error.message);
  }
}

verifyNewsletter();
