import React, { useState, useEffect } from 'react';

interface FavoriteButtonProps {
  productId: string;
  productName: string;
}

export default function FavoriteButton({ productId, productName }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar estado de favorito al montar
  useEffect(() => {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    
    // Normalizar: si es un array, convertir a objeto
    if (Array.isArray(favorites)) {
      favorites = {};
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    setIsFavorite(!!favorites[productId]);
    setIsLoading(false);
  }, [productId]);

  // Manejar click en favorito
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    
    // Normalizar: si es un array, convertir a objeto
    if (Array.isArray(favorites)) {
      favorites = {};
    }
    
    if (favorites[productId]) {
      delete favorites[productId];
    } else {
      favorites[productId] = {
        name: productName,
        addedAt: new Date().toISOString(),
      };
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);

    // Emitir evento para actualizar badge
    window.dispatchEvent(new Event('favorites-updated'));
  };

  if (isLoading) {
    return null;
  }

  return (
    <button
      onClick={handleToggleFavorite}
      className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:scale-110"
      title={isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
      aria-label={isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
    >
      <svg
        className={`w-6 h-6 transition-colors ${
          isFavorite ? 'fill-red-600 text-red-600' : 'text-gray-400 hover:text-red-600'
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
  );
}
