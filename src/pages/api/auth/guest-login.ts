/**
 * src/pages/api/auth/guest-login.ts
 * Endpoint para login como invitado - establece una cookie
 */

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Establecer cookie de invitado SIN httpOnly (necesaria para que se envíe correctamente)
  cookies.set('guest-session', 'true', {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    secure: process.env.NODE_ENV === 'production'
  });

  // Guardar timestamp
  cookies.set('guest-login-time', new Date().toISOString(), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production'
  });

  // Redirigir a /productos con un parámetro de verificación
  return redirect('/productos');
};
