import { useEffect, useState } from 'react';
import type { SizeStock } from '../../types';

interface StockDisplayProps {
  productId: string;
  initialStock: number;
  selectedSize?: string;
}

export default function StockDisplay({ productId, initialStock, selectedSize }: StockDisplayProps) {
  const [stock, setStock] = useState(initialStock);
  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>([]);
  const [currentSize, setCurrentSize] = useState(selectedSize || '');

  // Escuchar cambios del select de talla
  useEffect(() => {
    const sizeSelect = document.getElementById('size') as HTMLSelectElement;
    if (sizeSelect) {
      const handleSizeChange = () => {
        setCurrentSize(sizeSelect.value);
      };
      sizeSelect.addEventListener('change', handleSizeChange);
      if (sizeSelect.value) {
        setCurrentSize(sizeSelect.value);
      }
      return () => {
        sizeSelect.removeEventListener('change', handleSizeChange);
      };
    }
  }, []);

  // Recargar stock cada 5 segundos
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let lastSizeStocks: string = '';

    const updateStock = async () => {
      if (!document.hidden) {
        try {
          const url = currentSize
            ? `/api/products/${productId}?size=${encodeURIComponent(currentSize)}`
            : `/api/products/${productId}`;
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.product) {
            const newSizeStocksStr = JSON.stringify(data.product.sizeStocks);
            if (newSizeStocksStr !== lastSizeStocks) {
              setSizeStocks(data.product.sizeStocks || []);
              setStock(data.product.stock);
              lastSizeStocks = newSizeStocksStr;
            }
          }
        } catch (error) {
          console.error('Error actualizando stock:', error);
        }
      }
    };

    updateStock();
    interval = setInterval(updateStock, 5000);

    return () => clearInterval(interval);
  }, [productId, currentSize]);

  // Obtener stock de la talla seleccionada
  const currentSizeStock = currentSize
    ? sizeStocks.find(s => s.size === currentSize)?.stock ?? stock
    : stock;

  return (
    <div
      className={`p-4 rounded-sm text-sm font-semibold transition ${
        currentSizeStock > 0
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-700'
      }`}
    >
      {currentSize ? (
        currentSizeStock > 0
          ? `${currentSizeStock} unidades en stock (talla ${currentSize})`
          : `Agotado (talla ${currentSize})`
      ) : (
        currentSizeStock > 0
          ? `${currentSizeStock} unidades en stock (total)`
          : 'Agotado'
      )}
    </div>
  );
}
