import type { APIRoute } from 'astro';
import crypto from 'crypto';

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const apiKey = import.meta.env.CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: 'Cloudinary credentials not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generar firma
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash('sha1')
      .update(stringToSign)
      .digest('hex');

    return new Response(
      JSON.stringify({ timestamp, signature, apiKey }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error generating signature:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate signature' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
