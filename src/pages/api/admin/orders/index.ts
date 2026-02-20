import type { APIRoute } from 'astro';
import { supabaseClient, supabaseServer } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, orderId, status, message } = body;
    
    console.log('📍 Ruta /api/admin/orders:', { action, orderId, status, message });

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
      
      // Ahora actualizar usando función SQL (sin RLS) y guardar el mensaje
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

      // Si hay un mensaje, guardarlo en el campo notes
      if (message) {
        console.log('💬 Guardando mensaje:', message);
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({ notes: message, updated_at: nowIso })
          .eq('id', orderId);
        
        if (updateError) {
          console.warn('⚠️ Advertencia al guardar mensaje:', updateError);
        } else {
          console.log('✅ Mensaje guardado exitosamente');
        }
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

    // Si es para guardar solo el mensaje (sin cambiar estado)
    if (action === 'save-message') {
      if (!orderId || !message) {
        return new Response(JSON.stringify({ 
          error: 'orderId y message son requeridos' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Usar el cliente de servidor para actualizar (tiene permisos de admin)
      if (!supabaseServer) {
        return new Response(JSON.stringify({ 
          error: 'Cliente de servidor no configurado'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Verificar que el pedido existe
      const { data: existingOrder, error: selectError } = await supabaseServer
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
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

      // Guardar el mensaje sin cambiar el estado
      const nowIso = new Date().toISOString();
      console.log('💬 Guardando solo mensaje:', message);
      
      const { error: updateError } = await supabaseServer
        .from('orders')
        .update({ notes: message, updated_at: nowIso })
        .eq('id', orderId);
      
      if (updateError) {
        console.error('❌ Error al guardar mensaje:', updateError);
        return new Response(JSON.stringify({ 
          error: 'Error al guardar el mensaje',
          details: updateError.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Mensaje guardado exitosamente para pedido:', orderId);

      // Retornar la orden actualizada con el nuevo mensaje
      const updatedOrderData = { ...existingOrder, notes: message, updated_at: nowIso };
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Mensaje guardado exitosamente',
        order: updatedOrderData
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Si es para eliminar un pedido
    if (action === 'delete-order') {
      if (!orderId) {
        return new Response(JSON.stringify({ 
          error: 'orderId es requerido' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!supabaseServer) {
        return new Response(JSON.stringify({ 
          error: 'Cliente de servidor no configurado'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Verificar que el pedido existe
      const { data: existingOrder, error: selectError } = await supabaseServer
        .from('orders')
        .select('id, order_number, total_cents, status')
        .eq('id', orderId)
        .single();

      if (selectError || !existingOrder) {
        console.error('❌ Pedido no encontrado para eliminar:', selectError);
        return new Response(JSON.stringify({ 
          error: 'Pedido no encontrado',
          details: selectError?.message || 'No existe este pedido'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Eliminar registros relacionados primero (order_items, invoices, refunds)
      // Eliminar refunds asociados
      await supabaseServer
        .from('refunds')
        .delete()
        .eq('order_id', orderId);

      // Eliminar invoices asociadas
      await supabaseServer
        .from('invoices')
        .delete()
        .eq('order_id', orderId);

      // Eliminar order_items asociados
      await supabaseServer
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      // Finalmente eliminar el pedido
      const { error: deleteError } = await supabaseServer
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (deleteError) {
        console.error('❌ Error al eliminar pedido:', deleteError);
        return new Response(JSON.stringify({ 
          error: 'Error al eliminar el pedido',
          details: deleteError.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Pedido eliminado exitosamente:', orderId);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Pedido eliminado correctamente',
        deletedOrder: existingOrder
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
