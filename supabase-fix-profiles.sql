-- ============================================
-- ИСПРАВЛЕНИЕ ТАБЛИЦЫ PROFILES ДЛЯ ПРОСТОЙ АВТОРИЗАЦИИ ПО ТЕЛЕФОНУ
-- ============================================

-- 1. Удаляем старую таблицу (ВНИМАНИЕ: это удалит все профили!)
-- Если нужно сохранить данные, закомментируйте эти строки
DROP TABLE IF EXISTS bonus_transactions CASCADE;
DROP TABLE IF EXISTS customer_segment_members CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Создаём новую таблицу profiles с автогенерацией ID
CREATE TABLE profiles (
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

-- 3. RLS политики
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Разрешаем всё для anon и authenticated
CREATE POLICY "profiles_all_access" ON profiles
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Права доступа
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;

-- 5. Индексы
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_role ON profiles(role);

-- 6. Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Тестовый профиль админа (опционально)
INSERT INTO profiles (phone, name, role, bonus_balance)
VALUES ('+79001234567', 'Админ', 'admin', 0)
ON CONFLICT (phone) DO NOTHING;

-- Выводим результат
SELECT 'Таблица profiles успешно создана!' as status;
SELECT * FROM profiles LIMIT 5;
