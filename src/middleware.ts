import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/supabase';

/**
 * Middleware para proteger rutas de administración
 * Redirige a login si el usuario no está autenticado
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Rutas que requieren autenticación
  const protectedRoutes = ['/admin'];

  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Permitir acceso a la página de login sin autenticación
  if (pathname === '/admin/login') {
    return next();
  }

  // Verificar autenticación para rutas protegidas
  if (isProtectedRoute) {
    try {
      const session = await getSession();

      if (!session) {
        // Redirigir a login si no hay sesión
        return context.redirect('/admin/login');
      }

      // Usuario autenticado, continuar
      context.locals.user = session.user;
      context.locals.session = session;
    } catch (error) {
      console.error('Error en middleware de autenticación:', error);
      return context.redirect('/admin/login');
    }
  }

  return next();
});
