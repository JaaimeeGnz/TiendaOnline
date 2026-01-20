import type { APIRoute } from 'astro';
import { supabaseClient } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const idsParam = url.searchParams.get('ids');
    
    if (!idsParam) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ids = idsParam.split(',').map(id => id.trim()).filter(id => id.length > 0);
    
    console.log('🔍 API: IDs recibidos:', ids);
    console.log('🔍 API: Cantidad de IDs:', ids.length);
    
    if (ids.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Primero obtén todos los productos para debugging
    const { data: allProducts, error: allError } = await supabaseClient
      .from('products')
      .select('id, name, slug');
    
    console.log('🔍 API: Total productos en BD:', allProducts?.length || 0);
    if (allProducts && allProducts.length > 0) {
      const firstThree = allProducts.slice(0, 3);
      console.log('🔍 API: Primeros 3 productos (ID):', firstThree.map(p => p.id));
    }
    
    // Ahora intenta con .in()
    const { data: products, error } = await supabaseClient
      .from('products')
      .select('*')
      .in('id', ids);

    console.log('🔍 API: Error en .in():', error);
    console.log('🔍 API: Productos encontrados con .in():', products?.length || 0);
    
    // Filtra manualmente si .in() no funcionó
    let resultProducts = products || [];
    if (!resultProducts || resultProducts.length === 0) {
      console.log('🔍 API: .in() devolvió vacío, intentando filtro manual...');
      if (allProducts) {
        resultProducts = allProducts.filter(p => ids.includes(p.id));
        console.log('🔍 API: Después de filtro manual:', resultProducts.length);
      }
    }

    if (error) {
      console.error('Error fetching products:', error);
      return new Response(JSON.stringify([]), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(resultProducts), {
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
