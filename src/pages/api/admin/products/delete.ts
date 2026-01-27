import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'ID de producto inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Eliminar el producto
    const { error } = await supabaseClient
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Producto eliminado correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in delete API:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar el producto' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
