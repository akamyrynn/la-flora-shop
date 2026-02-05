'use client';

import { useState, useEffect } from 'react';
import {
  Flower2,
  Plus,
  Edit2,
  Trash2,
  Leaf,
  Package,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SingleImageUploader from '@/components/admin/ui/SingleImageUploader';
import type { FlowerComponent, PackagingOption, FlowerComponentType, PackagingOptionType } from '@/lib/types';

type Tab = 'flowers' | 'packaging';

const colorOptions = [
  { value: 'red', label: 'Красный' },
  { value: 'pink', label: 'Розовый' },
  { value: 'white', label: 'Белый' },
  { value: 'yellow', label: 'Жёлтый' },
  { value: 'purple', label: 'Фиолетовый' },
  { value: 'coral', label: 'Коралловый' },
  { value: 'peach', label: 'Персиковый' },
];

export default function ConstructorAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('flowers');
  const [flowers, setFlowers] = useState<FlowerComponent[]>([]);
  const [packaging, setPackaging] = useState<PackagingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FlowerComponent | PackagingOption | null>(null);
  const [saving, setSaving] = useState(false);

  const [flowerForm, setFlowerForm] = useState({
    name: '',
    name_plural: '',
    type: 'flower' as FlowerComponentType,
    price_per_unit: 0,
    min_quantity: 1,
    max_quantity: 51,
    step: 1,
    available_colors: [] as string[],
    image: '',
    is_seasonal: false,
    in_stock: true,
  });

  const [packagingForm, setPackagingForm] = useState({
    name: '',
    description: '',
    price: 0,
    type: 'ribbon' as PackagingOptionType,
    image: '',
    min_flowers: 1,
    max_flowers: 101,
    in_stock: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [flowersRes, packagingRes] = await Promise.all([
      supabase.from('flower_components').select('*').order('sort_order'),
      supabase.from('packaging_options').select('*').order('sort_order'),
    ]);

    if (flowersRes.data) setFlowers(flowersRes.data);
    if (packagingRes.data) setPackaging(packagingRes.data);
    setLoading(false);
  };

  const openFlowerForm = (flower?: FlowerComponent) => {
    if (flower) {
      setEditingItem(flower);
      setFlowerForm({
        name: flower.name,
        name_plural: flower.name_plural || '',
        type: flower.type,
        price_per_unit: flower.price_per_unit,
        min_quantity: flower.min_quantity,
        max_quantity: flower.max_quantity,
        step: flower.step,
        available_colors: flower.available_colors,
        image: flower.image || '',
        is_seasonal: flower.is_seasonal,
        in_stock: flower.in_stock,
      });
    } else {
      setEditingItem(null);
      setFlowerForm({
        name: '',
        name_plural: '',
        type: 'flower',
        price_per_unit: 0,
        min_quantity: 1,
        max_quantity: 51,
        step: 1,
        available_colors: [],
        image: '',
        is_seasonal: false,
        in_stock: true,
      });
    }
    setShowForm(true);
  };

  const openPackagingForm = (pack?: PackagingOption) => {
    if (pack) {
      setEditingItem(pack);
      setPackagingForm({
        name: pack.name,
        description: pack.description || '',
        price: pack.price,
        type: pack.type,
        image: pack.image || '',
        min_flowers: pack.min_flowers,
        max_flowers: pack.max_flowers,
        in_stock: pack.in_stock,
      });
    } else {
      setEditingItem(null);
      setPackagingForm({
        name: '',
        description: '',
        price: 0,
        type: 'ribbon',
        image: '',
        min_flowers: 1,
        max_flowers: 101,
        in_stock: true,
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFlowerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingItem) {
      await supabase
        .from('flower_components')
        .update(flowerForm)
        .eq('id', editingItem.id);
    } else {
      await supabase.from('flower_components').insert([flowerForm]);
    }

    setSaving(false);
    closeForm();
    loadData();
  };

  const handlePackagingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingItem) {
      await supabase
        .from('packaging_options')
        .update(packagingForm)
        .eq('id', editingItem.id);
    } else {
      await supabase.from('packaging_options').insert([packagingForm]);
    }

    setSaving(false);
    closeForm();
    loadData();
  };

  const deleteFlower = async (id: string) => {
    if (!confirm('Удалить этот компонент?')) return;
    await supabase.from('flower_components').delete().eq('id', id);
    loadData();
  };

  const deletePackaging = async (id: string) => {
    if (!confirm('Удалить эту упаковку?')) return;
    await supabase.from('packaging_options').delete().eq('id', id);
    loadData();
  };

  const toggleColor = (color: string) => {
    setFlowerForm((prev) => ({
      ...prev,
      available_colors: prev.available_colors.includes(color)
        ? prev.available_colors.filter((c) => c !== color)
        : [...prev.available_colors, color],
    }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
          <Flower2 className="h-7 w-7 text-primary" />
          Конструктор букетов
        </h1>
        <p className="mt-1 text-gray-500">
          Управление компонентами для сборки букетов
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('flowers')}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'flowers'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <Flower2 className="h-5 w-5" />
            Цветы и зелень ({flowers.length})
          </button>
          <button
            onClick={() => setActiveTab('packaging')}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'packaging'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <Package className="h-5 w-5" />
            Упаковка ({packaging.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'flowers' ? (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => openFlowerForm()}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              Добавить компонент
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flowers.map((flower) => (
              <div
                key={flower.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        flower.type === 'flower'
                          ? 'bg-pink-100 text-pink-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {flower.type === 'flower' ? (
                        <Flower2 className="h-6 w-6" />
                      ) : (
                        <Leaf className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{flower.name}</h3>
                      <p className="text-sm text-gray-500">
                        {flower.price_per_unit} ₽ / шт
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openFlowerForm(flower)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteFlower(flower.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {flower.available_colors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {flower.available_colors.map((color) => (
                      <span
                        key={color}
                        className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>Мин: {flower.min_quantity}</span>
                  <span>Макс: {flower.max_quantity}</span>
                  <span>Шаг: {flower.step}</span>
                </div>

                {!flower.in_stock && (
                  <span className="mt-2 inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
                    Нет в наличии
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => openPackagingForm()}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              Добавить упаковку
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packaging.map((pack) => (
              <div
                key={pack.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{pack.name}</h3>
                      <p className="text-sm text-gray-500">+{pack.price} ₽</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openPackagingForm(pack)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePackaging(pack.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {pack.description && (
                  <p className="mt-2 text-sm text-gray-500">{pack.description}</p>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  Для букетов от {pack.min_flowers} до {pack.max_flowers} цветов
                </div>

                {!pack.in_stock && (
                  <span className="mt-2 inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
                    Нет в наличии
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flower Form Modal */}
      {showForm && activeTab === 'flowers' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingItem ? 'Редактировать' : 'Новый компонент'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFlowerSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Название</label>
                <input
                  type="text"
                  value={flowerForm.name}
                  onChange={(e) => setFlowerForm({ ...flowerForm, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  placeholder="Роза"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Тип</label>
                <select
                  value={flowerForm.type}
                  onChange={(e) =>
                    setFlowerForm({ ...flowerForm, type: e.target.value as FlowerComponentType })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                >
                  <option value="flower">Цветок</option>
                  <option value="greenery">Зелень</option>
                  <option value="filler">Наполнитель</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Цена за штуку (₽)</label>
                <input
                  type="number"
                  value={flowerForm.price_per_unit}
                  onChange={(e) =>
                    setFlowerForm({ ...flowerForm, price_per_unit: Number(e.target.value) })
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Мин</label>
                  <input
                    type="number"
                    value={flowerForm.min_quantity}
                    onChange={(e) =>
                      setFlowerForm({ ...flowerForm, min_quantity: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Макс</label>
                  <input
                    type="number"
                    value={flowerForm.max_quantity}
                    onChange={(e) =>
                      setFlowerForm({ ...flowerForm, max_quantity: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Шаг</label>
                  <input
                    type="number"
                    value={flowerForm.step}
                    onChange={(e) =>
                      setFlowerForm({ ...flowerForm, step: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {flowerForm.type === 'flower' && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Доступные цвета</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => toggleColor(color.value)}
                        className={`rounded-lg px-3 py-1 text-sm ${
                          flowerForm.available_colors.includes(color.value)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {color.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <SingleImageUploader
                value={flowerForm.image}
                onChange={(url) => setFlowerForm({ ...flowerForm, image: url })}
                folder="flowers"
                label="Изображение"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={flowerForm.in_stock}
                  onChange={(e) => setFlowerForm({ ...flowerForm, in_stock: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">В наличии</span>
              </label>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-600 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Packaging Form Modal */}
      {showForm && activeTab === 'packaging' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingItem ? 'Редактировать' : 'Новая упаковка'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePackagingSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Название</label>
                <input
                  type="text"
                  value={packagingForm.name}
                  onChange={(e) => setPackagingForm({ ...packagingForm, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  placeholder="Крафт-бумага"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Тип</label>
                <select
                  value={packagingForm.type}
                  onChange={(e) =>
                    setPackagingForm({ ...packagingForm, type: e.target.value as PackagingOptionType })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                >
                  <option value="ribbon">Лента</option>
                  <option value="paper">Бумага</option>
                  <option value="box">Коробка</option>
                  <option value="basket">Корзина</option>
                  <option value="hat_box">Шляпная коробка</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Цена (₽)</label>
                <input
                  type="number"
                  value={packagingForm.price}
                  onChange={(e) =>
                    setPackagingForm({ ...packagingForm, price: Number(e.target.value) })
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Описание</label>
                <textarea
                  value={packagingForm.description}
                  onChange={(e) =>
                    setPackagingForm({ ...packagingForm, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  rows={2}
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={packagingForm.in_stock}
                  onChange={(e) =>
                    setPackagingForm({ ...packagingForm, in_stock: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">В наличии</span>
              </label>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-600 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
