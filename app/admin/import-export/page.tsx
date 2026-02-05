'use client';

import { useState } from 'react';
import {
  FileDown,
  FileUp,
  Download,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Tab = 'import' | 'export';

export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState<Tab>('export');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const exportProducts = async () => {
    setExporting(true);
    setMessage(null);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'ID', 'Название', 'Описание', 'Цена', 'Старая цена', 'Категория',
        'В наличии', 'Популярный', 'Новинка', 'Изображение'
      ];

      const rows = data?.map((p) => [
        p.id,
        p.name,
        p.description || '',
        p.price,
        p.old_price || '',
        p.category,
        p.in_stock ? 'Да' : 'Нет',
        p.is_popular ? 'Да' : 'Нет',
        p.is_new ? 'Да' : 'Нет',
        p.image,
      ]) || [];

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: `Экспортировано ${data?.length || 0} товаров` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка экспорта' });
    } finally {
      setExporting(false);
    }
  };

  const exportOrders = async () => {
    setExporting(true);
    setMessage(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'ID', 'Номер', 'Статус', 'Сумма', 'Имя клиента', 'Телефон',
        'Email', 'Адрес доставки', 'Дата создания'
      ];

      const rows = data?.map((o) => [
        o.id,
        o.order_number,
        o.status,
        o.total,
        o.customer_name,
        o.customer_phone,
        o.customer_email || '',
        o.delivery_address || '',
        o.created_at,
      ]) || [];

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: `Экспортировано ${data?.length || 0} заказов` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка экспорта' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error('Файл пуст или содержит только заголовки');
      }

      // Parse CSV (simple parser)
      const parseCSVLine = (line: string) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]);
      const rows = lines.slice(1).map(parseCSVLine);

      // Map columns
      const nameIndex = headers.findIndex((h) => h.toLowerCase().includes('название') || h.toLowerCase() === 'name');
      const priceIndex = headers.findIndex((h) => h.toLowerCase().includes('цена') || h.toLowerCase() === 'price');
      const categoryIndex = headers.findIndex((h) => h.toLowerCase().includes('категория') || h.toLowerCase() === 'category');
      const imageIndex = headers.findIndex((h) => h.toLowerCase().includes('изображение') || h.toLowerCase() === 'image');
      const descIndex = headers.findIndex((h) => h.toLowerCase().includes('описание') || h.toLowerCase() === 'description');

      if (nameIndex === -1 || priceIndex === -1) {
        throw new Error('Не найдены обязательные колонки: Название, Цена');
      }

      const products = rows
        .filter((row) => row[nameIndex] && row[priceIndex])
        .map((row) => ({
          name: row[nameIndex],
          price: parseFloat(row[priceIndex]) || 0,
          category: row[categoryIndex] || 'bouquets',
          image: row[imageIndex] || '',
          description: row[descIndex] || '',
          in_stock: true,
          is_popular: false,
          is_new: false,
        }));

      if (products.length === 0) {
        throw new Error('Не найдено товаров для импорта');
      }

      const { error } = await supabase.from('products').insert(products);

      if (error) throw error;

      setMessage({ type: 'success', text: `Импортировано ${products.length} товаров` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Ошибка импорта' });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
          <FileDown className="h-7 w-7 text-primary" />
          Импорт / Экспорт
        </h1>
        <p className="mt-1 text-gray-500">
          Массовая загрузка и выгрузка данных
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'export'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <Download className="h-5 w-5" />
            Экспорт
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'import'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <Upload className="h-5 w-5" />
            Импорт
          </button>
        </nav>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Content */}
      {activeTab === 'export' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Товары</h3>
                <p className="text-sm text-gray-500">Экспорт каталога в CSV</p>
              </div>
            </div>
            <button
              onClick={exportProducts}
              disabled={exporting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Скачать CSV
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Заказы</h3>
                <p className="text-sm text-gray-500">Экспорт заказов в CSV</p>
              </div>
            </div>
            <button
              onClick={exportOrders}
              disabled={exporting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Скачать CSV
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h3 className="font-medium">Импорт товаров из CSV</h3>
            <p className="mt-1 text-sm text-gray-500">
              Загрузите файл CSV с товарами. Обязательные колонки: Название, Цена
            </p>
          </div>

          <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <FileUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-gray-600">Перетащите файл сюда или</p>
            <label className="cursor-pointer">
              <span className="text-primary hover:underline">выберите файл</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
            </label>
            {importing && (
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Импорт...
              </div>
            )}
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 text-sm font-medium">Формат файла</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Формат: CSV с разделителем запятая</li>
              <li>• Кодировка: UTF-8</li>
              <li>• Первая строка: заголовки колонок</li>
              <li>• Обязательные колонки: Название, Цена</li>
              <li>• Опциональные: Категория, Описание, Изображение</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
