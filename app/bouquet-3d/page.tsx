'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Minus,
  Flower2,
  Leaf,
  Gift,
  ShoppingCart,
} from 'lucide-react';
import type { BouquetConfig, FlowerItem } from '@/components/bouquet-3d/BouquetBuilder3D';

// Dynamic import для Three.js
const BouquetBuilder3D = dynamic(
  () => import('@/components/bouquet-3d/BouquetBuilder3D'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-rose-50 to-rose-100 rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-gray-500">Загрузка 3D сцены...</p>
        </div>
      </div>
    ),
  }
);

// Типы цветов (с фиксированными цветами - как в реальности)
const flowerTypes = [
  { id: 'rose', name: 'Розовая роза', icon: '🌹', basePrice: 150 },
  { id: 'sakura', name: 'Сакура', icon: '🌸', basePrice: 200 },
] as const;

// Цвета упаковки
const wrappingColors = [
  { id: 'kraft', name: 'Крафт', value: '#c9a66b' },
  { id: 'white', name: 'Белая', value: '#f5f5f4' },
  { id: 'pink', name: 'Розовая', value: '#fce7f3' },
  { id: 'black', name: 'Чёрная', value: '#1c1917' },
  { id: 'green', name: 'Зелёная', value: '#86efac' },
];

// Цвета ленты
const ribbonColors = [
  { id: 'red', name: 'Красная', value: '#dc2626' },
  { id: 'pink', name: 'Розовая', value: '#f472b6' },
  { id: 'white', name: 'Белая', value: '#fafaf9' },
  { id: 'gold', name: 'Золотая', value: '#d97706' },
  { id: 'purple', name: 'Фиолетовая', value: '#a855f7' },
];

export default function Bouquet3DPage() {
  // State для выбора цветов (без цвета - цветы натуральные)
  const [selectedFlowers, setSelectedFlowers] = useState<
    { type: 'rose' | 'sakura'; count: number }[]
  >([{ type: 'rose', count: 5 }]);

  const [wrappingColorId, setWrappingColorId] = useState('kraft');
  const [ribbonColorId, setRibbonColorId] = useState('red');
  const [greeneryAmount, setGreeneryAmount] = useState(6);

  // Добавить тип цветка
  const addFlowerType = () => {
    setSelectedFlowers((prev) => [
      ...prev,
      { type: 'sakura', count: 3 },
    ]);
  };

  // Удалить тип цветка
  const removeFlowerType = (index: number) => {
    setSelectedFlowers((prev) => prev.filter((_, i) => i !== index));
  };

  // Обновить цветок
  const updateFlower = (
    index: number,
    field: 'type' | 'count',
    value: string | number
  ) => {
    setSelectedFlowers((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };

  // Конфиг для 3D
  const bouquetConfig: BouquetConfig = useMemo(() => {
    const flowers: FlowerItem[] = selectedFlowers.map((f) => ({
      type: f.type,
      count: f.count,
    }));

    return {
      flowers,
      wrappingColor:
        wrappingColors.find((c) => c.id === wrappingColorId)?.value || '#c9a66b',
      ribbonColor:
        ribbonColors.find((c) => c.id === ribbonColorId)?.value || '#dc2626',
      greeneryAmount,
    };
  }, [selectedFlowers, wrappingColorId, ribbonColorId, greeneryAmount]);

  // Подсчёт цены
  const totalPrice = useMemo(() => {
    let price = 0;

    selectedFlowers.forEach((f) => {
      const flowerType = flowerTypes.find((t) => t.id === f.type);
      if (flowerType) {
        price += flowerType.basePrice * f.count;
      }
    });

    // Упаковка
    price += 200;

    // Зелень
    price += greeneryAmount * 30;

    // Лента
    price += 100;

    return price;
  }, [selectedFlowers, greeneryAmount]);

  // Общее количество цветов
  const totalFlowers = selectedFlowers.reduce((sum, f) => sum + f.count, 0);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Назад в магазин</span>
          </Link>
          <h1 className="font-serif text-xl text-primary-700">
            3D Конструктор букета
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* 3D Preview - STICKY */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-[450px] lg:h-[550px]">
                <BouquetBuilder3D config={bouquetConfig} />
              </div>
              <div className="p-3 bg-gray-50 border-t">
                <p className="text-sm text-gray-500 text-center">
                  Вращайте букет мышкой
                </p>
              </div>
            </div>
          </div>

          {/* Controls - SCROLLABLE */}
          <div className="space-y-4">
            {/* Flowers Selection */}
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Flower2 className="h-5 w-5 text-pink-500" />
                Выберите цветы
              </h2>

              <div className="space-y-3">
                {selectedFlowers.map((flower, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Цветок #{index + 1}</span>
                      {selectedFlowers.length > 1 && (
                        <button
                          onClick={() => removeFlowerType(index)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          Удалить
                        </button>
                      )}
                    </div>

                    {/* Тип цветка */}
                    <div className="flex gap-2">
                      {flowerTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => updateFlower(index, 'type', type.id)}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-center ${
                            flower.type === type.id
                              ? 'border-primary bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl block mb-1">{type.icon}</span>
                          <span className="text-xs block font-medium">{type.name}</span>
                          <span className="text-xs text-gray-500">
                            {type.basePrice} ₽/шт
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Количество */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-600">Количество:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateFlower(index, 'count', Math.max(1, flower.count - 1))
                          }
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {flower.count}
                        </span>
                        <button
                          onClick={() =>
                            updateFlower(index, 'count', Math.min(15, flower.count + 1))
                          }
                          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {selectedFlowers.length < 3 && (
                  <button
                    onClick={addFlowerType}
                    className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Добавить ещё тип цветка
                  </button>
                )}
              </div>
            </div>

            {/* Greenery */}
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Leaf className="h-5 w-5 text-green-500" />
                Зелень
              </h2>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Количество:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGreeneryAmount(Math.max(0, greeneryAmount - 1))}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {greeneryAmount}
                  </span>
                  <button
                    onClick={() => setGreeneryAmount(Math.min(12, greeneryAmount + 1))}
                    className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Wrapping & Ribbon */}
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Gift className="h-5 w-5 text-orange-500" />
                Упаковка и лента
              </h2>

              {/* Wrapping */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">
                  Цвет упаковки:
                </label>
                <div className="flex flex-wrap gap-2">
                  {wrappingColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setWrappingColorId(color.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
                        wrappingColorId === color.id
                          ? 'border-primary bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-xs">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ribbon */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  Цвет ленты:
                </label>
                <div className="flex flex-wrap gap-2">
                  {ribbonColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setRibbonColorId(color.id)}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        ribbonColorId === color.id
                          ? 'border-primary scale-110 shadow-lg'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Summary & Add to Cart */}
            <div className="bg-primary-700 text-white rounded-2xl p-5 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-primary-100 text-sm">Цветов:</span>
                <span className="font-semibold">{totalFlowers} шт</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-primary-100 text-sm">Зелень:</span>
                <span className="font-semibold">{greeneryAmount} шт</span>
              </div>
              <div className="border-t border-primary-500 pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Итого:</span>
                  <span className="text-2xl font-bold">
                    {totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽
                  </span>
                </div>
              </div>

              <button className="w-full py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Добавить в корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
