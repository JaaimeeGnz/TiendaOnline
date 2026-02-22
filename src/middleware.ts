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

  // IMPORTANTE: No procesar el middleware para rutas de API públicas
  // para evitar que el body sea consumido
  // Pero SÍ proteger rutas API de admin
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin/')) {
    return next();
  }

  // Proteger rutas API de admin (requieren autenticación)
  if (pathname.startsWith('/api/admin/')) {
    // Verificar autenticación
    const accessToken = context.cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar token válido
    try {
      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseAnonKey) {
        const serverClient = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await serverClient.auth.getUser(accessToken);
        if (!data?.user) {
          return new Response(
            JSON.stringify({ error: 'Token inválido' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Error de autenticación' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return next();
  }

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
  const publicRoutes = ['/', '/auth', '/login', '/productos', '/categoria', '/marcas', '/carrito', '/contacto'];

  // Rutas de admin que requieren autenticación
  const adminRoutes = ['/admin'];

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Permitir acceso a rutas públicas sin autenticación
  if (isPublicRoute) {
    return next();
  }

  // Rutas de admin requieren autenticación en servidor
  if (isAdminRoute) {
    if (!user) {
      // Sin usuario autenticado → redirigir a /auth con mensaje
      return context.redirect('/auth?error=unauthorized&message=Debes+iniciar+sesion+para+acceder+al+panel+de+administracion');
    }
    // Usuario autenticado → permitir acceso
    return next();
  }

  // Para todas las demás rutas, permitir el acceso
  return next();
});
