'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, _hasHydrated } = useStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Ждём пока Zustand восстановит данные из localStorage
    if (!_hasHydrated) return;

    const validateSession = async () => {
      if (!user?.id) {
        setIsValidating(false);
        return;
      }

      try {
        // Проверяем, существует ли пользователь в БД и получаем актуальные данные
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error || !profile) {
          // Пользователь не найден — очищаем сессию
          console.log('Session invalid: user not found in database');
          setUser(null);
        } else {
          // Обновляем данные пользователя (например, баланс бонусов мог измениться)
          setUser({
            id: profile.id,
            phone: profile.phone,
            email: profile.email,
            full_name: profile.name,
            bonus_balance: profile.bonus_balance || 0,
            bonus_card: profile.bonus_card,
            role: profile.role,
          });
        }
      } catch (err) {
        console.error('Session validation error:', err);
        // При ошибке оставляем пользователя как есть
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [_hasHydrated, user?.id, setUser]);

  // Можно показать лоадер пока идёт валидация, но лучше рендерить сразу
  // чтобы избежать мерцания
  return <>{children}</>;
}
