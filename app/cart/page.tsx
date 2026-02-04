'use client';

import { useStore } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';
import AddonsSection from '@/components/AddonsSection';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity } = useStore();

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-serif italic text-primary mb-12">Корзина</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-serif italic text-primary-65 mb-6">Корзина пуста</p>
            <Link 
              href="/catalog" 
              className="inline-block bg-primary text-cream px-8 py-4 rounded-full hover:bg-primary-80 transition"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-6 border-b border-primary-10 py-6">
                  <div className="relative w-32 h-32 bg-primary/[0.07] rounded-xl overflow-hidden flex-shrink-0">
                    {item.product.main_image ? (
                      <Image
                        src={item.product.main_image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">🌸</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-serif italic text-primary mb-2">{item.product.name}</h3>
                    <p className="text-primary-80 mb-4">{item.product.price}₽</p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 border border-primary-10 rounded-full px-4 py-2">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.product.id, Math.max(1, item.quantity - 1))
                          }
                          className="text-primary hover:opacity-70 transition"
                        >
                          −
                        </button>
                        <span className="text-primary font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.product.id, item.quantity + 1)
                          }
                          className="text-primary hover:opacity-70 transition"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-primary-65 hover:text-primary transition text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-serif text-primary">
                      {item.product.price * item.quantity}₽
                    </p>
                  </div>
                </div>
              ))}

              <AddonsSection />
            </div>

            <div className="bg-primary/[0.03] p-8 rounded-2xl h-fit">
              <h3 className="text-2xl font-serif italic text-primary mb-6">Итого</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-primary-80">
                  <span>Товары:</span>
                  <span>{total}₽</span>
                </div>
                <div className="flex justify-between text-primary-80">
                  <span>Доставка:</span>
                  <span>Рассчитается при оформлении</span>
                </div>
              </div>
              
              <div className="border-t border-primary-10 pt-6 mb-8">
                <div className="flex justify-between text-2xl font-serif text-primary">
                  <span>Всего:</span>
                  <span>{total}₽</span>
                </div>
              </div>
              
              <Link
                href="/checkout"
                className="block w-full bg-primary text-cream text-center py-4 rounded-full hover:bg-primary-80 transition font-medium"
              >
                Оформить заказ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
