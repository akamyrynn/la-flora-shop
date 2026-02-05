'use client';

import { useState, useEffect } from 'react';
import {
  Monitor,
  Plus,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Settings,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import type { POSTerminal, Store } from '@/lib/types';

export default function POSTerminalsPage() {
  const [terminals, setTerminals] = useState<(POSTerminal & { store?: Store })[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<POSTerminal | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    store_id: '',
    external_id: '',
    status: 'inactive' as 'active' | 'inactive' | 'maintenance',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [terminalsRes, storesRes] = await Promise.all([
      supabase.from('pos_terminals').select('*, store:stores(*)').order('name'),
      supabase.from('stores').select('*').eq('is_active', true),
    ]);

    if (terminalsRes.data) setTerminals(terminalsRes.data);
    if (storesRes.data) setStores(storesRes.data);

    setLoading(false);
  };

  const openForm = (terminal?: POSTerminal) => {
    if (terminal) {
      setEditingItem(terminal);
      setForm({
        name: terminal.name,
        store_id: terminal.store_id,
        external_id: terminal.external_id || '',
        status: terminal.status,
      });
    } else {
      setEditingItem(null);
      setForm({
        name: '',
        store_id: stores[0]?.id || '',
        external_id: '',
        status: 'inactive',
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingItem) {
      await supabase.from('pos_terminals').update(form).eq('id', editingItem.id);
    } else {
      await supabase.from('pos_terminals').insert([form]);
    }

    setSaving(false);
    closeForm();
    loadData();
  };

  const deleteTerminal = async (id: string) => {
    if (!confirm('Удалить этот терминал?')) return;
    await supabase.from('pos_terminals').delete().eq('id', id);
    loadData();
  };

  const toggleStatus = async (terminal: POSTerminal) => {
    const newStatus = terminal.status === 'active' ? 'inactive' : 'active';
    await supabase.from('pos_terminals').update({ status: newStatus }).eq('id', terminal.id);
    loadData();
  };

  const statusColors = {
    active: 'success' as const,
    inactive: 'default' as const,
    maintenance: 'warning' as const,
  };

  const statusLabels = {
    active: 'Активен',
    inactive: 'Неактивен',
    maintenance: 'Обслуживание',
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
            <Monitor className="h-7 w-7 text-primary" />
            Терминалы
          </h1>
          <p className="mt-1 text-gray-500">
            Управление кассовыми терминалами
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Добавить терминал
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Всего терминалов</p>
          <p className="mt-1 text-2xl font-semibold">{terminals.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Активных</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {terminals.filter((t) => t.status === 'active').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">На обслуживании</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-600">
            {terminals.filter((t) => t.status === 'maintenance').length}
          </p>
        </div>
      </div>

      {/* Terminals Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {terminals.map((terminal) => (
          <div
            key={terminal.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    terminal.status === 'active'
                      ? 'bg-green-100 text-green-600'
                      : terminal.status === 'maintenance'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Monitor className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">{terminal.name}</h3>
                  <p className="text-sm text-gray-500">{terminal.store?.name}</p>
                </div>
              </div>
              <StatusBadge variant={statusColors[terminal.status]}>
                {statusLabels[terminal.status]}
              </StatusBadge>
            </div>

            {terminal.external_id && (
              <p className="mt-3 text-sm text-gray-500">
                ID: <span className="font-mono">{terminal.external_id}</span>
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => toggleStatus(terminal)}
                className={`flex items-center gap-1 rounded px-3 py-1.5 text-sm ${
                  terminal.status === 'active'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {terminal.status === 'active' ? (
                  <>
                    <PowerOff className="h-4 w-4" />
                    Выключить
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4" />
                    Включить
                  </>
                )}
              </button>
              <button
                onClick={() => openForm(terminal)}
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteTerminal(terminal.id)}
                className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {terminals.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Терминалы не добавлены
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingItem ? 'Редактировать терминал' : 'Новый терминал'}
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
                  placeholder="Касса 1"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Точка продаж</label>
                <select
                  value={form.store_id}
                  onChange={(e) => setForm({ ...form, store_id: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                >
                  <option value="">Выберите точку</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Внешний ID</label>
                <input
                  type="text"
                  value={form.external_id}
                  onChange={(e) => setForm({ ...form, external_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  placeholder="Опционально"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Статус</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as 'active' | 'inactive' | 'maintenance' })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                >
                  <option value="inactive">Неактивен</option>
                  <option value="active">Активен</option>
                </select>
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
