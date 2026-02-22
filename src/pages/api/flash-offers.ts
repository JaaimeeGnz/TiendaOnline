import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET /api/flash-offers
 * Endpoint PUBLICO para obtener la oferta flash activa (usado en homepage)
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
      return new Response(JSON.stringify({ offer: null }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ offer: data || null }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ offer: null }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }
};
