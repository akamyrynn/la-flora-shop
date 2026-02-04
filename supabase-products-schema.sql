-- Таблица продуктов (букетов)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  composition TEXT,
  care_instructions TEXT,
  
  -- Цена и наличие
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  in_stock BOOLEAN DEFAULT TRUE,
  
  -- Категоризация
  bouquet_type TEXT NOT NULL, -- mono, mixed, composition
  flower_type TEXT, -- roses, peonies, chrysanthemums, tulips
  color TEXT NOT NULL, -- red, pink, white, yellow, purple, mixed
  occasions TEXT[] DEFAULT '{}', -- birthday, march8, wedding, anniversary
  
  -- Характеристики
  quantity INTEGER DEFAULT 1, -- количество цветов
  size TEXT, -- small, medium, large
  packaging_type TEXT DEFAULT 'ribbon', -- ribbon, wrapped
  
  -- Изображения
  images TEXT[] DEFAULT '{}',
  main_image TEXT,
  
  -- Связи
  related_products UUID[] DEFAULT '{}',
  variant_group UUID, -- для связи вариантов (15/25/51/101 роза)
  
  -- Метаданные
  is_popular BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица дополнительных товаров (открытки, вазы, кризал)
CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL, -- card, vase, krisal, other
  image TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  product_id UUID REFERENCES products,
  order_id UUID REFERENCES orders,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_products_bouquet_type ON products(bouquet_type);
CREATE INDEX IF NOT EXISTS idx_products_flower_type ON products(flower_type);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_variant_group ON products(variant_group);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_addons_type ON addons(type);

-- RLS политики для продуктов (публичное чтение, админ редактирование)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
ON products FOR SELECT
USING (TRUE);

CREATE POLICY "Authenticated users can insert products"
ON products FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products"
ON products FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products"
ON products FOR DELETE
USING (auth.role() = 'authenticated');

-- RLS для дополнительных товаров
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view addons"
ON addons FOR SELECT
USING (TRUE);

CREATE POLICY "Authenticated users can manage addons"
ON addons FOR ALL
USING (auth.role() = 'authenticated');

-- RLS для отзывов
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified reviews"
ON reviews FOR SELECT
USING (is_verified = TRUE);

CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Триггеры для updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addons_updated_at
BEFORE UPDATE ON addons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
