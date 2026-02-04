'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'Как сделать заказ?',
    answer: 'Выберите букет в каталоге, добавьте в корзину и оформите заказ. Укажите адрес доставки, дату и время.',
  },
  {
    question: 'Какая стоимость доставки?',
    answer: 'Стоимость доставки рассчитывается автоматически в зависимости от зоны доставки.',
  },
  {
    question: 'Можно ли доставить букет анонимно?',
    answer: 'Да, при оформлении заказа отметьте опцию "Доставить анонимно".',
  },
  {
    question: 'Как работает бонусная программа?',
    answer: 'Привяжите карту Инспиро в личном кабинете. Бонусы начисляются за каждый заказ и могут быть использованы для оплаты.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Часто задаваемые вопросы</h1>
      
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center"
            >
              <span className="font-semibold">{faq.question}</span>
              <span className="text-2xl">{openIndex === index ? '−' : '+'}</span>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-gray-600">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
