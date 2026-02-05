'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';
import { ChevronRight, Flower2, Calendar, Users, Palette, Ruler } from 'lucide-react';

// Мультиуровневое меню цветов
const FLOWER_MENU = {
  categories: [
    { name: 'Все букеты', href: '/catalog' },
    { name: 'Букеты на 14 февраля', href: '/catalog?occasion=valentine' },
    { name: 'Классические букеты', href: '/catalog?type=classic' },
    { name: 'Монобукеты', href: '/catalog?type=mono' },
    { name: 'Авторские букеты', href: '/catalog?type=author' },
    { name: 'Цветы в коробке', href: '/catalog?type=box' },
    { name: 'Корзины с цветами', href: '/catalog?type=basket' },
    { name: 'Premium', href: '/catalog?type=premium' },
  ],
  filters: {
    occasion: {
      name: 'Повод',
      icon: Calendar,
      items: [
        { name: 'День рождения', href: '/catalog?occasion=birthday' },
        { name: '14 февраля', href: '/catalog?occasion=valentine' },
        { name: '8 марта', href: '/catalog?occasion=march8' },
        { name: 'Свадьба', href: '/catalog?occasion=wedding' },
        { name: 'Юбилей', href: '/catalog?occasion=anniversary' },
        { name: 'Выписка из роддома', href: '/catalog?occasion=baby' },
      ],
    },
    recipient: {
      name: 'Кому',
      icon: Users,
      items: [
        { name: 'Девушке', href: '/catalog?for=girlfriend' },
        { name: 'Маме', href: '/catalog?for=mom' },
        { name: 'Жене', href: '/catalog?for=wife' },
        { name: 'Коллеге', href: '/catalog?for=colleague' },
        { name: 'Учителю', href: '/catalog?for=teacher' },
        { name: 'Мужчине', href: '/catalog?for=man' },
      ],
    },
    flower: {
      name: 'По цветку',
      icon: Flower2,
      items: [
        { name: 'Розы', href: '/catalog?flower=roses' },
        { name: 'Пионы', href: '/catalog?flower=peonies' },
        { name: 'Тюльпаны', href: '/catalog?flower=tulips' },
        { name: 'Хризантемы', href: '/catalog?flower=chrysanthemums' },
        { name: 'Эустомы', href: '/catalog?flower=eustoma' },
        { name: 'Гортензии', href: '/catalog?flower=hydrangea' },
      ],
    },
    size: {
      name: 'По размеру',
      icon: Ruler,
      items: [
        { name: 'Мини (до 25 см)', href: '/catalog?size=mini' },
        { name: 'Маленький', href: '/catalog?size=small' },
        { name: 'Средний', href: '/catalog?size=medium' },
        { name: 'Большой', href: '/catalog?size=large' },
        { name: 'Огромный', href: '/catalog?size=huge' },
      ],
    },
    color: {
      name: 'По цвету',
      icon: Palette,
      items: [
        { name: 'Красные', href: '/catalog?color=red' },
        { name: 'Белые', href: '/catalog?color=white' },
        { name: 'Розовые', href: '/catalog?color=pink' },
        { name: 'Жёлтые', href: '/catalog?color=yellow' },
        { name: 'Микс', href: '/catalog?color=mix' },
      ],
    },
  },
};

export default function HomePage() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [flowerMenuOpen, setFlowerMenuOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // Новинки
    const { data: newData } = await supabase
      .from('products')
      .select('*')
      .eq('is_new', true)
      .limit(4);
    if (newData) setNewProducts(newData);

    // Распродажа
    const { data: saleData } = await supabase
      .from('products')
      .select('*')
      .not('old_price', 'is', null)
      .limit(4);
    if (saleData) setSaleProducts(saleData);

    // Популярные
    const { data: popularData } = await supabase
      .from('products')
      .select('*')
      .limit(8);
    if (popularData) setPopularProducts(popularData);
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 px-6 py-8">
          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0 relative z-[100]">
            <div className="sticky top-20 space-y-4">
              {/* Кнопка ЦВЕТЫ с мега-меню на ховер */}
              <div
                className="relative"
                onMouseEnter={() => setFlowerMenuOpen(true)}
                onMouseLeave={() => {
                  setFlowerMenuOpen(false);
                  setExpandedFilter(null);
                }}
              >
                {/* Кнопка */}
                <div className="bg-primary rounded-2xl p-4 text-cream font-medium text-lg flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Flower2 className="w-6 h-6" />
                    <span>Цветы</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${flowerMenuOpen ? 'rotate-0' : ''}`} />
                </div>

                {/* Невидимый мост между кнопкой и меню */}
                {flowerMenuOpen && (
                  <div className="absolute left-full top-0 w-4 h-full" />
                )}

                {/* Мега-меню - открывается СБОКУ с отступом */}
                <div className={`absolute left-full top-0 ml-2 z-[9999] flex transition-all duration-300 origin-left ${
                  flowerMenuOpen
                    ? 'opacity-100 scale-100 translate-x-0'
                    : 'opacity-0 scale-95 -translate-x-4 pointer-events-none'
                }`}>
                  {/* Колонка 1: Категории */}
                  <div className="w-52 bg-white rounded-l-2xl shadow-2xl border border-gray-100 py-3">
                    <nav className="space-y-0.5 px-2">
                      {FLOWER_MENU.categories.map((cat) => (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          className="flex items-center gap-2 py-2 px-3 text-gray-700 hover:bg-primary/5 hover:text-primary rounded-lg transition text-sm"
                        >
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-3 pt-3 mx-3 border-t border-gray-100">
                      <Link
                        href="/catalog"
                        className="flex items-center gap-2 text-primary text-sm font-medium hover:underline px-1"
                      >
                        Смотреть все цветы
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Колонка 2: Фильтры */}
                  <div className="w-36 bg-white shadow-xl border-y border-gray-100 py-3">
                    <nav className="space-y-0.5 px-2">
                      {Object.entries(FLOWER_MENU.filters).map(([key, filter]) => (
                        <button
                          key={key}
                          onMouseEnter={() => setExpandedFilter(key)}
                          className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition text-sm ${
                            expandedFilter === key
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="uppercase tracking-wide text-xs">{filter.name}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expandedFilter === key ? 'translate-x-0.5' : ''}`} />
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Колонка 3: Подпункты фильтра */}
                  <div className={`w-44 bg-white rounded-r-2xl shadow-xl border-y border-r border-gray-100 py-3 transition-all duration-200 ${
                    expandedFilter ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                  }`}>
                    {expandedFilter && FLOWER_MENU.filters[expandedFilter as keyof typeof FLOWER_MENU.filters] && (
                      <nav className="space-y-0.5 px-2">
                        {FLOWER_MENU.filters[expandedFilter as keyof typeof FLOWER_MENU.filters].items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block py-2 px-3 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition text-sm"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </nav>
                    )}
                  </div>
                </div>
              </div>

              {/* Цветы поштучно */}
              <Link
                href="/flowers"
                className="flex items-center gap-3 bg-white border border-primary/10 text-primary p-4 rounded-2xl hover:bg-primary/5 hover:border-primary/20 transition group"
              >
                <span className="text-2xl">🌸</span>
                <div>
                  <span className="font-medium block">Цветы поштучно</span>
                  <span className="text-xs text-primary/60">Розы, тюльпаны, пионы...</span>
                </div>
                <ChevronRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Бюджет */}
              <div className="bg-cream border border-primary/10 rounded-2xl p-5">
                <h3 className="text-lg font-serif italic text-primary mb-4">Бюджет</h3>
                <nav className="space-y-2">
                  <Link href="/catalog?budget=0-2500" className="block text-primary/70 hover:text-primary transition text-sm py-1">
                    До 2 500₽
                  </Link>
                  <Link href="/catalog?budget=2500-5000" className="block text-primary/70 hover:text-primary transition text-sm py-1">
                    2 500 - 5 000₽
                  </Link>
                  <Link href="/catalog?budget=5000-10000" className="block text-primary/70 hover:text-primary transition text-sm py-1">
                    5 000 - 10 000₽
                  </Link>
                  <Link href="/catalog?budget=10000-999999" className="block text-primary/70 hover:text-primary transition text-sm py-1">
                    От 10 000₽
                  </Link>
                </nav>
              </div>

              {/* Конструктор */}
              <Link href="/bouquet-builder" className="block bg-primary/5 border border-primary/10 text-primary p-5 rounded-2xl hover:bg-primary/10 transition">
                <div className="text-2xl mb-2">✨</div>
                <h3 className="text-lg font-serif italic mb-1">Конструктор букетов</h3>
                <p className="text-sm text-primary/60">Создайте свой уникальный букет</p>
              </Link>

              {/* Квиз */}
              <Link href="/quiz" className="block bg-primary text-cream p-5 rounded-2xl text-center hover:opacity-90 transition">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="text-lg font-serif italic mb-1">Не знаете что выбрать?</h3>
                <p className="text-sm text-cream/80">Пройдите квиз</p>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 relative z-0">
            {/* Hero */}
            <section className="bg-primary/[0.03] rounded-3xl p-12 md:p-16 mb-12 text-center border border-primary-10">
              <h1 className="text-5xl md:text-7xl font-serif italic text-primary mb-6">
                La Flora Boutique
              </h1>
              <p className="text-xl md:text-2xl text-primary-80 mb-8 max-w-2xl mx-auto">
                Изысканные букеты для особенных моментов
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/catalog"
                  className="bg-primary text-cream px-10 py-4 rounded-full hover:opacity-80 transition text-lg font-medium"
                >
                  Смотреть каталог
                </Link>
                <Link
                  href="/quiz"
                  className="bg-cream border-2 border-primary text-primary px-10 py-4 rounded-full hover:opacity-80 transition text-lg font-medium"
                >
                  Подобрать букет
                </Link>
              </div>
            </section>

            {/* Распродажа */}
            {saleProducts.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl md:text-5xl font-serif italic text-primary">
                    🔥 Распродажа
                  </h2>
                  <Link href="/catalog?sale=true" className="text-primary hover:opacity-70 transition">
                    Смотреть все →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {saleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Новинки */}
            {newProducts.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl md:text-5xl font-serif italic text-primary">
                    ✨ Новинки
                  </h2>
                  <Link href="/catalog?new=true" className="text-primary hover:opacity-70 transition">
                    Смотреть все →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {newProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Популярные */}
            {popularProducts.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl md:text-5xl font-serif italic text-primary">
                    💎 Популярные букеты
                  </h2>
                  <Link href="/catalog" className="text-primary hover:opacity-70 transition">
                    Смотреть все →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {popularProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Отзывы */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl md:text-5xl font-serif italic text-primary">
                  💬 Отзывы клиентов
                </h2>
                <Link href="/reviews" className="text-primary hover:opacity-70 transition">
                  Все отзывы →
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Анна',
                    text: 'Потрясающие букеты! Заказывала розы на день рождения, все было идеально. Свежие цветы, красивая упаковка.',
                    rating: 5,
                  },
                  {
                    name: 'Дмитрий',
                    text: 'Быстрая доставка, вежливый курьер. Букет превзошел все ожидания! Жена была в восторге.',
                    rating: 5,
                  },
                  {
                    name: 'Мария',
                    text: 'Заказываю здесь постоянно. Качество всегда на высоте, цены адекватные. Рекомендую!',
                    rating: 5,
                  },
                ].map((review, i) => (
                  <div key={i} className="bg-cream border border-primary-10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-12 h-12 bg-primary/[0.1] rounded-full flex items-center justify-center text-primary font-serif text-xl">
                        {review.name[0]}
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">{review.name}</h4>
                        <div className="text-yellow-500">{'⭐'.repeat(review.rating)}</div>
                      </div>
                    </div>
                    <p className="text-primary-80">{review.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Преимущества */}
            <section className="bg-primary/[0.03] rounded-3xl p-12 border border-primary-10">
              <h2 className="text-4xl md:text-5xl font-serif italic text-primary mb-12 text-center">
                Почему выбирают нас
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: '🌸',
                    title: 'Свежие цветы',
                    description: 'Только свежие букеты от проверенных поставщиков. Гарантия качества.',
                  },
                  {
                    icon: '🚚',
                    title: 'Быстрая доставка',
                    description: 'Доставим в течение 2 часов по Москве. Точно в срок.',
                  },
                  {
                    icon: '🎁',
                    title: 'Бонусная программа',
                    description: 'Копите бонусы с каждого заказа и получайте скидки.',
                  },
                  {
                    icon: '💳',
                    title: 'Удобная оплата',
                    description: 'Онлайн, наличными или картой курьеру. Как вам удобно.',
                  },
                  {
                    icon: '📸',
                    title: 'Фото букета',
                    description: 'Отправим фото букета перед доставкой по вашему желанию.',
                  },
                  {
                    icon: '🎨',
                    title: 'Индивидуальный подход',
                    description: 'Создадим букет по вашим пожеланиям и бюджету.',
                  },
                ].map((benefit, i) => (
                  <div key={i} className="text-center">
                    <div className="text-5xl mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-serif italic text-primary mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-primary-80">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Telegram Button */}
      <a
        href="https://t.me/your_telegram"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 bg-primary text-cream w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:opacity-80 transition text-2xl z-50"
        title="Написать в Telegram"
      >
        ✈️
      </a>
    </div>
  );
}
