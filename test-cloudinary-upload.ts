import { execSync } from 'child_process';

// Script para diagnosticar problemas con Cloudinary
// Uso: node test-cloudinary-upload.mjs

interface CloudinaryAuth {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

// Tu configuración
const config: CloudinaryAuth = {
  cloudName: 'dqwjtfqxc',
  apiKey: '512627185662728',
  apiSecret: 'u3yfGYdysGY9onVuhzsAubXN9u0',
};

async function testCloudinarySetup() {
  console.log('🔍 Diagnosticando configuración de Cloudinary...\n');

  // Prueba 1: Verificar credenciales básicas
  console.log('✓ Credenciales de Cloudinary:');
  console.log(`  - Cloud Name: ${config.cloudName}`);
  console.log(`  - API Key: ${config.apiKey.slice(0, 5)}...${config.apiKey.slice(-5)}`);
  console.log(`  - API Secret: ${config.apiSecret.slice(0, 5)}...${config.apiSecret.slice(-5)}\n`);

  // Prueba 2: Conectar a Cloudinary API para obtener presets
  try {
    console.log('📡 Conectando a Cloudinary API para verificar presets...');
    
    const auth = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64');
    
    const curlCommand = `curl -s -H "Authorization: Basic ${auth}" https://api.cloudinary.com/v1_1/${config.cloudName}/upload_presets`;
    const response = execSync(curlCommand, { encoding: 'utf-8' });
    const data = JSON.parse(response);
    
    console.log(`✅ Conectado a Cloudinary exitosamente\n`);
    
    console.log('📋 Upload Presets encontrados:');
    if (data.presets && data.presets.length > 0) {
      data.presets.forEach((preset: any) => {
        console.log(`  - ${preset.name} (${preset.unsigned ? 'Unsigned' : 'Signed'})`);
        if (preset.folder) console.log(`    Carpeta: ${preset.folder}`);
      });
    } else {
      console.log('  ⚠️ No hay presets configurados');
    }

    // Verificar si existe el preset que necesitamos
    const fashionmarketPreset = data.presets?.find((p: any) => p.name === 'fashionmarket_products');
    
    console.log('\n🎯 Estado del preset requerido:');
    if (fashionmarketPreset) {
      console.log('  ✅ El preset "fashionmarket_products" EXISTS');
      console.log(`  - Unsigned: ${fashionmarketPreset.unsigned ? '✅ Sí' : '❌ No'}`);
      console.log(`  - Carpeta: ${fashionmarketPreset.folder || '(Sin carpeta específica)'}`);
      console.log(`  - Formato: ${fashionmarketPreset.format || 'Auto'}`);
    } else {
      console.log('  ❌ El preset "fashionmarket_products" NO EXISTE');
      console.log('  ⚠️ DEBES CREARLO MANUALMENTE EN https://cloudinary.com/console/settings/upload');
      console.log('  Ver instrucciones en: CLOUDINARY_UPLOAD_PRESET_SETUP.md');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📚 Próximos pasos:');
  console.log('1. Si el preset NO EXISTE, créalo manualmente en Cloudinary');
  console.log('2. Asegúrate de marcar "Unsigned" (sin firmar)');
  console.log('3. Recarga tu navegador y prueba subir una imagen\n');
}

testCloudinarySetup();
