import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ request, params }) => {
  try {
    // Obtener la ruta
    const path = params['...rest'];
    console.log('📍 Ruta solicitada:', path);

    // Si es para actualizar estado
    if (path === 'update-status') {
      const { orderId, status } = await request.json();

      console.log('🔄 Actualizar pedido - orderId:', orderId, 'status:', status);

      // Validar que se proporcionen los datos necesarios
      if (!orderId || !status) {
        return new Response(JSON.stringify({ 
          error: 'orderId y status son requeridos' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validar que el estado sea válido
      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return new Response(JSON.stringify({ 
          error: 'Estado de pedido inválido' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Actualizar el pedido en Supabase
      const { data, error } = await supabaseClient
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('❌ Error updating order:', error);
        return new Response(JSON.stringify({ 
          error: 'Error al actualizar el pedido',
          details: error.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!data || data.length === 0) {
        return new Response(JSON.stringify({ 
          error: 'Pedido no encontrado' 
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Pedido actualizado:', data[0].id);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Estado del pedido actualizado correctamente',
        order: data[0]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Ruta no encontrada' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in orders endpoint:', error);
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
