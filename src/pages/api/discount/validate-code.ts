import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Código de descuento inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Buscar el código en la tabla newsletter_subscribers
    const { data: subscriber, error } = await supabaseClient
      .from('newsletter_subscribers')
      .select('discount_code, discount_percentage, is_active')
      .eq('discount_code', code.toUpperCase())
      .single();

    console.log('🎫 Búsqueda de código:', { code, subscriber, error });

    if (error || !subscriber) {
      return new Response(
        JSON.stringify({ error: 'Código de descuento no válido' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que el cupón está activo
    if (!subscriber.is_active) {
      return new Response(
        JSON.stringify({ error: 'Este código de descuento ha expirado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Código válido:', {
      code: subscriber.discount_code,
      percentage: subscriber.discount_percentage,
    });

    return new Response(
      JSON.stringify({
        success: true,
        discountPercentage: subscriber.discount_percentage,
        code: subscriber.discount_code,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error validando código:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar el código' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
