'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

type Period = 'today' | 'week' | 'month' | 'year';

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month');

  // Demo data - would come from API in real app
  const stats = {
    revenue: { value: 458000, change: 12.5 },
    orders: { value: 156, change: 8.3 },
    averageOrder: { value: 2936, change: -2.1 },
    customers: { value: 89, change: 15.7 },
  };

  const topProducts = [
    { name: 'Букет "Нежность"', sold: 45, revenue: 112500 },
    { name: 'Букет "Страсть"', sold: 38, revenue: 133000 },
    { name: 'Розы красные 51 шт', sold: 32, revenue: 224000 },
    { name: 'Букет "Весна"', sold: 28, revenue: 70000 },
    { name: 'Тюльпаны 25 шт', sold: 24, revenue: 48000 },
  ];

  const periodLabels: Record<Period, string> = {
    today: 'Сегодня',
    week: 'Неделя',
    month: 'Месяц',
    year: 'Год',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
            <BarChart3 className="h-7 w-7 text-primary" />
            Отчёты и аналитика
          </h1>
          <p className="mt-1 text-gray-500">
            Статистика продаж и ключевые показатели
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                stats.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.revenue.change >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(stats.revenue.change)}%
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Выручка</p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.revenue.value.toLocaleString()} ₽
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                stats.orders.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.orders.change >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(stats.orders.change)}%
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Заказы</p>
          <p className="mt-1 text-2xl font-semibold">{stats.orders.value}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                stats.averageOrder.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.averageOrder.change >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(stats.averageOrder.change)}%
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Средний чек</p>
          <p className="mt-1 text-2xl font-semibold">
            {stats.averageOrder.value.toLocaleString()} ₽
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                stats.customers.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.customers.change >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(stats.customers.change)}%
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Новые клиенты</p>
          <p className="mt-1 text-2xl font-semibold">{stats.customers.value}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-medium">Динамика выручки</h3>
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
            <div className="text-center">
              <BarChart3 className="mx-auto mb-2 h-12 w-12" />
              <p>График выручки</p>
              <p className="text-sm">Подключите библиотеку графиков (recharts)</p>
            </div>
          </div>
        </div>

        {/* Orders Chart Placeholder */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-medium">Заказы по дням</h3>
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 h-12 w-12" />
              <p>График заказов</p>
              <p className="text-sm">Подключите библиотеку графиков (recharts)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-medium">Топ продаваемых товаров</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-sm font-medium text-gray-500">Товар</th>
                <th className="pb-3 text-right text-sm font-medium text-gray-500">Продано</th>
                <th className="pb-3 text-right text-sm font-medium text-gray-500">Выручка</th>
                <th className="pb-3 text-right text-sm font-medium text-gray-500">Доля</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.map((product, index) => {
                const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
                const share = (product.revenue / totalRevenue) * 100;

                return (
                  <tr key={product.name}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-600">
                          {index + 1}
                        </span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">{product.sold} шт</td>
                    <td className="py-3 text-right font-medium">
                      {product.revenue.toLocaleString()} ₽
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{share.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="text-sm font-medium text-gray-500">Конверсия корзины</h4>
          <p className="mt-2 text-2xl font-semibold">68%</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            +5% к прошлому периоду
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="text-sm font-medium text-gray-500">Возвраты</h4>
          <p className="mt-2 text-2xl font-semibold">2.3%</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
            <TrendingDown className="h-4 w-4" />
            -0.5% к прошлому периоду
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="text-sm font-medium text-gray-500">Повторные покупки</h4>
          <p className="mt-2 text-2xl font-semibold">34%</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            +8% к прошлому периоду
          </div>
        </div>
      </div>
    </div>
  );
}
