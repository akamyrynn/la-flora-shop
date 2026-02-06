'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

const BouquetScene = dynamic(
  () => import('@/components/bouquet-configurator/BouquetScene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-rose-50 to-rose-100 rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-gray-500">Загрузка 3D сцены...</p>
        </div>
      </div>
    ),
  }
);

export default function Bouquet3DPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Назад в магазин</span>
          </Link>
          <h1 className="font-serif text-xl text-primary-700">
            3D Букет — Просмотр модели
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="h-[500px] lg:h-[650px]">
            <BouquetScene />
          </div>
          <div className="p-3 bg-gray-50 border-t">
            <p className="text-sm text-gray-500 text-center">
              Вращайте букет мышкой. Откройте консоль (F12) чтобы увидеть структуру модели.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
