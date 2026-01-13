import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ redirect }) => {
  try {
    await supabaseClient.auth.signOut();
    return redirect('/auth?message=Sesión cerrada correctamente');
  } catch (error) {
    console.error('Error en logout:', error);
    return redirect('/auth?error=Error al cerrar sesión');
  }
};
