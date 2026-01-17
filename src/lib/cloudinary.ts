import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Generar firma para upload seguro desde el cliente
 */
export function generateUploadSignature(folder: string = 'fashionmarket/products') {
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

  const signature = crypto
    .createHash('sha1')
    .update(paramsString + import.meta.env.CLOUDINARY_API_SECRET)
    .digest('hex');

  return {
    signature,
    timestamp,
    folder,
    cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.CLOUDINARY_API_KEY,
  };
}

/**
 * Obtener URL optimizada de Cloudinary para una imagen
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  } = {}
) {
  const {
    width = 500,
    height = 500,
    quality = 'auto',
    format = 'webp',
    crop = 'fill',
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    quality,
    format,
    crop,
    secure: true,
  });
}

/**
 * Subir imagen a Cloudinary desde el servidor
 */
export async function uploadProductImage(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'fashionmarket/products'
) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}-${fileName}`,
        resource_type: 'auto',
        quality: 'auto',
        format: 'webp',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Eliminar imagen de Cloudinary
 */
export async function deleteProductImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Error deleting image from Cloudinary: ${error}`);
  }
}
