import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    // Hacer signOut para limpiar la sesión en Supabase
    await supabaseClient.auth.signOut();
    
    // Redirigir al login
    return context.redirect('/auth');
  } catch (error) {
    console.error('Error during logout:', error);
    // Incluso si hay error, redirigir al login
    return context.redirect('/auth');
  }
};
