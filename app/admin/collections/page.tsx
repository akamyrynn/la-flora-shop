'use client';

import { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Save,
  X,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SingleImageUploader from '@/components/admin/ui/SingleImageUploader';
import type { Collection } from '@/lib/types';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Collection | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('collections')
      .select('*')
      .order('sort_order');

    if (data) setCollections(data);
    setLoading(false);
  };

  const openForm = (collection?: Collection) => {
    if (collection) {
      setEditingItem(collection);
      setForm({
        name: collection.name,
        slug: collection.slug,
        description: collection.description || '',
        image: collection.image || '',
        is_active: collection.is_active,
        is_featured: collection.is_featured,
      });
    } else {
      setEditingItem(null);
      setForm({
        name: '',
        slug: '',
        description: '',
        image: '',
        is_active: true,
        is_featured: false,
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[а-яё]/gi, (char) => {
        const map: Record<string, string> = {
          а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
          з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
          п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
          ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
        };
        return map[char.toLowerCase()] || char;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      ...form,
      slug: form.slug || generateSlug(form.name),
    };

    if (editingItem) {
      await supabase.from('collections').update(data).eq('id', editingItem.id);
    } else {
      await supabase.from('collections').insert([data]);
    }

    setSaving(false);
    closeForm();
    loadCollections();
  };

  const deleteCollection = async (id: string) => {
    if (!confirm('Удалить эту коллекцию?')) return;
    await supabase.from('collections').delete().eq('id', id);
    loadCollections();
  };

  const toggleActive = async (collection: Collection) => {
    await supabase
      .from('collections')
      .update({ is_active: !collection.is_active })
      .eq('id', collection.id);
    loadCollections();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
            <Layers className="h-7 w-7 text-primary" />
            Коллекции
          </h1>
          <p className="mt-1 text-gray-500">
            Группировка товаров по тематическим коллекциям
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Создать коллекцию
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className={`rounded-lg border bg-white p-4 ${
              collection.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 cursor-grab text-gray-300" />
                <div>
                  <h3 className="font-medium text-gray-900">{collection.name}</h3>
                  <p className="text-sm text-gray-500">/{collection.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleActive(collection)}
                  className={`rounded p-1 ${
                    collection.is_active
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={collection.is_active ? 'Активна' : 'Неактивна'}
                >
                  {collection.is_active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => openForm(collection)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteCollection(collection.id)}
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {collection.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {collection.description}
              </p>
            )}

            <div className="mt-3 flex items-center gap-2">
              {collection.is_featured && (
                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                  Избранная
                </span>
              )}
              <span className="text-xs text-gray-400">
                {collection.products_count || 0} товаров
              </span>
            </div>
          </div>
        ))}

        {collections.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Коллекции не созданы
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingItem ? 'Редактировать коллекцию' : 'Новая коллекция'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Название</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  placeholder="День рождения"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">URL (slug)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  placeholder="den-rozhdeniya"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Оставьте пустым для автогенерации
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Описание</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  rows={3}
                />
              </div>

              <SingleImageUploader
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                folder="collections"
                label="Изображение коллекции"
              />

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Активна</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Избранная</span>
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
