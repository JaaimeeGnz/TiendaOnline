import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../../lib/supabase';

/**
 * Endpoint para actualizar un producto existente
 * PUT /api/admin/products/[id]
 */
export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de producto no encontrado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();

    // Obtener datos del formulario
    const name = formData.get('name')?.toString();
    const description = formData.get('description')?.toString();
    const price_cents = parseInt(formData.get('price_cents')?.toString() || '0');
    const stock = parseInt(formData.get('stock')?.toString() || '0');
    const category_id = formData.get('category_id')?.toString();
    const color = formData.get('color')?.toString();
    const material = formData.get('material')?.toString();
    const sku = formData.get('sku')?.toString();
    const featured = formData.get('featured') === 'on';
    const original_price_cents = formData.get('original_price_cents')?.toString();
    const is_active = formData.get('is_active') === 'on';
    const images_json = formData.get('images_json')?.toString();
    const existing_images_json = formData.get('existing_images')?.toString();

    // Validar campos requeridos
    if (!name || !description || !price_cents || !category_id) {
      return new Response(
        JSON.stringify({ error: 'Campos requeridos faltantes' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Combinar imágenes existentes con nuevas
    let images: string[] = [];
    
    // Parsear imágenes existentes
    if (existing_images_json) {
      try {
        images = JSON.parse(existing_images_json);
      } catch (e) {
        images = [];
      }
    }

    // Agregar nuevas imágenes
    if (images_json) {
      try {
        const newImages = JSON.parse(images_json);
        images = [...images, ...newImages];
      } catch (e) {
        // Si falla el parse, mantener las existentes
      }
    }

    // Actualizar en Supabase
    const { error } = await supabaseClient
      .from('products')
      .update({
        name,
        description,
        price_cents,
        stock,
        category_id,
        images: images.length > 0 ? images : null,
        color: color || null,
        material: material || null,
        sku: sku || null,
        featured,
        is_active,
        original_price_cents: original_price_cents ? parseInt(original_price_cents) : null,
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ error: 'Error al actualizar el producto' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Redirigir a la lista de productos
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/admin/productos',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
