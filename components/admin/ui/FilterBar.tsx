'use client';

import { useState } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'date' | 'dateRange' | 'search';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export default function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  onSearch,
  searchPlaceholder = 'Поиск...',
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeFiltersCount = Object.values(values).filter(Boolean).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSearch?.('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
            showFilters || activeFiltersCount > 0
              ? 'border-primary bg-primary-50 text-primary'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>Фильтры</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="min-w-[180px]">
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  {filter.label}
                </label>
                {filter.type === 'select' && filter.options && (
                  <select
                    value={values[filter.key] || ''}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Все</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === 'date' && (
                  <input
                    type="date"
                    value={values[filter.key] || ''}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                )}
              </div>
            ))}
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm text-gray-500">
                Активных фильтров: {activeFiltersCount}
              </span>
              <button
                onClick={onClear}
                className="text-sm text-red-600 hover:underline"
              >
                Сбросить все
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active filters chips */}
      {!showFilters && activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(values).map(([key, value]) => {
            if (!value) return null;
            const filter = filters.find((f) => f.key === key);
            if (!filter) return null;

            const label =
              filter.type === 'select'
                ? filter.options?.find((o) => o.value === value)?.label
                : value;

            return (
              <span
                key={key}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
              >
                <span className="text-gray-500">{filter.label}:</span>
                <span>{label}</span>
                <button
                  onClick={() => onChange(key, '')}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
