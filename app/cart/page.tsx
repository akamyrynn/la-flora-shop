'use client';

import { useStore } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';
import AddonsSection from '@/components/AddonsSection';
import { Trash2, Plus, Minus, Flower2 } from 'lucide-react';

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

export default function CartPage() {
  const {
    cart,
    singleFlowers,
    removeFromCart,
    updateCartQuantity,
    removeSingleFlower,
    updateSingleFlowerQuantity,
  } = useStore();

  // Сумма букетов
  const bouquetsTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Сумма поштучных цветов
  const flowersTotal = singleFlowers.reduce(
    (sum, item) => sum + item.flower.price * item.quantity,
    0
  );

  // Общая сумма
  const total = bouquetsTotal + flowersTotal;

  // Всего товаров
  const totalItems =
    cart.reduce((sum, item) => sum + item.quantity, 0) +
    singleFlowers.reduce((sum, item) => sum + item.quantity, 0);

  const isEmpty = cart.length === 0 && singleFlowers.length === 0;

  return (
    <div className="min-h-screen bg-cream py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif italic text-primary mb-8">Корзина</h1>

        {isEmpty ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🛒</div>
            <p className="text-2xl font-serif italic text-primary/60 mb-6">Корзина пуста</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/catalog"
                className="inline-block bg-primary text-cream px-8 py-4 rounded-full hover:bg-primary/90 transition"
              >
                Перейти в каталог
              </Link>
              <Link
                href="/flowers"
                className="inline-block border-2 border-primary text-primary px-8 py-4 rounded-full hover:bg-primary/5 transition"
              >
                Цветы поштучно
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-6">
              {/* Букеты */}
              {cart.length > 0 && (
                <div>
                  <h2 className="text-xl font-medium text-primary mb-4">Букеты</h2>
                  <div className="bg-white rounded-2xl overflow-hidden">
                    {cart.map((item, index) => (
                      <div
                        key={item.product.id}
                        className={`flex gap-4 p-4 ${
                          index !== cart.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="relative w-24 h-24 md:w-32 md:h-32 bg-primary/5 rounded-xl overflow-hidden flex-shrink-0">
                          {item.product.images && item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : item.product.main_image ? (
                            <Image
                              src={item.product.main_image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-4xl">🌸</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-primary truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-primary/60 text-sm mb-3">{item.product.price.toLocaleString()} ₽</p>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 border border-primary/20 rounded-full">
                              <button
                                onClick={() =>
                                  updateCartQuantity(item.product.id, Math.max(1, item.quantity - 1))
                                }
                                className="w-9 h-9 flex items-center justify-center hover:bg-primary/5 transition rounded-l-full"
                              >
                                <Minus className="w-4 h-4 text-primary" />
                              </button>
                              <span className="text-primary font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="w-9 h-9 flex items-center justify-center hover:bg-primary/5 transition rounded-r-full"
                              >
                                <Plus className="w-4 h-4 text-primary" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-primary/50 hover:text-red-500 transition"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-serif text-primary">
                            {(item.product.price * item.quantity).toLocaleString()} ₽
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Поштучные цветы */}
              {singleFlowers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Flower2 className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-medium text-primary">Цветы поштучно</h2>
                  </div>
                  <div className="bg-white rounded-2xl overflow-hidden">
                    {singleFlowers.map((item, index) => (
                      <div
                        key={`${item.flower.id}-${item.selectedColor}`}
                        className={`flex gap-4 p-4 ${
                          index !== singleFlowers.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="relative w-20 h-20 bg-primary/5 rounded-xl overflow-hidden flex-shrink-0">
                          {item.flower.image ? (
                            <Image
                              src={item.flower.image}
                              alt={item.flower.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-3xl">🌷</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-primary">{item.flower.name}</h3>
                          <p className="text-primary/60 text-sm">
                            {COLOR_NAMES[item.selectedColor] || item.selectedColor} • {item.flower.price} ₽/шт
                          </p>

                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 border border-primary/20 rounded-full">
                              <button
                                onClick={() =>
                                  updateSingleFlowerQuantity(
                                    item.flower.id,
                                    item.selectedColor,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center hover:bg-primary/5 transition rounded-l-full"
                              >
                                <Minus className="w-4 h-4 text-primary" />
                              </button>
                              <span className="text-primary font-medium w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateSingleFlowerQuantity(
                                    item.flower.id,
                                    item.selectedColor,
                                    item.quantity + 1
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center hover:bg-primary/5 transition rounded-r-full"
                              >
                                <Plus className="w-4 h-4 text-primary" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeSingleFlower(item.flower.id, item.selectedColor)}
                              className="text-primary/50 hover:text-red-500 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-serif text-primary">
                            {(item.flower.price * item.quantity).toLocaleString()} ₽
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/flowers"
                    className="block text-center text-primary/70 hover:text-primary mt-3 text-sm underline"
                  >
                    + Добавить ещё цветы
                  </Link>
                </div>
              )}

              {/* Дополнения */}
              <AddonsSection />
            </div>

            {/* Итого */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-medium text-primary mb-4">Ваш заказ</h3>

                <div className="space-y-3 mb-4 text-sm">
                  {cart.length > 0 && (
                    <div className="flex justify-between text-primary/70">
                      <span>Букеты ({cart.reduce((s, i) => s + i.quantity, 0)} шт)</span>
                      <span>{bouquetsTotal.toLocaleString()} ₽</span>
                    </div>
                  )}
                  {singleFlowers.length > 0 && (
                    <div className="flex justify-between text-primary/70">
                      <span>Цветы ({singleFlowers.reduce((s, i) => s + i.quantity, 0)} шт)</span>
                      <span>{flowersTotal.toLocaleString()} ₽</span>
                    </div>
                  )}
                  <div className="flex justify-between text-primary/70">
                    <span>Доставка</span>
                    <span>При оформлении</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between text-2xl font-serif text-primary">
                    <span>Итого:</span>
                    <span>{total.toLocaleString()} ₽</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-primary text-cream text-center py-4 rounded-full hover:bg-primary/90 transition font-medium"
                >
                  Оформить заказ
                </Link>

                <p className="text-xs text-primary/50 text-center mt-4">
                  Нажимая «Оформить заказ», вы соглашаетесь с условиями обработки данных
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
