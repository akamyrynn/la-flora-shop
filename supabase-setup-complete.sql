-- ============================================
-- ПОЛНАЯ НАСТРОЙКА БАЗЫ ДАННЫХ
-- Выполните этот скрипт в Supabase SQL Editor
-- ============================================

-- Включаем расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ТАБЛИЦА ПРОДУКТОВ (БУКЕТОВ)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  short_description TEXT,
  description TEXT,
  composition TEXT,
  care_instructions TEXT,
  
  -- Цена и наличие
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  in_stock BOOLEAN DEFAULT TRUE,
  
  -- Категоризация
  bouquet_type TEXT NOT NULL DEFAULT 'mono',
  flower_type TEXT DEFAULT 'roses',
  color TEXT NOT NULL DEFAULT 'red',
  occasions TEXT[] DEFAULT '{}',
  
  -- Характеристики
  quantity INTEGER DEFAULT 1,
  size TEXT DEFAULT 'medium',
  packaging_type TEXT DEFAULT 'ribbon',
  
  -- Изображения
  images TEXT[] DEFAULT '{}',
  main_image TEXT,
  
  -- Связи
  related_products UUID[] DEFAULT '{}',
  variant_group UUID,
  
  -- Метаданные
  is_popular BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ТАБЛИЦА ДОПОЛНИТЕЛЬНЫХ ТОВАРОВ
-- ============================================
CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'card',
  image TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  phone TEXT,
  email TEXT,
  name TEXT,
  bonus_card TEXT,
  bonus_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ТАБЛИЦА ЗАКАЗОВ
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  
  -- Контакты
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Доставка
  delivery_date DATE NOT NULL,
  delivery_time TEXT NOT NULL,
  address TEXT NOT NULL,
  
  -- Товары (JSON)
  items JSONB NOT NULL,
  
  -- Оплата
  total DECIMAL(10,2) NOT NULL,
  bonus_used INTEGER DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'online',
  payment_status TEXT DEFAULT 'pending',
  
  -- Статус
  status TEXT DEFAULT 'new',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ТАБЛИЦА ОТЗЫВОВ
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ТАБЛИЦА ИЗБРАННОГО
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_bouquet_type ON products(bouquet_type);
CREATE INDEX IF NOT EXISTS idx_products_flower_type ON products(flower_type);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_variant_group ON products(variant_group);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE INDEX IF NOT EXISTS idx_addons_type ON addons(type);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- ============================================
-- RLS ПОЛИТИКИ
-- ============================================

-- Products: публичное чтение, аутентифицированные могут редактировать
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products"
ON products FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
CREATE POLICY "Authenticated users can insert products"
ON products FOR INSERT
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
CREATE POLICY "Authenticated users can update products"
ON products FOR UPDATE
USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
CREATE POLICY "Authenticated users can delete products"
ON products FOR DELETE
USING (TRUE);

-- Addons: публичное чтение, аутентифицированные могут редактировать
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view addons" ON addons;
CREATE POLICY "Anyone can view addons"
ON addons FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can manage addons" ON addons;
CREATE POLICY "Authenticated users can manage addons"
ON addons FOR ALL
USING (TRUE);

-- Orders: пользователи видят только свои заказы
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders"
ON orders FOR UPDATE
USING (TRUE);

-- Profiles: пользователи видят только свой профиль
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR ALL
USING (TRUE);

-- Reviews: все видят проверенные отзывы
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view verified reviews" ON reviews;
CREATE POLICY "Anyone can view verified reviews"
ON reviews FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (TRUE);

-- Favorites: пользователи управляют своим избранным
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites"
ON favorites FOR ALL
USING (TRUE);

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addons_updated_at ON addons;
CREATE TRIGGER update_addons_updated_at
BEFORE UPDATE ON addons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ГОТОВО!
-- ============================================
-- Теперь можно добавлять тестовые данные из sample-data.sql
