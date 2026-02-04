'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

export default function HomePage() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);

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
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Категории */}
              <div className="bg-cream border border-primary-10 rounded-2xl p-6">
                <h3 className="text-2xl font-serif italic text-primary mb-6">Категории</h3>
                <nav className="space-y-3">
                  <Link href="/catalog" className="block text-primary-80 hover:text-primary transition py-2 border-b border-primary-10">
                    Все букеты
                  </Link>
                  <Link href="/catalog?type=mono" className="block text-primary-80 hover:text-primary transition py-2 border-b border-primary-10">
                    🌹 Монобукеты
                  </Link>
                  <Link href="/catalog?type=mixed" className="block text-primary-80 hover:text-primary transition py-2 border-b border-primary-10">
                    💐 Сборные букеты
                  </Link>
                  <Link href="/catalog?type=composition" className="block text-primary-80 hover:text-primary transition py-2 border-b border-primary-10">
                    🌸 Композиции
                  </Link>
                  <Link href="/catalog?flower=roses" className="block text-primary-80 hover:text-primary transition py-2 border-b border-primary-10">
                    Розы
                  </Link>
                  <Link href="/catalog?flower=peonies" className="block text-primary-80 hover:text-primary transition py-2 border-b border-primary-10">
                    Пионы
                  </Link>
                  <Link href="/catalog?flower=tulips" className="block text-primary-80 hover:text-primary transition py-2 border-b border-primary-10">
                    Тюльпаны
                  </Link>
                </nav>
              </div>

              {/* Повод */}
              <div className="bg-cream border border-primary-10 rounded-2xl p-6">
                <h3 className="text-2xl font-serif italic text-primary mb-6">Повод</h3>
                <nav className="space-y-3">
                  <Link href="/catalog?occasion=birthday" className="block text-primary-80 hover:text-primary transition py-2">
                    🎂 День рождения
                  </Link>
                  <Link href="/catalog?occasion=wedding" className="block text-primary-80 hover:text-primary transition py-2">
                    💍 Свадьба
                  </Link>
                  <Link href="/catalog?occasion=march8" className="block text-primary-80 hover:text-primary transition py-2">
                    🌷 8 марта
                  </Link>
                  <Link href="/catalog?occasion=valentines" className="block text-primary-80 hover:text-primary transition py-2">
                    ❤️ День влюбленных
                  </Link>
                  <Link href="/catalog?occasion=anniversary" className="block text-primary-80 hover:text-primary transition py-2">
                    🎉 Годовщина
                  </Link>
                </nav>
              </div>

              {/* Бюджет */}
              <div className="bg-primary/[0.03] border border-primary-10 rounded-2xl p-6">
                <h3 className="text-2xl font-serif italic text-primary mb-6">Бюджет</h3>
                <nav className="space-y-3">
                  <Link href="/catalog?budget=0-2500" className="block text-primary-80 hover:text-primary transition py-2">
                    До 2 500₽
                  </Link>
                  <Link href="/catalog?budget=2500-5000" className="block text-primary-80 hover:text-primary transition py-2">
                    2 500 - 5 000₽
                  </Link>
                  <Link href="/catalog?budget=5000-10000" className="block text-primary-80 hover:text-primary transition py-2">
                    5 000 - 10 000₽
                  </Link>
                  <Link href="/catalog?budget=10000-999999" className="block text-primary-80 hover:text-primary transition py-2">
                    От 10 000₽
                  </Link>
                </nav>
              </div>

              {/* Квиз */}
              <Link href="/quiz" className="block bg-primary text-cream p-6 rounded-2xl text-center hover:opacity-80 transition">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="text-xl font-serif italic mb-2">Не знаете что выбрать?</h3>
                <p className="text-sm text-cream-80">Пройдите квиз</p>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
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
