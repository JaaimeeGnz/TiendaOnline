import React, { useState, useEffect } from 'react';
import { addToCart } from '../../stores/cart';
import type { CartItem } from '../../stores/cart';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
  stock: number;
  selectedSize?: string;
  imageUrl?: string;
  onAddSuccess?: () => void;
}

export default function AddToCartButton({
  productId,
  productName,
  productSlug,
  price,
  stock,
  selectedSize: initialSelectedSize,
  imageUrl,
  onAddSuccess,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(initialSelectedSize || '');

  // Sincronizar con el select HTML cuando cambia
  useEffect(() => {
    const sizeSelect = document.getElementById('size') as HTMLSelectElement;
    if (sizeSelect) {
      const handleSizeChange = () => {
        setSelectedSize(sizeSelect.value);
      };
      
      sizeSelect.addEventListener('change', handleSizeChange);
      
      // Obtener valor inicial del select si existe
      if (sizeSelect.value) {
        setSelectedSize(sizeSelect.value);
      }
      
      return () => {
        sizeSelect.removeEventListener('change', handleSizeChange);
      };
    }
  }, []);

  const handleAddToCart = async () => {
    // Obtener valor actual del select
    const sizeSelect = document.getElementById('size') as HTMLSelectElement;
    const currentSize = sizeSelect?.value || selectedSize;
    
    console.log('🛒 AddToCart Debug:', {
      selectedSize,
      currentSize,
      sizeSelect: sizeSelect?.value,
      stock
    });
    
    // Validaciones
    if (stock === 0) {
      console.error('❌ Sin stock');
      setFeedback('error');
      return;
    }

    if (!currentSize || currentSize === '') {
      console.error('❌ Sin talla seleccionada');
      setFeedback('error');
      return;
    }

    setIsAdding(true);

    try {
      // 1️⃣ Reservar stock en la BD
      console.log('📦 Reservando stock...', { productId, quantity });
      const reserveResponse = await fetch('/api/cart/reserve-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const reserveData = await reserveResponse.json();

      if (!reserveResponse.ok) {
        console.error('❌ Error al reservar stock:', reserveData);
        setFeedback('error');
        return;
      }

      console.log('✅ Stock reservado:', reserveData);

      // 2️⃣ Añadir al carrito local
      const cartItem: Omit<CartItem, 'quantity'> = {
        id: productId,
        name: productName,
        slug: productSlug,
        price_cents: price,
        size: currentSize,
        image_url: imageUrl,
        stock: reserveData.product.stockRemaining, // Stock actualizado
      };

      console.log('✅ Agregando al carrito:', cartItem);
      addToCart(cartItem, quantity);
      setFeedback('success');

      // Disparar evento personalizado para actualizar el modal del carrito
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: cartItem }));

      // Llamar callback si existe
      onAddSuccess?.();

      // Limpiar feedback después de 2 segundos
      setTimeout(() => setFeedback(null), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setFeedback('error');
      setTimeout(() => setFeedback(null), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(Math.max(1, Math.min(parseInt(e.target.value), stock)));
  };

  const isDisabled = stock === 0 || !selectedSize || isAdding;

  return (
    <div className="space-y-3">
      {/* Selector de cantidad */}
      {stock > 1 && (
        <div className="flex items-center gap-2">
          <label htmlFor="quantity" className="text-sm text-neutral-gray_dark font-sans">
            Cantidad:
          </label>
          <select
            id="quantity"
            value={quantity}
            onChange={handleQuantityChange}
            disabled={isDisabled}
            className="px-3 py-2 border border-primary-300 rounded-sm text-sm font-sans focus:outline-none focus:border-primary-800 disabled:bg-neutral-gray_light disabled:cursor-not-allowed"
          >
            {Array.from({ length: Math.min(stock, 10) }, (_, i) => i + 1).map(
              (q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              )
            )}
          </select>
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`w-full py-3 px-4 font-serif text-sm uppercase tracking-wider transition-all duration-300 ${
          isDisabled
            ? 'bg-neutral-gray_medium text-neutral-white cursor-not-allowed'
            : feedback === 'success'
              ? 'bg-green-700 text-white'
              : feedback === 'error'
                ? 'bg-red-700 text-white'
                : 'bg-primary-800 text-neutral-white hover:bg-primary-900 active:scale-95'
        }`}
      >
        {isAdding ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Añadiendo...
          </span>
        ) : feedback === 'success' ? (
          '✓ Añadido al carrito'
        ) : feedback === 'error' ? (
          '✗ Error'
        ) : stock === 0 ? (
          'Agotado'
        ) : !selectedSize ? (
          'Selecciona una talla'
        ) : (
          'Añadir al carrito'
        )}
      </button>

      {/* Mensaje informativo */}
      {stock > 0 && stock <= 5 && (
        <p className="text-xs text-amber-600 font-sans text-center">
          ⚠ Solo quedan {stock} unidades
        </p>
      )}
    </div>
  );
}
