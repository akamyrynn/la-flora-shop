'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Eye,
  Check,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DataTable, { Column } from '@/components/admin/ui/DataTable';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import type { InventoryDocument, Store } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TransferDocument extends InventoryDocument {
  store?: Store;
  from_store?: Store;
  to_store?: Store;
}

export default function TransfersPage() {
  const [documents, setDocuments] = useState<TransferDocument[]>([]);
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
      .select(`
        *,
        from_store:stores!inventory_documents_from_store_id_fkey(*),
        to_store:stores!inventory_documents_to_store_id_fkey(*)
      `, { count: 'exact' })
      .eq('type', 'transfer')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setDocuments(data as TransferDocument[]);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    const confirmText = status === 'confirmed'
      ? 'Подтвердить перемещение? Товары будут перемещены между складами.'
      : 'Отменить перемещение?';

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

  const columns: Column<TransferDocument>[] = [
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
      key: 'from_store',
      header: 'Откуда → Куда',
      render: (item) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{item.from_store?.name || '—'}</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{item.to_store?.name || '—'}</span>
        </div>
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
            <ArrowLeftRight className="h-7 w-7 text-blue-500" />
            Перемещения
          </h1>
          <p className="mt-1 text-gray-500">
            Перемещение товаров между складами и точками
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Новое перемещение
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Всего перемещений</p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Ожидают подтверждения</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-600">
            {documents.filter((d) => d.status === 'draft').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Проведено сегодня</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {documents.filter((d) =>
              d.status === 'confirmed' &&
              new Date(d.created_at).toDateString() === new Date().toDateString()
            ).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={documents}
        columns={columns}
        keyField="id"
        loading={loading}
        emptyMessage="Нет документов перемещения"
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
