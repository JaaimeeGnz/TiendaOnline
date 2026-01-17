import type { APIRoute } from 'astro';

// Este endpoint no es más necesario, la verificación se hace en el cliente
// Pero lo dejamos para compatibilidad
export const GET: APIRoute = async (context) => {
  return new Response(
    JSON.stringify({ message: 'Use client-side verification instead' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

