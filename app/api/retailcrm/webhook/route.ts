import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { STATUS_MAP_FROM_CRM } from '@/lib/retailcrm';

/**
 * Webhook endpoint для получения обновлений из RetailCRM
 * URL для настройки в RetailCRM: https://your-domain.com/api/retailcrm/webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем секретный ключ (опционально)
    const webhookSecret = process.env.RETAILCRM_WEBHOOK_SECRET;
    if (webhookSecret) {
      const providedSecret = request.headers.get('X-Webhook-Secret');
      if (providedSecret !== webhookSecret) {
        return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
      }
    }

    const body = await request.json();
    console.log('RetailCRM webhook received:', JSON.stringify(body, null, 2));

    // Обработка изменений заказов
    if (body.orders) {
      for (const orderData of body.orders) {
        await processOrderUpdate(orderData);
      }
    }

    // Обработка изменений клиентов
    if (body.customers) {
      for (const customerData of body.customers) {
        await processCustomerUpdate(customerData);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function processOrderUpdate(orderData: {
  externalId?: string;
  id?: number;
  status?: string;
  managerComment?: string;
  delivery?: {
    date?: string;
    time?: { from?: string; to?: string };
  };
}) {
  const orderId = orderData.externalId;
  if (!orderId) {
    console.warn('Order update without externalId:', orderData);
    return;
  }

  // Маппим статус из RetailCRM в наш формат
  const newStatus = orderData.status ? STATUS_MAP_FROM_CRM[orderData.status] : undefined;

  const updateData: Record<string, unknown> = {};

  if (newStatus) {
    updateData.status = newStatus;
  }

  if (orderData.managerComment) {
    updateData.admin_comment = orderData.managerComment;
  }

  if (orderData.delivery?.date) {
    updateData.delivery_date = orderData.delivery.date;
  }

  if (orderData.delivery?.time) {
    const timeSlot = `${orderData.delivery.time.from || ''} - ${orderData.delivery.time.to || ''}`.trim();
    if (timeSlot && timeSlot !== ' - ') {
      updateData.delivery_time_slot = timeSlot;
    }
  }

  if (Object.keys(updateData).length > 0) {
    updateData.updated_at = new Date().toISOString();
    updateData.retailcrm_synced_at = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('Failed to update order:', error);
    } else {
      console.log(`Order ${orderId} updated with:`, updateData);
    }
  }
}

async function processCustomerUpdate(customerData: {
  externalId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phones?: { number: string }[];
}) {
  const customerId = customerData.externalId;
  if (!customerId) {
    console.warn('Customer update without externalId:', customerData);
    return;
  }

  const updateData: Record<string, unknown> = {};

  if (customerData.firstName || customerData.lastName) {
    updateData.name = [customerData.firstName, customerData.lastName].filter(Boolean).join(' ');
  }

  if (customerData.email) {
    updateData.email = customerData.email;
  }

  if (Object.keys(updateData).length > 0) {
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', customerId);

    if (error) {
      console.error('Failed to update customer:', error);
    } else {
      console.log(`Customer ${customerId} updated with:`, updateData);
    }
  }
}

// GET запрос для проверки работоспособности webhook
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'RetailCRM webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
