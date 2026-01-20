/**
 * SearchBar.tsx
 * Barra de búsqueda en tiempo real con sugerencias
 */

import { useState, useRef, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Buscar productos mientras escribes
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Esperar 300ms después de que el usuario deja de escribir

    return () => clearTimeout(timer);
  }, [query]);

  // Cerrar resultados cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/productos?search=${encodeURIComponent(query)}`;
    }
  };

  const handleResultClick = (slug: string) => {
    window.location.href = `/productos/${slug}`;
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl mx-8">
      <div className="flex w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar en JGMarket: Nike, Adidas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setShowResults(true)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-jd-turquoise text-sm"
        />
      </div>

      {/* Dropdown de resultados */}
      {showResults && (results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              Buscando...
            </div>
          )}
          
          {results.length > 0 && (
            <>
              <div className="border-b border-gray-200 p-2 text-xs text-gray-500 font-semibold">
                {results.length} resultados encontrados
              </div>
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleResultClick(product.slug)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 transition flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-jd-black group-hover:text-jd-red">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${(product.price_cents / 100).toFixed(2)}
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-jd-red ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </>
          )}

          {!isLoading && results.length === 0 && query.trim().length > 0 && (
            <div className="p-4 text-center text-gray-500">
              No se encontraron productos
            </div>
          )}
        </div>
      )}
    </div>
  );
}
