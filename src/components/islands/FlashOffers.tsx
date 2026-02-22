import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { FlashOffer, Product } from '../../types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setExpired(true);
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  if (expired) return <span className="text-yellow-300 font-bold">¡Oferta finalizada!</span>;

  return (
    <div className="flex items-center gap-2">
      <div className="bg-white text-jd-black rounded px-2 py-1 min-w-[48px] text-center">
        <span className="text-xl font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
        <p className="text-[10px] uppercase font-bold text-gray-500">Horas</p>
      </div>
      <span className="text-2xl font-bold text-white">:</span>
      <div className="bg-white text-jd-black rounded px-2 py-1 min-w-[48px] text-center">
        <span className="text-xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <p className="text-[10px] uppercase font-bold text-gray-500">Min</p>
      </div>
      <span className="text-2xl font-bold text-white">:</span>
      <div className="bg-white text-jd-black rounded px-2 py-1 min-w-[48px] text-center">
        <span className="text-xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <p className="text-[10px] uppercase font-bold text-gray-500">Seg</p>
      </div>
    </div>
  );
}

export default function FlashOffers() {
  const [offer, setOffer] = useState<FlashOffer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashOffer();
  }, []);

  async function fetchFlashOffer() {
    try {
      const res = await fetch('/api/flash-offers');
      const data = await res.json();

      if (data.offer && data.offer.is_active) {
        const now = new Date().getTime();
        const end = new Date(data.offer.ends_at).getTime();
        if (end > now) {
          setOffer(data.offer);
          const sb = createClient(supabaseUrl, supabaseAnonKey);

          if (data.offer.product_ids && data.offer.product_ids.length > 0) {
            const { data: prods } = await sb
              .from('products')
              .select('*')
              .in('id', data.offer.product_ids);
            if (prods) setProducts(prods);
          } else {
            // Sin productos seleccionados, mostrar los que tengan descuento
            const { data: prods } = await sb
              .from('products')
              .select('*')
              .not('original_price_cents', 'is', null)
              .limit(4);
            if (prods) {
              const saleProducts = prods.filter(
                (p: Product) => p.original_price_cents && p.original_price_cents > p.price_cents
              );
              setProducts(saleProducts);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching flash offer:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !offer || products.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 py-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-yellow-400 rounded-full translate-x-1/2 translate-y-1/2 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              {offer.title}
            </h2>
            {offer.subtitle && (
              <p className="text-red-200 text-sm mt-1">{offer.subtitle}</p>
            )}
            <span className="inline-block mt-2 bg-yellow-400 text-jd-black px-3 py-1 rounded text-sm font-black">
              -{offer.discount_percentage}% DESCUENTO
            </span>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-red-200 text-xs uppercase font-bold mb-2">Termina en:</p>
            <CountdownTimer endsAt={offer.ends_at} />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => {
            const originalPrice = product.price_cents / 100;
            const flashPrice = originalPrice * (1 - offer.discount_percentage / 100);
            const image = product.images?.[0] || '';

            return (
              <a
                key={product.id}
                href={`/productos/${product.slug}`}
                className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-square bg-gray-100">
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                      </svg>
                    </div>
                  )}
                  {/* Flash badge */}
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-black animate-pulse">
                    FLASH
                  </div>
                </div>
                <div className="p-3">
                  {product.brand && (
                    <p className="text-xs text-gray-500 font-bold uppercase">{product.brand}</p>
                  )}
                  <p className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-red-600 font-black">{flashPrice.toFixed(2)}</span>
                    <span className="text-gray-400 text-xs line-through">{originalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
