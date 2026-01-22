import type { APIRoute } from 'astro';
import { supabaseClient as supabase } from '../../../lib/supabase';
import { sendPromotionalEmail } from '../../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validar método
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'Product ID es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener producto
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener suscriptores
    const { data: subscribers, error: subscriberError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (subscriberError || !subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No hay suscriptores', sent: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const subscriberEmails = subscribers.map(s => s.email);
    let successCount = 0;

    // Enviar email a cada suscriptor
    for (const email of subscriberEmails) {
      try {
        const productUrl = `${import.meta.env.PUBLIC_SITE_URL}/productos/${product.slug}`;
        const result = await sendPromotionalEmail(
          email,
          product.name,
          product.images?.[0] || '/placeholder.jpg',
          product.price_cents,
          productUrl
        );
        
        if (result.success) {
          successCount++;
        }
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Emails promocionales enviados a ${successCount} suscriptores`,
        sent: successCount,
        total: subscribers.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending promotional emails:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
