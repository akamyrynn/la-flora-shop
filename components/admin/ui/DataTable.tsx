'use client';

import { useState, ReactNode } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import Pagination from './Pagination';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
  };
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  onSort?: (key: string) => void;
}

export default function DataTable<T>({
  data,
  columns,
  keyField,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  onRowClick,
  actions,
  loading = false,
  emptyMessage = 'Нет данных',
  pagination,
  sortConfig,
  onSort,
}: DataTableProps<T>) {
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const getItemKey = (item: T): string => {
    return String((item as Record<string, unknown>)[keyField as string]);
  };

  const getItemValue = (item: T, key: string): unknown => {
    return (item as Record<string, unknown>)[key];
  };

  const allSelected = data.length > 0 && data.every((item) =>
    selectedItems.includes(getItemKey(item))
  );

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map((item) => getItemKey(item)));
    }
  };

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      onSelectionChange?.(selectedItems.filter((i) => i !== id));
    } else {
      onSelectionChange?.([...selectedItems, id]);
    }
  };

  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronUp className="h-4 w-4 text-gray-300" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.header}</span>
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions && <th className="w-12 px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-gray-500">Загрузка...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = getItemKey(item);
                const isSelected = selectedItems.includes(id);

                return (
                  <tr
                    key={id}
                    className={`transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-primary-50' : ''
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                        {column.render
                          ? column.render(item)
                          : String(getItemValue(item, column.key) ?? '')}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenActionMenu(openActionMenu === id ? null : id)
                            }
                            className="rounded p-1 hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-5 w-5 text-gray-400" />
                          </button>
                          {openActionMenu === id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenActionMenu(null)}
                              />
                              <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                {actions(item)}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="border-t border-gray-200 px-4 py-3">
          <Pagination
            page={pagination.page}
            perPage={pagination.perPage}
            total={pagination.total}
            onPageChange={pagination.onPageChange}
            onPerPageChange={pagination.onPerPageChange}
          />
        </div>
      )}
    </div>
  );
}
