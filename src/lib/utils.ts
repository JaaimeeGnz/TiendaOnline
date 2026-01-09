/**
 * Utilidades generales de la aplicación
 */

/**
 * Convierte céntimos a formato de moneda (EUR)
 * @param cents Precio en céntimos
 * @returns String formateado (ej: "59,99 €")
 */
export function formatPrice(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(euros);
}

/**
 * Convierte una cadena a slug
 * @param str Cadena a convertir
 * @returns Slug formateado
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Genera una URL de imagen de Supabase Storage
 * @param bucket Nombre del bucket
 * @param path Ruta del archivo
 * @returns URL completa de la imagen
 */
export function getImageUrl(bucket: string, path: string): string {
  if (typeof import.meta === 'undefined') return '';
  const supabaseUrl = (import.meta as any).env?.PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return '';
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Valida un email
 * @param email Email a validar
 * @returns true si es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Devuelve el color de estado de producto
 * @param stock Cantidad en stock
 * @returns Clase de color Tailwind
 */
export function getStockStatus(stock: number): string {
  if (stock === 0) return 'text-red-600';
  if (stock <= 5) return 'text-amber-600';
  return 'text-green-600';
}

/**
 * Devuelve el texto de estado de producto
 * @param stock Cantidad en stock
 * @returns Texto descriptivo
 */
export function getStockStatusText(stock: number): string {
  if (stock === 0) return 'Agotado';
  if (stock <= 5) return `Solo ${stock} disponibles`;
  return 'Disponible';
}

/**
 * Delay helper para operaciones async
 * @param ms Milisegundos
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calcula el descuento entre dos precios
 * @param originalPrice Precio original en céntimos
 * @param discountedPrice Precio con descuento en céntimos
 * @returns Porcentaje de descuento
 */
export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}
