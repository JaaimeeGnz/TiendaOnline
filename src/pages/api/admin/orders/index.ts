import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, orderId, status } = body;
    
    console.log('📍 Ruta /api/admin/orders:', { action, orderId, status });

    // Si es para actualizar estado
    if (!action || action === 'update-status') {
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
      console.log('🔍 Buscando pedido con ID:', orderId);
      console.log('📝 Actualizando status a:', status);
      
      // Primero verificar que el pedido existe
      const { data: existingOrder, error: selectError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      console.log('🔎 Búsqueda de pedido existente:', { existingOrder, selectError });
      
      if (selectError || !existingOrder) {
        console.error('❌ Pedido no encontrado:', selectError);
        return new Response(JSON.stringify({ 
          error: 'Pedido no encontrado',
          details: selectError?.message || 'No existe este pedido'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Ahora actualizar usando función SQL (sin RLS)
      const nowIso = new Date().toISOString();
      console.log('⏱️ Actualizando status a:', status, 'Timestamp:', nowIso);
      
      const { data: result, error } = await supabaseClient
        .rpc('update_order_status', {
          order_id: orderId,
          new_status: status
        });

      console.log('📊 Resultado de RPC:', { result, error });

      if (error) {
        console.error('❌ Error al actualizar:', error);
        return new Response(JSON.stringify({ 
          error: 'Error al actualizar el pedido',
          details: error.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Pedido actualizado via RPC:', result?.id, 'Status:', result?.status);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Estado del pedido actualizado correctamente',
        order: result || existingOrder
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Acción no encontrada' }), {
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
