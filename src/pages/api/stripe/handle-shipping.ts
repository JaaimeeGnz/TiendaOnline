import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabaseServer } from '../../../lib/supabase';

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'sessionId es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!supabaseServer) {
      return new Response(
        JSON.stringify({ error: 'Servidor no configurado' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener la sesión de Stripe con detalles de envío
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer'],
    });

    console.log('📦 Sesión de Stripe recuperada:', {
      id: session.id,
      customer_email: session.customer_email,
      shipping: session.shipping_details?.address,
      name: session.shipping_details?.name,
    });

    // Buscar la orden por customer_email o session.id
    const { data: orders, error: orderError } = await supabaseServer
      .from('orders')
      .select('id, user_id')
      .eq('notes', `Session ID: ${sessionId}, Email: ${session.customer_email}`)
      .limit(1);

    if (orderError || !orders || orders.length === 0) {
      console.warn('Orden no encontrada para sessionId:', sessionId);
      return new Response(
        JSON.stringify({ 
          error: 'Orden no encontrada',
          details: orderError?.message || 'No se encontró orden'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const order = orders[0];
    const shippingAddress = session.shipping_details?.address;
    const shippingName = session.shipping_details?.name;

    if (!shippingAddress) {
      console.warn('No hay dirección de envío en Stripe');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Orden encontrada pero sin dirección de envío'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extraer partes del nombre (name suele ser "Nombre Apellido")
    const nameParts = shippingName?.split(' ') || ['', ''];
    const firstName = nameParts[0] || '';
    const fullName = shippingName || '';

    // Parsear la dirección de Stripe
    // Formato en Stripe: street + postal_code + city + state + country
    // Necesitamos dividir la calle en calle y número
    const streetFull = shippingAddress.line1 || '';
    const line2 = shippingAddress.line2 || '';

    // Intentar extraer número de la calle (ej: "Calle Principal 123")
    const streetMatch = streetFull.match(/^(.+?)\s+(\d+)(?:\s*[a-zA-Z]*)?$/);
    let street = streetFull;
    let number = '';

    if (streetMatch) {
      street = streetMatch[1];
      number = streetMatch[2];
    }

    console.log('📍 Dirección parseada:', {
      street,
      number,
      apartment: line2,
      city: shippingAddress.city,
      postal_code: shippingAddress.postal_code,
      state: shippingAddress.state,
      country: shippingAddress.country,
    });

    // Guardar la dirección en la tabla addresses
    const { data: newAddress, error: addressError } = await supabaseServer
      .from('addresses')
      .insert({
        user_id: order.user_id || null,
        name: fullName,
        street: street,
        number: number,
        apartment: line2 || null,
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postal_code: shippingAddress.postal_code || '',
        country: shippingAddress.country || '',
        is_default: false,
      })
      .select()
      .single();

    if (addressError) {
      console.error('❌ Error guardando dirección:', addressError);
      return new Response(
        JSON.stringify({ 
          error: 'Error guardando dirección',
          details: addressError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Dirección guardada:', newAddress.id);

    // Actualizar la orden con el address_id
    const { error: updateError } = await supabaseServer
      .from('orders')
      .update({ 
        address_id: newAddress.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('❌ Error actualizando orden con address_id:', updateError);
      return new Response(
        JSON.stringify({ 
          error: 'Error actualizando orden',
          details: updateError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Orden actualizada con address_id:', newAddress.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Dirección guardada exitosamente',
        address: newAddress,
        orderId: order.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error procesando dirección' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
