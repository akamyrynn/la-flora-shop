'use client';

import { useState, useEffect } from 'react';
import {
  Store as StoreIcon,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Loader2,
  Save,
  X,
  Warehouse,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Store, StoreType } from '@/lib/types';

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'store' as StoreType,
    address: '',
    phone: '',
    is_active: true,
    is_default: false,
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('is_default', { ascending: false })
      .order('name');

    if (!error && data) {
      setStores(data);
    }
    setLoading(false);
  };

  const openForm = (store?: Store) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name,
        type: store.type,
        address: store.address || '',
        phone: store.phone || '',
        is_active: store.is_active,
        is_default: store.is_default,
      });
    } else {
      setEditingStore(null);
      setFormData({
        name: '',
        type: 'store',
        address: '',
        phone: '',
        is_active: true,
        is_default: false,
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStore(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (formData.is_default) {
      await supabase.from('stores').update({ is_default: false }).neq('id', editingStore?.id || '');
    }

    if (editingStore) {
      await supabase.from('stores').update(formData).eq('id', editingStore.id);
    } else {
      await supabase.from('stores').insert([formData]);
    }

    setSaving(false);
    closeForm();
    loadStores();
  };

  const deleteStore = async (id: string) => {
    if (!confirm('Удалить эту точку? Все данные об остатках будут потеряны.')) {
      return;
    }

    await supabase.from('stores').delete().eq('id', id);
    loadStores();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
            <StoreIcon className="h-7 w-7 text-primary" />
            Точки продаж и склады
          </h1>
          <p className="mt-1 text-gray-500">
            Управление магазинами и складами для учёта товаров
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Добавить
        </button>
      </div>

      {/* Stores list */}
      <div className="space-y-4">
        {stores.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
            <Warehouse className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">Нет добавленных точек</p>
            <button
              onClick={() => openForm()}
              className="mt-4 text-primary hover:underline"
            >
              Добавить первую точку
            </button>
          </div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              className={`rounded-lg border bg-white p-4 ${
                store.is_default ? 'border-primary' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                      store.type === 'store'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    {store.type === 'store' ? (
                      <StoreIcon className="h-6 w-6" />
                    ) : (
                      <Warehouse className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{store.name}</h3>
                      {store.is_default && (
                        <span className="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                          По умолчанию
                        </span>
                      )}
                      {!store.is_active && (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          Неактивен
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {store.type === 'store' ? 'Магазин' : 'Склад'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                      {store.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {store.address}
                        </span>
                      )}
                      {store.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {store.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openForm(store)}
                    className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteStore(store.id)}
                    className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingStore ? 'Редактировать точку' : 'Новая точка'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Название
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Главный магазин"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Тип
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as StoreType })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="store">Магазин</option>
                  <option value="warehouse">Склад</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Адрес
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="ул. Цветочная, 1"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Телефон
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Активен</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) =>
                      setFormData({ ...formData, is_default: e.target.checked })
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">По умолчанию</span>
                </label>
              </div>

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
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
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
