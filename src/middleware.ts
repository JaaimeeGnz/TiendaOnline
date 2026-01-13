import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/supabase';

/**
 * Middleware para manejar autenticación
 * - Rutas públicas (/auth, /api): acceso libre
 * - Rutas de admin (/admin): solo usuarios autenticados
 * - Rutas de tienda (/productos, /carrito, etc): acceso libre (usuarios autenticados o invitados)
 * - Raíz (/): redirige a /auth si no está autenticado
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Obtener sesión actual
  let session = null;
  try {
    session = await getSession();
  } catch (error) {
    console.error('Error al obtener sesión:', error);
  }

  // Guardar en locals para acceder en componentes
  context.locals.user = session?.user || null;
  context.locals.session = session || null;
  context.locals.isGuest = !session; // true si es invitado o no autenticado

  // Rutas públicas que no requieren autenticación (no se redirigen)
  const publicRoutes = ['/auth', '/api'];

  // Rutas de admin que requieren autenticación
  const adminRoutes = ['/admin'];

  // Rutas de tienda accesibles para invitados
  const storeRoutes = ['/productos', '/carrito', '/contacto', '/categoria', '/'];

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isStoreRoute = storeRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  // Permitir acceso a rutas públicas sin autenticación
  if (isPublicRoute) {
    return next();
  }

  // Rutas de admin requieren autenticación
  if (isAdminRoute) {
    if (!session) {
      return context.redirect('/admin/login');
    }
    return next();
  }

  // Rutas de tienda: permitir acceso a todos (autenticados e invitados)
  if (isStoreRoute) {
    return next();
  }

  return next();
});
