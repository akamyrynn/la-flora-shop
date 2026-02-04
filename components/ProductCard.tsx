'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/store';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleFavorite, favorites } = useStore();
  const isFavorite = favorites.includes(product.id);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug || product.id}`}>
        <div className="relative aspect-[3/4] bg-primary/[0.07] rounded-2xl overflow-hidden mb-4">
          {product.main_image ? (
            <Image
              src={product.main_image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-65">
              <span className="text-6xl">🌸</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.is_new && (
              <span className="bg-primary text-cream text-xs px-3 py-1 rounded-full font-medium">
                Новинка
              </span>
            )}
            {product.old_price && product.old_price > product.price && (
              <span className="bg-cream text-primary text-xs px-3 py-1 rounded-full font-medium">
                Скидка
              </span>
            )}
          </div>

          {/* Hover Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-primary bg-opacity-20 flex items-center justify-center transition-opacity">
              <button className="bg-cream text-primary px-6 py-3 rounded-full hover:bg-white transition font-medium">
                Быстрый просмотр
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(product.id);
        }}
        className="absolute top-4 right-4 bg-cream rounded-full p-2 hover:bg-white transition z-10"
      >
        <svg
          className={`w-5 h-5 ${isFavorite ? 'fill-primary' : 'fill-none'} stroke-primary`}
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      {/* Product Info */}
      <div>
        <h3 className="text-xl font-serif italic text-primary mb-1">{product.name}</h3>
        {product.short_description && (
          <p className="text-primary-65 text-sm mb-3 line-clamp-2">{product.short_description}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-serif text-primary">{product.price}₽</span>
            {product.old_price && product.old_price > product.price && (
              <span className="text-sm text-primary-65 line-through ml-2">{product.old_price}₽</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
