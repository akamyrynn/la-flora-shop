'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import {
  User,
  ShoppingBag,
  Heart,
  Phone,
  Flower2,
  ChevronDown,
  Search,
  MapPin,
  Clock,
  Star,
  Shield,
} from 'lucide-react';
import AuthModal from './AuthModal';

// Информационные ссылки
const INFO_LINKS = [
  { name: 'Доставка и оплата', href: '/delivery' },
  { name: 'О компании', href: '/about' },
  { name: 'Контакты', href: '/contacts' },
  { name: 'Гарантии', href: '/guarantees' },
  { name: 'Уход за цветами', href: '/care' },
  { name: 'Бонусная программа', href: '/bonus' },
];

export default function Header() {
  const { cart, favorites, user } = useStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-cream border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
              <Flower2 className="w-6 h-6 text-primary" />
              <span className="text-lg font-serif font-bold text-primary">La Flora</span>
            </Link>

            {/* City & Date */}
            <div className="hidden lg:flex items-center gap-4 text-xs text-primary/70">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Красноярск</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            {/* Phone & Hours */}
            <div className="hidden md:flex flex-col items-start text-xs">
              <span className="text-primary/60">Ежедневно с 9:00 до 21:00</span>
              <a href="tel:+79001234567" className="text-primary font-medium hover:underline">
                +7 (900) 123-45-67
              </a>
            </div>

            {/* Quality badges */}
            <div className="hidden xl:flex items-center gap-4 text-xs text-primary/70">
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Гарантия качества</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                <span>Отзывы</span>
              </div>
            </div>

            {/* Info dropdown - на hover */}
            <div
              className="relative hidden md:block"
              onMouseEnter={() => setInfoOpen(true)}
              onMouseLeave={() => setInfoOpen(false)}
            >
              <button className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition py-2">
                <span>Информация</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${infoOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute right-0 top-full w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transition-all duration-200 ${
                infoOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}>
                {INFO_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth */}
            {user ? (
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-1.5 text-xs text-primary hover:text-primary/70 transition"
              >
                <User className="w-4 h-4" />
                <span>Профиль</span>
              </Link>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs text-primary hover:text-primary/70 transition"
              >
                <User className="w-4 h-4" />
                <span>Войти</span>
              </button>
            )}

            {/* Icons */}
            <div className="flex items-center gap-1">
              <button className="p-2 text-primary/70 hover:text-primary transition">
                <Search className="w-5 h-5" />
              </button>
              <Link
                href="/favorites"
                className="relative p-2 text-primary/70 hover:text-primary transition"
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="relative p-2 text-primary/70 hover:text-primary transition"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {/* Mobile auth */}
              <button
                onClick={() => setAuthModalOpen(true)}
                className="sm:hidden p-2 text-primary/70 hover:text-primary transition"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
