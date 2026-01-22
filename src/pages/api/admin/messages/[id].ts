import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID no proporcionado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { status, admin_notes } = body;

    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status, admin_notes })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating message:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Error al actualizar el mensaje' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Message updated:', data.id);

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
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

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting message:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Error al eliminar el mensaje' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Message deleted:', id);

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
