'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SingleFlower } from '@/lib/types';
import { useStore } from '@/lib/store';
import { ShoppingBag, Plus, Minus, Check, Flower2, AlertCircle } from 'lucide-react';

const COLOR_NAMES: Record<string, string> = {
  red: 'Красный',
  white: 'Белый',
  pink: 'Розовый',
  yellow: 'Жёлтый',
  orange: 'Оранжевый',
  purple: 'Фиолетовый',
  burgundy: 'Бордовый',
  cream: 'Кремовый',
  green: 'Зелёный',
};

const COLOR_CLASSES: Record<string, string> = {
  red: 'bg-red-500',
  white: 'bg-white border-2 border-gray-200',
  pink: 'bg-pink-400',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  burgundy: 'bg-rose-900',
  cream: 'bg-amber-100',
  green: 'bg-green-500',
};

export default function FlowersPage() {
  const [flowers, setFlowers] = useState<SingleFlower[]>([]);
  const [loading, setLoading] = useState(true);
  const { singleFlowers, addSingleFlower, removeSingleFlower, updateSingleFlowerQuantity } = useStore();

  // Состояние выбора для каждого цветка
  const [selections, setSelections] = useState<Record<string, { color: string; quantity: number }>>({});

  useEffect(() => {
    loadFlowers();
  }, []);

  const loadFlowers = async () => {
    const { data, error } = await supabase
      .from('single_flowers')
      .select('*')
      .eq('in_stock', true)
      .order('sort_order');

    if (data) {
      setFlowers(data);
      // Инициализируем выбор по умолчанию
      const initial: Record<string, { color: string; quantity: number }> = {};
      data.forEach((f) => {
        initial[f.id] = { color: f.color, quantity: 1 };
      });
      setSelections(initial);
    }
    setLoading(false);
  };

  const handleColorChange = (flowerId: string, color: string) => {
    setSelections((prev) => ({
      ...prev,
      [flowerId]: { ...prev[flowerId], color },
    }));
  };

  const handleQuantityChange = (flowerId: string, delta: number) => {
    setSelections((prev) => {
      const current = prev[flowerId]?.quantity || 1;
      const flower = flowers.find((f) => f.id === flowerId);
      const min = flower?.min_quantity || 1;
      const max = flower?.max_quantity || 99;
      const newQty = Math.max(min, Math.min(max, current + delta));
      return {
        ...prev,
        [flowerId]: { ...prev[flowerId], quantity: newQty },
      };
    });
  };

  const handleAddToCart = (flower: SingleFlower) => {
    const selection = selections[flower.id];
    if (selection) {
      addSingleFlower(flower, selection.quantity, selection.color);
    }
  };

  const isInCart = (flowerId: string, color: string) => {
    return singleFlowers.some((item) => item.flower.id === flowerId && item.selectedColor === color);
  };

  // Подсчёт общей суммы в корзине поштучных цветов
  const totalFlowersInCart = singleFlowers.reduce((sum, item) => sum + item.quantity, 0);
  const totalFlowersPrice = singleFlowers.reduce((sum, item) => sum + item.flower.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-primary text-cream py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Flower2 className="w-8 h-8" />
            <h1 className="text-4xl font-serif italic">Цветы поштучно</h1>
          </div>
          <p className="text-cream/80 max-w-2xl">
            Выберите любые цветы в нужном количестве. Идеально для составления собственного букета
            или когда нужно добавить пару цветков к готовому букету.
          </p>
        </div>
      </div>

      {/* Корзина поштучных (фиксированная) */}
      {totalFlowersInCart > 0 && (
        <div className="sticky top-16 z-40 bg-white shadow-md border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-primary">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium">{totalFlowersInCart} цветов</span>
              </div>
              <span className="text-2xl font-serif text-primary">{totalFlowersPrice.toLocaleString()} ₽</span>
            </div>
            <Link
              href="/cart"
              className="px-6 py-2 bg-primary text-cream rounded-full hover:bg-primary/90 transition font-medium"
            >
              Перейти в корзину
            </Link>
          </div>
        </div>
      )}

      {/* Список цветов */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {flowers.length === 0 ? (
          <div className="text-center py-16">
            <Flower2 className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <p className="text-primary/60 text-lg">Цветы пока не добавлены</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flowers.map((flower) => {
              const selection = selections[flower.id] || { color: flower.color, quantity: 1 };
              const inCart = isInCart(flower.id, selection.color);
              const itemPrice = flower.price * selection.quantity;

              return (
                <div
                  key={flower.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  {/* Изображение */}
                  <div className="relative aspect-square bg-primary/5">
                    {flower.image ? (
                      <Image
                        src={flower.image}
                        alt={flower.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-8xl">🌸</span>
                      </div>
                    )}
                    {/* Сезонный бейдж */}
                    {flower.is_seasonal && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                        Сезонный
                      </div>
                    )}
                    {/* Цена за штуку */}
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full">
                      <span className="font-medium text-primary">{flower.price} ₽/шт</span>
                    </div>
                  </div>

                  {/* Информация */}
                  <div className="p-4">
                    <h3 className="text-xl font-serif text-primary mb-1">{flower.name}</h3>
                    {flower.stem_length && (
                      <p className="text-sm text-primary/60 mb-3">Высота: {flower.stem_length}</p>
                    )}

                    {/* Выбор цвета */}
                    {flower.available_colors.length > 1 && (
                      <div className="mb-4">
                        <p className="text-sm text-primary/70 mb-2">Выберите цвет:</p>
                        <div className="flex flex-wrap gap-2">
                          {flower.available_colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => handleColorChange(flower.id, color)}
                              className={`w-8 h-8 rounded-full ${COLOR_CLASSES[color] || 'bg-gray-300'}
                                ${selection.color === color ? 'ring-2 ring-primary ring-offset-2' : ''}
                                transition-all hover:scale-110`}
                              title={COLOR_NAMES[color] || color}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-primary/50 mt-1">
                          {COLOR_NAMES[selection.color] || selection.color}
                        </p>
                      </div>
                    )}

                    {/* Выбор количества */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(flower.id, -1)}
                          disabled={selection.quantity <= flower.min_quantity}
                          className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center
                            hover:border-primary hover:bg-primary/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4 text-primary" />
                        </button>
                        <span className="text-2xl font-medium text-primary w-12 text-center">
                          {selection.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(flower.id, 1)}
                          disabled={selection.quantity >= flower.max_quantity}
                          className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center
                            hover:border-primary hover:bg-primary/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-serif text-primary">{itemPrice.toLocaleString()} ₽</p>
                      </div>
                    </div>

                    {/* Кнопка добавления */}
                    <button
                      onClick={() => handleAddToCart(flower)}
                      className={`w-full py-3 rounded-full font-medium transition flex items-center justify-center gap-2
                        ${inCart
                          ? 'bg-green-500 text-white'
                          : 'bg-primary text-cream hover:bg-primary/90'
                        }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-5 h-5" />
                          В корзине — добавить ещё
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5" />
                          Добавить в корзину
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Информация */}
        <div className="mt-12 bg-primary/5 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-primary mb-2">Как это работает?</h3>
              <ul className="text-primary/70 space-y-1 text-sm">
                <li>• Выберите любые цветы и нужное количество</li>
                <li>• Цветы можно добавить к готовому букету или купить отдельно</li>
                <li>• Минимальный заказ поштучных цветов — от 3 штук</li>
                <li>• Флорист соберёт ваш заказ в день доставки</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
