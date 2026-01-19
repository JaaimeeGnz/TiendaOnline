import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ verify-session: Variables de entorno faltantes');
      return new Response(JSON.stringify({ authenticated: false }), { status: 200 });
    }

    // Obtener access token de las cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    
    if (!accessToken) {
      console.log('❌ verify-session: Sin access token en cookies');
      return new Response(JSON.stringify({ authenticated: false }), { status: 200 });
    }

    console.log('🔍 verify-session: Verificando token con Supabase');
    
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await client.auth.getUser(accessToken);
    
    if (error) {
      console.log('❌ verify-session: Error de Supabase:', error.message);
      return new Response(JSON.stringify({ authenticated: false }), { status: 200 });
    }
    
    if (user) {
      console.log('✅ verify-session: Sesión válida para:', user.email);
      return new Response(JSON.stringify({ 
        authenticated: true, 
        email: user.email 
      }), { status: 200 });
    } else {
      console.log('❌ verify-session: Sin usuario en respuesta');
      return new Response(JSON.stringify({ authenticated: false }), { status: 200 });
    }
  } catch (error) {
    console.error('❌ verify-session: Error:', error);
    return new Response(JSON.stringify({ authenticated: false }), { status: 200 });
  }
};
