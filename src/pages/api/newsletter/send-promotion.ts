import type { APIRoute } from 'astro';
import { supabaseClient as supabase } from '../../../lib/supabase';
import { sendNewsletterPromotion } from '../../../lib/email';

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
    const { title, description, productIds = [] } = body;

    if (!title || !description) {
      return new Response(
        JSON.stringify({ error: 'Title y description son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

    // Obtener productos
    let products: any[] = [];
    
    if (productIds.length > 0) {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)
        .eq('is_active', true)
        .limit(6);

      if (!productsError && productsData) {
        products = productsData;
      }
    } else {
      // Si no hay IDs específicos, obtener productos destacados
      const { data: featuredProducts, error: featuredError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('featured', true)
        .limit(6);

      if (!featuredError && featuredProducts) {
        products = featuredProducts;
      }
    }

    if (products.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No hay productos disponibles para enviar' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Preparar lista de productos
    const productsList = products.map(p => ({
      name: p.name,
      image: p.images?.[0] || '/placeholder.jpg',
      price: p.price_cents,
      url: `${import.meta.env.PUBLIC_SITE_URL}/productos/${p.slug}`,
    }));

    // Enviar newsletter a todos los suscriptores
    const result = await sendNewsletterPromotion(
      subscriberEmails,
      title,
      description,
      productsList
    );

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.success 
          ? `Newsletter enviado a ${result.sent} de ${result.total} suscriptores`
          : 'Error al enviar newsletter',
        sent: result.sent,
        total: result.total,
      }),
      { status: result.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending newsletter promotion:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
