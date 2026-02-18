import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

/**
 * POST /api/cart/reserve-stock
 * Reduce el stock de una talla específica cuando se añade un producto al carrito
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
      console.error('Producto no encontrado:', productId);
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener stock de la talla específica desde product_sizes
    const { data: sizeData, error: fetchError } = await supabase
      .from('product_sizes')
      .select('id, stock')
      .eq('product_id', productId)
      .eq('size', size)
      .single();

    if (fetchError || !sizeData) {
      console.error('Talla no encontrada:', { productId, size });
      return new Response(
        JSON.stringify({ error: `Talla ${size} no encontrada para este producto` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar stock disponible para esa talla
    if (sizeData.stock < quantity) {
      console.warn(`Stock insuficiente para ${product.name} talla ${size}:`, {
        disponible: sizeData.stock,
        solicitado: quantity,
      });
      return new Response(
        JSON.stringify({
          error: `Stock insuficiente para talla ${size}. Disponible: ${sizeData.stock}`,
          available: sizeData.stock,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Reducir stock de la talla
    const newStock = sizeData.stock - quantity;
    const { error: updateError } = await supabase
      .from('product_sizes')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', sizeData.id);

    if (updateError) {
      console.error('Error al actualizar stock:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error al actualizar stock' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Stock reservado para ${product.name} talla ${size}:`, {
      productId,
      size,
      cantidad: quantity,
      stockAnterior: sizeData.stock,
      stockNuevo: newStock,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Stock reservado correctamente',
        product: {
          id: productId,
          name: product.name,
          size,
          stockReserved: quantity,
          stockRemaining: newStock,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error en reserve-stock:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
