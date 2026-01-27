import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { productId, categoryId } = await request.json();

    if (!productId || !categoryId) {
      return new Response(
        JSON.stringify({ error: 'Parámetros inválidos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Actualizar la categoría del producto
    const { error } = await supabaseClient
      .from('products')
      .update({ category_id: categoryId })
      .eq('id', productId);

    if (error) {
      console.error('Error updating product category:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Categoría actualizada correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in update-category API:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar la categoría' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
