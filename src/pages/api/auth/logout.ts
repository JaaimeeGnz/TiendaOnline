import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  try {
    // Intentar cerrar sesión en Supabase
    try {
      await supabaseClient.auth.signOut();
    } catch (error) {
      // Continuar incluso si Supabase falla
      console.warn('Warning: Could not sign out from Supabase:', error);
    }

    // Limpiar cookies de invitado
    cookies.delete('guest-session', { path: '/' });
    cookies.delete('guest-login-time', { path: '/' });

    // ⭐ IMPORTANTE: Limpiar cookies de sesión de Supabase
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });

    return redirect('/login');
  } catch (error) {
    console.error('Error en logout:', error);
    return redirect('/login');
  }
};
