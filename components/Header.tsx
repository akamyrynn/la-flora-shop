'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useState } from 'react';

export default function Header() {
  const { cart, user } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-primary-10">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl md:text-3xl font-serif italic text-primary hover:opacity-80 transition">
            La Flora
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/catalog" className="text-primary hover:opacity-65 transition">
              Каталог
            </Link>
            <Link href="/portfolio" className="text-primary hover:opacity-65 transition">
              Портфолио
            </Link>
            <Link href="/faq" className="text-primary hover:opacity-65 transition">
              FAQ
            </Link>
            <Link href="/reviews" className="text-primary hover:opacity-65 transition">
              Отзывы
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-5">
            <Link 
              href="/profile" 
              className="hidden md:flex items-center gap-2 text-primary hover:opacity-65 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
            
            <Link href="/cart" className="relative group">
              <svg 
                className="w-6 h-6 text-primary group-hover:opacity-65 transition" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" 
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-cream text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-primary hover:opacity-65 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-6 pb-4 flex flex-col gap-4 border-t border-primary-10 pt-6">
            <Link href="/catalog" className="text-primary hover:opacity-65 transition" onClick={() => setMobileMenuOpen(false)}>
              Каталог
            </Link>
            <Link href="/portfolio" className="text-primary hover:opacity-65 transition" onClick={() => setMobileMenuOpen(false)}>
              Портфолио
            </Link>
            <Link href="/faq" className="text-primary hover:opacity-65 transition" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
            <Link href="/reviews" className="text-primary hover:opacity-65 transition" onClick={() => setMobileMenuOpen(false)}>
              Отзывы
            </Link>
            <Link href="/profile" className="text-primary hover:opacity-65 transition" onClick={() => setMobileMenuOpen(false)}>
              {user ? 'Профиль' : 'Войти'}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
