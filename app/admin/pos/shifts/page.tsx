'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Eye,
  Play,
  Square,
  User,
  Banknote,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DataTable, { Column } from '@/components/admin/ui/DataTable';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import type { POSShift } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function POSShiftsPage() {
  const [shifts, setShifts] = useState<POSShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  useEffect(() => {
    loadShifts();
  }, [page]);

  const loadShifts = async () => {
    setLoading(true);

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, count, error } = await supabase
      .from('pos_shifts')
      .select('*, terminal:pos_terminals(*), cashier:profiles(*)', { count: 'exact' })
      .order('opened_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setShifts(data as POSShift[]);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  const columns: Column<POSShift>[] = [
    {
      key: 'opened_at',
      header: 'Открытие',
      render: (item) => (
        <div>
          <div className="font-medium">
            {format(new Date(item.opened_at), 'd MMM yyyy', { locale: ru })}
          </div>
          <div className="text-sm text-gray-500">
            {format(new Date(item.opened_at), 'HH:mm', { locale: ru })}
          </div>
        </div>
      ),
    },
    {
      key: 'closed_at',
      header: 'Закрытие',
      render: (item) =>
        item.closed_at ? (
          <div>
            <div className="font-medium">
              {format(new Date(item.closed_at), 'd MMM yyyy', { locale: ru })}
            </div>
            <div className="text-sm text-gray-500">
              {format(new Date(item.closed_at), 'HH:mm', { locale: ru })}
            </div>
          </div>
        ) : (
          <StatusBadge variant="success">Открыта</StatusBadge>
        ),
    },
    {
      key: 'cashier_id',
      header: 'Кассир',
      render: (item) => {
        const shift = item as POSShift & { cashier?: { name: string } };
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span>{shift.cashier?.name || '—'}</span>
          </div>
        );
      },
    },
    {
      key: 'terminal_id',
      header: 'Терминал',
      render: (item) => {
        const shift = item as POSShift & { terminal?: { name: string } };
        return <span>{shift.terminal?.name || '—'}</span>;
      },
    },
    {
      key: 'total_sales',
      header: 'Продажи',
      render: (item) => (
        <span className="font-medium text-green-600">
          {(item.total_sales || 0).toLocaleString()} ₽
        </span>
      ),
    },
    {
      key: 'total_cash',
      header: 'Наличные',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Banknote className="h-4 w-4 text-green-500" />
          <span>{(item.total_cash || 0).toLocaleString()} ₽</span>
        </div>
      ),
    },
    {
      key: 'total_card',
      header: 'Карты',
      render: (item) => (
        <div className="flex items-center gap-1">
          <CreditCard className="h-4 w-4 text-blue-500" />
          <span>{(item.total_card || 0).toLocaleString()} ₽</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      render: (item) =>
        item.closed_at ? (
          <StatusBadge variant="default">Закрыта</StatusBadge>
        ) : (
          <StatusBadge variant="success">Открыта</StatusBadge>
        ),
    },
  ];

  // Stats
  const openShifts = shifts.filter((s) => !s.closed_at);
  const todaySales = shifts
    .filter((s) => {
      const opened = new Date(s.opened_at);
      const today = new Date();
      return opened.toDateString() === today.toDateString();
    })
    .reduce((sum, s) => sum + (s.total_sales || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
            <Clock className="h-7 w-7 text-primary" />
            Кассовые смены
          </h1>
          <p className="mt-1 text-gray-500">
            Управление сменами кассиров
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600">
          <Play className="h-4 w-4" />
          Открыть смену
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Открытых смен</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {openShifts.length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Продажи сегодня</p>
          <p className="mt-1 text-2xl font-semibold">
            {todaySales.toLocaleString()} ₽
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Всего смен</p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Средняя выручка</p>
          <p className="mt-1 text-2xl font-semibold">
            {shifts.length
              ? Math.round(
                  shifts.reduce((sum, s) => sum + (s.total_sales || 0), 0) / shifts.length
                ).toLocaleString()
              : 0}{' '}
            ₽
          </p>
        </div>
      </div>

      {/* Active shifts */}
      {openShifts.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-medium text-green-800">
            <Play className="h-4 w-4" />
            Активные смены
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {openShifts.map((shift) => {
              const shiftData = shift as POSShift & {
                terminal?: { name: string };
                cashier?: { name: string };
              };
              return (
                <div
                  key={shift.id}
                  className="flex items-center justify-between rounded-lg bg-white p-3"
                >
                  <div>
                    <p className="font-medium">{shiftData.terminal?.name || 'Терминал'}</p>
                    <p className="text-sm text-gray-500">{shiftData.cashier?.name || 'Кассир'}</p>
                    <p className="text-xs text-gray-400">
                      Открыта {formatDistanceToNow(new Date(shift.opened_at), { locale: ru, addSuffix: true })}
                    </p>
                  </div>
                  <button className="flex items-center gap-1 rounded bg-red-100 px-3 py-1 text-sm text-red-600 hover:bg-red-200">
                    <Square className="h-3 w-3" />
                    Закрыть
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        data={shifts}
        columns={columns}
        keyField="id"
        loading={loading}
        emptyMessage="Нет смен"
        pagination={{
          page,
          perPage,
          total,
          onPageChange: setPage,
        }}
        actions={(item) => (
          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
            <Eye className="h-4 w-4" />
            Подробнее
          </button>
        )}
      />
    </div>
  );
}
