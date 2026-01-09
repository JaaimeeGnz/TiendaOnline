import { atom } from 'nanostores';
import type { WritableAtom } from 'nanostores';

/**
 * Estructura de un ítem en el carrito
 */
export interface CartItem {
  id: string; // UUID del producto
  name: string;
  slug: string;
  price_cents: number; // Precio en céntimos
  quantity: number;
  size?: string;
  image_url?: string;
  stock: number;
}

/**
 * Estructura del estado del carrito
 */
export interface CartState {
  items: CartItem[];
  lastUpdated: number;
}

// Clave para localStorage
const CART_STORAGE_KEY = 'fashionmarket_cart';

/**
 * Obtiene el carrito del localStorage
 */
function getInitialCart(): CartState {
  if (typeof window === 'undefined') {
    return { items: [], lastUpdated: Date.now() };
  }

  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) {
    return { items: [], lastUpdated: Date.now() };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { items: [], lastUpdated: Date.now() };
  }
}

/**
 * Guarda el carrito en localStorage
 */
function saveCart(state: CartState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
}

// Nano Store del carrito
export const cartStore: WritableAtom<CartState> = atom<CartState>(
  getInitialCart()
);

/**
 * Añade un producto al carrito
 * @param item Producto a añadir
 * @param quantity Cantidad (por defecto 1)
 */
export function addToCart(
  item: Omit<CartItem, 'quantity'>,
  quantity: number = 1
): void {
  const currentCart = cartStore.get();
  const existingItem = currentCart.items.find(
    (i: CartItem) => i.id === item.id && i.size === item.size
  );

  let newItems: CartItem[];

  if (existingItem) {
    // Si el producto ya está en el carrito, aumentar cantidad
    newItems = currentCart.items.map((i: CartItem) =>
      i.id === item.id && i.size === item.size
        ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
        : i
    );
  } else {
    // Añadir nuevo producto
    newItems = [
      ...currentCart.items,
      {
        ...item,
        quantity: Math.min(quantity, item.stock),
      },
    ];
  }

  const newState: CartState = {
    items: newItems,
    lastUpdated: Date.now(),
  };

  cartStore.set(newState);
  saveCart(newState);
}

/**
 * Elimina un producto del carrito
 * @param productId ID del producto
 * @param size Talla (si aplica)
 */
export function removeFromCart(productId: string, size?: string): void {
  const currentCart = cartStore.get();
  const newItems = currentCart.items.filter(
    (item: CartItem) => !(item.id === productId && item.size === size)
  );

  const newState: CartState = {
    items: newItems,
    lastUpdated: Date.now(),
  };

  cartStore.set(newState);
  saveCart(newState);
}

/**
 * Actualiza la cantidad de un producto en el carrito
 * @param productId ID del producto
 * @param quantity Nueva cantidad
 * @param size Talla (si aplica)
 */
export function updateCartItemQuantity(
  productId: string,
  quantity: number,
  size?: string
): void {
  if (quantity <= 0) {
    removeFromCart(productId, size);
    return;
  }

  const currentCart = cartStore.get();
  const newItems = currentCart.items.map((item: CartItem) => {
    if (item.id === productId && item.size === size) {
      return {
        ...item,
        quantity: Math.min(quantity, item.stock),
      };
    }
    return item;
  });

  const newState: CartState = {
    items: newItems,
    lastUpdated: Date.now(),
  };

  cartStore.set(newState);
  saveCart(newState);
}

/**
 * Limpia el carrito completamente
 */
export function clearCart(): void {
  const newState: CartState = {
    items: [],
    lastUpdated: Date.now(),
  };

  cartStore.set(newState);
  saveCart(newState);
}

/**
 * Calcula el total del carrito (en céntimos)
 */
export function getCartTotal(): number {
  const cart = cartStore.get();
  return cart.items.reduce((total: number, item: CartItem) => {
    return total + item.price_cents * item.quantity;
  }, 0);
}

/**
 * Obtiene la cantidad total de artículos en el carrito
 */
export function getCartItemCount(): number {
  const cart = cartStore.get();
  return cart.items.reduce((count: number, item: CartItem) => count + item.quantity, 0);
}

/**
 * Obtiene los artículos del carrito
 */
export function getCartItems(): CartItem[] {
  return cartStore.get().items;
}

/**
 * Valida si todos los artículos del carrito tienen stock suficiente
 */
export function validateCart(): boolean {
  const cart = cartStore.get();
  return cart.items.every((item: CartItem) => item.quantity <= item.stock);
}

/**
 * Aplica cambios de stock a los artículos del carrito
 * (util para sincronizar con servidor)
 * @param updates Map de productId -> nuevo stock
 */
export function updateCartStock(updates: Record<string, number>): void {
  const currentCart = cartStore.get();
  const newItems = currentCart.items
    .map((item: CartItem) => {
      if (item.id in updates) {
        const newStock = updates[item.id];
        if (newStock <= 0) return null;
        return {
          ...item,
          stock: newStock,
          quantity: Math.min(item.quantity, newStock),
        };
      }
      return item;
    })
    .filter((item: CartItem | null): item is CartItem => item !== null);

  const newState: CartState = {
    items: newItems,
    lastUpdated: Date.now(),
  };

  cartStore.set(newState);
  saveCart(newState);
}
