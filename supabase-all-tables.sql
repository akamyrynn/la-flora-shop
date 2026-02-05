-- ============================================
-- ПОЛНАЯ НАСТРОЙКА БАЗЫ ДАННЫХ LA FLORA
-- Выполнять в Supabase SQL Editor
-- ============================================

-- 1. PROFILES (уже должна существовать, но на всякий случай)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  bonus_card TEXT,
  bonus_balance INTEGER DEFAULT 0,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager', 'cashier')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_all_access" ON profiles;
CREATE POLICY "profiles_all_access" ON profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  composition TEXT,
  care_instructions TEXT,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  in_stock BOOLEAN DEFAULT true,
  bouquet_type TEXT DEFAULT 'mixed',
  flower_type TEXT,
  color TEXT,
  occasions TEXT[],
  quantity INTEGER DEFAULT 1,
  size TEXT,
  packaging_type TEXT DEFAULT 'wrapped',
  images TEXT[],
  main_image TEXT,
  related_products UUID[],
  variant_group UUID,
  is_popular BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_all_access" ON products;
CREATE POLICY "products_all_access" ON products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON products TO anon;
GRANT ALL ON products TO authenticated;

-- 3. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  delivery_date DATE NOT NULL,
  delivery_time TEXT NOT NULL,
  delivery_address TEXT,
  address TEXT,
  delivery_cost DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2),
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  bonus_used INTEGER DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'online',
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_all_access" ON orders;
CREATE POLICY "orders_all_access" ON orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON orders TO anon;
GRANT ALL ON orders TO authenticated;

-- 4. BONUS_TRANSACTIONS
CREATE TABLE IF NOT EXISTS bonus_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('accrual', 'usage', 'expired', 'adjustment')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bonus_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bonus_transactions_all_access" ON bonus_transactions;
CREATE POLICY "bonus_transactions_all_access" ON bonus_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON bonus_transactions TO anon;
GRANT ALL ON bonus_transactions TO authenticated;

-- 5. BONUS_SETTINGS
CREATE TABLE IF NOT EXISTS bonus_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accrual_percent INTEGER DEFAULT 5,
  max_usage_percent INTEGER DEFAULT 30,
  min_order_for_accrual INTEGER DEFAULT 1000,
  expiration_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bonus_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bonus_settings_all_access" ON bonus_settings;
CREATE POLICY "bonus_settings_all_access" ON bonus_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON bonus_settings TO anon;
GRANT ALL ON bonus_settings TO authenticated;

-- Дефолтные настройки бонусов
INSERT INTO bonus_settings (accrual_percent, max_usage_percent, min_order_for_accrual, is_active)
SELECT 5, 30, 1000, true
WHERE NOT EXISTS (SELECT 1 FROM bonus_settings LIMIT 1);

-- 6. REVIEWS (опционально)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_all_access" ON reviews;
CREATE POLICY "reviews_all_access" ON reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON reviews TO anon;
GRANT ALL ON reviews TO authenticated;

-- 7. SINGLE_FLOWERS (поштучные цветы)
CREATE TABLE IF NOT EXISTS single_flowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  color TEXT,
  available_colors TEXT[],
  stem_length TEXT,
  image TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 100,
  is_seasonal BOOLEAN DEFAULT false,
  season_start INTEGER,
  season_end INTEGER,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE single_flowers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "single_flowers_all_access" ON single_flowers;
CREATE POLICY "single_flowers_all_access" ON single_flowers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON single_flowers TO anon;
GRANT ALL ON single_flowers TO authenticated;

-- ============================================
-- ИНДЕКСЫ
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_popular ON products(is_popular);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_user_id ON bonus_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- ============================================
-- ГОТОВО!
-- ============================================
SELECT 'Все таблицы успешно созданы!' as status;
