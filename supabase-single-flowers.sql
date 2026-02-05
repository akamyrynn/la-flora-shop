-- =============================================
-- МОДУЛЬ ПОШТУЧНЫХ ЦВЕТОВ
-- Отдельная таблица для цветов поштучно
-- =============================================

-- Таблица поштучных цветов
CREATE TABLE IF NOT EXISTS single_flowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- цена за 1 штуку
  color VARCHAR(50), -- основной цвет
  available_colors TEXT[] DEFAULT '{}', -- доступные цвета если есть варианты
  stem_length VARCHAR(50), -- длина стебля "60-70 см"
  image TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 100, -- сколько в наличии
  min_quantity INTEGER DEFAULT 1, -- минимум для заказа
  max_quantity INTEGER DEFAULT 99, -- максимум для заказа
  is_seasonal BOOLEAN DEFAULT false, -- сезонный цветок
  season_start INTEGER, -- месяц начала сезона (1-12)
  season_end INTEGER, -- месяц конца сезона
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_single_flowers_in_stock ON single_flowers(in_stock);
CREATE INDEX IF NOT EXISTS idx_single_flowers_is_popular ON single_flowers(is_popular);
CREATE INDEX IF NOT EXISTS idx_single_flowers_slug ON single_flowers(slug);

-- RLS политики
ALTER TABLE single_flowers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Single flowers viewable by everyone"
  ON single_flowers FOR SELECT USING (true);

CREATE POLICY "Single flowers editable by admins"
  ON single_flowers FOR ALL USING (true);

-- =============================================
-- ЗАПОЛНЯЕМ ДАННЫМИ
-- =============================================

INSERT INTO single_flowers (
  name, slug, description, price, color, available_colors,
  stem_length, image, in_stock, is_seasonal, season_start, season_end, is_popular, sort_order
) VALUES
-- Розы (доступны в разных цветах)
(
  'Роза',
  'roza',
  'Классическая роза премиум качества на длинном стебле. Свежесрезанная, простоит до 14 дней.',
  250,
  'red',
  '{"red", "white", "pink", "yellow", "orange", "burgundy"}',
  '60-70 см',
  '',
  true,
  false,
  NULL,
  NULL,
  true,
  1
),
-- Пион (только розовый, сезонный)
(
  'Пион',
  'pion',
  'Пышный садовый пион с крупным бутоном. Нежный аромат. Диаметр бутона 12-15 см.',
  550,
  'pink',
  '{"pink", "white", "burgundy"}',
  '40-50 см',
  '',
  true,
  true,
  5, -- май
  7, -- июль
  true,
  2
),
-- Лилия
(
  'Лилия восточная',
  'liliya',
  'Роскошная восточная лилия с насыщенным ароматом. На одном стебле 2-4 бутона.',
  450,
  'white',
  '{"white", "pink", "yellow"}',
  '70-80 см',
  '',
  true,
  false,
  NULL,
  NULL,
  true,
  3
),
-- Тюльпан
(
  'Тюльпан',
  'tyulpan',
  'Свежий голландский тюльпан. Идеален для весенних букетов.',
  150,
  'red',
  '{"red", "white", "pink", "yellow", "purple", "orange"}',
  '40-50 см',
  '',
  true,
  true,
  2, -- февраль
  5, -- май
  true,
  4
),
-- Хризантема кустовая
(
  'Хризантема кустовая',
  'hrizantema',
  'Кустовая хризантема с множеством соцветий. Долго стоит в вазе — до 3 недель.',
  180,
  'white',
  '{"white", "yellow", "pink", "green"}',
  '60-70 см',
  '',
  true,
  false,
  NULL,
  NULL,
  false,
  5
),
-- Гербера
(
  'Гербера',
  'gerbera',
  'Яркая гербера с крупным соцветием. Символ радости и оптимизма.',
  200,
  'orange',
  '{"red", "orange", "yellow", "pink", "white"}',
  '50-60 см',
  '',
  true,
  false,
  NULL,
  NULL,
  true,
  6
),
-- Эустома
(
  'Эустома',
  'eustoma',
  'Нежная эустома (лизиантус). 3-5 бутонов на ветке. Отлично дополняет букеты.',
  350,
  'white',
  '{"white", "pink", "purple", "cream"}',
  '50-60 см',
  '',
  true,
  false,
  NULL,
  NULL,
  true,
  7
),
-- Альстромерия
(
  'Альстромерия',
  'alstromeriya',
  'Перуанская лилия с множеством цветков на одной ветке. Очень стойкая.',
  180,
  'pink',
  '{"pink", "white", "yellow", "orange", "red"}',
  '50-60 см',
  '',
  true,
  false,
  NULL,
  NULL,
  false,
  8
);

-- =============================================
-- ТАБЛИЦА СВЯЗИ: цветы в корзине/заказе
-- =============================================

-- Поштучные цветы в корзине (для сохранения выбора цвета)
CREATE TABLE IF NOT EXISTS cart_single_flowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255), -- для неавторизованных
  user_id UUID REFERENCES profiles(id),
  flower_id UUID REFERENCES single_flowers(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_color VARCHAR(50), -- выбранный цвет
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Поштучные цветы в заказе
CREATE TABLE IF NOT EXISTS order_single_flowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  flower_id UUID REFERENCES single_flowers(id),
  flower_name VARCHAR(255) NOT NULL, -- сохраняем название на момент заказа
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL, -- цена на момент заказа
  selected_color VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE cart_single_flowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_single_flowers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cart flowers viewable by owner"
  ON cart_single_flowers FOR ALL USING (true);

CREATE POLICY "Order flowers viewable by everyone"
  ON order_single_flowers FOR SELECT USING (true);

CREATE POLICY "Order flowers insertable"
  ON order_single_flowers FOR INSERT WITH CHECK (true);

-- Удалим старые данные из products если они там есть
DELETE FROM products WHERE quantity = 1 AND bouquet_type = 'mono' AND flower_type IN ('roses', 'peonies', 'tulips', 'chrysanthemums', 'other');
