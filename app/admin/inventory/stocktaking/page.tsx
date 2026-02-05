'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  Eye,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DataTable, { Column } from '@/components/admin/ui/DataTable';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import type { InventoryDocument } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function StocktakingPage() {
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
      .eq('type', 'stocktaking')
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
      ? 'Подтвердить инвентаризацию? Остатки будут скорректированы по факту.'
      : 'Отменить инвентаризацию?';

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
    draft: { label: 'В процессе', variant: 'warning' },
    confirmed: { label: 'Завершена', variant: 'success' },
    cancelled: { label: 'Отменена', variant: 'error' },
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
      header: 'Дата начала',
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
      key: 'discrepancy',
      header: 'Расхождения',
      render: (item) => {
        // This would come from the document details
        const hasDiscrepancy = (item.total_amount || 0) !== 0;
        return hasDiscrepancy ? (
          <div className="flex items-center gap-1 text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Есть</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Нет</span>
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
            <ClipboardCheck className="h-7 w-7 text-orange-500" />
            Инвентаризация
          </h1>
          <p className="mt-1 text-gray-500">
            Сверка фактических остатков с учётными
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Начать инвентаризацию
        </button>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <h3 className="flex items-center gap-2 font-medium text-orange-800">
          <ClipboardCheck className="h-5 w-5" />
          Как проводить инвентаризацию
        </h3>
        <ol className="mt-2 space-y-1 text-sm text-orange-700">
          <li>1. Создайте новый документ инвентаризации</li>
          <li>2. Система загрузит ожидаемые остатки</li>
          <li>3. Внесите фактические количества для каждого товара</li>
          <li>4. Проверьте расхождения и подтвердите документ</li>
          <li>5. Остатки будут автоматически скорректированы</li>
        </ol>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Всего инвентаризаций</p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">В процессе</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-600">
            {documents.filter((d) => d.status === 'draft').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">С расхождениями</p>
          <p className="mt-1 text-2xl font-semibold text-orange-600">
            {documents.filter((d) => d.status === 'confirmed' && (d.total_amount || 0) !== 0).length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Последняя</p>
          <p className="mt-1 text-lg font-semibold">
            {documents[0]
              ? format(new Date(documents[0].created_at), 'd MMM', { locale: ru })
              : '—'}
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={documents}
        columns={columns}
        keyField="id"
        loading={loading}
        emptyMessage="Нет документов инвентаризации"
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
              {item.status === 'draft' ? 'Продолжить' : 'Просмотр'}
            </button>
            {item.status === 'draft' && (
              <>
                <button
                  onClick={() => updateStatus(item.id, 'confirmed')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                >
                  <Check className="h-4 w-4" />
                  Завершить
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
