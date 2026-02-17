import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export const GET: APIRoute = async (context) => {
  try {
    // Obtener parámetros de búsqueda
    const authHeaderEmail = context.request.headers.get('x-customer-email');
    const authHeaderId = context.request.headers.get('x-user-id');
    const url = new URL(context.request.url);
    const emailParam = url.searchParams.get('email');
    const userIdParam = url.searchParams.get('userId');

    const customerEmail = authHeaderEmail || emailParam;
    const userId = authHeaderId || userIdParam;

    if (!customerEmail && !userId) {
      console.warn('❌ No customer email or user ID provided');
      return new Response(
        JSON.stringify({
          orders: [],
          message: 'No se proporcionó identificación de usuario'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`🔍 Buscando pedidos para Email: ${customerEmail} | UserID: ${userId}`);

    let query = supabase
      .from('orders')
      // Seleccionamos todo de orders y Mapeamos order_items a la propiedad "items"
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    // Construir consulta OR: (customer_email = X) OR (user_id = Y)
    if (customerEmail && userId) {
      query = query.or(`customer_email.eq.${customerEmail},user_id.eq.${userId}`);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else if (customerEmail) {
      query = query.eq('customer_email', customerEmail);
    }

    const { data: orders, error: dbError } = await query;

    if (dbError) {
      console.error('❌ Error DB:', dbError.code, dbError.message);
      return new Response(
        JSON.stringify({
          orders: [],
          message: 'Error al consultar base de datos'
        }),
        {
          status: 200, // Devolvemos 200 con array vacío para no romper el frontend
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✅ Pedidos encontrados:', orders?.length || 0);

    return new Response(
      JSON.stringify({ orders: orders || [] }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Orders API error:', error);
    return new Response(
      JSON.stringify({
        orders: [],
        message: 'Error al obtener pedidos'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
