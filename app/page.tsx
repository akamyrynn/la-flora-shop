'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';
import {
  ChevronRight,
  ChevronDown,
  Flower2,
  Calendar,
  Users,
  Palette,
  Ruler,
  Truck,
  Shield,
  Gift,
  CreditCard,
  Camera,
  Heart,
  Star,
  Clock,
  MapPin,
  Phone
} from 'lucide-react';

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

// FAQ данные
const FAQ_DATA = [
  {
    question: 'Можно оформить заказ с доставкой на сегодня?',
    answer: 'В интернет-магазине La Flora вы можете купить цветы с быстрой доставкой по Москве в день заказа с 10:00 до 23:00. Привезем заказ в течение 1–2 часов. Крайнее время предзаказа на сегодня доступно до 19:00. Заказы, оформленные после 19:00, доставляются на следующий день с 10 утра. Если нужна срочная доставка букета или подарка к точному часу, такая услуга предоставляется по согласованию и рассчитывается в зависимости от адреса получателя.',
  },
  {
    question: 'Как оформить заказ, если адрес и время доставки неизвестны?',
    answer: 'В этом случае наша служба доставки свяжется с получателем, чтобы уточнить удобные время и место для вручения подарка. После согласования условий мы отправим вам сообщение с информацией о времени в день доставки в СМС и на email. Информация об адресе получателя не подлежит разглашению, поэтому она будет скрыта в заказе.',
  },
  {
    question: 'Даете ли вы гарантии?',
    answer: 'Каждый заказ застрахован на 100%. Состав и оформление гарантированы и соблюдаются в точности как это представлено в описании и на фотографиях товара. Помимо этого, каждый клиент защищён благодаря нашему особому контролю качества и клиентскому сервису. Фото по собранному заказу обязательно будут отправлены вам в СМС и на Email. Если же цветы проявят признаки увядания в течение 48 часов, обязательно пришлите фотографии нам в чат или на hello@laflora.ru и мы оперативно заменим букет или компенсируем стоимость.',
  },
  {
    question: 'Предоставляете ли вы скидки?',
    answer: 'После каждой покупки вы получаете бонусные баллы, которые можно использовать для оплаты нового заказа - до 100% его стоимости. Также мы начисляем баллы за участие в программе качества: отзывы о цветах и нашей работе, а также предложения по улучшению сервиса. Как получить дополнительные баллы, вам подскажут наши менеджеры.',
  },
  {
    question: 'Что вы делаете, если получателя нет на месте?',
    answer: 'В данной ситуации мы предложим вам возможные варианты: доставку в другое время или день, отправку цветов по другому адресу, либо отмену заказа с возвратом части средств. В любом случае после оформления заказ будет либо доставлен, либо отменён - по вашему желанию.',
  },
  {
    question: 'Сколько стоит доставка букета по адресу?',
    answer: 'Стоимость доставки по Москве внутри МКАД недорогая, составляет 290 руб. В остальных случаях, стоимость услуги рассчитывается автоматически по адресу получателя.',
  },
  {
    question: 'Доставляете ли вы цветы на дом по Москве?',
    answer: 'Да, основное назначение сервиса La Flora это как раз оказание услуги доставки цветочных композиций на дом адресату или заказчику. Вы всегда можете рассчитывать на безупречный курьерский сервис до самой двери. Все букеты тщательно защищены транспортировочной упаковкой и имеют подпитку до момента вручения получателя.',
  },
];

// Отзывы
const REVIEWS_DATA = [
  {
    name: 'Анна Петрова',
    date: '2 дня назад',
    text: 'Потрясающие букеты! Заказывала розы на день рождения мамы, всё было идеально. Свежие цветы, красивая упаковка, доставили точно в срок. Очень довольна!',
    rating: 5,
    product: 'Букет "Нежность"',
  },
  {
    name: 'Дмитрий Козлов',
    date: '5 дней назад',
    text: 'Быстрая доставка, вежливый курьер. Букет превзошел все ожидания! Жена была в восторге от пионов. Обязательно буду заказывать ещё.',
    rating: 5,
    product: 'Букет из пионов',
  },
  {
    name: 'Мария Сидорова',
    date: 'Неделю назад',
    text: 'Заказываю здесь постоянно — и на праздники, и просто так. Качество всегда на высоте, цены адекватные. Бонусная система приятный плюс. Рекомендую!',
    rating: 5,
    product: 'Букет "Весенний микс"',
  },
  {
    name: 'Екатерина Иванова',
    date: '2 недели назад',
    text: 'Заказала букет для подруги на юбилей. Отправили фото перед доставкой — всё как на картинке! Подруга была счастлива. Спасибо за отличный сервис!',
    rating: 5,
    product: 'Букет "Роскошь"',
  },
];

// Интерфейс секции
interface ProductSection {
  title: string;
  href: string;
  products: Product[];
  loading: boolean;
}

export default function HomePage() {
  const [flowerMenuOpen, setFlowerMenuOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Секции с продуктами
  const [sections, setSections] = useState<Record<string, ProductSection>>({
    valentine: { title: 'Букеты на 14 февраля', href: '/catalog?occasion=valentine', products: [], loading: true },
    classic: { title: 'Классические букеты', href: '/catalog?type=classic', products: [], loading: true },
    author: { title: 'Авторские букеты', href: '/catalog?type=author', products: [], loading: true },
    sale: { title: 'Распродажа', href: '/catalog?sale=true', products: [], loading: true },
    roses: { title: 'Букеты роз', href: '/catalog?flower=roses', products: [], loading: true },
    new: { title: 'Новинки', href: '/catalog?new=true', products: [], loading: true },
    premium: { title: 'Премиум букеты', href: '/catalog?type=premium', products: [], loading: true },
    popular: { title: 'Популярное', href: '/catalog?sort=popular', products: [], loading: true },
  });

  useEffect(() => {
    loadAllSections();
  }, []);

  const loadAllSections = async () => {
    // Загружаем все секции параллельно
    const [valentineData, classicData, authorData, saleData, rosesData, newData, premiumData, popularData] = await Promise.all([
      // 14 февраля - все букеты (в реальности фильтр по occasion)
      supabase.from('products').select('*').limit(4),
      // Классические
      supabase.from('products').select('*').eq('bouquet_type', 'mixed').limit(4),
      // Авторские
      supabase.from('products').select('*').eq('bouquet_type', 'composition').limit(4),
      // Распродажа
      supabase.from('products').select('*').not('old_price', 'is', null).limit(4),
      // Розы
      supabase.from('products').select('*').eq('flower_type', 'roses').limit(4),
      // Новинки
      supabase.from('products').select('*').eq('is_new', true).limit(4),
      // Премиум (дорогие)
      supabase.from('products').select('*').gte('price', 5000).order('price', { ascending: false }).limit(4),
      // Популярные
      supabase.from('products').select('*').eq('is_popular', true).order('order_count', { ascending: false }).limit(4),
    ]);

    setSections({
      valentine: { ...sections.valentine, products: valentineData.data || [], loading: false },
      classic: { ...sections.classic, products: classicData.data || [], loading: false },
      author: { ...sections.author, products: authorData.data || [], loading: false },
      sale: { ...sections.sale, products: saleData.data || [], loading: false },
      roses: { ...sections.roses, products: rosesData.data || [], loading: false },
      new: { ...sections.new, products: newData.data || [], loading: false },
      premium: { ...sections.premium, products: premiumData.data || [], loading: false },
      popular: { ...sections.popular, products: popularData.data || [], loading: false },
    });
  };

  // Компонент секции с продуктами
  const ProductSectionComponent = ({ sectionKey }: { sectionKey: string }) => {
    const section = sections[sectionKey];
    if (!section || (section.products.length === 0 && !section.loading)) return null;

    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-serif italic text-primary">
            {section.title}
          </h2>
          <Link
            href={section.href}
            className="flex items-center gap-2 text-primary hover:text-primary/70 transition font-medium"
          >
            <span>Смотреть все</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        {section.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {section.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    );
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
                <Flower2 className="w-6 h-6 text-primary" />
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
                <Flower2 className="w-8 h-8 mb-2 text-primary" />
                <h3 className="text-lg font-serif italic mb-1">Конструктор букетов</h3>
                <p className="text-sm text-primary/60">Создайте свой уникальный букет</p>
              </Link>

              {/* Квиз */}
              <Link href="/quiz" className="block bg-primary text-cream p-5 rounded-2xl text-center hover:opacity-90 transition">
                <Heart className="w-8 h-8 mx-auto mb-2" />
                <h3 className="text-lg font-serif italic mb-1">Не знаете что выбрать?</h3>
                <p className="text-sm text-cream/80">Пройдите квиз</p>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 relative z-0">
            {/* Hero */}
            <section className="bg-primary/[0.03] rounded-3xl p-12 md:p-16 mb-12 text-center border border-primary/10">
              <h1 className="text-5xl md:text-7xl font-serif italic text-primary mb-6">
                La Flora Boutique
              </h1>
              <p className="text-xl md:text-2xl text-primary/80 mb-8 max-w-2xl mx-auto">
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

            {/* Секции продуктов */}
            <ProductSectionComponent sectionKey="valentine" />
            <ProductSectionComponent sectionKey="classic" />
            <ProductSectionComponent sectionKey="author" />
            <ProductSectionComponent sectionKey="sale" />
            <ProductSectionComponent sectionKey="roses" />
            <ProductSectionComponent sectionKey="new" />
            <ProductSectionComponent sectionKey="premium" />
            <ProductSectionComponent sectionKey="popular" />

            {/* Отзывы */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl md:text-4xl font-serif italic text-primary">
                  Отзывы клиентов
                </h2>
                <Link
                  href="/reviews"
                  className="flex items-center gap-2 text-primary hover:text-primary/70 transition font-medium"
                >
                  <span>Все отзывы</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {REVIEWS_DATA.map((review, i) => (
                  <div key={i} className="bg-white border border-primary/10 rounded-2xl p-6 hover:shadow-lg transition">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-serif text-xl flex-shrink-0">
                        {review.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-primary truncate">{review.name}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(review.rating)].map((_, j) => (
                              <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-4">{review.text}</p>
                    <p className="text-xs text-primary/60 truncate">{review.product}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Преимущества */}
            <section className="bg-white rounded-3xl p-8 md:p-12 border border-primary/10 mb-16">
              <h2 className="text-3xl md:text-4xl font-serif italic text-primary mb-10 text-center">
                Почему выбирают нас
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: Flower2,
                    title: 'Свежие цветы',
                    description: 'Только свежие букеты от проверенных поставщиков. Гарантия свежести 5 дней.',
                  },
                  {
                    icon: Truck,
                    title: 'Быстрая доставка',
                    description: 'Доставим в течение 1-2 часов по Москве. Работаем с 10:00 до 23:00.',
                  },
                  {
                    icon: Gift,
                    title: 'Бонусная программа',
                    description: 'Копите бонусы с каждого заказа и оплачивайте ими до 30% стоимости.',
                  },
                  {
                    icon: CreditCard,
                    title: 'Удобная оплата',
                    description: 'Онлайн, наличными или картой курьеру. Как вам удобно.',
                  },
                  {
                    icon: Camera,
                    title: 'Фото букета',
                    description: 'Отправим фото собранного букета перед доставкой бесплатно.',
                  },
                  {
                    icon: Shield,
                    title: 'Гарантия качества',
                    description: 'Заменим букет бесплатно, если он увянет в течение 48 часов.',
                  },
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl md:text-4xl font-serif italic text-primary">
                  Вопросы и ответы
                </h2>
                <Link
                  href="/faq"
                  className="flex items-center gap-2 text-primary hover:text-primary/70 transition font-medium"
                >
                  <span>Все вопросы</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="space-y-4">
                {FAQ_DATA.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white border border-primary/10 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition"
                    >
                      <span className="font-medium text-primary pr-4">{faq.question}</span>
                      <ChevronDown className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${expandedFaq === i ? 'max-h-96' : 'max-h-0'}`}>
                      <p className="px-6 pb-6 text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Контакты */}
            <section className="bg-primary/[0.03] rounded-3xl p-8 md:p-12 border border-primary/10">
              <h2 className="text-3xl md:text-4xl font-serif italic text-primary mb-8 text-center">
                Свяжитесь с нами
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <a href="tel:+79001234567" className="text-lg font-medium text-primary hover:underline">
                      +7 (900) 123-45-67
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Время работы</p>
                    <p className="text-lg font-medium text-primary">10:00 - 23:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Адрес</p>
                    <p className="text-lg font-medium text-primary">Москва, Цветочная 1</p>
                  </div>
                </div>
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
        className="fixed bottom-8 right-8 bg-primary text-cream w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:opacity-80 transition z-50"
        title="Написать в Telegram"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
        </svg>
      </a>
    </div>
  );
}
