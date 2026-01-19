import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({
        isAuthenticated: false,
        user: null
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Crear cliente con cookies del contexto
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          Authorization: `Bearer ${cookies.get('sb-access-token')?.value || ''}`,
        },
      },
    });

    // Obtener sesión usando el token de acceso
    const authToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!authToken) {
      return new Response(JSON.stringify({
        isAuthenticated: false,
        user: null
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: { user } } = await supabaseClient.auth.getUser(authToken);

    return new Response(JSON.stringify({
      isAuthenticated: !!user,
      user: user || null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return new Response(JSON.stringify({
      isAuthenticated: false,
      user: null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};