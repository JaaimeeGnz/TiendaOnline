// Abre esto en la consola de tu navegador (F12 → Console)
// Copia y pega esto para verificar la configuración

console.log('=== Verificación de Cloudinary ===');

if (typeof window.cloudinary !== 'undefined') {
  console.log('✅ Widget de Cloudinary cargado');
} else {
  console.log('❌ Widget de Cloudinary NO cargado');
}

// Verificar si las variables de entorno están accesibles
const testEnv = {
  PUBLIC_CLOUDINARY_CLOUD_NAME: import.meta?.env?.PUBLIC_CLOUDINARY_CLOUD_NAME,
};

console.log('Variables de entorno:', testEnv);

// Intentar crear un widget de prueba
if (window.cloudinary) {
  try {
    const testWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dqwjtfqxc',
        uploadPreset: 'fashionmarket_products',
      },
      (error, result) => {
        if (error) {
          console.error('Error en widget de prueba:', error);
        } else if (result) {
          console.log('Resultado:', result);
        }
      }
    );
    console.log('✅ Widget de prueba creado exitosamente');
  } catch (e) {
    console.error('❌ Error creando widget:', e);
  }
}
