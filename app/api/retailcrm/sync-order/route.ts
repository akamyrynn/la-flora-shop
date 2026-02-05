import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import retailCRM, { convertOrderToRetailCRM } from '@/lib/retailcrm';

/**
 * Синхронизировать заказ с RetailCRM
 * POST /api/retailcrm/sync-order
 * Body: { orderId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Получаем заказ из Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Получаем позиции заказа
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    // Конвертируем в формат RetailCRM
    const crmOrder = convertOrderToRetailCRM({
      ...order,
      items: items || [],
    });

    // Проверяем, был ли заказ уже отправлен в CRM
    if (order.retailcrm_id) {
      // Обновляем существующий заказ
      const result = await retailCRM.updateOrder(order.id, crmOrder);

      if (!result.success) {
        console.error('RetailCRM update error:', result.errorMsg);
        return NextResponse.json(
          { error: 'Failed to update order in RetailCRM', details: result.errorMsg },
          { status: 500 }
        );
      }

      // Обновляем время синхронизации
      await supabase
        .from('orders')
        .update({ retailcrm_synced_at: new Date().toISOString() })
        .eq('id', orderId);

      return NextResponse.json({
        success: true,
        action: 'updated',
        retailcrm_id: order.retailcrm_id,
      });
    } else {
      // Создаём новый заказ в CRM
      const result = await retailCRM.createOrder(crmOrder);

      if (!result.success) {
        console.error('RetailCRM create error:', result.errorMsg);
        return NextResponse.json(
          { error: 'Failed to create order in RetailCRM', details: result.errorMsg },
          { status: 500 }
        );
      }

      // Сохраняем ID из RetailCRM
      const retailcrmId = (result as { id?: number }).id;
      await supabase
        .from('orders')
        .update({
          retailcrm_id: retailcrmId,
          retailcrm_synced_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: true,
        action: 'created',
        retailcrm_id: retailcrmId,
      });
    }
  } catch (error) {
    console.error('Sync order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
