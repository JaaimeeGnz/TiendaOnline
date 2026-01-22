import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

// Usar la clave pública de Supabase para insertar mensajes
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📧 Contact form submission received');
    console.log('Supabase URL:', supabaseUrl ? '✓' : '✗');
    console.log('Supabase Key:', supabaseKey ? '✓' : '✗');

    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validar datos
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Todos los campos son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Guardar en la tabla contact_messages
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving contact message:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Error al guardar el mensaje: ' + error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Contact message saved:', data);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.',
        data: data,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Contact submission error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error procesando tu solicitud: ' + String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
