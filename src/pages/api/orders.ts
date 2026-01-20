import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export const GET: APIRoute = async (context) => {
  try {
    // Obtener el correo del cliente del header o query params
    const authHeader = context.request.headers.get('x-customer-email');
    const url = new URL(context.request.url);
    const emailParam = url.searchParams.get('email');
    
    const customerEmail = authHeader || emailParam;
    
    if (!customerEmail) {
      console.warn('❌ No customer email provided');
      return new Response(
        JSON.stringify({ 
          orders: [],
          message: 'No hay correo de cliente' 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('🔍 Buscando pedidos para:', customerEmail);

    // Obtener los pedidos filtrando por customer_email
    const { data: orders, error: dbError } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('❌ Error DB:', dbError.code, dbError.message);
      // Si hay error, devolver lista vacía
      return new Response(
        JSON.stringify({ 
          orders: [],
          message: 'No hay pedidos registrados' 
        }),
        {
          status: 200,
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
