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
  role?: 'customer' | 'admin' | 'manager' | 'cashier';
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

// ============================================
// СИСТЕМА БОНУСОВ
// ============================================

export interface BonusSettings {
  id: string;
  accrual_percent: number;
  max_usage_percent: number;
  min_order_for_accrual: number;
  expiration_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BonusTransactionType = 'accrual' | 'usage' | 'expired' | 'adjustment';

export interface BonusTransaction {
  id: string;
  user_id: string;
  order_id?: string;
  type: BonusTransactionType;
  amount: number;
  balance_after: number;
  description?: string;
  expires_at?: string;
  created_by?: string;
  created_at: string;
}

// ============================================
// СКЛАДЫ И ТОЧКИ ПРОДАЖ
// ============================================

export type StoreType = 'store' | 'warehouse';

export interface WorkingHours {
  open: string;
  close: string;
}

export interface Store {
  id: string;
  name: string;
  type: StoreType;
  address?: string;
  phone?: string;
  working_hours?: Record<string, WorkingHours>;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  store_id: string;
  product_id: string;
  quantity: number;
  reserved_quantity: number;
  min_quantity: number;
  cost_price?: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  product?: Product;
  store?: Store;
}

// ============================================
// ДОКУМЕНТЫ ДВИЖЕНИЯ ТОВАРОВ
// ============================================

export type DocumentType = 'receipt' | 'writeoff' | 'transfer' | 'revaluation' | 'stocktaking';
export type DocumentStatus = 'draft' | 'confirmed' | 'cancelled';

export interface InventoryDocument {
  id: string;
  document_number: string;
  type: DocumentType;
  status: DocumentStatus;
  supplier_name?: string;
  supplier_invoice?: string;
  from_store_id?: string;
  to_store_id?: string;
  writeoff_reason?: string;
  reason?: string;
  store_id?: string;
  comment?: string;
  total_amount?: number;
  items_count?: number;
  confirmed_at?: string;
  confirmed_by?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  items?: InventoryDocumentItem[];
  store?: Store;
  from_store?: Store;
  to_store?: Store;
}

export interface InventoryDocumentItem {
  id: string;
  document_id: string;
  product_id: string;
  quantity: number;
  cost_price?: number;
  old_price?: number;
  new_price?: number;
  expected_quantity?: number;
  actual_quantity?: number;
  difference?: number;
  created_at: string;
  // Joined fields
  product?: Product;
}

export type MovementType = 'receipt' | 'sale' | 'return' | 'writeoff' | 'transfer_in' | 'transfer_out' | 'adjustment';

export interface InventoryMovement {
  id: string;
  store_id: string;
  product_id: string;
  document_id?: string;
  order_id?: string;
  type: MovementType;
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  cost_price?: number;
  created_by?: string;
  created_at: string;
  // Joined fields
  product?: Product;
  store?: Store;
}

// ============================================
// КЛИЕНТЫ И СЕГМЕНТЫ
// ============================================

export type UserRole = 'customer' | 'admin' | 'manager' | 'cashier';
export type ContactPreference = 'phone' | 'email' | 'whatsapp' | 'telegram';
export type Gender = 'male' | 'female' | 'other';

export interface CustomerAddress {
  id: string;
  title: string;
  address: string;
  is_default: boolean;
}

export interface Profile {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  gender?: Gender;
  role: UserRole;
  bonus_card?: string;
  bonus_balance: number;
  internal_bonus_balance: number;
  preferred_contact: ContactPreference;
  accepts_marketing: boolean;
  marketing_channels: string[];
  tags: string[];
  orders_count: number;
  total_spent: number;
  average_order: number;
  last_order_at?: string;
  addresses: CustomerAddress[];
  acquisition_source?: string;
  acquisition_campaign?: string;
  manager_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SegmentConditions {
  orders_count?: { min?: number; max?: number };
  total_spent?: { min?: number; max?: number };
  last_order_days?: { min?: number; max?: number };
  tags?: string[];
}

export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  conditions: SegmentConditions;
  color: string;
  is_auto: boolean;
  customers_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// КОЛЛЕКЦИИ
// ============================================

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  meta_title?: string;
  meta_description?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  auto_conditions?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined fields
  products?: Product[];
  products_count?: number;
}

// ============================================
// POS - КАССА
// ============================================

export type TerminalStatus = 'active' | 'inactive' | 'maintenance';
export type ShiftStatus = 'open' | 'closed';
export type TransactionType = 'sale' | 'return' | 'cash_in' | 'cash_out';
export type PaymentMethod = 'cash' | 'card' | 'bonus' | 'mixed';

export interface POSTerminal {
  id: string;
  name: string;
  store_id: string;
  external_id?: string;
  status: TerminalStatus;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined fields
  store?: Store;
}

export interface POSShift {
  id: string;
  terminal_id: string;
  cashier_id: string;
  opened_at: string;
  closed_at?: string;
  opening_cash: number;
  closing_cash?: number;
  total_sales: number;
  total_cash: number;
  total_card: number;
  total_bonus: number;
  transactions_count: number;
  status: ShiftStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  terminal?: POSTerminal;
  cashier?: Profile;
}

export interface PaymentDetails {
  cash?: number;
  card?: number;
  bonus?: number;
}

export interface POSTransaction {
  id: string;
  shift_id: string;
  order_id?: string;
  type: TransactionType;
  amount: number;
  payment_method?: PaymentMethod;
  payment_details?: PaymentDetails;
  fiscal_receipt_number?: string;
  fiscal_data?: Record<string, unknown>;
  created_at: string;
  // Joined fields
  shift?: POSShift;
  order?: Order;
}

// ============================================
// КОНСТРУКТОР БУКЕТОВ
// ============================================

// ============================================
// ПОШТУЧНЫЕ ЦВЕТЫ
// ============================================

export interface SingleFlower {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  color: string;
  available_colors: string[];
  stem_length?: string;
  image?: string;
  in_stock: boolean;
  stock_quantity: number;
  min_quantity: number;
  max_quantity: number;
  is_seasonal: boolean;
  season_start?: number;
  season_end?: number;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CartSingleFlower {
  flower: SingleFlower;
  quantity: number;
  selectedColor: string;
}

export type FlowerComponentType = 'flower' | 'greenery' | 'filler';
export type PackagingOptionType = 'ribbon' | 'paper' | 'box' | 'basket' | 'hat_box';

export interface FlowerComponent {
  id: string;
  name: string;
  name_plural?: string;
  type: FlowerComponentType;
  price_per_unit: number;
  min_quantity: number;
  max_quantity: number;
  step: number;
  available_colors: string[];
  image?: string;
  is_seasonal: boolean;
  season_start?: number;
  season_end?: number;
  in_stock: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PackagingOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: PackagingOptionType;
  image?: string;
  min_flowers: number;
  max_flowers: number;
  in_stock: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomBouquetComponent {
  component_id: string;
  quantity: number;
  color: string;
}

export type CustomBouquetStatus = 'draft' | 'ordered';

export interface CustomBouquet {
  id: string;
  user_id?: string;
  session_id?: string;
  name: string;
  components: CustomBouquetComponent[];
  packaging_id?: string;
  total_flowers: number;
  calculated_price: number;
  status: CustomBouquetStatus;
  order_id?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  packaging?: PackagingOption;
}
