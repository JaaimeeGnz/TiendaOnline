import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

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

interface ProductFiltersProps {
  products: Product[];
  brands: string[];
}

export default function ProductFilters({ products, brands }: ProductFiltersProps) {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [priceFilter, setPriceFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [saleOnly, setSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    let result = [...products];

    // Filtro de precio
    if (priceFilter !== 'all') {
      result = result.filter(product => {
        const price = product.price_cents / 100;
        switch (priceFilter) {
          case '0-50':
            return price < 50;
          case '50-100':
            return price >= 50 && price < 100;
          case '100-200':
            return price >= 100 && price < 200;
          case '200+':
            return price >= 200;
          default:
            return true;
        }
      });
    }

    // Filtro de marca
    if (brandFilter !== 'all') {
      result = result.filter(product => product.brand === brandFilter);
    }

    // Filtro de rebajas
    if (saleOnly) {
      result = result.filter(product => 
        product.original_price_cents && 
        product.original_price_cents > product.price_cents
      );
    }

    // Ordenamiento
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price_cents - b.price_cents);
        break;
      case 'price-high':
        result.sort((a, b) => b.price_cents - a.price_cents);
        break;
      case 'newest':
        result.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case 'featured':
      default:
        result.sort((a, b) => {
          if (a.featured === b.featured) return 0;
          return a.featured ? -1 : 1;
        });
    }

    setFilteredProducts(result);
  }, [priceFilter, brandFilter, saleOnly, sortBy, products]);

  return (
    <>
      <style>{`
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .filters-container {
          max-height: 400px;
          overflow-y: scroll;
          overflow-x: hidden;
          padding-right: 8px;
        }
        .filters-container::-webkit-scrollbar {
          width: 6px;
        }
        .filters-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .filters-container::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        .filters-container::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded p-4 sticky top-24 filters-container">
            <h3 className="font-bold text-sm uppercase mb-4 pb-2 border-b border-gray-200">
              Filtros
            </h3>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-bold text-sm uppercase mb-3">Precio</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value="all"
                    checked={priceFilter === 'all'}
                    onChange={(e) => setPriceFilter(e.currentTarget.value)}
                    className="text-jd-turquoise focus:ring-jd-turquoise"
                  />
                  Todos
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value="0-50"
                    checked={priceFilter === '0-50'}
                    onChange={(e) => setPriceFilter(e.currentTarget.value)}
                    className="text-jd-turquoise focus:ring-jd-turquoise"
                  />
                  Menos de €50
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value="50-100"
                    checked={priceFilter === '50-100'}
                    onChange={(e) => setPriceFilter(e.currentTarget.value)}
                    className="text-jd-turquoise focus:ring-jd-turquoise"
                  />
                  €50 - €100
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value="100-200"
                    checked={priceFilter === '100-200'}
                    onChange={(e) => setPriceFilter(e.currentTarget.value)}
                    className="text-jd-turquoise focus:ring-jd-turquoise"
                  />
                  €100 - €200
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value="200+"
                    checked={priceFilter === '200+'}
                    onChange={(e) => setPriceFilter(e.currentTarget.value)}
                    className="text-jd-turquoise focus:ring-jd-turquoise"
                  />
                  Más de €200
                </label>
              </div>
            </div>

            {/* Brands Filter */}
            {brands && brands.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-sm uppercase mb-3">Marca</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="radio"
                      name="brand"
                      value="all"
                      checked={brandFilter === 'all'}
                      onChange={(e) => setBrandFilter(e.currentTarget.value)}
                      className="text-jd-turquoise focus:ring-jd-turquoise"
                    />
                    Todas
                  </label>
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="radio"
                        name="brand"
                        value={brand}
                        checked={brandFilter === brand}
                        onChange={(e) => setBrandFilter(e.currentTarget.value)}
                        className="text-jd-turquoise focus:ring-jd-turquoise"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sale Only */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-bold text-jd-red cursor-pointer">
                <input
                  type="checkbox"
                  checked={saleOnly}
                  onChange={(e) => setSaleOnly(e.currentTarget.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-jd-red focus:ring-jd-red"
                />
                SOLO REBAJAS
              </label>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Sort and Results Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-gray-500">{filteredProducts.length} productos</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.currentTarget.value)}
                className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-jd-turquoise"
              >
                <option value="featured">Destacados</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
                <option value="newest">Más Recientes</option>
              </select>
            </div>
          </div>

          {/* Products Display */}
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded p-12 text-center col-span-3">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-xl font-bold text-jd-black mb-2">
                No hay productos
              </h3>
              <p className="text-gray-500 mb-6">
                No se encontraron productos que coincidan con los filtros seleccionados
              </p>
              <a
                href="/productos"
                className="inline-block px-6 py-3 bg-jd-turquoise text-white font-bold uppercase text-sm hover:bg-opacity-90 transition"
              >
                Ver todos los productos
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
