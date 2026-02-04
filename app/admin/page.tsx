'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    customers: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [products, orders] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*'),
    ]);

    const revenue = orders.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    setStats({
      products: products.count || 0,
      orders: orders.data?.length || 0,
      revenue,
      customers: 0,
    });
  };

  const statCards = [
    { label: 'Букеты', value: stats.products, icon: '🌸', color: 'bg-blue-500', link: '/admin/products' },
    { label: 'Заказы', value: stats.orders, icon: '📦', color: 'bg-green-500', link: '/admin/orders' },
    { label: 'Выручка', value: `${stats.revenue}₽`, icon: '💰', color: 'bg-purple-500', link: '/admin/orders' },
    { label: 'Клиенты', value: stats.customers, icon: '👥', color: 'bg-orange-500', link: '/admin/customers' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Добро пожаловать в админ-панель La Flora</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.link}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-700 hover:bg-primary-50 transition"
          >
            <span className="text-2xl">➕</span>
            <span className="font-medium text-gray-700">Добавить букет</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-700 hover:bg-primary-50 transition"
          >
            <span className="text-2xl">📋</span>
            <span className="font-medium text-gray-700">Посмотреть заказы</span>
          </Link>
          <Link
            href="/admin/addons"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-700 hover:bg-primary-50 transition"
          >
            <span className="text-2xl">🎁</span>
            <span className="font-medium text-gray-700">Управление допами</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Последняя активность</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">📦</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Новый заказ #1234</p>
              <p className="text-xs text-gray-600">5 минут назад</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">🌸</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Добавлен новый букет</p>
              <p className="text-xs text-gray-600">1 час назад</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">👤</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Новый клиент зарегистрирован</p>
              <p className="text-xs text-gray-600">2 часа назад</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
