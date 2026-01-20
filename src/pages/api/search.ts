import type { APIRoute } from 'astro';
import { supabaseClient } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const query = url.searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const searchTerm = `%${query.trim().toLowerCase()}%`;

    const { data: products, error } = await supabaseClient
      .from('products')
      .select('id, name, slug, price_cents, is_active')
      .ilike('name', searchTerm)
      .eq('is_active', true)
      .limit(10);

    if (error) {
      console.error('Error searching products:', error);
      return new Response(JSON.stringify([]), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(products || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
