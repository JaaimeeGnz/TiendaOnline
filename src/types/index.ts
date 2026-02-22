/**
 * Interfaces TypeScript centralizadas - FashionMarket
 * 
 * Este archivo centraliza todos los tipos de datos del proyecto
 * para evitar duplicación y mantener consistencia.
 * 
 * Importar: import type { Product, Order, CartItem, ... } from '../types';
 */

// ============================================
// CATÁLOGO
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  original_price_cents?: number | null;
  stock: number;
  category_id: string;
  images: string[];
  sizes: string[];
  color?: string;
  material?: string;
  brand?: string;
  is_active: boolean;
  featured: boolean;
  sku?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
  sku?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// USUARIOS
// ============================================

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  street: string;
  number: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Pick<Product, 'id' | 'name' | 'price_cents' | 'images' | 'description'>;
}

// ============================================
// CARRITO
// ============================================

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  quantity: number;
  size?: string;
  image_url?: string;
  stock: number;
}

export interface CartState {
  items: CartItem[];
  lastUpdated: number;
}

// ============================================
// PEDIDOS
// ============================================

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_brand?: string;
  quantity: number;
  price_cents: number;
  total_cents: number;
  size?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  session_id?: string;
  customer_email?: string;
  order_number?: number | string;
  items: OrderItem[] | any[];
  subtotal_cents?: number;
  shipping_cents?: number;
  total_cents: number;
  shipping_address?: ShippingAddress;
  payment_status?: string;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface ShippingAddress {
  name: string;
  street: string;
  number: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

// ============================================
// FACTURACIÓN
// ============================================

export type InvoiceType = 'invoice' | 'credit_note';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled';

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  customer_email: string;
  customer_name: string;
  type: InvoiceType;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  status: InvoiceStatus;
  issued_at: string;
  due_date?: string;
  paid_at?: string;
  items: any[];
  reference_invoice_id?: string;
  reason?: string;
  created_at?: string;
  updated_at?: string;
}

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed';
export type RefundMethod = 'original_payment' | 'store_credit';

export interface Refund {
  id: string;
  order_id: string;
  invoice_id?: string;
  credit_note_id?: string;
  customer_email: string;
  customer_name: string;
  reason: string;
  status: RefundStatus;
  refund_amount_cents: number;
  returned_items: any[];
  refund_method: RefundMethod;
  requested_at: string;
  approved_at?: string;
  processed_at?: string;
  refund_date?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// MARKETING
// ============================================

export interface FlashOffer {
  id: string;
  title: string;
  subtitle?: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  discount_percentage: number;
  product_ids: string[];
  created_at?: string;
  updated_at?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  discount_code: string;
  discount_percentage: number;
  is_active: boolean;
  subscribed_at: string;
  used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_percentage: number;
  discount_type: string;
  discount_value: number;
  valid_from: string;
  valid_until?: string;
  max_uses?: number;
  times_used: number;
  min_purchase_cents?: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DiscountCodeUsage {
  id: string;
  code_id: string;
  email: string;
  order_id?: string;
  amount_saved_cents?: number;
  created_at: string;
}

// ============================================
// SOPORTE
// ============================================

export type ContactMessageStatus = 'new' | 'read' | 'resolved' | 'spam';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  admin_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// DASHBOARD / ANALYTICS
// ============================================

export interface DashboardStats {
  totalSalesMonth: number;
  pendingOrders: number;
  topProduct: TopProduct | null;
  salesLast7Days: DailySales[];
}

export interface TopProduct {
  name: string;
  sold: number;
}

export interface DailySales {
  date: string;
  sales: number;
}

// ============================================
// UI / COMPONENTES
// ============================================

export interface BannerSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  background: string;
}

export type SizeRecommendation = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface SizeStock {
  size: string;
  stock: number;
}
