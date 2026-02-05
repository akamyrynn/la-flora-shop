'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Flower2,
  Leaf,
  Package,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import type { FlowerComponent, PackagingOption, CustomBouquetComponent } from '@/lib/types';

const colorOptions = [
  { value: 'red', label: 'Красный', color: '#DC2626' },
  { value: 'pink', label: 'Розовый', color: '#EC4899' },
  { value: 'white', label: 'Белый', color: '#F9FAFB' },
  { value: 'yellow', label: 'Жёлтый', color: '#FBBF24' },
  { value: 'purple', label: 'Фиолетовый', color: '#8B5CF6' },
  { value: 'coral', label: 'Коралловый', color: '#F97316' },
];

export default function ConstructorPage() {
  const [flowers, setFlowers] = useState<FlowerComponent[]>([]);
  const [packaging, setPackaging] = useState<PackagingOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedComponents, setSelectedComponents] = useState<CustomBouquetComponent[]>([]);
  const [selectedPackaging, setSelectedPackaging] = useState<string | null>(null);

  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [flowersRes, packagingRes] = await Promise.all([
      supabase.from('flower_components').select('*').eq('in_stock', true).order('sort_order'),
      supabase.from('packaging_options').select('*').eq('in_stock', true).order('sort_order'),
    ]);

    if (flowersRes.data) setFlowers(flowersRes.data);
    if (packagingRes.data) setPackaging(packagingRes.data);
    setLoading(false);
  };

  const addComponent = (componentId: string, color: string = 'red') => {
    const component = flowers.find((f) => f.id === componentId);
    if (!component) return;

    setSelectedComponents((prev) => {
      const existing = prev.find(
        (c) => c.component_id === componentId && c.color === color
      );
      if (existing) {
        return prev.map((c) =>
          c.component_id === componentId && c.color === color
            ? { ...c, quantity: Math.min(c.quantity + component.step, component.max_quantity) }
            : c
        );
      }
      return [...prev, { component_id: componentId, quantity: component.min_quantity, color }];
    });
  };

  const removeComponent = (componentId: string, color: string) => {
    const component = flowers.find((f) => f.id === componentId);
    if (!component) return;

    setSelectedComponents((prev) => {
      const existing = prev.find(
        (c) => c.component_id === componentId && c.color === color
      );
      if (existing && existing.quantity > component.min_quantity) {
        return prev.map((c) =>
          c.component_id === componentId && c.color === color
            ? { ...c, quantity: c.quantity - component.step }
            : c
        );
      }
      return prev.filter(
        (c) => !(c.component_id === componentId && c.color === color)
      );
    });
  };

  const totalFlowers = useMemo(() => {
    return selectedComponents.reduce((sum, c) => {
      const flower = flowers.find((f) => f.id === c.component_id);
      return flower?.type === 'flower' ? sum + c.quantity : sum;
    }, 0);
  }, [selectedComponents, flowers]);

  const totalPrice = useMemo(() => {
    let price = selectedComponents.reduce((sum, c) => {
      const flower = flowers.find((f) => f.id === c.component_id);
      return flower ? sum + flower.price_per_unit * c.quantity : sum;
    }, 0);

    if (selectedPackaging) {
      const pack = packaging.find((p) => p.id === selectedPackaging);
      if (pack) price += pack.price;
    }

    return price;
  }, [selectedComponents, selectedPackaging, flowers, packaging]);

  const handleAddToCart = () => {
    if (selectedComponents.length === 0) return;

    const customProduct = {
      id: `custom-${Date.now()}`,
      name: 'Авторский букет',
      slug: `custom-bouquet-${Date.now()}`,
      price: totalPrice,
      in_stock: true,
      bouquet_type: 'composition' as const,
      color: 'mixed',
      quantity: totalFlowers,
      packaging_type: 'wrapped' as const,
      images: [],
      is_popular: false,
      is_new: false,
      views_count: 0,
      order_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addToCart(customProduct, 1);
    alert('Букет добавлен в корзину!');
  };

  const flowerComponents = flowers.filter((f) => f.type === 'flower');
  const greeneryComponents = flowers.filter((f) => f.type === 'greenery' || f.type === 'filler');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
            <span>Назад в магазин</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl italic text-primary-700">
            Собери свой букет
          </h1>
          <p className="mt-2 text-gray-600">
            Выберите цветы, зелень и упаковку для вашего идеального букета
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - Flowers selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Flowers */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Flower2 className="h-6 w-6 text-pink-500" />
                Выберите цветы
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {flowerComponents.map((flower) => {
                  const selected = selectedComponents.filter(
                    (c) => c.component_id === flower.id
                  );
                  const totalQty = selected.reduce((sum, s) => sum + s.quantity, 0);

                  return (
                    <div
                      key={flower.id}
                      className={`rounded-xl border-2 p-4 transition-all ${
                        totalQty > 0
                          ? 'border-primary bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {flower.image ? (
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={flower.image}
                              alt={flower.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-pink-100">
                            <Flower2 className="h-10 w-10 text-pink-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-medium">{flower.name}</h3>
                          <p className="text-sm text-gray-500">
                            {flower.price_per_unit} ₽ / шт
                          </p>

                          {/* Color selection */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {flower.available_colors.map((colorValue) => {
                              const colorInfo = colorOptions.find(
                                (c) => c.value === colorValue
                              );
                              const isSelected = selected.some(
                                (s) => s.color === colorValue
                              );

                              return (
                                <button
                                  key={colorValue}
                                  onClick={() => addComponent(flower.id, colorValue)}
                                  className={`h-6 w-6 rounded-full border-2 transition-all ${
                                    isSelected
                                      ? 'border-primary scale-110'
                                      : 'border-gray-300 hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: colorInfo?.color }}
                                  title={colorInfo?.label}
                                />
                              );
                            })}
                          </div>

                          {/* Quantity controls for selected colors */}
                          {selected.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {selected.map((sel) => {
                                const colorInfo = colorOptions.find(
                                  (c) => c.value === sel.color
                                );
                                return (
                                  <div
                                    key={`${sel.component_id}-${sel.color}`}
                                    className="flex items-center gap-2"
                                  >
                                    <span
                                      className="h-3 w-3 rounded-full"
                                      style={{ backgroundColor: colorInfo?.color }}
                                    />
                                    <span className="text-sm">{colorInfo?.label}</span>
                                    <div className="ml-auto flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          removeComponent(flower.id, sel.color)
                                        }
                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="w-8 text-center font-medium">
                                        {sel.quantity}
                                      </span>
                                      <button
                                        onClick={() => addComponent(flower.id, sel.color)}
                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-600"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Greenery */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Leaf className="h-6 w-6 text-green-500" />
                Добавьте зелень
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                {greeneryComponents.map((item) => {
                  const selected = selectedComponents.find(
                    (c) => c.component_id === item.id
                  );

                  return (
                    <div
                      key={item.id}
                      className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                        selected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        if (selected) {
                          setSelectedComponents((prev) =>
                            prev.filter((c) => c.component_id !== item.id)
                          );
                        } else {
                          addComponent(item.id, 'green');
                        }
                      }}
                    >
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <Leaf className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.price_per_unit} ₽</p>
                      {selected && (
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeComponent(item.id, 'green');
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-medium">{selected.quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addComponent(item.id, 'green');
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Packaging */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Package className="h-6 w-6 text-orange-500" />
                Выберите упаковку
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                {packaging.map((pack) => (
                  <div
                    key={pack.id}
                    className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                      selectedPackaging === pack.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() =>
                      setSelectedPackaging(
                        selectedPackaging === pack.id ? null : pack.id
                      )
                    }
                  >
                    {pack.image ? (
                      <div className="relative mx-auto mb-2 h-16 w-16 overflow-hidden rounded-lg">
                        <Image
                          src={pack.image}
                          alt={pack.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-orange-100">
                        <Package className="h-8 w-8 text-orange-400" />
                      </div>
                    )}
                    <h3 className="font-medium">{pack.name}</h3>
                    <p className="text-sm text-gray-500">+{pack.price} ₽</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                Ваш букет
              </h2>

              {selectedComponents.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  <Flower2 className="mx-auto mb-2 h-12 w-12" />
                  <p>Выберите цветы для букета</p>
                </div>
              ) : (
                <>
                  <ul className="mb-4 divide-y">
                    {selectedComponents.map((comp) => {
                      const flower = flowers.find((f) => f.id === comp.component_id);
                      const colorInfo = colorOptions.find(
                        (c) => c.value === comp.color
                      );

                      return (
                        <li
                          key={`${comp.component_id}-${comp.color}`}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor:
                                  comp.color === 'green'
                                    ? '#22C55E'
                                    : colorInfo?.color,
                              }}
                            />
                            <span className="text-sm">
                              {flower?.name} × {comp.quantity}
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {flower ? flower.price_per_unit * comp.quantity : 0} ₽
                          </span>
                        </li>
                      );
                    })}
                    {selectedPackaging && (
                      <li className="flex items-center justify-between py-2">
                        <span className="text-sm">
                          {packaging.find((p) => p.id === selectedPackaging)?.name}
                        </span>
                        <span className="text-sm font-medium">
                          {packaging.find((p) => p.id === selectedPackaging)?.price} ₽
                        </span>
                      </li>
                    )}
                  </ul>

                  <div className="border-t pt-4">
                    <div className="mb-2 flex justify-between text-sm text-gray-500">
                      <span>Цветов в букете:</span>
                      <span>{totalFlowers} шт</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Итого:</span>
                      <span className="text-primary">{totalPrice.toLocaleString()} ₽</span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-medium text-white transition-colors hover:bg-primary-600"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Добавить в корзину
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
