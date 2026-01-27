import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de Supabase');
}

console.log('📌 Usando ANON_KEY para DELETE');

const supabase = createClient(supabaseUrl, supabaseKey);

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;
    console.log('🔄 Updating message with id:', id);
    
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID no proporcionado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { status, admin_notes } = body;
    console.log('📝 Update data:', { status, admin_notes });

    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status, admin_notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error updating message:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Error al actualizar el mensaje' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data || data.length === 0) {
      console.error('❌ No rows updated for id:', id);
      return new Response(
        JSON.stringify({ success: false, error: 'Mensaje no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Message updated:', data[0].id);

    return new Response(
      JSON.stringify({
        success: true,
        data: data[0],
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

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID no proporcionado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('🗑️ Eliminando mensaje:', id);
    console.log('� Usando ANON_KEY');

    const { data, error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error deleting message:', error);
      console.error('🔍 Error details - code:', error.code);
      console.error('🔍 Error details - message:', error.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Error al eliminar el mensaje' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data || data.length === 0) {
      console.error('❌ No rows deleted for id:', id);
      return new Response(
        JSON.stringify({ success: false, error: 'Mensaje no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Message deleted successfully:', id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mensaje eliminado correctamente',
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
