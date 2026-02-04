'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Addon } from '@/lib/types';
import { useStore } from '@/lib/store';

export default function AddonsSection() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    const { data } = await supabase
      .from('addons')
      .select('*')
      .eq('in_stock', true);
    setAddons(data || []);
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-4">Добавить к заказу:</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {addons.map((addon) => (
          <button
            key={addon.id}
            onClick={() => toggleAddon(addon.id)}
            className={`p-3 border rounded hover:bg-white transition ${
              selectedAddons.includes(addon.id) ? 'border-pink-500 bg-pink-50' : ''
            }`}
          >
            <div className="text-sm font-medium">{addon.name}</div>
            <div className="text-xs text-gray-600">{addon.price}₽</div>
          </button>
        ))}
      </div>
    </div>
  );
}
