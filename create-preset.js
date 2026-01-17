// Script para crear el Upload Preset en Cloudinary
// Uso: node create-preset.js

import https from 'https';

const config = {
  cloudName: 'dqwjtfqxc',
  apiKey: '512627185662728',
  apiSecret: 'u3yfGYdysGY9onVuhzsAubXN9u0',
};

function createUploadPreset() {
  console.log('🚀 Creando Upload Preset en Cloudinary...\n');

  const auth = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64');

  // Datos del preset
  const presetData = {
    name: 'fashionmarket_products',
    unsigned: true,
    folder: 'fashionmarket/products',
    overwrite: true,
    resource_type: 'auto',
    quality: 'auto',
  };

  // Convertir a URL encoded
  const params = Object.entries(presetData)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  console.log('📋 Configuración del preset:');
  console.log(`  - Nombre: ${presetData.name}`);
  console.log(`  - Unsigned (sin firmar): ${presetData.unsigned}`);
  console.log(`  - Carpeta destino: ${presetData.folder}`);
  console.log(`  - Resource type: ${presetData.resource_type}\n`);

  const options = {
    hostname: 'api.cloudinary.com',
    port: 443,
    path: `/v1_1/${config.cloudName}/upload_presets`,
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(params),
    },
  };

  console.log('⏳ Enviando solicitud a Cloudinary...\n');

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);

        if (response.name === 'fashionmarket_products') {
          console.log('✅ ¡Upload Preset creado exitosamente!\n');
          console.log('📊 Detalles del preset creado:');
          console.log(`  - ID: ${response.name}`);
          console.log(`  - Unsigned: ${response.unsigned}`);
          console.log(`  - Carpeta: ${response.folder}`);
          console.log(`  - Resource Type: ${response.resource_type}`);
          
          console.log('\n🎉 Próximos pasos:');
          console.log('1. ✅ El preset está creado');
          console.log('2. Recarga tu navegador (Ctrl+R o Cmd+R)');
          console.log('3. Ve a: http://localhost:3000/admin/productos/[ID]');
          console.log('4. Intenta subir una imagen');
          console.log('5. ¡Debería funcionar ahora!\n');
        } else if (response.error) {
          console.error('❌ Error creando preset:');
          console.error(`  ${response.error.message}`);
          if (response.error.http_code === 400 && response.error.message.includes('already exists')) {
            console.log('\n✅ El preset ya existe. Puede que necesites recargarpágina.');
          }
        } else {
          console.error('❌ Respuesta inesperada:', response);
        }
      } catch (e) {
        console.error('❌ Error parseando respuesta:', e.message);
        console.error('Respuesta:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error en la solicitud:', e.message);
  });

  req.write(params);
  req.end();
}

createUploadPreset();
