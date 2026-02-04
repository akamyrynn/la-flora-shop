-- Таблица пользователей
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  bonus_card VARCHAR(50),
  bonus_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица товаров
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description TEXT,
  price INTEGER NOT NULL,
  images TEXT[] DEFAULT '{}',
  bouquet_type VARCHAR(50) NOT NULL,
  occasion TEXT[] DEFAULT '{}',
  flower_type VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  packaging_type VARCHAR(50) DEFAULT 'ribbon',
  related_products TEXT[] DEFAULT '{}',
  composition TEXT,
  care_instructions TEXT,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица заказов
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  items JSONB NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time VARCHAR(20) NOT NULL,
  delivery_address TEXT NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  delivery_cost INTEGER NOT NULL,
  total INTEGER NOT NULL,
  bonus_used INTEGER DEFAULT 0,
  payment_method VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица избранного
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Таблица отзывов
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX idx_products_bouquet_type ON products(bouquet_type);
CREATE INDEX idx_products_flower_type ON products(flower_type);
CREATE INDEX idx_products_color ON products(color);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
