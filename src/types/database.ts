export type AppRole = 'admin' | 'user';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  short_description: string | null;
  price: number;
  price_bdt: number;
  sale_price: number | null;
  sale_price_bdt: number | null;
  image_url: string | null;
  category_id: string | null;
  brand_id: string | null;
  stock: number;
  low_stock_threshold: number | null;
  is_featured: boolean;
  is_active: boolean;
  flash_sale_enabled: boolean;
  sale_start_date: string | null;
  sale_end_date: string | null;
  product_type: string | null;
  wc_id: number | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price: number;
  price_bdt: number;
  sale_price: number | null;
  sale_price_bdt: number | null;
  stock: number;
  wc_id: number | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  payment_method: string | null;
  payment_status: string;
  notes: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  transaction_id: string | null;
  delivery_info: string | null;
  delivery_type: string | null;
  delivery_platform: string | null;
  delivery_instructions: string | null;
  delivered_at: string | null;
  delivery_email_sent: boolean;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface DeliveryLog {
  id: string;
  order_id: string;
  action: string;
  delivery_info_snapshot: string | null;
  performed_by: string | null;
  customer_ip: string | null;
  error_message: string | null;
  created_at: string;
}
