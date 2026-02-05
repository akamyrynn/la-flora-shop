'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { processOrderBonuses } from '@/lib/bonus';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShoppingBag, Gift, CreditCard, Truck, MapPin, User } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, singleFlowers, user, clearCart } = useStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    recipientName: '',
    recipientPhone: '',
    isAnonymous: false,
    deliveryDate: '',
    deliveryTime: '',
    address: '',
    comment: '',
    bonusToUse: 0,
    paymentMethod: 'online',
  });

  // Подставляем данные пользователя если залогинен
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.full_name || prev.customerName,
        customerPhone: user.phone || prev.customerPhone,
      }));
    }
  }, [user]);

  // Расчёт суммы
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const flowersTotal = singleFlowers.reduce((sum, item) => sum + item.flower.price * item.quantity, 0);
  const subtotal = cartTotal + flowersTotal;
  const deliveryCost = subtotal >= 5000 ? 0 : 500;
  const maxBonusUsage = Math.min(user?.bonus_balance || 0, Math.floor(subtotal * 0.3));
  const total = subtotal + deliveryCost - formData.bonusToUse;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0 && singleFlowers.length === 0) {
      setError('Корзина пуста');
      return;
    }

    setLoading(true);

    try {
      // Формируем items для заказа
      const items = [
        ...cart.map(item => ({
          type: 'bouquet',
          product_id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        ...singleFlowers.map(item => ({
          type: 'flower',
          product_id: item.flower.id,
          name: item.flower.name,
          color: item.selectedColor,
          quantity: item.quantity,
          price: item.flower.price,
        })),
      ];

      // Данные заказа - ТОЛЬКО поля которые есть в таблице!
      const orderData = {
        user_id: user?.id || null,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        recipient_name: formData.recipientName,
        recipient_phone: formData.recipientPhone,
        is_anonymous: formData.isAnonymous,
        delivery_date: formData.deliveryDate,
        delivery_time: formData.deliveryTime,
        address: formData.address,
        items: items,
        total: total,
        bonus_used: formData.bonusToUse,
        payment_method: formData.paymentMethod,
        status: 'new',
        notes: formData.comment || null,
      };

      console.log('Creating order with data:', orderData);

      // Создаём заказ
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        setError(`Ошибка: ${orderError.message}`);
        return;
      }

      console.log('Order created:', order);

      // Обрабатываем бонусы если пользователь залогинен
      if (user?.id && formData.bonusToUse > 0) {
        try {
          await processOrderBonuses(user.id, order.id, subtotal, formData.bonusToUse);
          // Обновляем баланс в локальном состоянии
          const { setUser } = useStore.getState();
          setUser({
            ...user,
            bonus_balance: user.bonus_balance - formData.bonusToUse,
          });
        } catch (bonusError) {
          console.error('Bonus processing error:', bonusError);
        }
      }

      // Очищаем корзину
      clearCart();

      // Переход на страницу успеха
      router.push(`/order-success?order=${order.id}`);
    } catch (err) {
      console.error('Ошибка создания заказа:', err);
      setError('Произошла ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  // Если корзина пуста
  if (cart.length === 0 && singleFlowers.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-primary/30 mx-auto mb-4" />
          <h2 className="text-2xl font-serif italic text-primary mb-2">Корзина пуста</h2>
          <p className="text-primary/60 mb-6">Добавьте товары для оформления заказа</p>
          <Link href="/catalog" className="inline-block bg-primary text-cream px-8 py-3 rounded-full hover:opacity-90 transition">
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="p-2 rounded-lg hover:bg-primary/5 text-primary transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif italic text-primary">Оформление заказа</h1>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Форма */}
          <div className="lg:col-span-2 space-y-6">
            {/* Контакты заказчика */}
            <div className="bg-white border border-primary/10 p-6 rounded-2xl">
              <h2 className="text-xl font-serif italic text-primary mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Ваши контакты
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ваше имя *"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-3 border border-primary/20 rounded-xl bg-cream text-primary placeholder:text-primary/50 focus:border-primary focus:outline-none transition"
                  required
                />
                <input
                  type="tel"
                  placeholder="Ваш телефон *"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-primary/20 rounded-xl bg-cream text-primary placeholder:text-primary/50 focus:border-primary focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Получатель */}
            <div className="bg-white border border-primary/10 p-6 rounded-2xl">
              <h2 className="text-xl font-serif italic text-primary mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Получатель
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Имя получателя *"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full px-4 py-3 border border-primary/20 rounded-xl bg-cream text-primary placeholder:text-primary/50 focus:border-primary focus:outline-none transition"
                  required
                />
                <input
                  type="tel"
                  placeholder="Телефон получателя *"
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-primary/20 rounded-xl bg-cream text-primary placeholder:text-primary/50 focus:border-primary focus:outline-none transition"
                  required
                />
              </div>
              <label className="flex items-center gap-3 text-primary cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="w-5 h-5 rounded border-primary/20 text-primary focus:ring-primary"
                />
                <span>Доставить анонимно</span>
              </label>
            </div>

            {/* Доставка */}
            <div className="bg-white border border-primary/10 p-6 rounded-2xl">
              <h2 className="text-xl font-serif italic text-primary mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Доставка
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-primary/60 mb-1">Дата доставки *</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full px-4 py-3 border border-primary/20 rounded-xl bg-cream text-primary focus:border-primary focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary/60 mb-1">Время доставки *</label>
                  <select
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                    className="w-full px-4 py-3 border border-primary/20 rounded-xl bg-cream text-primary focus:border-primary focus:outline-none transition"
                    required
                  >
                    <option value="">Выберите время</option>
                    <option value="09:00-12:00">09:00 - 12:00</option>
                    <option value="12:00-15:00">12:00 - 15:00</option>
                    <option value="15:00-18:00">15:00 - 18:00</option>
                    <option value="18:00-21:00">18:00 - 21:00</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-primary/60 mb-1">Адрес доставки *</label>
                <input
                  type="text"
                  placeholder="Улица, дом, квартира"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-primary/20 rounded-xl bg-cream text-primary placeholder:text-primary/50 focus:border-primary focus:outline-none transition"
                  required
                />
              </div>
              <p className="text-sm text-primary/50 mt-2 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {subtotal >= 5000 ? 'Бесплатная доставка!' : `Доставка: ${deliveryCost}₽ (бесплатно от 5000₽)`}
              </p>
            </div>

            {/* Комментарий */}
            <div className="bg-white border border-primary/10 p-6 rounded-2xl">
              <h2 className="text-xl font-serif italic text-primary mb-4">Комментарий</h2>
              <textarea
                placeholder="Пожелания к заказу..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full px-4 py-3 border border-primary/20 rounded-xl bg-cream text-primary placeholder:text-primary/50 focus:border-primary focus:outline-none transition resize-none h-24"
              />
            </div>

            {/* Бонусы */}
            {user && user.bonus_balance > 0 && (
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
                <h2 className="text-xl font-serif italic text-primary mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Списать бонусы
                </h2>
                <p className="text-primary/70 mb-3">
                  Доступно: <span className="font-bold">{user.bonus_balance} ₽</span>
                  <span className="text-sm ml-2">(макс. {maxBonusUsage} ₽)</span>
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    max={maxBonusUsage}
                    value={formData.bonusToUse}
                    onChange={(e) => setFormData({
                      ...formData,
                      bonusToUse: Math.min(parseInt(e.target.value) || 0, maxBonusUsage)
                    })}
                    className="flex-1 px-4 py-3 border border-primary/20 rounded-xl bg-white text-primary focus:border-primary focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bonusToUse: maxBonusUsage })}
                    className="px-4 py-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition"
                  >
                    Макс
                  </button>
                </div>
              </div>
            )}

            {/* Способ оплаты */}
            <div className="bg-white border border-primary/10 p-6 rounded-2xl">
              <h2 className="text-xl font-serif italic text-primary mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Способ оплаты
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'online', label: 'Онлайн картой' },
                  { value: 'cash', label: 'Наличными курьеру' },
                  { value: 'card', label: 'Картой курьеру' },
                ].map(method => (
                  <label key={method.value} className="flex items-center gap-3 p-3 border border-primary/10 rounded-xl cursor-pointer hover:border-primary/30 transition">
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-5 h-5 text-primary focus:ring-primary"
                    />
                    <span className="text-primary">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Сайдбар */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-primary/10 p-6 rounded-2xl sticky top-20">
              <h2 className="text-xl font-serif italic text-primary mb-4">Ваш заказ</h2>

              {/* Товары */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-primary/5 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] && (
                        <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary truncate">{item.product.name}</p>
                      <p className="text-xs text-primary/50">{item.quantity} шт × {item.product.price} ₽</p>
                    </div>
                  </div>
                ))}
                {singleFlowers.map((item) => (
                  <div key={`${item.flower.id}-${item.selectedColor}`} className="flex gap-3">
                    <div className="w-14 h-14 bg-primary/5 rounded-lg overflow-hidden flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary truncate">{item.flower.name}</p>
                      <p className="text-xs text-primary/50">{item.quantity} шт × {item.flower.price} ₽</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Итог */}
              <div className="border-t border-primary/10 pt-4 space-y-2">
                <div className="flex justify-between text-primary/70 text-sm">
                  <span>Товары:</span>
                  <span>{subtotal} ₽</span>
                </div>
                <div className="flex justify-between text-primary/70 text-sm">
                  <span>Доставка:</span>
                  <span>{deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost} ₽`}</span>
                </div>
                {formData.bonusToUse > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Бонусы:</span>
                    <span>-{formData.bonusToUse} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-serif text-primary pt-2 border-t border-primary/10">
                  <span>Итого:</span>
                  <span>{total} ₽</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-cream py-4 rounded-full hover:opacity-90 transition font-medium mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Оформляем...
                  </>
                ) : (
                  'Оформить заказ'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
