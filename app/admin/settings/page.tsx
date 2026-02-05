'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ShopSettings {
  shop_name: string;
  shop_phone: string;
  shop_email: string;
  shop_address: string;
  working_hours: string;
  min_order_amount: number;
  currency: string;
  timezone: string;
  meta_title: string;
  meta_description: string;
}

const defaultSettings: ShopSettings = {
  shop_name: 'La Flora',
  shop_phone: '+7 (999) 123-45-67',
  shop_email: 'info@laflora.ru',
  shop_address: 'г. Москва, ул. Цветочная, д. 1',
  working_hours: '09:00 - 21:00',
  min_order_amount: 1500,
  currency: 'RUB',
  timezone: 'Europe/Moscow',
  meta_title: 'La Flora - Доставка цветов',
  meta_description: 'Свежие букеты с доставкой по Москве',
};

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('shop_settings')
      .select('*')
      .single();

    if (data) {
      setSettings({ ...defaultSettings, ...data });
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from('shop_settings')
      .upsert({ id: 1, ...settings });

    setSaving(false);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
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
          <Settings className="h-7 w-7 text-primary" />
          Общие настройки
        </h1>
        <p className="mt-1 text-gray-500">
          Основная информация о магазине
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
        {/* Shop Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-medium">
            <Store className="h-5 w-5 text-gray-400" />
            Информация о магазине
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Название магазина</label>
              <input
                type="text"
                value={settings.shop_name}
                onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Минимальная сумма заказа</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.min_order_amount}
                  onChange={(e) =>
                    setSettings({ ...settings, min_order_amount: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-primary focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₽</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-medium">
            <Phone className="h-5 w-5 text-gray-400" />
            Контакты
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Телефон</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={settings.shop_phone}
                  onChange={(e) => setSettings({ ...settings, shop_phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={settings.shop_email}
                  onChange={(e) => setSettings({ ...settings, shop_email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Адрес</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={settings.shop_address}
                  onChange={(e) => setSettings({ ...settings, shop_address: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Время работы</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={settings.working_hours}
                  onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-primary focus:outline-none"
                  placeholder="09:00 - 21:00"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Часовой пояс</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-primary focus:outline-none"
                >
                  <option value="Europe/Moscow">Москва (UTC+3)</option>
                  <option value="Europe/Kaliningrad">Калининград (UTC+2)</option>
                  <option value="Europe/Samara">Самара (UTC+4)</option>
                  <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
                  <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
                  <option value="Asia/Vladivostok">Владивосток (UTC+10)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-medium">
            <Globe className="h-5 w-5 text-gray-400" />
            SEO настройки
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Meta Title</label>
              <input
                type="text"
                value={settings.meta_title}
                onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                {settings.meta_title.length}/60 символов
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Meta Description</label>
              <textarea
                value={settings.meta_description}
                onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                {settings.meta_description.length}/160 символов
              </p>
            </div>
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
