import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request, redirect }) => {
  try {
    const session = await getSession();

    if (session) {
      // Usuario autenticado, redirigir a productos
      return redirect('/productos');
    } else {
      // Usuario no autenticado o es invitado
      const isGuest = request.headers.get('cookie')?.includes('jgmarket-guest');
      if (isGuest) {
        // Invitado, permitir acceso a productos
        return redirect('/productos');
      }
      // No autenticado, ir a login
      return redirect('/auth');
    }
  } catch (error) {
    console.error('Error en check-auth:', error);
    return redirect('/auth');
  }
};
