import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

/**
 * POST /api/orders/cancel
 * Cancela un pedido: restaura stock por talla, elimina order_items y orders.
 * Solo permite cancelar pedidos con status "pending".
 *
 * Body: { "orderId": "uuid" }
 * Headers: x-user-id o x-customer-email para verificar propiedad
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar identidad del usuario
    const userEmail = request.headers.get('x-customer-email');
    const userId = request.headers.get('x-user-id');

    if (!userEmail && !userId) {
      return new Response(
        JSON.stringify({ error: 'No se pudo identificar al usuario' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Usar service role para poder eliminar registros
    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Obtener el pedido con sus items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Pedido no encontrado:', orderError);
      return new Response(
        JSON.stringify({ error: 'Pedido no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verificar que el pedido pertenece al usuario
    const isOwner =
      (userEmail && order.customer_email === userEmail) ||
      (userId && order.user_id === userId);

    if (!isOwner) {
      return new Response(
        JSON.stringify({ error: 'No tienes permiso para cancelar este pedido' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Solo permitir cancelar pedidos pendientes o pagados (no enviados ni entregados)
    const canCancel = ['pending', 'pendiente', 'paid', 'pagado'].includes(order.status.toLowerCase().trim());
    if (!canCancel) {
      return new Response(
        JSON.stringify({
          error: 'Solo se pueden cancelar pedidos en estado pendiente o pagado',
          currentStatus: order.status
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Restaurar stock por talla para cada item del pedido
    const items = order.items || [];
    // 4. Restaurar stock por talla de forma atómica usando stored procedure
    for (const item of items) {
      if (item.product_id && item.size) {
        const { data: result, error: rpcError } = await supabase
          .rpc('increment_stock', {
            p_product_id: item.product_id,
            p_size: item.size,
            p_quantity: item.quantity || 1,
          });

        if (rpcError) {
          // Fallback: actualización directa si la RPC no está disponible
          console.warn('RPC increment_stock no disponible, fallback directo:', rpcError.message);
          const { data: sizeData } = await supabase
            .from('product_sizes')
            .select('id, stock')
            .eq('product_id', item.product_id)
            .eq('size', item.size)
            .single();

          if (sizeData) {
            const newStock = sizeData.stock + (item.quantity || 1);
            await supabase
              .from('product_sizes')
              .update({ stock: newStock, updated_at: new Date().toISOString() })
              .eq('id', sizeData.id);
          }
        }

        console.log(`✅ Stock restaurado: producto ${item.product_id}, talla ${item.size}, +${item.quantity || 1}`);
      }
    }

    // 5. Eliminar factura asociada si existe
    await supabase
      .from('invoices')
      .delete()
      .eq('order_id', orderId);

    // 6. Eliminar order_items (por CASCADE debería borrarse, pero por seguridad lo hacemos explícito)
    const { error: deleteItemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (deleteItemsError) {
      console.error('Error eliminando order_items:', deleteItemsError);
    }

    // 7. Eliminar el pedido
    const { error: deleteOrderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (deleteOrderError) {
      console.error('Error eliminando order:', deleteOrderError);
      return new Response(
        JSON.stringify({ error: 'Error al eliminar el pedido: ' + deleteOrderError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🗑️ Pedido ${orderId} cancelado y eliminado correctamente`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pedido cancelado correctamente'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error en cancel order:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
