import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { FlashOffer } from '../../types';

interface AdminProduct {
  id: string;
  name: string;
  price_cents: number;
}

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export default function FlashOfferAdmin() {
  const [offer, setOffer] = useState<FlashOffer | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [title, setTitle] = useState('FLASH SALE');
  const [subtitle, setSubtitle] = useState('Ofertas exclusivas por tiempo limitado');
  const [isActive, setIsActive] = useState(false);
  const [endsAt, setEndsAt] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(25);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Cargar productos directamente de Supabase
      const sb = createClient(supabaseUrl, supabaseAnonKey);
      const { data: prodsData } = await sb
        .from('products')
        .select('id, name, price_cents')
        .order('name');

      if (prodsData && prodsData.length > 0) {
        setProducts(prodsData);
      }

      // Cargar oferta flash existente
      const offerRes = await fetch('/api/admin/flash-offers');
      const offerData = await offerRes.json();

      if (offerData.offer) {
        const o = offerData.offer;
        setOffer(o);
        setTitle(o.title);
        setSubtitle(o.subtitle || '');
        setIsActive(o.is_active);
        setDiscountPercentage(o.discount_percentage);
        setSelectedProducts(o.product_ids || []);
        if (o.ends_at) {
          const date = new Date(o.ends_at);
          setEndsAt(date.toISOString().slice(0, 16));
        }
      } else {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        setEndsAt(tomorrow.toISOString().slice(0, 16));
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/flash-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: offer?.id,
          title,
          subtitle,
          is_active: isActive,
          ends_at: new Date(endsAt).toISOString(),
          discount_percentage: discountPercentage,
          product_ids: selectedProducts,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOffer(data.offer);
        setMessage('Oferta flash guardada correctamente');
      } else {
        setMessage('Error: ' + (data.error || 'Error desconocido'));
      }
    } catch (err) {
      setMessage('Error de conexion');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle() {
    const newActive = !isActive;
    setIsActive(newActive);
    setSaving(true);
    try {
      await fetch('/api/admin/flash-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: offer?.id,
          title,
          subtitle,
          is_active: newActive,
          ends_at: new Date(endsAt).toISOString(),
          discount_percentage: discountPercentage,
          product_ids: selectedProducts,
        }),
      });
      setMessage(newActive ? 'Oferta Flash ACTIVADA' : 'Oferta Flash DESACTIVADA');
    } catch {
      setMessage('Error al cambiar estado');
    } finally {
      setSaving(false);
    }
  }

  function toggleProduct(productId: string) {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with toggle */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white uppercase">OFERTAS FLASH</h3>
          <p className="text-red-200 text-sm">Controla las ofertas por tiempo limitado</p>
        </div>
        <button
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-7 w-14 flex-shrink-0 rounded-full transition-colors ${
            isActive ? 'bg-green-500' : 'bg-gray-400'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
              isActive ? 'translate-x-7' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Status band */}
      <div className={`px-4 py-2 text-sm font-bold flex items-center gap-2 ${isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
        <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
        {isActive ? 'Oferta activa -- visible en la tienda' : 'Oferta desactivada -- no visible'}
      </div>

      {/* Form */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Subtítulo</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Finaliza el</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">% Descuento</label>
            <input
              type="number"
              min="5"
              max="90"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {/* Product selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Productos en la oferta ({selectedProducts.length} seleccionados)
          </label>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
            {products.map((p) => (
              <label
                key={p.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                  selectedProducts.includes(p.id) ? 'bg-red-50 border border-red-200' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(p.id)}
                  onChange={() => toggleProduct(p.id)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-sm">{p.name}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  €{(p.price_cents / 100).toFixed(2)}
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Si no seleccionas productos, se mostrarán automáticamente los que tengan descuento.
          </p>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-jd-black text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          {message && <span className="text-sm">{message}</span>}
        </div>
      </div>
    </div>
  );
}
