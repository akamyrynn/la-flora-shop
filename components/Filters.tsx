'use client';

import { useState } from 'react';

interface FiltersProps {
  onFilterChange: (filters: any) => void;
}

export default function Filters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState({
    bouquetType: '',
    priceRange: '',
    color: '',
    occasion: '',
    flowerType: '',
    sortBy: 'popular',
  });

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-cream border border-primary-10 rounded-2xl p-6 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <select
          value={filters.bouquetType}
          onChange={(e) => updateFilter('bouquetType', e.target.value)}
          className="px-4 py-3 border border-primary-10 rounded-full bg-cream text-primary focus:outline-none focus:border-primary transition"
        >
          <option value="">Тип букета</option>
          <option value="mono">Монобукет</option>
          <option value="mixed">Сборный</option>
          <option value="composition">Композиция</option>
        </select>

        <select
          value={filters.priceRange}
          onChange={(e) => updateFilter('priceRange', e.target.value)}
          className="px-4 py-3 border border-primary-10 rounded-full bg-cream text-primary focus:outline-none focus:border-primary transition"
        >
          <option value="">Бюджет</option>
          <option value="0-2500">До 2500₽</option>
          <option value="2500-5000">2500-5000₽</option>
          <option value="5000-10000">5000-10000₽</option>
          <option value="10000+">От 10000₽</option>
        </select>

        <select
          value={filters.color}
          onChange={(e) => updateFilter('color', e.target.value)}
          className="px-4 py-3 border border-primary-10 rounded-full bg-cream text-primary focus:outline-none focus:border-primary transition"
        >
          <option value="">Цвет</option>
          <option value="red">Красный</option>
          <option value="pink">Розовый</option>
          <option value="white">Белый</option>
          <option value="yellow">Желтый</option>
          <option value="purple">Фиолетовый</option>
          <option value="mixed">Микс</option>
        </select>

        <select
          value={filters.occasion}
          onChange={(e) => updateFilter('occasion', e.target.value)}
          className="px-4 py-3 border border-primary-10 rounded-full bg-cream text-primary focus:outline-none focus:border-primary transition"
        >
          <option value="">Повод</option>
          <option value="birthday">День рождения</option>
          <option value="march8">8 марта</option>
          <option value="wedding">Свадьба</option>
          <option value="anniversary">Годовщина</option>
        </select>

        <select
          value={filters.flowerType}
          onChange={(e) => updateFilter('flowerType', e.target.value)}
          className="px-4 py-3 border border-primary-10 rounded-full bg-cream text-primary focus:outline-none focus:border-primary transition"
        >
          <option value="">Вид цветка</option>
          <option value="roses">Розы</option>
          <option value="peonies">Пионы</option>
          <option value="chrysanthemums">Хризантемы</option>
          <option value="tulips">Тюльпаны</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="px-4 py-3 border border-primary-10 rounded-full bg-cream text-primary focus:outline-none focus:border-primary transition"
        >
          <option value="popular">Популярные</option>
          <option value="price_asc">Цена ↑</option>
          <option value="price_desc">Цена ↓</option>
          <option value="new">Новинки</option>
        </select>
      </div>
    </div>
  );
}
