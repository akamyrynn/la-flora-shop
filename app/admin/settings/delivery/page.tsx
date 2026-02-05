'use client';

import { useState, useEffect } from 'react';
import {
  Truck,
  Save,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  min_order: number;
  delivery_time: string;
  is_active: boolean;
}

interface DeliverySettings {
  free_delivery_threshold: number;
  express_delivery_price: number;
  express_delivery_time: string;
  same_day_cutoff: string;
  next_day_cutoff: string;
}

const defaultSettings: DeliverySettings = {
  free_delivery_threshold: 5000,
  express_delivery_price: 500,
  express_delivery_time: '2 часа',
  same_day_cutoff: '16:00',
  next_day_cutoff: '20:00',
};

export default function DeliverySettingsPage() {
  const [settings, setSettings] = useState<DeliverySettings>(defaultSettings);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [settingsRes, zonesRes] = await Promise.all([
      supabase.from('delivery_settings').select('*').single(),
      supabase.from('delivery_zones').select('*').order('price'),
    ]);

    if (settingsRes.data) {
      setSettings({ ...defaultSettings, ...settingsRes.data });
    }

    if (zonesRes.data) {
      setZones(zonesRes.data);
    } else {
      // Default zones
      setZones([
        { id: '1', name: 'Центр', price: 0, min_order: 2000, delivery_time: '1-2 часа', is_active: true },
        { id: '2', name: 'В пределах МКАД', price: 300, min_order: 1500, delivery_time: '2-3 часа', is_active: true },
        { id: '3', name: 'За МКАД до 10 км', price: 500, min_order: 3000, delivery_time: '3-4 часа', is_active: true },
      ]);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    // Save settings
    await supabase.from('delivery_settings').upsert({ id: 1, ...settings });

    // Save zones
    for (const zone of zones) {
      if (zone.id.startsWith('new-')) {
        const { id, ...data } = zone;
        await supabase.from('delivery_zones').insert([data]);
      } else {
        await supabase.from('delivery_zones').upsert(zone);
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    loadData();
  };

  const addZone = () => {
    setZones([
      ...zones,
      {
        id: `new-${Date.now()}`,
        name: '',
        price: 0,
        min_order: 0,
        delivery_time: '',
        is_active: true,
      },
    ]);
  };

  const updateZone = (id: string, field: keyof DeliveryZone, value: string | number | boolean) => {
    setZones(zones.map((z) => (z.id === id ? { ...z, [field]: value } : z)));
  };

  const deleteZone = async (id: string) => {
    if (!confirm('Удалить эту зону?')) return;

    if (!id.startsWith('new-')) {
      await supabase.from('delivery_zones').delete().eq('id', id);
    }

    setZones(zones.filter((z) => z.id !== id));
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
          <Truck className="h-7 w-7 text-primary" />
          Настройки доставки
        </h1>
        <p className="mt-1 text-gray-500">
          Зоны доставки и стоимость
        </p>
      </div>

      {/* Success message */}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
          <CheckCircle className="h-5 w-5" />
          Настройки сохранены
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-medium">Общие настройки</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Бесплатная доставка от</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.free_delivery_threshold}
                  onChange={(e) =>
                    setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-primary focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₽</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Экспресс-доставка</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.express_delivery_price}
                  onChange={(e) =>
                    setSettings({ ...settings, express_delivery_price: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-primary focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₽</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Время экспресс</label>
              <input
                type="text"
                value={settings.express_delivery_time}
                onChange={(e) =>
                  setSettings({ ...settings, express_delivery_time: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                placeholder="2 часа"
              />
            </div>
          </div>
        </div>

        {/* Cutoff Times */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-medium">
            <Clock className="h-5 w-5 text-gray-400" />
            Время приёма заказов
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Заказ на сегодня до</label>
              <input
                type="time"
                value={settings.same_day_cutoff}
                onChange={(e) => setSettings({ ...settings, same_day_cutoff: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                После этого времени заказы оформляются на завтра
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Заказ на завтра до</label>
              <input
                type="time"
                value={settings.next_day_cutoff}
                onChange={(e) => setSettings({ ...settings, next_day_cutoff: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-medium">
              <MapPin className="h-5 w-5 text-gray-400" />
              Зоны доставки
            </h2>
            <button
              type="button"
              onClick={addZone}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Добавить зону
            </button>
          </div>

          <div className="space-y-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 sm:grid-cols-5"
              >
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Название зоны</label>
                  <input
                    type="text"
                    value={zone.name}
                    onChange={(e) => updateZone(zone.id, 'name', e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                    placeholder="Центр"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-500">Стоимость (₽)</label>
                  <input
                    type="number"
                    value={zone.price}
                    onChange={(e) => updateZone(zone.id, 'price', Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-500">Мин. заказ (₽)</label>
                  <input
                    type="number"
                    value={zone.min_order}
                    onChange={(e) => updateZone(zone.id, 'min_order', Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-500">Время доставки</label>
                  <input
                    type="text"
                    value={zone.delivery_time}
                    onChange={(e) => updateZone(zone.id, 'delivery_time', e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                    placeholder="2-3 часа"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={zone.is_active}
                      onChange={(e) => updateZone(zone.id, 'is_active', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Активна</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteZone(zone.id)}
                    className="ml-auto rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {zones.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Нет зон доставки
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Подсказка</p>
            <p>
              Зоны доставки отображаются клиентам при оформлении заказа. Укажите стоимость 0 для бесплатной доставки в конкретную зону.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
}
