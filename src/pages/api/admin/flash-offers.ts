import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET /api/admin/flash-offers
 * Obtiene la oferta flash actual
 */
export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabase
      .from('flash_offers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ offer: data || null }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * POST /api/admin/flash-offers
 * Crea o actualiza la oferta flash
 * Body: { title, subtitle, is_active, ends_at, discount_percentage, product_ids }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, title, subtitle, is_active, ends_at, discount_percentage, product_ids } = body;

    if (id) {
      // Actualizar existente
      const { data, error } = await supabase
        .from('flash_offers')
        .update({
          title: title || 'FLASH SALE',
          subtitle: subtitle || '',
          is_active: is_active ?? false,
          ends_at: ends_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          discount_percentage: discount_percentage || 20,
          product_ids: product_ids || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ offer: data }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Crear nueva
      const { data, error } = await supabase
        .from('flash_offers')
        .insert({
          title: title || 'FLASH SALE',
          subtitle: subtitle || '',
          is_active: is_active ?? false,
          ends_at: ends_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          discount_percentage: discount_percentage || 20,
          product_ids: product_ids || [],
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ offer: data }), {
        status: 201, headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
