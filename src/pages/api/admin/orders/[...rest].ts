import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../../lib/supabase';
import { sendOrderStatusUpdateEmail } from '../../../../lib/email';

export const prerender = false;

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
      const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
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

      // Enviar correo de actualización de estado si hay cambio relevante
      if (['paid', 'shipped', 'delivered'].includes(status)) {
        try {
          console.log('📧 Preparando email de actualización de estado...');
          
          // Extraer email del campo notes: "Session ID: ..., Email: email@example.com"
          const emailMatch = data[0].notes?.match(/Email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          const orderEmail = emailMatch && emailMatch[1] ? emailMatch[1] : null;
          
          if (orderEmail) {
            console.log('📧 Enviando email de actualización a:', orderEmail);
            const emailResult = await sendOrderStatusUpdateEmail(
              orderEmail,
              data[0].order_number,
              status
            );
            
            if (emailResult.success) {
              console.log('✅ Email de actualización enviado correctamente');
            } else {
              console.warn('⚠️ Error enviando email de actualización:', emailResult.error);
            }
          } else {
            console.warn('⚠️ No se encontró email del cliente para enviar notificación');
          }
        } catch (emailError) {
          console.error('❌ Error enviando email de actualización:', emailError);
          // No fallar la respuesta si hay error en email
        }
      }

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
