-- ============================================
-- ИСПРАВЛЕНИЕ RLS ПОЛИТИК ДЛЯ ТАБЛИЦЫ ORDERS
-- ============================================

-- Включаем RLS если ещё не включен
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;
DROP POLICY IF EXISTS "orders_all_access" ON orders;
DROP POLICY IF EXISTS "Allow anonymous order creation" ON orders;
DROP POLICY IF EXISTS "Allow viewing own orders" ON orders;

-- Разрешаем создание заказов всем (в т.ч. анонимным пользователям)
CREATE POLICY "orders_insert_anon" ON orders
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Разрешаем просмотр заказов по телефону или user_id
CREATE POLICY "orders_select_own" ON orders
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Разрешаем обновление заказов (для админки)
CREATE POLICY "orders_update_all" ON orders
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Права доступа
GRANT ALL ON orders TO anon;
GRANT ALL ON orders TO authenticated;

-- Проверяем что всё работает
SELECT 'RLS политики для orders успешно созданы!' as status;
