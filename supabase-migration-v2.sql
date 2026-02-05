-- ============================================
-- МИГРАЦИЯ V2: РАСШИРЕНИЕ ФУНКЦИОНАЛА
-- Бонусы, Склад, CRM, Конструктор, POS
-- ============================================

-- ============================================
-- 1. РАСШИРЕНИЕ ТАБЛИЦЫ PROFILES
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager', 'cashier'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS internal_bonus_balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_contact TEXT DEFAULT 'phone' CHECK (preferred_contact IN ('phone', 'email', 'whatsapp', 'telegram'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepts_marketing BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_channels TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS orders_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_spent DECIMAL(12,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS average_order DECIMAL(10,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acquisition_source TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acquisition_campaign TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS manager_notes TEXT;

-- Индексы для profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_orders_count ON profiles(orders_count);
CREATE INDEX IF NOT EXISTS idx_profiles_total_spent ON profiles(total_spent);
CREATE INDEX IF NOT EXISTS idx_profiles_last_order ON profiles(last_order_at);
CREATE INDEX IF NOT EXISTS idx_profiles_tags ON profiles USING GIN(tags);

-- ============================================
-- 2. СИСТЕМА БОНУСОВ
-- ============================================

-- Настройки бонусной системы
CREATE TABLE IF NOT EXISTS bonus_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accrual_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  max_usage_percent DECIMAL(5,2) NOT NULL DEFAULT 30.00,
  min_order_for_accrual DECIMAL(10,2) DEFAULT 1000.00,
  expiration_days INTEGER DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Вставляем дефолтные настройки
INSERT INTO bonus_settings (accrual_percent, max_usage_percent, min_order_for_accrual)
VALUES (5.00, 30.00, 1000.00)
ON CONFLICT DO NOTHING;

-- История бонусных транзакций
CREATE TABLE IF NOT EXISTS bonus_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('accrual', 'usage', 'expired', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bonus_transactions_user_id ON bonus_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_order_id ON bonus_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_type ON bonus_transactions(type);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_created_at ON bonus_transactions(created_at);

-- RLS для bonus_settings
ALTER TABLE bonus_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view bonus settings" ON bonus_settings;
CREATE POLICY "Anyone can view bonus settings"
ON bonus_settings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can modify bonus settings" ON bonus_settings;
CREATE POLICY "Admins can modify bonus settings"
ON bonus_settings FOR ALL USING (TRUE);

-- RLS для bonus_transactions
ALTER TABLE bonus_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view bonus transactions" ON bonus_transactions;
CREATE POLICY "Users can view bonus transactions"
ON bonus_transactions FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "System can create bonus transactions" ON bonus_transactions;
CREATE POLICY "System can create bonus transactions"
ON bonus_transactions FOR INSERT WITH CHECK (TRUE);

-- Триггер для bonus_settings
DROP TRIGGER IF EXISTS update_bonus_settings_updated_at ON bonus_settings;
CREATE TRIGGER update_bonus_settings_updated_at
BEFORE UPDATE ON bonus_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. ТОЧКИ ПРОДАЖ / СКЛАДЫ
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('store', 'warehouse')),
  address TEXT,
  phone TEXT,
  working_hours JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_type ON stores(type);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON stores(is_active);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view stores" ON stores;
CREATE POLICY "Anyone can view stores" ON stores FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage stores" ON stores;
CREATE POLICY "Admins can manage stores" ON stores FOR ALL USING (TRUE);

DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at
BEFORE UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. СКЛАДСКИЕ ОСТАТКИ
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  cost_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_store_product ON inventory(store_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view inventory" ON inventory;
CREATE POLICY "Anyone can view inventory" ON inventory FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage inventory" ON inventory;
CREATE POLICY "Admins can manage inventory" ON inventory FOR ALL USING (TRUE);

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ДОКУМЕНТЫ ДВИЖЕНИЯ ТОВАРОВ
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receipt', 'writeoff', 'transfer', 'revaluation', 'stocktaking')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
  supplier_name TEXT,
  supplier_invoice TEXT,
  from_store_id UUID REFERENCES stores(id),
  to_store_id UUID REFERENCES stores(id),
  writeoff_reason TEXT,
  store_id UUID REFERENCES stores(id),
  comment TEXT,
  total_amount DECIMAL(12,2),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_documents_type ON inventory_documents(type);
CREATE INDEX IF NOT EXISTS idx_inventory_documents_status ON inventory_documents(status);
CREATE INDEX IF NOT EXISTS idx_inventory_documents_store ON inventory_documents(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_documents_created ON inventory_documents(created_at);

ALTER TABLE inventory_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage documents" ON inventory_documents;
CREATE POLICY "Admins can manage documents" ON inventory_documents FOR ALL USING (TRUE);

DROP TRIGGER IF EXISTS update_inventory_documents_updated_at ON inventory_documents;
CREATE TRIGGER update_inventory_documents_updated_at
BEFORE UPDATE ON inventory_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. СТРОКИ ДОКУМЕНТОВ
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_document_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES inventory_documents(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  cost_price DECIMAL(10,2),
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  expected_quantity INTEGER,
  actual_quantity INTEGER,
  difference INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_document_items_document ON inventory_document_items(document_id);
CREATE INDEX IF NOT EXISTS idx_inventory_document_items_product ON inventory_document_items(product_id);

ALTER TABLE inventory_document_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage document items" ON inventory_document_items;
CREATE POLICY "Admins can manage document items" ON inventory_document_items FOR ALL USING (TRUE);

-- ============================================
-- 7. ИСТОРИЯ ДВИЖЕНИЯ ТОВАРОВ
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id),
  product_id UUID NOT NULL REFERENCES products(id),
  document_id UUID REFERENCES inventory_documents(id),
  order_id UUID REFERENCES orders(id),
  type TEXT NOT NULL CHECK (type IN ('receipt', 'sale', 'return', 'writeoff', 'transfer_in', 'transfer_out', 'adjustment')),
  quantity INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  cost_price DECIMAL(10,2),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_store ON inventory_movements(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON inventory_movements(created_at);

ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view movements" ON inventory_movements;
CREATE POLICY "Admins can view movements" ON inventory_movements FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "System can create movements" ON inventory_movements;
CREATE POLICY "System can create movements" ON inventory_movements FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- 8. СЕГМЕНТЫ КЛИЕНТОВ
-- ============================================
CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL,
  color TEXT DEFAULT '#6B7280',
  is_auto BOOLEAN DEFAULT TRUE,
  customers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_segment_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(segment_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_segment_members_segment ON customer_segment_members(segment_id);
CREATE INDEX IF NOT EXISTS idx_customer_segment_members_profile ON customer_segment_members(profile_id);

ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage segments" ON customer_segments;
CREATE POLICY "Admins can manage segments" ON customer_segments FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage segment members" ON customer_segment_members;
CREATE POLICY "Admins can manage segment members" ON customer_segment_members FOR ALL USING (TRUE);

DROP TRIGGER IF EXISTS update_customer_segments_updated_at ON customer_segments;
CREATE TRIGGER update_customer_segments_updated_at
BEFORE UPDATE ON customer_segments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. КОЛЛЕКЦИИ ТОВАРОВ
-- ============================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  meta_title TEXT,
  meta_description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  auto_conditions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_is_active ON collections(is_active);
CREATE INDEX IF NOT EXISTS idx_collection_products_collection ON collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product ON collection_products(product_id);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active collections" ON collections;
CREATE POLICY "Anyone can view active collections" ON collections FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage collections" ON collections;
CREATE POLICY "Admins can manage collections" ON collections FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "Anyone can view collection products" ON collection_products;
CREATE POLICY "Anyone can view collection products" ON collection_products FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage collection products" ON collection_products;
CREATE POLICY "Admins can manage collection products" ON collection_products FOR ALL USING (TRUE);

DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. POS - ТЕРМИНАЛЫ
-- ============================================
CREATE TABLE IF NOT EXISTS pos_terminals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  store_id UUID NOT NULL REFERENCES stores(id),
  external_id TEXT,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_terminals_store ON pos_terminals(store_id);

ALTER TABLE pos_terminals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage terminals" ON pos_terminals;
CREATE POLICY "Admins can manage terminals" ON pos_terminals FOR ALL USING (TRUE);

DROP TRIGGER IF EXISTS update_pos_terminals_updated_at ON pos_terminals;
CREATE TRIGGER update_pos_terminals_updated_at
BEFORE UPDATE ON pos_terminals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. POS - КАССОВЫЕ СМЕНЫ
-- ============================================
CREATE TABLE IF NOT EXISTS pos_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  terminal_id UUID NOT NULL REFERENCES pos_terminals(id),
  cashier_id UUID NOT NULL REFERENCES profiles(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  opening_cash DECIMAL(10,2) DEFAULT 0,
  closing_cash DECIMAL(10,2),
  total_sales DECIMAL(12,2) DEFAULT 0,
  total_cash DECIMAL(12,2) DEFAULT 0,
  total_card DECIMAL(12,2) DEFAULT 0,
  total_bonus DECIMAL(12,2) DEFAULT 0,
  transactions_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_shifts_terminal ON pos_shifts(terminal_id);
CREATE INDEX IF NOT EXISTS idx_pos_shifts_cashier ON pos_shifts(cashier_id);
CREATE INDEX IF NOT EXISTS idx_pos_shifts_opened ON pos_shifts(opened_at);

ALTER TABLE pos_shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage shifts" ON pos_shifts;
CREATE POLICY "Staff can manage shifts" ON pos_shifts FOR ALL USING (TRUE);

DROP TRIGGER IF EXISTS update_pos_shifts_updated_at ON pos_shifts;
CREATE TRIGGER update_pos_shifts_updated_at
BEFORE UPDATE ON pos_shifts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. POS - ТРАНЗАКЦИИ
-- ============================================
CREATE TABLE IF NOT EXISTS pos_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES pos_shifts(id),
  order_id UUID REFERENCES orders(id),
  type TEXT NOT NULL CHECK (type IN ('sale', 'return', 'cash_in', 'cash_out')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'bonus', 'mixed')),
  payment_details JSONB,
  fiscal_receipt_number TEXT,
  fiscal_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_transactions_shift ON pos_transactions(shift_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_order ON pos_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_created ON pos_transactions(created_at);

ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view transactions" ON pos_transactions;
CREATE POLICY "Staff can view transactions" ON pos_transactions FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Staff can create transactions" ON pos_transactions;
CREATE POLICY "Staff can create transactions" ON pos_transactions FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- 13. КОНСТРУКТОР - КОМПОНЕНТЫ ЦВЕТОВ
-- ============================================
CREATE TABLE IF NOT EXISTS flower_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_plural TEXT,
  type TEXT NOT NULL CHECK (type IN ('flower', 'greenery', 'filler')),
  price_per_unit DECIMAL(10,2) NOT NULL,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 101,
  step INTEGER DEFAULT 1,
  available_colors TEXT[] DEFAULT '{}',
  image TEXT,
  is_seasonal BOOLEAN DEFAULT FALSE,
  season_start INTEGER,
  season_end INTEGER,
  in_stock BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flower_components_type ON flower_components(type);
CREATE INDEX IF NOT EXISTS idx_flower_components_in_stock ON flower_components(in_stock);

ALTER TABLE flower_components ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view flower components" ON flower_components;
CREATE POLICY "Anyone can view flower components" ON flower_components FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage flower components" ON flower_components;
CREATE POLICY "Admins can manage flower components" ON flower_components FOR ALL USING (TRUE);

DROP TRIGGER IF EXISTS update_flower_components_updated_at ON flower_components;
CREATE TRIGGER update_flower_components_updated_at
BEFORE UPDATE ON flower_components
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 14. КОНСТРУКТОР - УПАКОВКА
-- ============================================
CREATE TABLE IF NOT EXISTS packaging_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ribbon', 'paper', 'box', 'basket', 'hat_box')),
  image TEXT,
  min_flowers INTEGER DEFAULT 1,
  max_flowers INTEGER DEFAULT 200,
  in_stock BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packaging_options_type ON packaging_options(type);

ALTER TABLE packaging_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view packaging" ON packaging_options;
CREATE POLICY "Anyone can view packaging" ON packaging_options FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage packaging" ON packaging_options;
CREATE POLICY "Admins can manage packaging" ON packaging_options FOR ALL USING (TRUE);

DROP TRIGGER IF EXISTS update_packaging_options_updated_at ON packaging_options;
CREATE TRIGGER update_packaging_options_updated_at
BEFORE UPDATE ON packaging_options
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 15. КОНСТРУКТОР - СОБРАННЫЕ БУКЕТЫ
-- ============================================
CREATE TABLE IF NOT EXISTS custom_bouquets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  name TEXT DEFAULT 'Мой букет',
  components JSONB NOT NULL,
  packaging_id UUID REFERENCES packaging_options(id),
  total_flowers INTEGER DEFAULT 0,
  calculated_price DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ordered')),
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_bouquets_user ON custom_bouquets(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_bouquets_session ON custom_bouquets(session_id);
CREATE INDEX IF NOT EXISTS idx_custom_bouquets_status ON custom_bouquets(status);

ALTER TABLE custom_bouquets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own custom bouquets" ON custom_bouquets;
CREATE POLICY "Users can manage own custom bouquets" ON custom_bouquets FOR ALL USING (TRUE);

DROP TRIGGER IF EXISTS update_custom_bouquets_updated_at ON custom_bouquets;
CREATE TRIGGER update_custom_bouquets_updated_at
BEFORE UPDATE ON custom_bouquets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 16. ФУНКЦИЯ ГЕНЕРАЦИИ НОМЕРА ДОКУМЕНТА
-- ============================================
CREATE OR REPLACE FUNCTION generate_document_number(doc_type TEXT)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  next_num INTEGER;
  result TEXT;
BEGIN
  CASE doc_type
    WHEN 'receipt' THEN prefix := 'ПН';
    WHEN 'writeoff' THEN prefix := 'СП';
    WHEN 'transfer' THEN prefix := 'ПР';
    WHEN 'revaluation' THEN prefix := 'ПЦ';
    WHEN 'stocktaking' THEN prefix := 'ИН';
    ELSE prefix := 'ДК';
  END CASE;

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(document_number FROM LENGTH(prefix) + 2) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM inventory_documents
  WHERE document_number LIKE prefix || '-%';

  result := prefix || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 17. ФУНКЦИЯ ОБНОВЛЕНИЯ СТАТИСТИКИ КЛИЕНТА
-- ============================================
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE profiles SET
      orders_count = (SELECT COUNT(*) FROM orders WHERE user_id = NEW.user_id AND status = 'completed'),
      total_spent = (SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = NEW.user_id AND status = 'completed'),
      average_order = (SELECT COALESCE(AVG(total), 0) FROM orders WHERE user_id = NEW.user_id AND status = 'completed'),
      last_order_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customer_stats_trigger ON orders;
CREATE TRIGGER update_customer_stats_trigger
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL)
EXECUTE FUNCTION update_customer_stats();

-- ============================================
-- МИГРАЦИЯ ЗАВЕРШЕНА!
-- ============================================
