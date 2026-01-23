import type { APIRoute } from 'astro';
import { supabaseServer } from '../../../lib/supabase';

/**
 * Crea un nuevo código de descuento (admin)
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const {
      code,
      discount_type = 'percentage',
      discount_value,
      valid_until,
      max_uses = null,
      min_purchase_cents = 0,
      description,
    } = body;

    // Validar datos
    if (!code || !discount_value) {
      return new Response(
        JSON.stringify({ error: 'Code and discount_value are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear código
    const { data, error } = await supabaseServer
      .from('discount_codes')
      .insert({
        code: code.toUpperCase(),
        discount_type,
        discount_value,
        valid_from: new Date().toISOString(),
        valid_until: valid_until ? new Date(valid_until).toISOString() : null,
        max_uses,
        min_purchase_cents,
        is_active: true,
        created_by: 'admin_system',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating discount code:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin discount creation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Obtiene lista de códigos de descuento (admin)
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const activeOnly = url.searchParams.get('active') === 'true';

    let query = supabaseServer
      .from('discount_codes')
      .select('*', { count: 'exact' });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        codes: data,
        pagination: {
          limit,
          offset,
          total: count,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin discount listing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
