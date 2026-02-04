'use client';

import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-cream py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-8xl mb-8">✅</div>
        <h1 className="text-5xl md:text-6xl font-serif italic text-primary mb-6">
          Заказ оформлен!
        </h1>
        <p className="text-xl text-primary-80 mb-12">
          Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время для подтверждения.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/profile"
            className="inline-block bg-primary text-cream px-12 py-5 rounded-full hover:opacity-80 transition text-lg font-medium mr-4"
          >
            Мои заказы
          </Link>
          <Link
            href="/catalog"
            className="inline-block bg-cream border border-primary text-primary px-12 py-5 rounded-full hover:opacity-80 transition text-lg font-medium"
          >
            Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  );
}
