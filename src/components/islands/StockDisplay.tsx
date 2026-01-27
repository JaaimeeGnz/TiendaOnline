import { useEffect, useState } from 'react';

interface StockDisplayProps {
  productId: string;
  initialStock: number;
}

export default function StockDisplay({ productId, initialStock }: StockDisplayProps) {
  const [stock, setStock] = useState(initialStock);
  const [loading, setLoading] = useState(false);

  // Recargar stock cada 3 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        
        if (data.product && data.product.stock !== undefined) {
          setStock(data.product.stock);
          console.log('📊 Stock actualizado:', data.product.stock);
        }
      } catch (error) {
        console.error('Error actualizando stock:', error);
      } finally {
        setLoading(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [productId]);

  return (
    <div
      className={`p-4 rounded-sm text-sm font-semibold transition ${
        stock > 0
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-700'
      }`}
    >
      {stock > 0
        ? `${stock} unidades en stock`
        : 'Agotado'}
      {loading && <span className="ml-2 text-xs opacity-50">actualizando...</span>}
    </div>
  );
}
