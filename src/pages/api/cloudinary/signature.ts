import type { APIRoute } from 'astro';
import { generateUploadSignature } from '../../../lib/cloudinary';

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('[API] Generando firma de Cloudinary...');
    
    // Verificar que las variables de entorno existan
    const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.CLOUDINARY_API_SECRET;
    
    console.log('[API] CloudName:', cloudName);
    console.log('[API] ApiKey:', apiKey ? 'configurado' : 'NO configurado');
    console.log('[API] ApiSecret:', apiSecret ? 'configurado' : 'NO configurado');
    
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Variables de entorno de Cloudinary no configuradas');
    }

    const signature = generateUploadSignature();
    console.log('[API] Firma generada:', signature);
    
    return new Response(
      JSON.stringify(signature),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('[API] Error generando firma:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate upload signature',
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
