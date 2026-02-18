import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

/**
 * POST /api/cart/release-stock
 * Devuelve el stock de una talla cuando se elimina un producto del carrito
 * 
 * Body:
 * {
 *   "productId": "uuid",
 *   "quantity": number,
 *   "size": string
 * }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { productId, quantity, size } = await request.json();

    // Validaciones
    if (!productId || !quantity || quantity <= 0 || !size) {
      return new Response(
        JSON.stringify({
          error: 'productId, quantity y size son requeridos',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener nombre del producto
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('❌ Producto no encontrado:', productId);
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener stock actual de la talla desde product_sizes
    const { data: sizeData, error: fetchError } = await supabase
      .from('product_sizes')
      .select('id, stock')
      .eq('product_id', productId)
      .eq('size', size)
      .single();

    if (fetchError || !sizeData) {
      console.error('❌ Talla no encontrada:', { productId, size });
      return new Response(
        JSON.stringify({ error: `Talla ${size} no encontrada para este producto` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Devolver stock a la talla
    const newStock = sizeData.stock + quantity;
    const { error: updateError } = await supabase
      .from('product_sizes')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', sizeData.id);

    if (updateError) {
      console.error('❌ Error al devolver stock:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error al devolver stock' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Stock devuelto para ${product.name} talla ${size}:`, {
      productId,
      size,
      cantidad: quantity,
      stockAnterior: sizeData.stock,
      stockNuevo: newStock,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Stock devuelto correctamente',
        product: {
          id: productId,
          name: product.name,
          size,
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
