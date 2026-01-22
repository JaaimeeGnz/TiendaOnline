/**
 * Script para verificar newsletter - versión simple
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno desde .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envConfig = dotenv.config({ path: envPath });

console.log('📋 Archivo .env.local:', envPath);
console.log('📄 ¿Existe?:', fs.existsSync(envPath));

if (envConfig.parsed) {
  console.log('\n✅ Variables cargadas desde .env.local:');
  console.log('   PUBLIC_SUPABASE_URL:', envConfig.parsed.PUBLIC_SUPABASE_URL ? '✓' : '✗');
  console.log('   PUBLIC_SUPABASE_ANON_KEY:', envConfig.parsed.PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗');
  console.log('   BREVO_API_KEY:', envConfig.parsed.BREVO_API_KEY ? '✓' : '✗');
} else {
  console.log('❌ No se pudo cargar .env.local');
}

const supabaseUrl = envConfig.parsed?.PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.parsed?.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Credenciales de Supabase no configuradas');
  process.exit(1);
}

console.log('\n✅ Credenciales OK');
console.log('   URL:', supabaseUrl.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  try {
    console.log('\n🔍 Verificando tablas...');

    // Test tabla newsletter_subscribers
    const { data: subs, error: subError, count: subCount } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .limit(1);

    if (subError) {
      console.log('❌ newsletter_subscribers:', subError.message);
    } else {
      console.log('✅ newsletter_subscribers: OK (' + subCount + ' registros)');
    }

    // Test tabla discount_codes
    const { data: codes, error: codeError, count: codeCount } = await supabase
      .from('discount_codes')
      .select('*', { count: 'exact' })
      .limit(1);

    if (codeError) {
      console.log('❌ discount_codes:', codeError.message);
    } else {
      console.log('✅ discount_codes: OK (' + codeCount + ' registros)');
    }

    console.log('\n✅ Verificación completada');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

verify();
