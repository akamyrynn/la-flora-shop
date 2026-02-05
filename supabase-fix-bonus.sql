-- ============================================
-- СОЗДАНИЕ ТАБЛИЦЫ BONUS_TRANSACTIONS
-- ============================================

-- Создаём таблицу если не существует
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

-- Включаем RLS
ALTER TABLE bonus_transactions ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "bonus_transactions_insert" ON bonus_transactions;
DROP POLICY IF EXISTS "bonus_transactions_select" ON bonus_transactions;
DROP POLICY IF EXISTS "bonus_transactions_all" ON bonus_transactions;

-- Разрешаем всё для anon и authenticated
CREATE POLICY "bonus_transactions_all_access" ON bonus_transactions
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Права доступа
GRANT ALL ON bonus_transactions TO anon;
GRANT ALL ON bonus_transactions TO authenticated;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_user_id ON bonus_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_created_at ON bonus_transactions(created_at DESC);

-- ============================================
-- ТАБЛИЦА НАСТРОЕК БОНУСОВ (если нужна)
-- ============================================

CREATE TABLE IF NOT EXISTS bonus_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accrual_percent INTEGER DEFAULT 5,
  max_usage_percent INTEGER DEFAULT 30,
  min_order_for_accrual INTEGER DEFAULT 1000,
  expiration_days INTEGER DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS для bonus_settings
ALTER TABLE bonus_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bonus_settings_all" ON bonus_settings;
CREATE POLICY "bonus_settings_all_access" ON bonus_settings
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

GRANT ALL ON bonus_settings TO anon;
GRANT ALL ON bonus_settings TO authenticated;

-- Создаём дефолтные настройки если их нет
INSERT INTO bonus_settings (accrual_percent, max_usage_percent, min_order_for_accrual, is_active)
SELECT 5, 30, 1000, true
WHERE NOT EXISTS (SELECT 1 FROM bonus_settings LIMIT 1);

-- Проверяем
SELECT 'Таблицы бонусов успешно созданы!' as status;
SELECT * FROM bonus_settings;
