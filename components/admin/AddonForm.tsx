'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Addon } from '@/lib/types';

interface AddonFormProps {
  addon: Addon | null;
  onClose: () => void;
}

export default function AddonForm({ addon, onClose }: AddonFormProps) {
  const [formData, setFormData] = useState({
    name: addon?.name || '',
    description: addon?.description || '',
    price: addon?.price || 0,
    type: addon?.type || 'card',
    image: addon?.image || '',
    in_stock: addon?.in_stock ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (addon) {
      await supabase.from('addons').update(formData).eq('id', addon.id);
    } else {
      await supabase.from('addons').insert([formData]);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">
          {addon ? 'Редактировать доп' : 'Добавить доп'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Цена *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Тип *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="card">Открытка</option>
                <option value="vase">Ваза</option>
                <option value="krisal">Кризал</option>
                <option value="other">Другое</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL изображения</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.in_stock}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
              />
              <span>В наличии</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 bg-primary text-cream py-3 rounded hover:opacity-80"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 py-3 rounded hover:bg-gray-400"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
