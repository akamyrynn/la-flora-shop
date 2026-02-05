import { supabase } from './supabase';
import type { BonusSettings, BonusTransaction, BonusTransactionType } from './types';

// ============================================
// ПОЛУЧЕНИЕ НАСТРОЕК БОНУСОВ
// ============================================

export async function getBonusSettings(): Promise<BonusSettings | null> {
  const { data, error } = await supabase
    .from('bonus_settings')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching bonus settings:', error);
    return null;
  }

  return data;
}

export async function updateBonusSettings(
  settings: Partial<BonusSettings>
): Promise<BonusSettings | null> {
  const { data: existing } = await supabase
    .from('bonus_settings')
    .select('id')
    .single();

  if (!existing) {
    return null;
  }

  const { data, error } = await supabase
    .from('bonus_settings')
    .update(settings)
    .eq('id', existing.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating bonus settings:', error);
    return null;
  }

  return data;
}

// ============================================
// РАСЧЁТ БОНУСОВ
// ============================================

export interface BonusCalculation {
  maxUsable: number;
  accrual: number;
  settings: BonusSettings;
}

export async function calculateBonuses(
  orderTotal: number,
  userBalance: number
): Promise<BonusCalculation | null> {
  const settings = await getBonusSettings();

  if (!settings || !settings.is_active) {
    return null;
  }

  const maxUsableByPercent = Math.floor(orderTotal * (settings.max_usage_percent / 100));
  const maxUsable = Math.min(maxUsableByPercent, userBalance);

  let accrual = 0;
  if (orderTotal >= settings.min_order_for_accrual) {
    accrual = Math.floor(orderTotal * (settings.accrual_percent / 100));
  }

  return {
    maxUsable,
    accrual,
    settings,
  };
}

// ============================================
// ОПЕРАЦИИ С БОНУСАМИ
// ============================================

export async function getUserBonusBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('internal_bonus_balance')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user bonus balance:', error);
    return 0;
  }

  return data?.internal_bonus_balance || 0;
}

export async function createBonusTransaction(
  userId: string,
  type: BonusTransactionType,
  amount: number,
  orderId?: string,
  description?: string,
  createdBy?: string
): Promise<BonusTransaction | null> {
  const currentBalance = await getUserBonusBalance(userId);
  const newBalance = type === 'usage' || type === 'expired'
    ? currentBalance - Math.abs(amount)
    : currentBalance + Math.abs(amount);

  const settings = await getBonusSettings();
  let expiresAt: string | undefined;

  if (type === 'accrual' && settings?.expiration_days) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + settings.expiration_days);
    expiresAt = expDate.toISOString();
  }

  const { data: transaction, error: txError } = await supabase
    .from('bonus_transactions')
    .insert({
      user_id: userId,
      order_id: orderId,
      type,
      amount: type === 'usage' || type === 'expired' ? -Math.abs(amount) : Math.abs(amount),
      balance_after: newBalance,
      description,
      expires_at: expiresAt,
      created_by: createdBy,
    })
    .select()
    .single();

  if (txError) {
    console.error('Error creating bonus transaction:', txError);
    return null;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ internal_bonus_balance: newBalance })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating user balance:', updateError);
    return null;
  }

  return transaction;
}

export async function accrueBonus(
  userId: string,
  amount: number,
  orderId?: string,
  description?: string
): Promise<BonusTransaction | null> {
  return createBonusTransaction(
    userId,
    'accrual',
    amount,
    orderId,
    description || `Начисление бонусов за заказ`
  );
}

export async function useBonus(
  userId: string,
  amount: number,
  orderId?: string,
  description?: string
): Promise<BonusTransaction | null> {
  const currentBalance = await getUserBonusBalance(userId);

  if (currentBalance < amount) {
    console.error('Insufficient bonus balance');
    return null;
  }

  return createBonusTransaction(
    userId,
    'usage',
    amount,
    orderId,
    description || `Списание бонусов на заказ`
  );
}

export async function adjustBonus(
  userId: string,
  amount: number,
  description: string,
  createdBy: string
): Promise<BonusTransaction | null> {
  return createBonusTransaction(
    userId,
    'adjustment',
    amount,
    undefined,
    description,
    createdBy
  );
}

// ============================================
// ИСТОРИЯ ТРАНЗАКЦИЙ
// ============================================

export async function getUserBonusTransactions(
  userId: string,
  limit: number = 50
): Promise<BonusTransaction[]> {
  const { data, error } = await supabase
    .from('bonus_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching bonus transactions:', error);
    return [];
  }

  return data || [];
}

export async function getAllBonusTransactions(
  filters?: {
    type?: BonusTransactionType;
    from?: string;
    to?: string;
  },
  limit: number = 100
): Promise<BonusTransaction[]> {
  let query = supabase
    .from('bonus_transactions')
    .select('*, profiles(name, email, phone)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.from) {
    query = query.gte('created_at', filters.from);
  }

  if (filters?.to) {
    query = query.lte('created_at', filters.to);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching all bonus transactions:', error);
    return [];
  }

  return data || [];
}

// ============================================
// ОБРАБОТКА ЗАКАЗА
// ============================================

export async function processOrderBonuses(
  userId: string,
  orderId: string,
  orderTotal: number,
  bonusUsed: number
): Promise<{
  usageTransaction?: BonusTransaction | null;
  accrualTransaction?: BonusTransaction | null;
}> {
  const result: {
    usageTransaction?: BonusTransaction | null;
    accrualTransaction?: BonusTransaction | null;
  } = {};

  if (bonusUsed > 0) {
    result.usageTransaction = await useBonus(
      userId,
      bonusUsed,
      orderId,
      `Оплата бонусами заказа #${orderId.slice(0, 8)}`
    );
  }

  const calculation = await calculateBonuses(orderTotal - bonusUsed, 0);
  if (calculation && calculation.accrual > 0) {
    result.accrualTransaction = await accrueBonus(
      userId,
      calculation.accrual,
      orderId,
      `Бонусы за заказ #${orderId.slice(0, 8)}`
    );
  }

  return result;
}
