'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    occasion: '',
    budget: '',
    color: '',
  });

  const handleFinish = () => {
    const params = new URLSearchParams(answers);
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Подбор букета</h1>
        
        <div className="bg-white p-8 rounded-lg shadow">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Какой повод?</h2>
              <div className="space-y-2">
                {['birthday', 'march8', 'wedding', 'anniversary'].map((occasion) => (
                  <button
                    key={occasion}
                    onClick={() => {
                      setAnswers({ ...answers, occasion });
                      setStep(2);
                    }}
                    className="w-full px-6 py-3 border rounded hover:bg-pink-50 text-left"
                  >
                    {occasion === 'birthday' && 'День рождения'}
                    {occasion === 'march8' && '8 марта'}
                    {occasion === 'wedding' && 'Свадьба'}
                    {occasion === 'anniversary' && 'Годовщина'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Ваш бюджет?</h2>
              <div className="space-y-2">
                {['0-2500', '2500-5000', '5000-10000', '10000+'].map((budget) => (
                  <button
                    key={budget}
                    onClick={() => {
                      setAnswers({ ...answers, budget });
                      setStep(3);
                    }}
                    className="w-full px-6 py-3 border rounded hover:bg-pink-50 text-left"
                  >
                    {budget === '10000+' ? 'От 10000₽' : `${budget}₽`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Предпочитаемый цвет?</h2>
              <div className="space-y-2">
                {['red', 'pink', 'white', 'yellow', 'purple', 'mixed'].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setAnswers({ ...answers, color });
                      handleFinish();
                    }}
                    className="w-full px-6 py-3 border rounded hover:bg-pink-50 text-left"
                  >
                    {color === 'red' && 'Красный'}
                    {color === 'pink' && 'Розовый'}
                    {color === 'white' && 'Белый'}
                    {color === 'yellow' && 'Желтый'}
                    {color === 'purple' && 'Фиолетовый'}
                    {color === 'mixed' && 'Микс'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
