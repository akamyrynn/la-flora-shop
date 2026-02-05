'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Phone, ArrowRight, Loader2, CheckCircle, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { accrueBonus } from '@/lib/bonus';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'phone' | 'code' | 'name';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const { setUser } = useStore();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  if (!isOpen) return null;

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
        setIsNewUser(false);
        if (existingUser.name) {
          setName(existingUser.name);
        }
      } else {
        setIsNewUser(true);
      }

      // В реальном приложении здесь отправка SMS
      console.log('SMS код: 1234');

      setStep('code');
    } catch (err) {
      setError('Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (code !== '1234') {
      setError('Неверный код');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanPhone = getCleanPhone();

      if (isNewUser) {
        setStep('name');
      } else {
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

      console.log('Attempting to insert profile with phone:', cleanPhone);

      const { data: profile, error: profileError, status, statusText } = await supabase
        .from('profiles')
        .insert({
          phone: cleanPhone,
          name: name.trim(),
          bonus_balance: 100,
        })
        .select()
        .single();

      console.log('Insert result:', { profile, profileError, status, statusText });

      if (profileError || !profile) {
        console.error('Profile insert error:', profileError, 'Status:', status);
        throw new Error(profileError?.message || `Ошибка создания профиля (${status})`);
      }

      // Пытаемся записать бонусную транзакцию (если таблица существует)
      try {
        await accrueBonus(profile.id, 100, 'Приветственный бонус за регистрацию');
      } catch (bonusErr) {
        // Игнорируем ошибку если таблица не существует
        console.log('Bonus accrual skipped:', bonusErr);
      }

      setUser({
        id: profile.id,
        phone: cleanPhone,
        full_name: name.trim(),
        bonus_balance: 100,
      });

      onClose();
      router.push('/profile');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Ошибка регистрации. Попробуйте позже.');
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

      onClose();
      router.push('/profile');
    }
  };

  const handleClose = () => {
    setStep('phone');
    setPhone('');
    setCode('');
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'phone' && 'Вход в аккаунт'}
            {step === 'code' && 'Введите код'}
            {step === 'name' && 'Как вас зовут?'}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone className="w-8 h-8 text-primary" />
          </div>

          <p className="text-gray-500 text-center mb-6">
            {step === 'phone' && 'Введите номер телефона для входа или регистрации'}
            {step === 'code' && `Код отправлен на ${phone}`}
            {step === 'name' && 'Последний шаг для завершения регистрации'}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Step: Phone */}
          {step === 'phone' && (
            <div className="space-y-4">
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 (___) ___-__-__"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                autoFocus
              />

              <button
                onClick={sendCode}
                disabled={loading || phone.replace(/\D/g, '').length < 11}
                className="w-full bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
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
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="____"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-2xl text-center tracking-[0.5em] focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                autoFocus
                maxLength={4}
              />
              <p className="text-xs text-gray-400 text-center">Для демо введите: 1234</p>

              <button
                onClick={verifyCode}
                disabled={loading || code.length !== 4}
                className="w-full bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

          {/* Step: Name */}
          {step === 'name' && (
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, Анна"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                autoFocus
              />

              <button
                onClick={registerUser}
                disabled={loading || !name.trim()}
                className="w-full bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
        <div className="px-6 pb-6">
          <p className="text-center text-xs text-gray-400">
            Продолжая, вы соглашаетесь с условиями использования
          </p>
        </div>
      </div>
    </div>
  );
}
