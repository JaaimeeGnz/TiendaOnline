import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('📊 Fetching contact messages');

    // Obtener todos los mensajes ordenados por fecha
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching messages:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Error al obtener los mensajes' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Messages fetched:', data?.length);

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error procesando la solicitud',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
