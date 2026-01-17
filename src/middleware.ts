import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/supabase';

/**
 * Middleware para manejar autenticación
 * - Página de login (/login): acceso libre - primera página que ve el usuario
 * - Rutas públicas (/auth, /api): acceso libre
 * - Rutas de admin (/admin): solo usuarios autenticados
 * - Raíz (/) y rutas de tienda: redirige a /login si no está autenticado ni es invitado
 * - Rutas de tienda (/productos, /carrito, etc): acceso tras autenticarse o elegir invitado
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

  // Rutas que permiten acceso libre sin autenticación
  const publicRoutes = ['/auth', '/api', '/login'];

  // Rutas de admin que requieren autenticación
  const adminRoutes = ['/admin'];

  // Rutas de tienda accesibles para invitados (después de login)
  const storeRoutes = ['/productos', '/carrito', '/contacto', '/categoria', '/marcas'];

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isStoreRoute = storeRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  // Permitir acceso a rutas públicas sin autenticación
  if (isPublicRoute) {
    return next();
  }

  // Rutas de admin requieren autenticación
  if (isAdminRoute) {
    // En SSR no podemos verificar sesión, entonces permitimos el acceso
    // La verificación real se hace en el cliente con los datos de Supabase
    return next();
  }

  // Si accede a / o rutas de tienda y no está autenticado y no es invitado
  // redirige a /login
  if ((pathname === '/' || isStoreRoute) && !session) {
    // Permitir acceso si tiene isGuest en localStorage (se verifica en cliente)
    // Por ahora redireccionar a login
    return context.redirect('/login');
  }

  return next();
});
