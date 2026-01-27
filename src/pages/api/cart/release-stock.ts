import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

/**
 * POST /api/cart/release-stock
 * Devuelve el stock cuando se elimina un producto del carrito
 * 
 * Body:
 * {
 *   "productId": "uuid",
 *   "quantity": number
 * }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { productId, quantity } = await request.json();

    // Validaciones
    if (!productId || !quantity || quantity <= 0) {
      return new Response(
        JSON.stringify({
          error: 'productId y quantity son requeridos',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener producto actual
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      console.error('❌ Producto no encontrado:', productId);
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Devolver stock
    const newStock = product.stock + quantity;
    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)
      .select();

    if (updateError) {
      console.error('❌ Error al devolver stock:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error al devolver stock' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Stock devuelto para ${product.name}:`, {
      productId,
      cantidad: quantity,
      stockAnterior: product.stock,
      stockNuevo: newStock,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Stock devuelto correctamente',
        product: {
          id: productId,
          name: product.name,
          stockReleased: quantity,
          stockRemaining: newStock,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ Error en release-stock:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
