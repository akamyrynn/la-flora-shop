'use client';

import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Eye,
  Check,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DataTable, { Column } from '@/components/admin/ui/DataTable';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import type { InventoryDocument } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function RevaluationPage() {
  const [documents, setDocuments] = useState<InventoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  useEffect(() => {
    loadDocuments();
  }, [page]);

  const loadDocuments = async () => {
    setLoading(true);

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, count, error } = await supabase
      .from('inventory_documents')
      .select('*, store:stores(*)', { count: 'exact' })
      .eq('type', 'revaluation')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setDocuments(data as InventoryDocument[]);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    const confirmText = status === 'confirmed'
      ? 'Подтвердить переоценку? Цены товаров будут обновлены.'
      : 'Отменить переоценку?';

    if (!confirm(confirmText)) return;

    await supabase
      .from('inventory_documents')
      .update({
        status,
        ...(status === 'confirmed' ? { confirmed_at: new Date().toISOString() } : {})
      })
      .eq('id', id);

    loadDocuments();
  };

  const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
    draft: { label: 'Черновик', variant: 'warning' },
    confirmed: { label: 'Проведён', variant: 'success' },
    cancelled: { label: 'Отменён', variant: 'error' },
  };

  const columns: Column<InventoryDocument>[] = [
    {
      key: 'document_number',
      header: '№ документа',
      render: (item) => (
        <span className="font-medium text-primary">{item.document_number}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Дата',
      render: (item) => (
        <span className="text-gray-600">
          {format(new Date(item.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
        </span>
      ),
    },
    {
      key: 'store_id',
      header: 'Склад',
      render: (item) => (
        <span>{(item as InventoryDocument & { store?: { name: string } }).store?.name || '—'}</span>
      ),
    },
    {
      key: 'items_count',
      header: 'Позиций',
      render: (item) => (
        <span className="text-gray-600">{item.items_count || 0}</span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Изменение',
      render: (item) => {
        const amount = item.total_amount || 0;
        const isPositive = amount >= 0;
        return (
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {isPositive ? '+' : ''}{amount.toLocaleString()} ₽
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Статус',
      render: (item) => {
        const status = statusMap[item.status];
        return <StatusBadge variant={status.variant}>{status.label}</StatusBadge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
            <Tag className="h-7 w-7 text-purple-500" />
            Переоценка
          </h1>
          <p className="mt-1 text-gray-500">
            Изменение цен на товары
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Новая переоценка
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Всего переоценок</p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Ожидают подтверждения</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-600">
            {documents.filter((d) => d.status === 'draft').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">За этот месяц</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {documents.filter((d) => {
              const docDate = new Date(d.created_at);
              const now = new Date();
              return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={documents}
        columns={columns}
        keyField="id"
        loading={loading}
        emptyMessage="Нет документов переоценки"
        pagination={{
          page,
          perPage,
          total,
          onPageChange: setPage,
        }}
        actions={(item) => (
          <>
            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
              <Eye className="h-4 w-4" />
              Просмотр
            </button>
            {item.status === 'draft' && (
              <>
                <button
                  onClick={() => updateStatus(item.id, 'confirmed')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                >
                  <Check className="h-4 w-4" />
                  Провести
                </button>
                <button
                  onClick={() => updateStatus(item.id, 'cancelled')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  Отменить
                </button>
              </>
            )}
          </>
        )}
      />
    </div>
  );
}
