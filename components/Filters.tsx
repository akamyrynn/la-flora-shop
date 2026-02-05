'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FiltersProps {
  onFilterChange: (filters: any) => void;
}

// Кастомный Select компонент
function CustomSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div
      className="relative"
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="w-full px-4 py-3 border border-primary/20 rounded-xl bg-white text-primary text-sm text-left flex items-center justify-between hover:border-primary/40 transition"
      >
        <span className={value ? 'text-primary' : 'text-primary/50'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-primary/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className={`absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-primary/10 py-1 z-50 transition-all duration-200 ${
        isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
      }`}>
        <button
          type="button"
          onClick={() => {
            onChange('');
            setIsOpen(false);
          }}
          className={`w-full px-4 py-2 text-sm text-left hover:bg-primary/5 transition ${
            !value ? 'text-primary font-medium' : 'text-primary/70'
          }`}
        >
          {placeholder}
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-sm text-left hover:bg-primary/5 transition ${
              value === option.value ? 'text-primary font-medium bg-primary/5' : 'text-primary/70'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Filters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState({
    bouquetType: '',
    priceRange: '',
    color: '',
    occasion: '',
    flowerType: '',
    sortBy: '',
  });

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white border border-primary/10 rounded-2xl p-4 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <CustomSelect
          value={filters.bouquetType}
          onChange={(v) => updateFilter('bouquetType', v)}
          placeholder="Тип букета"
          options={[
            { value: 'mono', label: 'Монобукет' },
            { value: 'mixed', label: 'Сборный' },
            { value: 'composition', label: 'Композиция' },
          ]}
        />

        <CustomSelect
          value={filters.priceRange}
          onChange={(v) => updateFilter('priceRange', v)}
          placeholder="Бюджет"
          options={[
            { value: '0-2500', label: 'До 2 500₽' },
            { value: '2500-5000', label: '2 500 - 5 000₽' },
            { value: '5000-10000', label: '5 000 - 10 000₽' },
            { value: '10000+', label: 'От 10 000₽' },
          ]}
        />

        <CustomSelect
          value={filters.color}
          onChange={(v) => updateFilter('color', v)}
          placeholder="Цвет"
          options={[
            { value: 'red', label: 'Красный' },
            { value: 'pink', label: 'Розовый' },
            { value: 'white', label: 'Белый' },
            { value: 'yellow', label: 'Жёлтый' },
            { value: 'purple', label: 'Фиолетовый' },
            { value: 'mixed', label: 'Микс' },
          ]}
        />

        <CustomSelect
          value={filters.occasion}
          onChange={(v) => updateFilter('occasion', v)}
          placeholder="Повод"
          options={[
            { value: 'birthday', label: 'День рождения' },
            { value: 'march8', label: '8 марта' },
            { value: 'valentine', label: '14 февраля' },
            { value: 'wedding', label: 'Свадьба' },
            { value: 'anniversary', label: 'Годовщина' },
          ]}
        />

        <CustomSelect
          value={filters.flowerType}
          onChange={(v) => updateFilter('flowerType', v)}
          placeholder="Вид цветка"
          options={[
            { value: 'roses', label: 'Розы' },
            { value: 'peonies', label: 'Пионы' },
            { value: 'tulips', label: 'Тюльпаны' },
            { value: 'chrysanthemums', label: 'Хризантемы' },
            { value: 'eustoma', label: 'Эустомы' },
          ]}
        />

        <CustomSelect
          value={filters.sortBy}
          onChange={(v) => updateFilter('sortBy', v)}
          placeholder="Сортировка"
          options={[
            { value: 'new', label: 'Новинки' },
            { value: 'price_asc', label: 'Сначала дешёвые' },
            { value: 'price_desc', label: 'Сначала дорогие' },
            { value: 'popular', label: 'Популярные' },
          ]}
        />
      </div>

      {/* Активные фильтры */}
      {Object.values(filters).some(v => v) && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-primary/10">
          <button
            onClick={() => {
              const reset = {
                bouquetType: '',
                priceRange: '',
                color: '',
                occasion: '',
                flowerType: '',
                sortBy: '',
              };
              setFilters(reset);
              onFilterChange(reset);
            }}
            className="px-3 py-1 text-xs text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition"
          >
            Сбросить всё
          </button>
        </div>
      )}
    </div>
  );
}
