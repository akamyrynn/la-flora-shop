'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import ProductForm from '@/components/admin/ProductForm';
import Image from 'next/image';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });
    
    if (filterType) {
      query = query.eq('bouquet_type', filterType);
    }
    
    const { data } = await query;
    setProducts(data || []);
  };

  const deleteProduct = async (id: string) => {
    if (confirm('Удалить этот товар?')) {
      await supabase.from('products').delete().eq('id', id);
      loadProducts();
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif italic text-gray-900 mb-2">Букеты</h1>
          <p className="text-gray-600">{products.length} товаров в каталоге</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="bg-primary text-cream px-6 py-3 rounded-lg hover:opacity-80 transition font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Добавить букет
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              loadProducts();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Все типы</option>
            <option value="mono">Монобукет</option>
            <option value="mixed">Сборный</option>
            <option value="composition">Композиция</option>
          </select>

          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
          >
            Обновить
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
          >
            <div className="relative aspect-[4/3] bg-gray-100">
              {product.main_image ? (
                <Image
                  src={product.main_image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🌸
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.is_new && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Новинка
                  </span>
                )}
                {!product.in_stock && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Нет в наличии
                  </span>
                )}
              </div>

              {/* Quick Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setShowForm(true);
                  }}
                  className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="bg-white p-2 rounded-lg shadow-lg hover:bg-red-50 transition"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.short_description || 'Нет описания'}
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-gray-900">{product.price}₽</span>
                  {product.old_price && (
                    <span className="text-sm text-gray-400 line-through ml-2">
                      {product.old_price}₽
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded">{product.bouquet_type}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{product.quantity} шт</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-400 mb-4">🌸</p>
          <p className="text-gray-600">Товары не найдены</p>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
