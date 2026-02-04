'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const { cart, user } = useStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    recipientName: '',
    recipientPhone: '',
    isAnonymous: false,
    deliveryDate: '',
    deliveryTime: '',
    address: '',
    bonusToUse: 0,
    paymentMethod: 'online',
  });

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCost = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Создание заказа в Supabase
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
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: total + deliveryCost - formData.bonusToUse,
        bonus_used: formData.bonusToUse,
        payment_method: formData.paymentMethod,
        status: 'new'
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Списание бонусов если использовались
      if (formData.bonusToUse > 0 && user?.bonus_card) {
        const { useBonuses } = await import('@/lib/inspiro');
        await useBonuses(user.bonus_card, formData.bonusToUse);
      }

      // Очистка корзины
      const { clearCart } = useStore.getState();
      clearCart();

      router.push('/order-success');
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
    }
  };

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-serif italic text-primary mb-12">Оформление заказа</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-cream border border-primary-10 p-8 rounded-2xl">
              <h2 className="text-2xl font-serif italic text-primary mb-6">Контакты заказчика</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="w-full px-6 py-4 border border-primary-10 rounded-full bg-cream text-primary placeholder:text-primary-65 focus:border-primary focus:outline-none transition"
                  required
                />
                <input
                  type="tel"
                  placeholder="Ваш телефон"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  className="w-full px-6 py-4 border border-primary-10 rounded-full bg-cream text-primary placeholder:text-primary-65 focus:border-primary focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="bg-cream border border-primary-10 p-8 rounded-2xl">
              <h2 className="text-2xl font-serif italic text-primary mb-6">Получатель</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Имя получателя"
                  value={formData.recipientName}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientName: e.target.value })
                  }
                  className="w-full px-6 py-4 border border-primary-10 rounded-full bg-cream text-primary placeholder:text-primary-65 focus:border-primary focus:outline-none transition"
                  required
                />
                <input
                  type="tel"
                  placeholder="Телефон получателя"
                  value={formData.recipientPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientPhone: e.target.value })
                  }
                  className="w-full px-6 py-4 border border-primary-10 rounded-full bg-cream text-primary placeholder:text-primary-65 focus:border-primary focus:outline-none transition"
                  required
                />
                <label className="flex items-center gap-3 text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) =>
                      setFormData({ ...formData, isAnonymous: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-primary-10 text-primary focus:ring-primary"
                  />
                  <span>Доставить анонимно</span>
                </label>
              </div>
            </div>

            <div className="bg-cream border border-primary-10 p-8 rounded-2xl">
              <h2 className="text-2xl font-serif italic text-primary mb-6">Дата и время доставки</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryDate: e.target.value })
                  }
                  className="px-6 py-4 border border-primary-10 rounded-full bg-cream text-primary focus:border-primary focus:outline-none transition"
                  required
                />
                <select
                  value={formData.deliveryTime}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryTime: e.target.value })
                  }
                  className="px-6 py-4 border border-primary-10 rounded-full bg-cream text-primary focus:border-primary focus:outline-none transition"
                  required
                >
                  <option value="">Выберите время</option>
                  <option value="10:00-12:00">10:00-12:00</option>
                  <option value="12:00-14:00">12:00-14:00</option>
                  <option value="14:00-16:00">14:00-16:00</option>
                  <option value="16:00-18:00">16:00-18:00</option>
                  <option value="18:00-20:00">18:00-20:00</option>
                </select>
              </div>
            </div>

            <div className="bg-cream border border-primary-10 p-8 rounded-2xl">
              <h2 className="text-2xl font-serif italic text-primary mb-6">Адрес доставки</h2>
              <input
                type="text"
                placeholder="Введите адрес"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-6 py-4 border border-primary-10 rounded-full bg-cream text-primary placeholder:text-primary-65 focus:border-primary focus:outline-none transition mb-4"
                required
              />
              <div className="h-64 bg-primary/[0.07] rounded-2xl flex items-center justify-center">
                <p className="text-primary-65 font-serif italic">Карта</p>
              </div>
            </div>

            {user && (
              <div className="bg-cream border border-primary-10 p-8 rounded-2xl">
                <h2 className="text-2xl font-serif italic text-primary mb-6">Бонусы</h2>
                <p className="mb-4 text-primary-80">Доступно: {user.bonus_balance}₽</p>
                <input
                  type="number"
                  placeholder="Списать бонусов"
                  max={user.bonus_balance}
                  value={formData.bonusToUse}
                  onChange={(e) =>
                    setFormData({ ...formData, bonusToUse: parseInt(e.target.value) })
                  }
                  className="w-full px-6 py-4 border border-primary-10 rounded-full bg-cream text-primary placeholder:text-primary-65 focus:border-primary focus:outline-none transition"
                />
              </div>
            )}

            <div className="bg-cream border border-primary-10 p-8 rounded-2xl">
              <h2 className="text-2xl font-serif italic text-primary mb-6">Способ оплаты</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-primary cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as any })
                    }
                    className="w-5 h-5 text-primary focus:ring-primary"
                  />
                  <span>Онлайн картой</span>
                </label>
                <label className="flex items-center gap-3 text-primary cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as any })
                    }
                    className="w-5 h-5 text-primary focus:ring-primary"
                  />
                  <span>Наличными курьеру</span>
                </label>
                <label className="flex items-center gap-3 text-primary cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as any })
                    }
                    className="w-5 h-5 text-primary focus:ring-primary"
                  />
                  <span>Картой курьеру</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-primary/[0.03] p-8 rounded-2xl h-fit border border-primary-10">
            <h2 className="text-2xl font-serif italic text-primary mb-6">Итого</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-primary-80">
                <span>Товары:</span>
                <span>{total}₽</span>
              </div>
              <div className="flex justify-between text-primary-80">
                <span>Доставка:</span>
                <span>{deliveryCost}₽</span>
              </div>
              {formData.bonusToUse > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Бонусы:</span>
                  <span>-{formData.bonusToUse}₽</span>
                </div>
              )}
            </div>
            <div className="border-t border-primary-10 pt-6 mb-8">
              <div className="flex justify-between text-2xl font-serif text-primary">
                <span>Всего:</span>
                <span>{total + deliveryCost - formData.bonusToUse}₽</span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-cream py-4 rounded-full hover:bg-primary-800 transition font-medium text-lg"
            >
              Подтвердить заказ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
