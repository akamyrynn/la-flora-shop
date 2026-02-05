'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, Gift, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { accrueBonus } from '@/lib/bonus';

type Step = 'phone' | 'code' | 'name';

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useStore();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Форматирование телефона
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7`;
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const getCleanPhone = () => {
    return '+7' + phone.replace(/\D/g, '').slice(1);
  };

  const sendCode = async () => {
    const cleanPhone = getCleanPhone();
    if (cleanPhone.length !== 12) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Проверяем, есть ли пользователь
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, name, phone')
        .eq('phone', cleanPhone)
        .single();

      if (existingUser) {
        setUserId(existingUser.id);
        setIsNewUser(false);
        if (existingUser.name) {
          setName(existingUser.name);
        }
      } else {
        setIsNewUser(true);
      }

      // В реальном приложении здесь отправка SMS через API
      // Для демо используем фиксированный код 1234
      console.log('SMS код: 1234');

      setStep('code');
    } catch (err) {
      setError('Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    // Для демо принимаем код 1234
    if (code !== '1234') {
      setError('Неверный код');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanPhone = getCleanPhone();

      if (isNewUser) {
        // Новый пользователь — переходим к вводу имени
        setStep('name');
      } else {
        // Существующий пользователь — входим
        await loginUser(cleanPhone);
      }
    } catch (err) {
      setError('Ошибка проверки кода');
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    if (!name.trim()) {
      setError('Введите ваше имя');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanPhone = getCleanPhone();

      // Создаём профиль
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          phone: cleanPhone,
          name: name.trim(),
          bonus_balance: 0,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Начисляем 100 бонусов за регистрацию
      await accrueBonus(
        profile.id,
        100,
        'Приветственный бонус за регистрацию'
      );

      // Обновляем баланс в профиле
      await supabase
        .from('profiles')
        .update({ bonus_balance: 100 })
        .eq('id', profile.id);

      // Устанавливаем пользователя в store
      setUser({
        id: profile.id,
        phone: cleanPhone,
        full_name: name.trim(),
        bonus_balance: 100,
      });

      // Переходим в профиль
      router.push('/profile');
    } catch (err) {
      console.error(err);
      setError('Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (phone: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();

    if (profile) {
      setUser({
        id: profile.id,
        phone: profile.phone,
        email: profile.email,
        full_name: profile.name,
        bonus_balance: profile.bonus_balance || 0,
      });

      router.push('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 'phone' && 'Вход в аккаунт'}
              {step === 'code' && 'Введите код'}
              {step === 'name' && 'Как вас зовут?'}
            </h1>
            <p className="text-gray-500 mt-2">
              {step === 'phone' && 'Введите номер телефона для входа или регистрации'}
              {step === 'code' && `Код отправлен на ${phone}`}
              {step === 'name' && 'Последний шаг для завершения регистрации'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step: Phone */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  autoFocus
                />
              </div>

              <button
                onClick={sendCode}
                disabled={loading || phone.replace(/\D/g, '').length < 11}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Получить код
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Bonus promo */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Gift className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">100 бонусов в подарок!</p>
                    <p className="text-sm text-yellow-600">За регистрацию на сайте</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step: Code */}
          {step === 'code' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Код из SMS
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="____"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-2xl text-center tracking-[0.5em] focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  autoFocus
                  maxLength={4}
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Для демо введите: 1234
                </p>
              </div>

              <button
                onClick={verifyCode}
                disabled={loading || code.length !== 4}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Подтвердить
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('phone')}
                className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
              >
                Изменить номер
              </button>
            </div>
          )}

          {/* Step: Name (for new users) */}
          {step === 'name' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ваше имя
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например, Анна"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  autoFocus
                />
              </div>

              <button
                onClick={registerUser}
                disabled={loading || !name.trim()}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Завершить регистрацию
                    <Gift className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Вы получите <span className="font-bold text-primary">100 бонусов</span> на счёт
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Продолжая, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
}
