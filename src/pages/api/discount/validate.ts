import type { APIRoute } from 'astro';
import { validateDiscountCode } from '../../../lib/newsletter';

export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Código requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await validateDiscountCode(code);

    return new Response(
      JSON.stringify(result),
      {
        status: result.valid ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Discount validation error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Error validating code' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
