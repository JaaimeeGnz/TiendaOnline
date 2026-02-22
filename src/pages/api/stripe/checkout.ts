import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

// Cliente con service_role para operaciones atómicas de stock
const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const POST: APIRoute = async (context) => {
  let body: any = null;
  try {
    body = await context.request.json();
    const { items, userId, email } = body;

    // Token es OPCIONAL - solo requerido si userId está presente
    let token: string | null = null;
    const authHeader = context.request.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Quitar "Bearer "
    }

    // CREAR cliente autenticado SOLO si hay token
    let supabaseAuth = supabase;
    if (token) {
      supabaseAuth = createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        }
      );
    }

    // Email es REQUERIDO, pero userId es OPCIONAL (invitados)
    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: 'El correo es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No items in cart' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ====== VERIFICACIÓN Y DECREMENTO ATÓMICO DE STOCK ======
    // Preparar items para la función atómica process_checkout_stock
    const stockItems = items
      .filter((item: any) => item.id && item.size)
      .map((item: any) => ({
        product_id: item.id,
        size: item.size,
        quantity: item.quantity || 1,
      }));

    if (stockItems.length > 0) {
      // Usar RPC para decrementar stock atómicamente (con SELECT ... FOR UPDATE)
      const { data: stockResult, error: stockError } = await supabaseAdmin
        .rpc('process_checkout_stock', {
          p_items: JSON.stringify(stockItems),
        });

      if (stockError) {
        console.error('❌ Error en process_checkout_stock RPC:', stockError);
        // Fallback: verificar y decrementar uno por uno
        for (const stockItem of stockItems) {
          const { data: decrementOk, error: decError } = await supabaseAdmin
            .rpc('decrement_stock', {
              p_product_id: stockItem.product_id,
              p_size: stockItem.size,
              p_quantity: stockItem.quantity,
            });

          if (decError || decrementOk === false) {
            // Restaurar stock de los items ya decrementados
            const itemIndex = stockItems.indexOf(stockItem);
            for (let i = 0; i < itemIndex; i++) {
              await supabaseAdmin.rpc('increment_stock', {
                p_product_id: stockItems[i].product_id,
                p_size: stockItems[i].size,
                p_quantity: stockItems[i].quantity,
              });
            }
            return new Response(
              JSON.stringify({ 
                error: `Sin stock suficiente para la talla ${stockItem.size}. Actualiza tu carrito.` 
              }),
              { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
        console.log('✅ Stock decrementado correctamente (fallback individual)');
      } else {
        // Verificar resultado de la función atómica
        const result = typeof stockResult === 'string' ? JSON.parse(stockResult) : stockResult;
        if (!result?.success) {
          console.error('❌ Stock insuficiente:', result?.error);
          return new Response(
            JSON.stringify({ 
              error: result?.error || 'Stock insuficiente para uno o más productos' 
            }),
            { status: 409, headers: { 'Content-Type': 'application/json' } }
          );
        }
        console.log('✅ Stock decrementado atómicamente:', result);
      }
    }

    // Calcular totales (redondear a enteros para evitar decimales)
    const subtotalCents = Math.round(items.reduce((sum: number, item: any) => sum + (item.price * 100 * item.quantity), 0));
    const shippingCents = subtotalCents >= 5000 ? 0 : 1000; // Envío gratis si >= €50
    const totalCents = subtotalCents + shippingCents;

    // Convertir items del carrito a formato de Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.brand ? `Brand: ${item.brand}` : undefined,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${import.meta.env.PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${import.meta.env.PUBLIC_SITE_URL}/cancel`,
      customer_email: email,
      ...(userId && { client_reference_id: userId }),
      shipping_address_collection: {
        allowed_countries: ['ES', 'FR', 'IT', 'DE', 'PT'],
      },
    });

    // Guardar orden en Supabase SIEMPRE (con o sin userId)
    let orderNumber = null;
    if (session.id && email) {
      try {
        console.log('📝 Intentando guardar orden:');
        console.log('  - session_id:', session.id);
        console.log('  - customer_email:', email);
        console.log('  - items:', items.length, 'productos');
        console.log('  - total_cents:', totalCents);

        // Generar order_number único
        const orderNum = `PED-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const { data, error: dbError } = await supabaseAuth.from('orders').insert({
          user_id: userId,
          order_number: orderNum,
          total_cents: totalCents,
          status: 'pending',
          payment_method: 'stripe',
          notes: `Session ID: ${session.id}, Email: ${email}`,
        }).select();

        if (dbError) {
          console.error('Error Supabase:', {
            code: dbError.code,
            message: dbError.message,
            details: dbError.details,
            hint: dbError.hint,
          });
        } else {
          console.log('Pedido guardado correctamente:', data);
          // Obtener el order_number
          if (data && data[0] && data[0].order_number) {
            orderNumber = data[0].order_number;
            console.log('Número de pedido:', orderNumber);
          }

          // Enviar email de confirmación

          // INSERTAR ITEMS EN ORDER_ITEMS
          if (data && data[0] && data[0].id && items && items.length > 0) {
            const orderId = data[0].id;
            const orderItemsData = items.map((item: any) => ({
              order_id: orderId,
              product_id: item.id || null, // Asumimos que item.id es el UUID del producto
              product_name: item.name,
              quantity: item.quantity,
              price_cents: Math.round(item.price * 100),
              total_cents: Math.round(item.price * 100 * item.quantity),
              size: item.size || null,
            }));

            const { error: itemsError } = await supabaseAuth
              .from('order_items')
              .insert(orderItemsData);

            if (itemsError) {
              console.error('Error guardando items del pedido:', itemsError);
            } else {
              console.log('Items guardados correctamente en order_items');
            }
          }

          try {
            console.log('📧 Enviando email de confirmación...');
            const emailResponse = await fetch(
              `${import.meta.env.PUBLIC_SITE_URL}/api/email/send-order-confirmation`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: email,
                  orderNumber: orderNumber || session.id.substring(0, 8),
                  items: items,
                  subtotal: subtotalCents,
                  shipping: shippingCents,
                  total: totalCents,
                })
              }
            );

            if (emailResponse.ok) {
              console.log('Email de confirmación enviado');
            } else {
              console.warn('Error enviando email de confirmación:', await emailResponse.text());
            }
          } catch (emailError) {
            console.error('Error en llamada a send-order-confirmation:', emailError);
          }
        }
      } catch (dbError) {
        console.error('Error guardando orden:', dbError);
      }
    } else {
      console.warn('No se puede guardar - session.id:', session.id, 'email:', email);
    }

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Stripe checkout error:', error);

    // Restaurar stock si ya se decrementó y hubo error
    if (body?.items) {
      const restoreItems = body.items.filter((item: any) => item.id && item.size);
      for (const item of restoreItems) {
        try {
          await supabaseAdmin.rpc('increment_stock', {
            p_product_id: item.id,
            p_size: item.size,
            p_quantity: item.quantity || 1,
          });
        } catch (restoreErr) {
          console.error('Error restaurando stock:', restoreErr);
        }
      }
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Error creating checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
