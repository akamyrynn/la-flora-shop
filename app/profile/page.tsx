'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { getBonusBalance } from '@/lib/inspiro';

export default function ProfilePage() {
  const { user, setUser } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [bonusCard, setBonusCard] = useState('');

  useEffect(() => {
    if (user) {
      loadOrders();
      if (user.bonus_card) {
        loadBonusBalance();
      }
    }
  }, [user]);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
  };

  const loadBonusBalance = async () => {
    if (user?.bonus_card) {
      const balance = await getBonusBalance(user.bonus_card);
      setUser({ ...user, bonus_balance: balance });
    }
  };

  const linkBonusCard = async () => {
    if (!user) return;
    const balance = await getBonusBalance(bonusCard);
    const updatedUser = { ...user, bonus_card: bonusCard, bonus_balance: balance };
    
    await supabase
      .from('users')
      .update({ bonus_card: bonusCard })
      .eq('id', user.id);
    
    setUser(updatedUser);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Войдите в систему</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Мои заказы</h2>
            {orders.length === 0 ? (
              <p>У вас пока нет заказов</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="border-b pb-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">Заказ #{order.id}</span>
                      <span>{order.total}₽</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm">Статус: {order.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Бонусная карта</h2>
            {user.bonus_card ? (
              <div>
                <p className="text-3xl font-bold text-pink-600 mb-2">
                  {user.bonus_balance}₽
                </p>
                <p className="text-sm text-gray-600">Доступно бонусов</p>
                <p className="text-sm mt-4">Карта: {user.bonus_card}</p>
              </div>
            ) : (
              <div>
                <p className="mb-4">Привяжите бонусную карту Инспиро</p>
                <input
                  type="text"
                  placeholder="Номер карты"
                  value={bonusCard}
                  onChange={(e) => setBonusCard(e.target.value)}
                  className="w-full px-4 py-2 border rounded mb-2"
                />
                <button
                  onClick={linkBonusCard}
                  className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600"
                >
                  Привязать карту
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Контакты</h2>
            <p className="text-sm">Телефон: {user.phone}</p>
            {user.email && <p className="text-sm">Email: {user.email}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
