import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  original_price_cents?: number;
  stock: number;
  featured: boolean;
  brand?: string;
  images?: string[];
  created_at?: string | Date;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFav, setIsFav] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar estado de favorito al montar
  useEffect(() => {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    
    // Normalizar: si es un array, convertir a objeto
    if (Array.isArray(favorites)) {
      favorites = {};
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    const isFav = !!favorites[product.id];
    setIsFav(isFav);
    setIsHydrated(true);
  }, [product.id]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    
    // Normalizar: si es un array, convertir a objeto
    if (Array.isArray(favorites)) {
      favorites = {};
    }
    
    if (favorites[product.id]) {
      delete favorites[product.id];
      setIsFav(false);
    } else {
      favorites[product.id] = {
        name: product.name,
        addedAt: new Date().toISOString(),
      };
      setIsFav(true);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    window.dispatchEvent(new Event('favorites-updated'));
  };

  const discount = product.original_price_cents
    ? Math.round(
        ((product.original_price_cents - product.price_cents) /
          product.original_price_cents) *
          100
      )
    : null;

  return (
    <div className="group relative">
      <a
        href={`/productos/${product.slug}`}
        className="block bg-white rounded overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          {/* Favorite Button */}
          {isHydrated && (
            <button
              onClick={handleFavorite}
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:scale-110"
              title={isFav ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
            >
              <svg
                className={`w-6 h-6 transition-colors ${
                  isFav ? 'fill-red-600 text-red-600' : 'text-gray-400 hover:text-red-600'
                }`}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}

          {/* Sale Badge */}
          {discount && discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold z-5">
              -{discount}%
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-5">
              <span className="text-white font-bold">Sin stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {product.brand && (
            <p className="text-xs text-gray-500 uppercase mb-1">{product.brand}</p>
          )}
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-jd-red transition">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-jd-red">
              €{(product.price_cents / 100).toFixed(2)}
            </span>
            {product.original_price_cents && (
              <span className="text-sm text-gray-400 line-through">
                €{(product.original_price_cents / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}
