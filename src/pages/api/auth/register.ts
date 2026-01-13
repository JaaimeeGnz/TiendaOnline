import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  // Esta ruta está disponible pero el registro ahora se maneja desde el cliente
  return new Response(
    JSON.stringify({ error: 'Usa el formulario de registro del cliente' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
};
