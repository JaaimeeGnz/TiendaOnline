import type { APIRoute } from 'astro';
import { supabaseServer } from '../../../lib/supabase';

/**
 * Obtiene estadísticas y lista de suscriptores (admin)
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    // Verificar autenticación (en producción, verificar JWT)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener parámetros de query
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Obtener suscriptores
    const { data: subscribers, error: subError, count: totalCount } = await supabaseServer
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (subError) {
      throw subError;
    }

    // Estadísticas
    const { data: stats } = await supabaseServer
      .from('newsletter_subscribers')
      .select('id, used_at', { count: 'exact' })
      .not('used_at', 'is', null);

    return new Response(
      JSON.stringify({
        subscribers,
        stats: {
          totalSubscribers: totalCount,
          codesUsed: stats?.length || 0,
          codesUnused: (totalCount || 0) - (stats?.length || 0),
        },
        pagination: {
          limit,
          offset,
          total: totalCount,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin newsletter error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
