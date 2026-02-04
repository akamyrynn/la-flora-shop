# Инструкция по настройке

## 1. Настройка Supabase

1. Зайдите на https://supabase.com и создайте новый проект
2. Перейдите в SQL Editor
3. Скопируйте и выполните содержимое файла `supabase-schema.sql`
4. Получите API ключи в Settings > API

## 2. Настройка переменных окружения

Заполните `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
INSPIRO_API_URL=https://api.inspiro.ru
INSPIRO_API_KEY=your-inspiro-key
YANDEX_MAPS_API_KEY=your-yandex-key
```

## 3. Установка зависимостей

```bash
npm install
```

## 4. Запуск проекта

```bash
npm run dev
```

Откройте http://localhost:3000

## 5. Первоначальная настройка

1. Перейдите на `/admin` для добавления товаров
2. Загрузите изображения в Supabase Storage
3. Настройте интеграцию с Инспиро
4. Настройте Яндекс.Карты для расчета доставки

## Структура базы данных

- `users` - пользователи
- `products` - товары
- `orders` - заказы
- `favorites` - избранное
- `reviews` - отзывы

## API интеграции

### Inspiro (бонусная система)
- `getBonusBalance(cardNumber)` - получить баланс
- `useBonuses(cardNumber, amount)` - списать бонусы
- `addBonuses(cardNumber, amount)` - начислить бонусы

### Yandex Maps
Используется для:
- Подсказок адресов
- Расчета стоимости доставки по зонам
