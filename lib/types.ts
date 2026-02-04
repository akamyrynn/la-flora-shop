export type BouquetType = 'mono' | 'mixed' | 'composition';
export type Occasion = 'birthday' | 'march8' | 'wedding' | 'anniversary' | 'other';
export type FlowerType = 'roses' | 'peonies' | 'chrysanthemums' | 'tulips' | 'other';
export type PackagingType = 'ribbon' | 'wrapped';
export type AddonType = 'card' | 'vase' | 'krisal' | 'other';

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  composition?: string;
  care_instructions?: string;
  price: number;
  old_price?: number;
  in_stock: boolean;
  bouquet_type: BouquetType;
  flower_type?: FlowerType;
  color: string;
  occasions?: Occasion[];
  quantity: number;
  size?: string;
  packaging_type: PackagingType;
  images: string[];
  main_image?: string;
  related_products?: string[];
  variant_group?: string;
  is_popular: boolean;
  is_new: boolean;
  views_count: number;
  order_count: number;
  created_at: string;
  updated_at: string;
}

export interface Addon {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: AddonType;
  image?: string;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addons?: Addon[];
}

export interface User {
  id: string;
  phone?: string;
  email?: string;
  full_name?: string;
  bonus_card?: string;
  bonus_balance: number;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  recipient_name: string;
  recipient_phone: string;
  is_anonymous: boolean;
  delivery_address: any;
  delivery_date: string;
  delivery_time_slot: any;
  delivery_zone?: string;
  delivery_cost: number;
  subtotal: number;
  total: number;
  payment_method: string;
  status: string;
  items: any;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
  images?: string[];
  is_verified: boolean;
  created_at: string;
}
