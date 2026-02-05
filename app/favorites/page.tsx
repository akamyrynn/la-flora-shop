'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';
import { Heart, ArrowLeft } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteProducts();
  }, [favorites]);

  const loadFavoriteProducts = async () => {
    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('id', favorites);

    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-primary/5 text-primary transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-serif italic text-primary">Избранное</h1>
            <p className="text-primary/60 text-sm">
              {favorites.length > 0
                ? `${favorites.length} ${favorites.length === 1 ? 'товар' : favorites.length < 5 ? 'товара' : 'товаров'}`
                : 'Пока пусто'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <h2 className="text-xl font-serif italic text-primary mb-2">
              Список избранного пуст
            </h2>
            <p className="text-primary/60 mb-6">
              Добавляйте понравившиеся букеты, нажимая на сердечко
            </p>
            <Link
              href="/catalog"
              className="inline-block bg-primary text-cream px-8 py-3 rounded-full hover:opacity-90 transition"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
