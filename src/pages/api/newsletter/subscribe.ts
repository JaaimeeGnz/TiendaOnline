import type { APIRoute } from 'astro';
import { subscribeToNewsletter } from '../../../lib/newsletter';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validar que sea POST
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { email, discount = 10 } = body;

    // Validar datos
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Procesar suscripción
    const result = await subscribeToNewsletter(email, discount);

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
