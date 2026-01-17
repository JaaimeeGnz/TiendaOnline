import { execSync } from 'child_process';

// Script para CREAR automáticamente el Upload Preset en Cloudinary
// Uso: npx ts-node create-cloudinary-preset.ts

const config = {
  cloudName: 'dqwjtfqxc',
  apiKey: '512627185662728',
  apiSecret: 'u3yfGYdysGY9onVuhzsAubXN9u0',
};

function createUploadPreset() {
  console.log('🚀 Creando Upload Preset en Cloudinary...\n');

  try {
    const auth = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64');
    
    // Datos del preset a crear
    const presetData = {
      name: 'fashionmarket_products',
      unsigned: true,
      folder: 'fashionmarket/products',
      overwrite: true,
      resource_type: 'auto',
      format: 'auto',
      quality: 'auto',
    };

    // Convertir a formato URL encoded
    const params = Object.entries(presetData)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    console.log('📋 Configuración del preset:');
    console.log(`  - Nombre: ${presetData.name}`);
    console.log(`  - Unsigned (sin firmar): ${presetData.unsigned}`);
    console.log(`  - Carpeta destino: ${presetData.folder}`);
    console.log(`  - Resource type: ${presetData.resource_type}\n`);

    const curlCommand = `curl -s -X POST -H "Authorization: Basic ${auth}" -H "Content-Type: application/x-www-form-urlencoded" -d "${params}" https://api.cloudinary.com/v1_1/${config.cloudName}/upload_presets`;
    
    console.log('⏳ Enviando solicitud a Cloudinary...');
    const response = execSync(curlCommand, { encoding: 'utf-8' });
    const data = JSON.parse(response);

    if (data.name === 'fashionmarket_products') {
      console.log('\n✅ ¡Upload Preset creado exitosamente!\n');
      console.log('📊 Detalles del preset creado:');
      console.log(`  - ID: ${data.name}`);
      console.log(`  - Unsigned: ${data.unsigned}`);
      console.log(`  - Carpeta: ${data.folder}`);
      console.log(`  - Resource Type: ${data.resource_type}`);
      console.log(`  - Overwrite: ${data.overwrite}`);
      
      console.log('\n🎉 Próximos pasos:');
      console.log('1. Recarga tu navegador');
      console.log('2. Intenta subir una imagen nuevamente');
      console.log('3. ¡Debería funcionar ahora!\n');
      
      return true;
    } else if (data.error) {
      console.error('❌ Error creando preset:', data.error.message);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

createUploadPreset();
