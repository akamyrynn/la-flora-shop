'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Download,
  Eye,
  Gift,
  ShoppingBag,
  Phone,
  Mail,
  Tag,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DataTable, { Column } from '@/components/admin/ui/DataTable';
import FilterBar, { FilterConfig } from '@/components/admin/ui/FilterBar';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import type { Profile } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 25;

  useEffect(() => {
    loadCustomers();
  }, [filters, page, searchQuery]);

  const loadCustomers = async () => {
    setLoading(true);

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
    }

    if (filters.has_orders === 'true') {
      query = query.gt('orders_count', 0);
    } else if (filters.has_orders === 'false') {
      query = query.eq('orders_count', 0);
    }

    if (filters.has_bonus === 'true') {
      query = query.gt('internal_bonus_balance', 0);
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      setCustomers(data as Profile[]);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  const filterConfig: FilterConfig[] = [
    {
      key: 'has_orders',
      label: 'Заказы',
      type: 'select',
      options: [
        { value: 'true', label: 'С заказами' },
        { value: 'false', label: 'Без заказов' },
      ],
    },
    {
      key: 'has_bonus',
      label: 'Бонусы',
      type: 'select',
      options: [{ value: 'true', label: 'Есть бонусы' }],
    },
  ];

  const columns: Column<Profile>[] = [
    {
      key: 'name',
      header: 'Клиент',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            {(item.name || item.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <Link
              href={`/admin/customers/${item.id}`}
              className="font-medium text-gray-900 hover:text-primary"
            >
              {item.name || 'Без имени'}
            </Link>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {item.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {item.phone}
                </span>
              )}
              {item.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {item.email}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'orders_count',
      header: 'Заказы',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-gray-400" />
          <span>{item.orders_count || 0}</span>
        </div>
      ),
    },
    {
      key: 'total_spent',
      header: 'Сумма покупок',
      sortable: true,
      render: (item) => (
        <span className="font-medium">
          {item.total_spent ? `${item.total_spent.toLocaleString()} ₽` : '0 ₽'}
        </span>
      ),
    },
    {
      key: 'internal_bonus_balance',
      header: 'Бонусы',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-yellow-500" />
          <span>{item.internal_bonus_balance || 0} ₽</span>
        </div>
      ),
    },
    {
      key: 'tags',
      header: 'Теги',
      render: (item) =>
        item.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-xs text-gray-400">
                +{item.tags.length - 2}
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      key: 'last_order_at',
      header: 'Последний заказ',
      sortable: true,
      render: (item) =>
        item.last_order_at ? (
          <span className="text-sm text-gray-500">
            {format(new Date(item.last_order_at), 'd MMM yyyy', { locale: ru })}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      key: 'created_at',
      header: 'Регистрация',
      render: (item) => (
        <span className="text-sm text-gray-500">
          {format(new Date(item.created_at), 'd MMM yyyy', { locale: ru })}
        </span>
      ),
    },
  ];

  // Stats
  const totalCustomers = total;
  const withOrders = customers.filter((c) => c.orders_count > 0).length;
  const totalBonus = customers.reduce(
    (sum, c) => sum + (c.internal_bonus_balance || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
            <Users className="h-7 w-7 text-primary" />
            Клиентская база
          </h1>
          <p className="mt-1 text-gray-500">
            Управление клиентами, история заказов и бонусов
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Всего клиентов</p>
          <p className="mt-1 text-2xl font-semibold">{totalCustomers}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">С заказами</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {withOrders}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Общая сумма бонусов</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-600">
            {totalBonus.toLocaleString()} ₽
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Средний чек</p>
          <p className="mt-1 text-2xl font-semibold">
            {customers.length
              ? Math.round(
                  customers.reduce((sum, c) => sum + (c.average_order || 0), 0) /
                    customers.filter((c) => c.average_order).length || 1
                ).toLocaleString()
              : 0}{' '}
            ₽
          </p>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filterConfig}
        values={filters}
        onChange={(key, value) => {
          setFilters({ ...filters, [key]: value });
          setPage(1);
        }}
        onClear={() => {
          setFilters({});
          setPage(1);
        }}
        onSearch={(query) => {
          setSearchQuery(query);
          setPage(1);
        }}
        searchPlaceholder="Поиск по имени, email или телефону..."
      />

      {/* Table */}
      <DataTable
        data={customers}
        columns={columns}
        keyField="id"
        loading={loading}
        emptyMessage="Клиенты не найдены"
        pagination={{
          page,
          perPage,
          total,
          onPageChange: setPage,
        }}
        actions={(item) => (
          <>
            <Link
              href={`/admin/customers/${item.id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              Просмотр
            </Link>
            <Link
              href={`/admin/customers/${item.id}#bonus`}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
            >
              <Gift className="h-4 w-4" />
              Начислить бонусы
            </Link>
          </>
        )}
      />
    </div>
  );
}
