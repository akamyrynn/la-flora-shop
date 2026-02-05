'use client';

import { useState, useEffect } from 'react';
import { Gift, Percent, Save, Loader2, AlertCircle } from 'lucide-react';
import { getBonusSettings, updateBonusSettings } from '@/lib/bonus';
import type { BonusSettings } from '@/lib/types';

export default function BonusSettingsPage() {
  const [settings, setSettings] = useState<BonusSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getBonusSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    const result = await updateBonusSettings({
      accrual_percent: settings.accrual_percent,
      max_usage_percent: settings.max_usage_percent,
      min_order_for_accrual: settings.min_order_for_accrual,
      expiration_days: settings.expiration_days,
      is_active: settings.is_active,
    });

    if (result) {
      setMessage({ type: 'success', text: 'Настройки успешно сохранены' });
      setSettings(result);
    } else {
      setMessage({ type: 'error', text: 'Ошибка сохранения настроек' });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-gray-500">Не удалось загрузить настройки бонусов</p>
        <button
          onClick={loadSettings}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
          <Gift className="h-7 w-7 text-primary" />
          Настройки бонусной системы
        </h1>
        <p className="mt-1 text-gray-500">
          Управление начислением и списанием бонусов клиентов
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status toggle */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Статус бонусной системы</h3>
              <p className="text-sm text-gray-500">
                Включите или отключите начисление и списание бонусов
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.is_active}
                onChange={(e) =>
                  setSettings({ ...settings, is_active: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100" />
            </label>
          </div>
        </div>

        {/* Accrual settings */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 font-medium text-gray-900">
            <Percent className="h-5 w-5 text-green-600" />
            Начисление бонусов
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Процент начисления
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.accrual_percent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      accrual_percent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-8 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  %
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Процент от суммы заказа, который начисляется как бонусы
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Минимальная сумма заказа
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={settings.min_order_for_accrual}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      min_order_for_accrual: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-8 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">

                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Минимальная сумма заказа для начисления бонусов
              </p>
            </div>
          </div>
        </div>

        {/* Usage settings */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 font-medium text-gray-900">
            <Percent className="h-5 w-5 text-orange-600" />
            Списание бонусов
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Максимальный процент оплаты
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={settings.max_usage_percent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_usage_percent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-8 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  %
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Максимальная часть заказа, которую можно оплатить бонусами
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Срок действия бонусов (дни)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={settings.expiration_days || ''}
                placeholder="Бессрочно"
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    expiration_days: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-gray-500">
                Оставьте пустым для бессрочных бонусов
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-3 font-medium text-gray-900">Пример расчёта</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              При заказе на <strong>5 000 ₽</strong> клиент получит{' '}
              <strong className="text-green-600">
                {Math.floor(5000 * (settings.accrual_percent / 100))} бонусов
              </strong>
            </p>
            <p>
              При заказе на <strong>5 000 ₽</strong> клиент сможет списать до{' '}
              <strong className="text-orange-600">
                {Math.floor(5000 * (settings.max_usage_percent / 100))} ₽
              </strong>{' '}
              бонусами
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Сохранить настройки
          </button>
        </div>
      </form>
    </div>
  );
}
