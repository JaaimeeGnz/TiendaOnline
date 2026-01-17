import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verificar autenticación (esto debe validarse con tu sesión)
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
    const images_json = formData.get('images_json')?.toString();

    // Validar campos requeridos
    if (!name || !description || !price_cents || !category_id) {
      return new Response(
        JSON.stringify({ error: 'Campos requeridos faltantes' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parsear URLs de imágenes de Cloudinary
    let images: string[] = [];
    if (images_json) {
      try {
        images = JSON.parse(images_json);
      } catch (e) {
        images = [];
      }
    }

    // Generar slug desde el nombre
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Insertar en Supabase
    const { data, error } = await supabaseClient.from('products').insert([
      {
        name,
        slug,
        description,
        price_cents,
        stock,
        category_id,
        images,
        color: color || null,
        material: material || null,
        sku: sku || null,
        featured,
        is_active: true,
      },
    ]);

    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ error: 'Error al crear el producto' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Producto creado exitosamente',
        data,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
