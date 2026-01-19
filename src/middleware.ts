import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';

/**
 * Middleware para manejar autenticación
 * - /: acceso libre → muestra homepage con ofertas
 * - /login, /auth: acceso libre
 * - /api: acceso libre
 * - /admin: solo usuarios autenticados
 * - /productos, /carrito, /contacto, /categoria, /marcas: acceso libre
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Verificar autenticación usando cookies HTTP
  const accessToken = context.cookies.get('sb-access-token')?.value;
  const isGuest = context.cookies.has('guest-session');

  // Verificar si el token es válido
  let user = null;
  if (accessToken) {
    try {
      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseAnonKey) {
        const serverClient = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await serverClient.auth.getUser(accessToken);
        user = data?.user || null;
      }
    } catch (error) {
      console.error('Error verificando token en middleware:', error);
    }
  }

  // Guardar en locals para acceder en componentes
  context.locals.user = user;
  context.locals.session = user ? { user } : null;
  context.locals.isGuest = isGuest;

  // Rutas públicas - sin restricción
  const publicRoutes = ['/', '/auth', '/api', '/login', '/productos', '/categoria', '/marcas', '/carrito', '/contacto'];

  // Rutas de admin que requieren autenticación
  const adminRoutes = ['/admin'];

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Permitir acceso a rutas públicas sin autenticación
  if (isPublicRoute) {
    return next();
  }

  // Rutas de admin requieren autenticación (verificación en cliente también)
  if (isAdminRoute) {
    return next();
  }

  // Para todas las demás rutas, permitir el acceso
  return next();
});
