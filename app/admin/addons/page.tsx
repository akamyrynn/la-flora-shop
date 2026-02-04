'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Addon } from '@/lib/types';
import AddonForm from '@/components/admin/AddonForm';

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);

  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    const { data } = await supabase.from('addons').select('*').order('created_at', { ascending: false });
    setAddons(data || []);
  };

  const deleteAddon = async (id: string) => {
    if (confirm('Удалить этот доп?')) {
      await supabase.from('addons').delete().eq('id', id);
      loadAddons();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif italic text-gray-900 mb-2">Допы</h1>
          <p className="text-gray-600">{addons.length} дополнительных товаров</p>
        </div>
        <button
          onClick={() => {
            setEditingAddon(null);
            setShowForm(true);
          }}
          className="bg-primary text-cream px-6 py-3 rounded-lg hover:opacity-80 transition font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Добавить доп
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {addons.map((addon) => (
          <div
            key={addon.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">
                {addon.type === 'card' && '💌'}
                {addon.type === 'vase' && '🏺'}
                {addon.type === 'krisal' && '💊'}
                {addon.type === 'other' && '🎁'}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition flex gap-2">
                <button
                  onClick={() => {
                    setEditingAddon(addon);
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteAddon(addon.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">{addon.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {addon.description || 'Нет описания'}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">{addon.price}₽</span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  addon.in_stock
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {addon.in_stock ? 'В наличии' : 'Нет'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {addons.length === 0 && (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-400 mb-4">🎁</p>
          <p className="text-gray-600">Допы не найдены</p>
        </div>
      )}

      {showForm && (
        <AddonForm
          addon={editingAddon}
          onClose={() => {
            setShowForm(false);
            loadAddons();
          }}
        />
      )}
    </div>
  );
}
