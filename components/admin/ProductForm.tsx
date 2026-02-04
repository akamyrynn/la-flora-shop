'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    short_description: product?.short_description || '',
    description: product?.description || '',
    composition: product?.composition || '',
    care_instructions: product?.care_instructions || '',
    price: product?.price || 0,
    old_price: product?.old_price || 0,
    in_stock: product?.in_stock ?? true,
    bouquet_type: product?.bouquet_type || 'mono',
    flower_type: product?.flower_type || 'roses',
    color: product?.color || 'red',
    occasions: product?.occasions || [],
    quantity: product?.quantity || 15,
    size: product?.size || 'medium',
    packaging_type: product?.packaging_type || 'ribbon',
    images: product?.images || [],
    main_image: product?.main_image || '',
    is_popular: product?.is_popular || false,
    is_new: product?.is_new || false,
  });

  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
    };

    if (product) {
      await supabase.from('products').update(data).eq('id', product.id);
    } else {
      await supabase.from('products').insert([data]);
    }

    onClose();
  };

  const addImage = () => {
    if (imageUrl) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl],
        main_image: formData.main_image || imageUrl,
      });
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages,
      main_image: formData.main_image === formData.images[index] ? newImages[0] || '' : formData.main_image,
    });
  };

  const toggleOccasion = (occasion: string) => {
    const occasions = formData.occasions.includes(occasion as any)
      ? formData.occasions.filter((o) => o !== occasion)
      : [...formData.occasions, occasion as any];
    setFormData({ ...formData, occasions });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
        <h2 className="text-2xl font-bold mb-6">
          {product ? 'Редактировать букет' : 'Добавить букет'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Краткое описание</label>
            <textarea
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Полное описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Состав</label>
              <textarea
                value={formData.composition}
                onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Уход</label>
              <textarea
                value={formData.care_instructions}
                onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                rows={3}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Цена *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Старая цена</label>
              <input
                type="number"
                value={formData.old_price}
                onChange={(e) => setFormData({ ...formData, old_price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Количество цветов</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Тип букета *</label>
              <select
                value={formData.bouquet_type}
                onChange={(e) => setFormData({ ...formData, bouquet_type: e.target.value as any })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="mono">Монобукет</option>
                <option value="mixed">Сборный</option>
                <option value="composition">Композиция</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Вид цветка</label>
              <select
                value={formData.flower_type}
                onChange={(e) => setFormData({ ...formData, flower_type: e.target.value as any })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="roses">Розы</option>
                <option value="peonies">Пионы</option>
                <option value="chrysanthemums">Хризантемы</option>
                <option value="tulips">Тюльпаны</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Цвет *</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="red">Красный</option>
                <option value="pink">Розовый</option>
                <option value="white">Белый</option>
                <option value="yellow">Желтый</option>
                <option value="purple">Фиолетовый</option>
                <option value="mixed">Микс</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Размер</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="small">Маленький</option>
                <option value="medium">Средний</option>
                <option value="large">Большой</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Упаковка</label>
              <select
                value={formData.packaging_type}
                onChange={(e) => setFormData({ ...formData, packaging_type: e.target.value as any })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="ribbon">Под ленту</option>
                <option value="wrapped">В упаковке</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Поводы</label>
            <div className="flex flex-wrap gap-2">
              {['birthday', 'march8', 'wedding', 'anniversary'].map((occasion) => (
                <button
                  key={occasion}
                  type="button"
                  onClick={() => toggleOccasion(occasion)}
                  className={`px-4 py-2 rounded ${
                    formData.occasions.includes(occasion as any)
                      ? 'bg-primary text-cream'
                      : 'bg-gray-200'
                  }`}
                >
                  {occasion === 'birthday' && 'День рождения'}
                  {occasion === 'march8' && '8 марта'}
                  {occasion === 'wedding' && 'Свадьба'}
                  {occasion === 'anniversary' && 'Годовщина'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Изображения</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL изображения"
                className="flex-1 px-4 py-2 border rounded"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-primary text-cream rounded hover:opacity-80"
              >
                Добавить
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.in_stock}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
              />
              <span>В наличии</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_popular}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
              />
              <span>Популярный</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_new}
                onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
              />
              <span>Новинка</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 bg-primary text-cream py-3 rounded hover:opacity-80"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 py-3 rounded hover:bg-gray-400"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
