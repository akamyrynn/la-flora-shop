'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }
    
    const { data } = await query;
    setOrders(data || []);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    loadOrders();
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      delivering: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      pending: 'Ожидает',
      confirmed: 'Подтвержден',
      preparing: 'Готовится',
      delivering: 'Доставляется',
      completed: 'Выполнен',
      cancelled: 'Отменен',
    };
    return labels[status] || status;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif italic text-gray-900 mb-2">Заказы</h1>
          <p className="text-gray-600">{orders.length} заказов</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === ''
                ? 'bg-primary-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Все
          </button>
          {['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg transition ${
                filterStatus === status
                  ? 'bg-primary-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Заказ #{order.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary-700 ${getStatusColor(
                  order.status
                )}`}
              >
                <option value="pending">Ожидает</option>
                <option value="confirmed">Подтвержден</option>
                <option value="preparing">Готовится</option>
                <option value="delivering">Доставляется</option>
                <option value="completed">Выполнен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Клиент</p>
                <p className="font-medium text-gray-900">{order.customer_name}</p>
                <p className="text-sm text-gray-600">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Получатель</p>
                <p className="font-medium text-gray-900">{order.recipient_name}</p>
                <p className="text-sm text-gray-600">{order.recipient_phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Доставка</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.delivery_date).toLocaleDateString('ru-RU')}
                </p>
                <p className="text-sm text-gray-600">{order.delivery_time_slot?.start || 'Не указано'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Оплата: <span className="font-medium">{order.payment_method}</span>
                </span>
                {order.is_anonymous && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    Анонимно
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{order.total}₽</p>
                {order.bonus_used > 0 && (
                  <p className="text-xs text-green-600">-{order.bonus_used}₽ бонусами</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-400 mb-4">📦</p>
          <p className="text-gray-600">Заказы не найдены</p>
        </div>
      )}
    </div>
  );
}
