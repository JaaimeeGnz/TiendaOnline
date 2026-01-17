import crypto from 'crypto';

// Test para verificar la firma de Cloudinary
const config = {
  cloudName: 'dqwjtfqxc',
  apiKey: '512627185662728',
  apiSecret: 'u3yfGYdysGY9onVuhzsAubXN9u0',
};

function generateUploadSignature(folder = 'fashionmarket/products') {
  const timestamp = Math.floor(Date.now() / 1000);
  
  const params = {
    timestamp,
    folder,
    resource_type: 'auto',
  };

  // Crear string para firmar
  const paramsString = Object.entries(params)
    .sort()
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  console.log('Params string:', paramsString);

  const signature = crypto
    .createHash('sha1')
    .update(paramsString + config.apiSecret)
    .digest('hex');

  return {
    signature,
    timestamp,
    folder,
    cloudName: config.cloudName,
    apiKey: config.apiKey,
  };
}

console.log('🔐 Generando firma de prueba...\n');
const sig = generateUploadSignature();
console.log('✅ Firma generada:\n', sig);
