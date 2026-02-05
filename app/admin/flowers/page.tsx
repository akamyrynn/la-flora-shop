'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SingleFlower } from '@/lib/types';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Flower2,
  X,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import ImageUploader from '@/components/admin/ui/ImageUploader';

const COLOR_OPTIONS = [
  { value: 'red', label: 'Красный', class: 'bg-red-500' },
  { value: 'white', label: 'Белый', class: 'bg-white border border-gray-300' },
  { value: 'pink', label: 'Розовый', class: 'bg-pink-400' },
  { value: 'yellow', label: 'Жёлтый', class: 'bg-yellow-400' },
  { value: 'orange', label: 'Оранжевый', class: 'bg-orange-500' },
  { value: 'purple', label: 'Фиолетовый', class: 'bg-purple-500' },
  { value: 'burgundy', label: 'Бордовый', class: 'bg-rose-900' },
  { value: 'cream', label: 'Кремовый', class: 'bg-amber-100' },
  { value: 'green', label: 'Зелёный', class: 'bg-green-500' },
];

const MONTHS = [
  { value: 1, label: 'Январь' },
  { value: 2, label: 'Февраль' },
  { value: 3, label: 'Март' },
  { value: 4, label: 'Апрель' },
  { value: 5, label: 'Май' },
  { value: 6, label: 'Июнь' },
  { value: 7, label: 'Июль' },
  { value: 8, label: 'Август' },
  { value: 9, label: 'Сентябрь' },
  { value: 10, label: 'Октябрь' },
  { value: 11, label: 'Ноябрь' },
  { value: 12, label: 'Декабрь' },
];

interface FlowerFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  color: string;
  available_colors: string[];
  stem_length: string;
  image: string;
  in_stock: boolean;
  stock_quantity: number;
  min_quantity: number;
  max_quantity: number;
  is_seasonal: boolean;
  season_start: number | null;
  season_end: number | null;
  is_popular: boolean;
  sort_order: number;
}

const defaultFormData: FlowerFormData = {
  name: '',
  slug: '',
  description: '',
  price: 200,
  color: 'red',
  available_colors: ['red'],
  stem_length: '50-60 см',
  image: '',
  in_stock: true,
  stock_quantity: 100,
  min_quantity: 1,
  max_quantity: 99,
  is_seasonal: false,
  season_start: null,
  season_end: null,
  is_popular: false,
  sort_order: 0,
};

export default function AdminFlowersPage() {
  const [flowers, setFlowers] = useState<SingleFlower[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFlower, setEditingFlower] = useState<SingleFlower | null>(null);
  const [formData, setFormData] = useState<FlowerFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFlowers();
  }, []);

  const loadFlowers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('single_flowers')
      .select('*')
      .order('sort_order');

    if (data) {
      setFlowers(data);
    }
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[а-яё]/g, (char) => {
        const map: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
          'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const openCreateModal = () => {
    setEditingFlower(null);
    setFormData(defaultFormData);
    setShowModal(true);
  };

  const openEditModal = (flower: SingleFlower) => {
    setEditingFlower(flower);
    setFormData({
      name: flower.name,
      slug: flower.slug,
      description: flower.description || '',
      price: flower.price,
      color: flower.color,
      available_colors: flower.available_colors || [flower.color],
      stem_length: flower.stem_length || '',
      image: flower.image || '',
      in_stock: flower.in_stock,
      stock_quantity: flower.stock_quantity,
      min_quantity: flower.min_quantity,
      max_quantity: flower.max_quantity,
      is_seasonal: flower.is_seasonal,
      season_start: flower.season_start || null,
      season_end: flower.season_end || null,
      is_popular: flower.is_popular,
      sort_order: flower.sort_order,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      ...formData,
      slug: formData.slug || generateSlug(formData.name),
      season_start: formData.is_seasonal ? formData.season_start : null,
      season_end: formData.is_seasonal ? formData.season_end : null,
    };

    if (editingFlower) {
      const { error } = await supabase
        .from('single_flowers')
        .update(data)
        .eq('id', editingFlower.id);

      if (!error) {
        loadFlowers();
        setShowModal(false);
      }
    } else {
      const { error } = await supabase.from('single_flowers').insert(data);

      if (!error) {
        loadFlowers();
        setShowModal(false);
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот цветок?')) return;

    const { error } = await supabase.from('single_flowers').delete().eq('id', id);

    if (!error) {
      loadFlowers();
    }
  };

  const toggleInStock = async (flower: SingleFlower) => {
    const { error } = await supabase
      .from('single_flowers')
      .update({ in_stock: !flower.in_stock })
      .eq('id', flower.id);

    if (!error) {
      setFlowers((prev) =>
        prev.map((f) => (f.id === flower.id ? { ...f, in_stock: !f.in_stock } : f))
      );
    }
  };

  const toggleColorInForm = (color: string) => {
    setFormData((prev) => {
      const colors = prev.available_colors.includes(color)
        ? prev.available_colors.filter((c) => c !== color)
        : [...prev.available_colors, color];
      return { ...prev, available_colors: colors };
    });
  };

  const filteredFlowers = flowers.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flower2 className="w-7 h-7 text-pink-500" />
            Цветы поштучно
          </h1>
          <p className="text-gray-500 mt-1">
            Управление ассортиментом поштучных цветов
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="w-5 h-5" />
          Добавить цветок
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredFlowers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Flower2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Цветов пока нет</p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-primary hover:underline"
          >
            Добавить первый цветок
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Цветок
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Цена
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Цвета
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                  В наличии
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                  Популярный
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFlowers.map((flower) => (
                <tr key={flower.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {flower.image ? (
                          <Image
                            src={flower.image}
                            alt={flower.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🌸
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{flower.name}</p>
                        <p className="text-sm text-gray-500">{flower.stem_length}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{flower.price} ₽</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {flower.available_colors.slice(0, 5).map((color) => {
                        const colorOpt = COLOR_OPTIONS.find((c) => c.value === color);
                        return (
                          <div
                            key={color}
                            className={`w-5 h-5 rounded-full ${colorOpt?.class || 'bg-gray-300'}`}
                            title={colorOpt?.label || color}
                          />
                        );
                      })}
                      {flower.available_colors.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{flower.available_colors.length - 5}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleInStock(flower)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                        flower.in_stock
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {flower.in_stock && <Check className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {flower.is_popular && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        ⭐ Популярный
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(flower)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Редактировать"
                      >
                        <Pencil className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(flower.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold">
                {editingFlower ? 'Редактировать цветок' : 'Новый цветок'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Основная информация */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                          slug: prev.slug || generateSlug(e.target.value),
                        }));
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Цена и наличие */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Цена за штуку *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                      }
                      required
                      min={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Остаток
                    </label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          stock_quantity: Number(e.target.value),
                        }))
                      }
                      min={0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Длина стебля
                    </label>
                    <input
                      type="text"
                      value={formData.stem_length}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, stem_length: e.target.value }))
                      }
                      placeholder="60-70 см"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                {/* Доступные цвета */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Доступные цвета
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => toggleColorInForm(color.value)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition ${
                          formData.available_colors.includes(color.value)
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${color.class}`} />
                        <span className="text-sm">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Основной цвет */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Основной цвет (по умолчанию)
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, color: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {COLOR_OPTIONS.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Фото */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фотография
                  </label>
                  <ImageUploader
                    images={formData.image ? [formData.image] : []}
                    onChange={(images) =>
                      setFormData((prev) => ({ ...prev, image: images[0] || '' }))
                    }
                    maxImages={1}
                    folder="flowers"
                  />
                </div>

                {/* Сезонность */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_seasonal}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, is_seasonal: e.target.checked }))
                      }
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="font-medium">Сезонный цветок</span>
                  </label>

                  {formData.is_seasonal && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Начало сезона
                        </label>
                        <select
                          value={formData.season_start || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              season_start: Number(e.target.value) || null,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Выберите месяц</option>
                          {MONTHS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Конец сезона
                        </label>
                        <select
                          value={formData.season_end || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              season_end: Number(e.target.value) || null,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Выберите месяц</option>
                          {MONTHS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Флаги */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.in_stock}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, in_stock: e.target.checked }))
                      }
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span>В наличии</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_popular}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, is_popular: e.target.checked }))
                      }
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span>Популярный (показывать на странице букета)</span>
                  </label>
                </div>

                {/* Сортировка */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Порядок сортировки
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sort_order: Number(e.target.value) }))
                    }
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Меньше число = выше в списке
                  </p>
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !formData.name}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingFlower ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
