import { useEffect, useState } from 'react';

interface StockDisplayProps {
  productId: string;
  initialStock: number;
}

export default function StockDisplay({ productId, initialStock }: StockDisplayProps) {
  const [stock, setStock] = useState(initialStock);
  const [loading, setLoading] = useState(false);

  // Recargar stock cada 5 segundos, pero solo si la pestaña está activa
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let lastStock = initialStock;

    const updateStock = async () => {
      // Solo hacer fetch si la página está visible
      if (!document.hidden) {
        try {
          setLoading(true);
          const response = await fetch(`/api/products/${productId}`);
          const data = await response.json();
          
          if (data.product && data.product.stock !== undefined) {
            // Solo actualizar el estado si el stock cambió
            if (data.product.stock !== lastStock) {
              console.log('📊 Stock actualizado:', lastStock, '->', data.product.stock);
              setStock(data.product.stock);
              lastStock = data.product.stock;
            }
          }
        } catch (error) {
          console.error('Error actualizando stock:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    // Hacer primer update inmediatamente
    updateStock();

    // Luego hacer polling cada 5 segundos
    interval = setInterval(updateStock, 5000);

    // Escuchar cambios de visibilidad de la página
    const handleVisibilityChange = () => {
      console.log('👀 Página visible:', !document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [productId, initialStock]);

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
    </div>
  );
}
