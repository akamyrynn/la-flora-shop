'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/store';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedPackaging, setSelectedPackaging] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart, toggleFavorite, favorites } = useStore();

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    let query = supabase.from('products').select('*');
    
    const { data: bySlug } = await query.eq('slug', params.id).single();
    if (bySlug) {
      setProduct(bySlug);
      setSelectedColor(bySlug.color);
      setSelectedPackaging(bySlug.packaging_type);
      
      if (bySlug.variant_group) {
        const { data: variantsData } = await supabase
          .from('products')
          .select('*')
          .eq('variant_group', bySlug.variant_group)
          .order('quantity', { ascending: true });
        setVariants(variantsData || []);
      }
      return;
    }

    const { data: byId } = await query.eq('id', params.id).single();
    if (byId) {
      setProduct(byId);
      setSelectedColor(byId.color);
      setSelectedPackaging(byId.packaging_type);
      
      if (byId.variant_group) {
        const { data: variantsData } = await supabase
          .from('products')
          .select('*')
          .eq('variant_group', byId.variant_group)
          .order('quantity', { ascending: true });
        setVariants(variantsData || []);
      }
    }
  };

  const switchToVariant = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      setProduct(variant);
      setSelectedImage(0);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const isFavorite = favorites.includes(product.id);

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-[3/4] bg-primary/[0.07] rounded-2xl overflow-hidden mb-4">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-65">
                  <span className="text-8xl">🌸</span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 border-2 ${
                      selectedImage === idx ? 'border-primary' : 'border-primary-10'
                    } rounded-lg overflow-hidden`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic text-primary mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-serif text-primary">{product.price}₽</span>
              {product.old_price && product.old_price > product.price && (
                <span className="text-2xl text-primary-65 line-through">{product.old_price}₽</span>
              )}
            </div>

            {product.short_description && (
              <p className="text-primary-80 mb-8 leading-relaxed">{product.short_description}</p>
            )}

            {/* Variants */}
            {variants.length > 0 && (
              <div className="mb-6">
                <p className="text-primary font-medium mb-3">
                  Количество {product.flower_type === 'roses' ? 'роз' : 'цветов'}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => switchToVariant(variant.id)}
                      className={`px-6 py-3 border-2 rounded-full transition ${
                        variant.id === product.id
                          ? 'bg-primary text-cream border-primary'
                          : 'bg-cream text-primary border-primary-10 hover:border-primary'
                      }`}
                    >
                      {variant.quantity} шт
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            <div className="mb-6">
              <p className="text-primary font-medium mb-3">Цвет:</p>
              <div className="flex gap-3">
                {['red', 'pink', 'white', 'yellow', 'purple', 'mixed'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-2 transition ${
                      selectedColor === color ? 'border-primary scale-110' : 'border-primary-10'
                    } ${
                      color === 'red' ? 'bg-red-500' :
                      color === 'pink' ? 'bg-pink-400' :
                      color === 'white' ? 'bg-white' :
                      color === 'yellow' ? 'bg-yellow-400' :
                      color === 'purple' ? 'bg-purple-500' :
                      'bg-gradient-to-r from-red-500 to-yellow-400'
                    }`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Packaging */}
            <div className="mb-8">
              <p className="text-primary font-medium mb-3">Упаковка:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPackaging('ribbon')}
                  className={`px-6 py-3 border-2 rounded-full transition ${
                    selectedPackaging === 'ribbon'
                      ? 'bg-primary text-cream border-primary'
                      : 'bg-cream text-primary border-primary-10 hover:border-primary'
                  }`}
                >
                  Под ленту
                </button>
                <button
                  onClick={() => setSelectedPackaging('wrapped')}
                  className={`px-6 py-3 border-2 rounded-full transition ${
                    selectedPackaging === 'wrapped'
                      ? 'bg-primary text-cream border-primary'
                      : 'bg-cream text-primary border-primary-10 hover:border-primary'
                  }`}
                >
                  В упаковке
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => addToCart(product, 1)}
                className="flex-1 bg-primary text-cream py-4 rounded-full hover:bg-primary-80 transition text-lg font-medium"
              >
                Добавить в корзину
              </button>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`px-6 py-4 border-2 rounded-full transition ${
                  isFavorite ? 'border-primary bg-primary' : 'border-primary-10 hover:border-primary'
                }`}
              >
                <svg 
                  className={`w-6 h-6 ${isFavorite ? 'fill-cream stroke-cream' : 'fill-none stroke-primary'}`} 
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="border-t border-primary-10 pt-6">
              <div className="flex gap-6 mb-6 border-b border-primary-10">
                {['description', 'composition', 'care'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 transition ${
                      activeTab === tab
                        ? 'border-b-2 border-primary text-primary font-medium'
                        : 'text-primary-65 hover:text-primary'
                    }`}
                  >
                    {tab === 'description' && 'Описание'}
                    {tab === 'composition' && 'Состав'}
                    {tab === 'care' && 'Уход'}
                  </button>
                ))}
              </div>

              <div className="text-primary-80 leading-relaxed">
                {activeTab === 'description' && (product.description || 'Описание отсутствует')}
                {activeTab === 'composition' && (product.composition || 'Состав не указан')}
                {activeTab === 'care' && (product.care_instructions || 'Рекомендации по уходу отсутствуют')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
