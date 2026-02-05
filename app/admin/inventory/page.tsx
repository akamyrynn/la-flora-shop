'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Warehouse,
  Plus,
  Download,
  AlertTriangle,
  Package,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DataTable, { Column } from '@/components/admin/ui/DataTable';
import FilterBar, { FilterConfig } from '@/components/admin/ui/FilterBar';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import type { InventoryItem, Store, Product } from '@/lib/types';

interface InventoryWithRelations extends InventoryItem {
  product: Product;
  store: Store;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryWithRelations[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 25;

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadInventory();
  }, [filters, page]);

  const loadStores = async () => {
    const { data } = await supabase
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setStores(data || []);
  };

  const loadInventory = async () => {
    setLoading(true);

    let query = supabase
      .from('inventory')
      .select(
        `
        *,
        product:products(*),
        store:stores(*)
      `,
        { count: 'exact' }
      )
      .order('quantity', { ascending: true });

    if (filters.store_id) {
      query = query.eq('store_id', filters.store_id);
    }

    if (filters.low_stock === 'true') {
      query = query.lte('quantity', supabase.rpc('get_min_quantity'));
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      setInventory(data as InventoryWithRelations[]);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  const filterConfig: FilterConfig[] = [
    {
      key: 'store_id',
      label: 'Склад/Магазин',
      type: 'select',
      options: stores.map((s) => ({ value: s.id, label: s.name })),
    },
    {
      key: 'low_stock',
      label: 'Статус',
      type: 'select',
      options: [
        { value: 'true', label: 'Низкий остаток' },
      ],
    },
  ];

  const columns: Column<InventoryWithRelations>[] = [
    {
      key: 'product',
      header: 'Товар',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.product?.main_image ? (
            <img
              src={item.product.main_image}
              alt=""
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{item.product?.name}</p>
            <p className="text-xs text-gray-500">{item.product?.slug}</p>
          </div>
        </div>
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
      key: 'quantity',
      header: 'Остаток',
      sortable: true,
      render: (item) => {
        const isLow = item.quantity <= item.min_quantity;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${isLow ? 'text-red-600' : 'text-gray-900'}`}
            >
              {item.quantity} шт
            </span>
            {isLow && (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        );
      },
    },
    {
      key: 'reserved_quantity',
      header: 'Резерв',
      render: (item) => (
        <span className="text-sm text-gray-500">
          {item.reserved_quantity || 0} шт
        </span>
      ),
    },
    {
      key: 'cost_price',
      header: 'Себестоимость',
      render: (item) => (
        <span className="text-sm">
          {item.cost_price ? `${item.cost_price} ₽` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      render: (item) => {
        if (item.quantity === 0) {
          return <StatusBadge variant="error">Нет в наличии</StatusBadge>;
        }
        if (item.quantity <= item.min_quantity) {
          return <StatusBadge variant="warning">Мало</StatusBadge>;
        }
        return <StatusBadge variant="success">В наличии</StatusBadge>;
      },
    },
  ];

  const lowStockCount = inventory.filter(
    (i) => i.quantity <= i.min_quantity
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
            <Warehouse className="h-7 w-7 text-primary" />
            Складские остатки
          </h1>
          <p className="mt-1 text-gray-500">
            Управление остатками товаров на складах
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadInventory}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Обновить
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Всего позиций</p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Складов</p>
          <p className="mt-1 text-2xl font-semibold">{stores.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Низкий остаток</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-600">
            {lowStockCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Нет в наличии</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">
            {inventory.filter((i) => i.quantity === 0).length}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link
          href="/admin/inventory/receipts/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Поступление
        </Link>
        <Link
          href="/admin/inventory/writeoffs/new"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Списание
        </Link>
        <Link
          href="/admin/inventory/transfers/new"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Перемещение
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
        searchPlaceholder="Поиск товара..."
      />

      {/* Table */}
      <DataTable
        data={inventory}
        columns={columns}
        keyField="id"
        loading={loading}
        emptyMessage="Нет данных об остатках"
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
