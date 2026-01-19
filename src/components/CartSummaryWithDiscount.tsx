/**
 * Ejemplo de integración de descuentos en el carrito
 * Este archivo muestra cómo usar el sistema de códigos de descuento
 */

import React, { useState } from 'react';
import DiscountCodeInput from './DiscountCodeInput';
import DiscountBadge from './DiscountBadge';
import {
  calculateCartTotal,
  formatPrice,
  calculateDiscountedPrice,
} from '../../lib/discountCalculations';

interface CartItem {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
}

interface CartSummaryProps {
  items: CartItem[];
}

export default function CartSummaryWithDiscount({ items }: CartSummaryProps) {
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const handleApplyCode = (code: string, discount: number) => {
    setAppliedCode(code);
    setDiscountPercentage(discount);
  };

  const handleRemoveCode = () => {
    setAppliedCode(null);
    setDiscountPercentage(0);
  };

  // Calcular totales
  const total = calculateCartTotal(
    items.map((item) => ({
      priceCents: item.priceCents,
      quantity: item.quantity,
    })),
    discountPercentage
  );

  const subtotalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen del Carrito</h2>

      {/* Items */}
      <div className="space-y-4 mb-6 border-b pb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-start text-gray-700"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                Cantidad: {item.quantity} × {formatPrice(item.priceCents)}
              </p>
            </div>
            <p className="font-semibold">
              {formatPrice(item.priceCents * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Descuento */}
      {discountPercentage > 0 && (
        <div className="mb-6">
          <DiscountBadge
            discountPercentage={discountPercentage}
            originalPrice={subtotalCents}
            showSavings={true}
          />
        </div>
      )}

      {/* Input para código de descuento */}
      <div className="mb-6 border-t pt-6">
        <DiscountCodeInput
          onApply={handleApplyCode}
          onRemove={handleRemoveCode}
          appliedCode={appliedCode || undefined}
        />
      </div>

      {/* Totales */}
      <div className="space-y-3 border-t pt-6">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span className="font-medium">{total.subtotal}</span>
        </div>

        {discountPercentage > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento ({discountPercentage}%)</span>
            <span className="font-medium">-{total.discount}</span>
          </div>
        )}

        <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3 mt-3">
          <span>Total</span>
          <span className="text-green-600">{total.total}</span>
        </div>
      </div>

      {/* Botón de checkout */}
      <button
        onClick={() => {
          console.log('Procesar compra con código:', appliedCode);
          // Aquí iría la lógica de checkout
        }}
        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
      >
        Proceder al Pago
      </button>

      {/* Avisos */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Los precios incluyen IVA. Envío calculado al checkout.
      </p>
    </div>
  );
}

/* 
 * EJEMPLO DE USO EN UNA PÁGINA:
 * 
 * import CartSummaryWithDiscount from '../components/CartSummaryWithDiscount';
 * 
 * const items = [
 *   { id: '1', name: 'Camisa Oxford', priceCents: 8999, quantity: 1 },
 *   { id: '2', name: 'Pantalones', priceCents: 12999, quantity: 2 },
 * ];
 * 
 * <CartSummaryWithDiscount items={items} />
 */
