import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

interface FavoriteItem {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price_cents: number;
    image?: string;
    description?: string;
  };
}

export default function UserFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener sesión del usuario
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('No estás autenticado');
        setLoading(false);
        return;
      }

      setUserEmail(session.user.email || '');

      // Intentar cargar favoritos de la tabla favorites (si existe)
      const { data, error: favError } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          user_id,
          created_at,
          products(
            id,
            name,
            price_cents,
            image,
            description
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (favError) {
        console.warn('Tabla favorites no disponible:', favError.message);
        setError('La tabla de favoritos no está configurada aún.');
        setFavorites([]);
      } else if (data) {
        // Mapear la estructura de la respuesta
        const mappedFavorites = data.map(fav => ({
          ...fav,
          product: Array.isArray(fav.products) ? fav.products[0] : fav.products,
        })) as FavoriteItem[];
        setFavorites(mappedFavorites);
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string, productName: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) {
        alert('Error al eliminar de favoritos');
        return;
      }

      setFavorites(favorites.filter(f => f.id !== favoriteId));
      alert(`"${productName}" eliminado de favoritos`);
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Error al eliminar de favoritos');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jd-turquoise"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">
          <strong>⚠️ {error}</strong>
        </p>
        <p className="text-sm text-yellow-600 mt-2">
          Contacta con soporte para más información.
        </p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">❤️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Sin favoritos aún</h3>
        <p className="text-gray-600 mb-6">
          Agrega productos a tu lista de favoritos para acceder a ellos fácilmente
        </p>
        <a
          href="/productos"
          className="inline-block px-6 py-3 bg-jd-turquoise text-white font-bold rounded-lg hover:bg-jd-turquoise/90 transition"
        >
          Explorar Productos
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>{favorites.length}</strong> producto{favorites.length !== 1 ? 's' : ''} en tu lista de favoritos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((fav) => (
          <div key={fav.id} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
            {/* Imagen del producto */}
            {fav.product?.image && (
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={fav.product.image}
                  alt={fav.product.name}
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
                <button
                  onClick={() => removeFavorite(fav.id, fav.product?.name || 'Producto')}
                  className="absolute top-3 right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition font-bold text-lg"
                  title="Quitar de favoritos"
                >
                  ❤️
                </button>
              </div>
            )}

            {/* Información del producto */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                {fav.product?.name || 'Producto desconocido'}
              </h3>

              {fav.product?.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {fav.product.description}
                </p>
              )}

              {fav.product?.price_cents ? (
                <p className="text-2xl font-black text-jd-turquoise mb-4">
                  {(fav.product.price_cents / 100).toFixed(2)}€
                </p>
              ) : null}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.location.href = `/producto/${fav.product_id}`;
                  }}
                  className="flex-1 px-4 py-2 bg-jd-turquoise text-white font-bold rounded-lg hover:bg-jd-turquoise/90 transition text-sm"
                >
                  Ver Producto
                </button>
                <button
                  onClick={() => removeFavorite(fav.id, fav.product?.name || 'Producto')}
                  className="flex-1 px-4 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition text-sm"
                >
                  ❌ Quitar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
