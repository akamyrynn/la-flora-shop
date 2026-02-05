'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Product, SingleFlower } from '@/lib/types';
import { useStore } from '@/lib/store';
import { ShoppingBag, Heart, Plus, Minus, ChevronRight, Flower2 } from 'lucide-react';

const COLOR_NAMES: Record<string, string> = {
  red: 'Красный',
  white: 'Белый',
  pink: 'Розовый',
  yellow: 'Жёлтый',
  orange: 'Оранжевый',
  purple: 'Фиолетовый',
  burgundy: 'Бордовый',
  mixed: 'Микс',
};

const COLOR_CLASSES: Record<string, string> = {
  red: 'bg-red-500',
  white: 'bg-white border-2 border-gray-200',
  pink: 'bg-pink-400',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  burgundy: 'bg-rose-900',
  mixed: 'bg-gradient-to-r from-red-500 via-yellow-400 to-pink-500',
};

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [variants, setVariants] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [singleFlowers, setSingleFlowers] = useState<SingleFlower[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPackaging, setSelectedPackaging] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleFavorite, favorites, addSingleFlower } = useStore();

  // Выбор поштучных цветов для добавления к букету
  const [flowerAdditions, setFlowerAdditions] = useState<Record<string, { qty: number; color: string }>>({});

  useEffect(() => {
    loadProduct();
    loadSingleFlowers();
  }, [params.id]);

  const loadProduct = async () => {
    setLoading(true);
    setNotFound(false);

    // Декодируем URL (кириллица может быть закодирована)
    const productId = decodeURIComponent(params.id as string);
    console.log('Loading product:', productId);

    // Сначала пробуем найти по slug
    const { data: bySlug, error: slugError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', productId)
      .single();

    console.log('By slug result:', bySlug, slugError);

    if (bySlug) {
      setProduct(bySlug);
      setSelectedPackaging(bySlug.packaging_type);
      loadVariants(bySlug);
      loadSimilarProducts(bySlug);
      setLoading(false);
      return;
    }

    // Затем по id (если это UUID)
    const { data: byId, error: idError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    console.log('By id result:', byId, idError);

    if (byId) {
      setProduct(byId);
      setSelectedPackaging(byId.packaging_type);
      loadVariants(byId);
      loadSimilarProducts(byId);
      setLoading(false);
      return;
    }

    // Не нашли — показываем "не найдено"
    setNotFound(true);
    setLoading(false);
  };

  const loadVariants = async (product: Product) => {
    if (product.variant_group) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('variant_group', product.variant_group)
        .order('quantity', { ascending: true });
      setVariants(data || []);
    }
  };

  const loadSimilarProducts = async (product: Product) => {
    // Похожие по типу цветка или категории
    const { data } = await supabase
      .from('products')
      .select('*')
      .neq('id', product.id)
      .eq('in_stock', true)
      .or(`flower_type.eq.${product.flower_type},bouquet_type.eq.${product.bouquet_type}`)
      .limit(4);

    setSimilarProducts(data || []);
  };

  const loadSingleFlowers = async () => {
    const { data } = await supabase
      .from('single_flowers')
      .select('*')
      .eq('in_stock', true)
      .eq('is_popular', true)
      .order('sort_order')
      .limit(4);

    setSingleFlowers(data || []);
  };

  const switchToVariant = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      setProduct(variant);
      setSelectedImage(0);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // Добавляем выбранные поштучные цветы
      Object.entries(flowerAdditions).forEach(([flowerId, { qty, color }]) => {
        if (qty > 0) {
          const flower = singleFlowers.find((f) => f.id === flowerId);
          if (flower) {
            addSingleFlower(flower, qty, color);
          }
        }
      });
    }
  };

  const updateFlowerAddition = (flowerId: string, qty: number, color: string) => {
    setFlowerAdditions((prev) => ({
      ...prev,
      [flowerId]: { qty: Math.max(0, qty), color },
    }));
  };

  // Дополнительная стоимость от поштучных цветов
  const additionalFlowersCost = Object.entries(flowerAdditions).reduce((sum, [flowerId, { qty }]) => {
    const flower = singleFlowers.find((f) => f.id === flowerId);
    return sum + (flower?.price || 0) * qty;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-4">🌸</div>
        <h1 className="text-2xl font-serif text-primary mb-2">Товар не найден</h1>
        <p className="text-primary/60 mb-6">Возможно, он был удалён или перемещён</p>
        <Link
          href="/catalog"
          className="px-6 py-3 bg-primary text-cream rounded-full hover:bg-primary/90 transition"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.includes(product.id);
  const totalPrice = product.price * quantity + additionalFlowersCost;

  return (
    <div className="min-h-screen bg-cream py-8 px-4 md:py-12 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Хлебные крошки */}
        <div className="flex items-center gap-2 text-sm text-primary/60 mb-6">
          <Link href="/" className="hover:text-primary">Главная</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/catalog" className="hover:text-primary">Каталог</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Галерея */}
          <div>
            <div className="relative aspect-[3/4] bg-primary/5 rounded-2xl overflow-hidden mb-4">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : product.main_image ? (
                <Image
                  src={product.main_image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/30">
                  <span className="text-9xl">🌸</span>
                </div>
              )}

              {/* Бейджи */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new && (
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                    Новинка
                  </span>
                )}
                {product.old_price && product.old_price > product.price && (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    Скидка {Math.round((1 - product.price / product.old_price) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* Миниатюры */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition
                      ${selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-primary/30'}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Информация о товаре */}
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-primary mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Цена */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-serif text-primary">{totalPrice.toLocaleString()} ₽</span>
              {product.old_price && product.old_price > product.price && (
                <span className="text-2xl text-primary/50 line-through">{product.old_price.toLocaleString()} ₽</span>
              )}
            </div>

            {product.short_description && (
              <p className="text-primary/70 mb-6 leading-relaxed">{product.short_description}</p>
            )}

            {/* Варианты по количеству */}
            {variants.length > 1 && (
              <div className="mb-6">
                <p className="text-primary font-medium mb-3">Количество цветов:</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => switchToVariant(variant.id)}
                      className={`px-5 py-2.5 border-2 rounded-full transition font-medium
                        ${variant.id === product.id
                          ? 'bg-primary text-cream border-primary'
                          : 'bg-cream text-primary border-primary/20 hover:border-primary'
                        }`}
                    >
                      {variant.quantity} шт — {variant.price.toLocaleString()} ₽
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Упаковка */}
            <div className="mb-6">
              <p className="text-primary font-medium mb-3">Упаковка:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPackaging('ribbon')}
                  className={`px-5 py-2.5 border-2 rounded-full transition
                    ${selectedPackaging === 'ribbon'
                      ? 'bg-primary text-cream border-primary'
                      : 'bg-cream text-primary border-primary/20 hover:border-primary'
                    }`}
                >
                  Под ленту
                </button>
                <button
                  onClick={() => setSelectedPackaging('wrapped')}
                  className={`px-5 py-2.5 border-2 rounded-full transition
                    ${selectedPackaging === 'wrapped'
                      ? 'bg-primary text-cream border-primary'
                      : 'bg-cream text-primary border-primary/20 hover:border-primary'
                    }`}
                >
                  В упаковке (+200 ₽)
                </button>
              </div>
            </div>

            {/* Добавить цветы поштучно */}
            {singleFlowers.length > 0 && (
              <div className="mb-6 p-4 bg-primary/5 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Flower2 className="w-5 h-5 text-primary" />
                  <p className="text-primary font-medium">Добавить цветы к букету:</p>
                </div>
                <div className="space-y-3">
                  {singleFlowers.map((flower) => {
                    const addition = flowerAdditions[flower.id] || { qty: 0, color: flower.color };
                    return (
                      <div key={flower.id} className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-primary">{flower.name}</p>
                          <p className="text-sm text-primary/60">{flower.price} ₽/шт</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateFlowerAddition(flower.id, addition.qty - 1, addition.color)}
                            className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center
                              hover:bg-primary/5 transition disabled:opacity-30"
                            disabled={addition.qty <= 0}
                          >
                            <Minus className="w-4 h-4 text-primary" />
                          </button>
                          <span className="w-8 text-center font-medium text-primary">{addition.qty}</span>
                          <button
                            onClick={() => updateFlowerAddition(flower.id, addition.qty + 1, addition.color)}
                            className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center
                              hover:bg-primary/5 transition"
                          >
                            <Plus className="w-4 h-4 text-primary" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link
                  href="/flowers"
                  className="block text-center text-sm text-primary/70 hover:text-primary mt-3 underline"
                >
                  Все цветы поштучно →
                </Link>
              </div>
            )}

            {/* Количество и кнопки */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border-2 border-primary/20 rounded-full">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-primary/5 transition rounded-l-full"
                >
                  <Minus className="w-5 h-5 text-primary" />
                </button>
                <span className="w-12 text-center text-xl font-medium text-primary">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-primary/5 transition rounded-r-full"
                >
                  <Plus className="w-5 h-5 text-primary" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-cream py-4 rounded-full hover:bg-primary/90 transition
                  text-lg font-medium flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                В корзину
              </button>

              <button
                onClick={() => toggleFavorite(product.id)}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition
                  ${isFavorite
                    ? 'border-red-500 bg-red-500 text-white'
                    : 'border-primary/20 hover:border-primary text-primary'
                  }`}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Табы */}
            <div className="border-t border-primary/10 pt-6">
              <div className="flex gap-6 mb-4 border-b border-primary/10">
                {['description', 'composition', 'care'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 transition text-sm md:text-base
                      ${activeTab === tab
                        ? 'border-b-2 border-primary text-primary font-medium'
                        : 'text-primary/50 hover:text-primary'
                      }`}
                  >
                    {tab === 'description' && 'Описание'}
                    {tab === 'composition' && 'Состав'}
                    {tab === 'care' && 'Уход'}
                  </button>
                ))}
              </div>

              <div className="text-primary/70 leading-relaxed text-sm md:text-base">
                {activeTab === 'description' && (product.description || 'Описание скоро появится')}
                {activeTab === 'composition' && (product.composition || 'Состав не указан')}
                {activeTab === 'care' && (product.care_instructions || 'Поставьте букет в чистую воду комнатной температуры. Меняйте воду каждые 2 дня. Подрезайте стебли под углом 45°.')}
              </div>
            </div>
          </div>
        </div>

        {/* Похожие букеты */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-serif italic text-primary mb-8">Похожие букеты</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug || item.id}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] bg-primary/5 rounded-xl overflow-hidden mb-3">
                    {item.images && item.images.length > 0 ? (
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : item.main_image ? (
                      <Image
                        src={item.main_image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🌸</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-primary group-hover:text-primary/70 transition line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-lg font-serif text-primary mt-1">{item.price.toLocaleString()} ₽</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
