'use client';

import { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Download,
  CreditCard,
  Banknote,
  Gift,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DataTable, { Column } from '@/components/admin/ui/DataTable';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import FilterBar, { FilterConfig } from '@/components/admin/ui/FilterBar';
import type { POSTransaction } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function POSTransactionsPage() {
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 25;

  useEffect(() => {
    loadTransactions();
  }, [filters, page]);

  const loadTransactions = async () => {
    setLoading(true);

    let query = supabase
      .from('pos_transactions')
      .select('*, shift:pos_shifts(*), order:orders(*)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.payment_method) {
      query = query.eq('payment_method', filters.payment_method);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      setTransactions(data as POSTransaction[]);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  const filterConfig: FilterConfig[] = [
    {
      key: 'payment_method',
      label: 'Способ оплаты',
      type: 'select',
      options: [
        { value: 'cash', label: 'Наличные' },
        { value: 'card', label: 'Карта' },
        { value: 'bonus', label: 'Бонусы' },
      ],
    },
    {
      key: 'type',
      label: 'Тип',
      type: 'select',
      options: [
        { value: 'sale', label: 'Продажа' },
        { value: 'return', label: 'Возврат' },
      ],
    },
  ];

  const paymentMethodIcons: Record<string, React.ReactNode> = {
    cash: <Banknote className="h-4 w-4 text-green-500" />,
    card: <CreditCard className="h-4 w-4 text-blue-500" />,
    bonus: <Gift className="h-4 w-4 text-yellow-500" />,
  };

  const paymentMethodLabels: Record<string, string> = {
    cash: 'Наличные',
    card: 'Карта',
    bonus: 'Бонусы',
  };

  const columns: Column<POSTransaction>[] = [
    {
      key: 'created_at',
      header: 'Дата и время',
      render: (item) => (
        <span className="text-gray-600">
          {format(new Date(item.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}
        </span>
      ),
    },
    {
      key: 'order_id',
      header: 'Заказ',
      render: (item) => (
        <span className="font-medium text-primary">
          {(item as POSTransaction & { order?: { order_number: string } }).order?.order_number || '—'}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Тип',
      render: (item) => (
        <StatusBadge variant={item.type === 'sale' ? 'success' : 'error'}>
          {item.type === 'sale' ? 'Продажа' : 'Возврат'}
        </StatusBadge>
      ),
    },
    {
      key: 'payment_method',
      header: 'Способ оплаты',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.payment_method && paymentMethodIcons[item.payment_method]}
          <span>{item.payment_method ? paymentMethodLabels[item.payment_method] : '—'}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Сумма',
      render: (item) => (
        <span className={`font-medium ${item.type === 'return' ? 'text-red-600' : 'text-gray-900'}`}>
          {item.type === 'return' ? '-' : ''}{item.amount.toLocaleString()} ₽
        </span>
      ),
    },
    {
      key: 'fiscal_receipt_number',
      header: 'Чек',
      render: (item) => (
        <span className="text-gray-500 font-mono text-sm">
          {item.fiscal_receipt_number || '—'}
        </span>
      ),
    },
  ];

  // Stats
  const totalSales = transactions
    .filter((t) => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRefunds = transactions
    .filter((t) => t.type === 'return')
    .reduce((sum, t) => sum + t.amount, 0);
  const cashSales = transactions
    .filter((t) => t.payment_method === 'cash' && t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);
  const cardSales = transactions
    .filter((t) => t.payment_method === 'card' && t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
            <Receipt className="h-7 w-7 text-primary" />
            Транзакции
          </h1>
          <p className="mt-1 text-gray-500">
            История всех кассовых операций
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Экспорт
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Продажи</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {totalSales.toLocaleString()} ₽
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Возвраты</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">
            {totalRefunds.toLocaleString()} ₽
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Наличные</p>
          <p className="mt-1 text-2xl font-semibold">
            {cashSales.toLocaleString()} ₽
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Безналичные</p>
          <p className="mt-1 text-2xl font-semibold">
            {cardSales.toLocaleString()} ₽
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
      />

      {/* Table */}
      <DataTable
        data={transactions}
        columns={columns}
        keyField="id"
        loading={loading}
        emptyMessage="Нет транзакций"
        pagination={{
          page,
          perPage,
          total,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
