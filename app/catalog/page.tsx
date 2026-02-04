'use client';

import { useState, useEffect } from 'react';
import Filters from '@/components/Filters';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (filters?: any) => {
    setLoading(true);
    let query = supabase.from('products').select('*').eq('in_stock', true);

    if (filters?.bouquetType) {
      query = query.eq('bouquet_type', filters.bouquetType);
    }
    if (filters?.color) {
      query = query.eq('color', filters.color);
    }
    if (filters?.flowerType) {
      query = query.eq('flower_type', filters.flowerType);
    }
    if (filters?.occasion) {
      query = query.contains('occasions', [filters.occasion]);
    }
    if (filters?.priceRange) {
      const [min, max] = filters.priceRange.split('-');
      if (max) {
        query = query.gte('price', parseInt(min)).lte('price', parseInt(max));
      } else {
        query = query.gte('price', parseInt(min.replace('+', '')));
      }
    }

    if (filters?.sortBy === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (filters?.sortBy === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else if (filters?.sortBy === 'new') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.eq('is_popular', true).order('order_count', { ascending: false });
    }

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-serif italic text-primary mb-8">Каталог букетов</h1>
        
        <Filters onFilterChange={loadProducts} />

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-primary-65 font-serif italic">Товары не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
