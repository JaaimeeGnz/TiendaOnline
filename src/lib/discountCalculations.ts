// Utility para manejar cálculos de descuentos

/**
 * Calcula el precio con descuento
 * @param priceCents - Precio en céntimos
 * @param discountPercentage - Porcentaje de descuento (0-100)
 * @returns Precio con descuento en céntimos
 */
export function calculateDiscountedPrice(
  priceCents: number,
  discountPercentage: number
): number {
  const discountCents = Math.round(priceCents * (discountPercentage / 100));
  return priceCents - discountCents;
}

/**
 * Calcula la cantidad ahorrada
 * @param priceCents - Precio en céntimos
 * @param discountPercentage - Porcentaje de descuento (0-100)
 * @returns Cantidad ahorrada en céntimos
 */
export function calculateSavings(
  priceCents: number,
  discountPercentage: number
): number {
  return Math.round(priceCents * (discountPercentage / 100));
}

/**
 * Convierte céntimos a formato de moneda
 * @param cents - Cantidad en céntimos
 * @param currency - Símbolo de moneda (default: €)
 * @returns Formato de moneda (ej: €59.99)
 */
export function formatPrice(cents: number, currency: string = '€'): string {
  const euros = (cents / 100).toFixed(2);
  return `${currency}${euros}`;
}

/**
 * Calcula el total del carrito con descuento
 * @param items - Array de items con precio en céntimos
 * @param discountPercentage - Porcentaje de descuento
 * @returns Objeto con subtotal, descuento y total
 */
export function calculateCartTotal(
  items: { priceCents: number; quantity: number }[],
  discountPercentage: number = 0
) {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  const discountCents = Math.round(subtotalCents * (discountPercentage / 100));
  const totalCents = subtotalCents - discountCents;

  return {
    subtotalCents,
    subtotal: formatPrice(subtotalCents),
    discountCents,
    discount: formatPrice(discountCents),
    totalCents,
    total: formatPrice(totalCents),
    discountPercentage,
  };
}

/**
 * Aplica múltiples descuentos (si es necesario)
 * @param priceCents - Precio en céntimos
 * @param discounts - Array de porcentajes de descuento
 * @returns Precio final en céntimos
 */
export function applyMultipleDiscounts(
  priceCents: number,
  discounts: number[]
): number {
  let finalPrice = priceCents;
  
  for (const discount of discounts) {
    const discountAmount = Math.round(finalPrice * (discount / 100));
    finalPrice -= discountAmount;
  }
  
  return finalPrice;
}
