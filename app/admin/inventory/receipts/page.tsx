'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PackagePlus, Plus, Eye, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DataTable, { Column } from '@/components/admin/ui/DataTable';
import FilterBar, { FilterConfig } from '@/components/admin/ui/FilterBar';
import { DocumentStatusBadge } from '@/components/admin/ui/StatusBadge';
import type { InventoryDocument, Store } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DocumentWithRelations extends InventoryDocument {
  store: Store;
}

export default function ReceiptsPage() {
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [filters, page]);

  const loadStores = async () => {
    const { data } = await supabase
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setStores(data || []);
  };

  const loadDocuments = async () => {
    setLoading(true);

    let query = supabase
      .from('inventory_documents')
      .select('*, store:stores(*)', { count: 'exact' })
      .eq('type', 'receipt')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.store_id) {
      query = query.eq('store_id', filters.store_id);
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      setDocuments(data as DocumentWithRelations[]);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  const confirmDocument = async (id: string) => {
    const { error } = await supabase
      .from('inventory_documents')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      loadDocuments();
    }
  };

  const cancelDocument = async (id: string) => {
    const { error } = await supabase
      .from('inventory_documents')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (!error) {
      loadDocuments();
    }
  };

  const filterConfig: FilterConfig[] = [
    {
      key: 'status',
      label: 'Статус',
      type: 'select',
      options: [
        { value: 'draft', label: 'Черновик' },
        { value: 'confirmed', label: 'Проведён' },
        { value: 'cancelled', label: 'Отменён' },
      ],
    },
    {
      key: 'store_id',
      label: 'Склад',
      type: 'select',
      options: stores.map((s) => ({ value: s.id, label: s.name })),
    },
  ];

  const columns: Column<DocumentWithRelations>[] = [
    {
      key: 'document_number',
      header: '№ документа',
      render: (item) => (
        <Link
          href={`/admin/inventory/receipts/${item.id}`}
          className="font-medium text-primary hover:underline"
        >
          {item.document_number}
        </Link>
      ),
    },
    {
      key: 'created_at',
      header: 'Дата',
      sortable: true,
      render: (item) => (
        <span className="text-sm">
          {format(new Date(item.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}
        </span>
      ),
    },
    {
      key: 'store',
      header: 'Склад',
      render: (item) => (
        <span className="text-sm">{item.store?.name || '—'}</span>
      ),
    },
    {
      key: 'supplier_name',
      header: 'Поставщик',
      render: (item) => (
        <span className="text-sm">{item.supplier_name || '—'}</span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Сумма',
      render: (item) => (
        <span className="font-medium">
          {item.total_amount ? `${item.total_amount.toLocaleString()} ₽` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      render: (item) => <DocumentStatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
            <PackagePlus className="h-7 w-7 text-primary" />
            Поступления товаров
          </h1>
          <p className="mt-1 text-gray-500">
            Оформление приходных накладных от поставщиков
          </p>
        </div>
        <Link
          href="/admin/inventory/receipts/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Новое поступление
        </Link>
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
        searchPlaceholder="Поиск по номеру или поставщику..."
      />

      {/* Table */}
      <DataTable
        data={documents}
        columns={columns}
        keyField="id"
        loading={loading}
        emptyMessage="Нет документов поступления"
        pagination={{
          page,
          perPage,
          total,
          onPageChange: setPage,
        }}
        actions={(item) => (
          <>
            <Link
              href={`/admin/inventory/receipts/${item.id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              Просмотр
            </Link>
            {item.status === 'draft' && (
              <>
                <button
                  onClick={() => confirmDocument(item.id)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-50"
                >
                  <Check className="h-4 w-4" />
                  Провести
                </button>
                <button
                  onClick={() => cancelDocument(item.id)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
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
