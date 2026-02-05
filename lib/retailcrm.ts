/**
 * RetailCRM API Integration
 * Документация: https://docs.retailcrm.ru/Developers/API
 */

const RETAILCRM_URL = process.env.RETAILCRM_URL || '';
const RETAILCRM_API_KEY = process.env.RETAILCRM_API_KEY || '';

interface RetailCRMConfig {
  url: string;
  apiKey: string;
}

// Типы для RetailCRM
export interface RetailCRMCustomer {
  externalId?: string;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  email?: string;
  phones?: { number: string }[];
  address?: {
    text?: string;
    city?: string;
    street?: string;
    building?: string;
    flat?: string;
  };
  customFields?: Record<string, unknown>;
}

export interface RetailCRMOrderItem {
  offer?: {
    externalId?: string;
    name?: string;
  };
  productName?: string;
  initialPrice: number;
  quantity: number;
  properties?: { name: string; value: string }[];
}

export interface RetailCRMOrder {
  externalId?: string;
  number?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  customerComment?: string;
  managerComment?: string;
  status?: string;
  delivery?: {
    code?: string;
    date?: string;
    time?: {
      from?: string;
      to?: string;
    };
    address?: {
      text?: string;
      city?: string;
      street?: string;
      building?: string;
      flat?: string;
    };
    cost?: number;
  };
  items: RetailCRMOrderItem[];
  payments?: {
    type: string;
    amount: number;
    status?: string;
  }[];
  customFields?: Record<string, unknown>;
}

export interface RetailCRMResponse<T = unknown> {
  success: boolean;
  errorMsg?: string;
  errors?: Record<string, string>;
  [key: string]: T | boolean | string | Record<string, string> | undefined;
}

class RetailCRMClient {
  private url: string;
  private apiKey: string;

  constructor(config?: RetailCRMConfig) {
    this.url = config?.url || RETAILCRM_URL;
    this.apiKey = config?.apiKey || RETAILCRM_API_KEY;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: Record<string, unknown>
  ): Promise<RetailCRMResponse<T>> {
    if (!this.url || !this.apiKey) {
      console.warn('RetailCRM not configured');
      return { success: false, errorMsg: 'RetailCRM not configured' };
    }

    const url = new URL(`/api/v5/${endpoint}`, this.url);

    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    let body: string | undefined;

    if (method === 'GET') {
      url.searchParams.set('apiKey', this.apiKey);
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          url.searchParams.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
      }
    } else {
      const formData = new URLSearchParams();
      formData.set('apiKey', this.apiKey);
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          formData.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
      }
      body = formData.toString();
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body,
      });

      const result = await response.json();
      return result as RetailCRMResponse<T>;
    } catch (error) {
      console.error('RetailCRM API error:', error);
      return {
        success: false,
        errorMsg: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ===== ЗАКАЗЫ =====

  /**
   * Создать заказ в RetailCRM
   */
  async createOrder(order: RetailCRMOrder, site?: string): Promise<RetailCRMResponse<{ id: number }>> {
    return this.request('orders/create', 'POST', {
      order: JSON.stringify(order),
      site,
    });
  }

  /**
   * Обновить заказ в RetailCRM
   */
  async updateOrder(
    id: string,
    order: Partial<RetailCRMOrder>,
    by: 'id' | 'externalId' = 'externalId',
    site?: string
  ): Promise<RetailCRMResponse> {
    return this.request(`orders/${id}/edit`, 'POST', {
      order: JSON.stringify(order),
      by,
      site,
    });
  }

  /**
   * Получить заказ из RetailCRM
   */
  async getOrder(
    id: string,
    by: 'id' | 'externalId' = 'externalId',
    site?: string
  ): Promise<RetailCRMResponse<{ order: RetailCRMOrder }>> {
    return this.request(`orders/${id}`, 'GET', { by, site });
  }

  /**
   * Получить историю изменений заказов
   */
  async getOrdersHistory(
    filter?: {
      sinceId?: number;
      startDate?: string;
      endDate?: string;
    },
    limit = 100
  ): Promise<RetailCRMResponse<{ history: unknown[]; pagination: { totalCount: number } }>> {
    return this.request('orders/history', 'GET', {
      ...filter,
      limit,
    });
  }

  // ===== КЛИЕНТЫ =====

  /**
   * Создать клиента в RetailCRM
   */
  async createCustomer(
    customer: RetailCRMCustomer,
    site?: string
  ): Promise<RetailCRMResponse<{ id: number }>> {
    return this.request('customers/create', 'POST', {
      customer: JSON.stringify(customer),
      site,
    });
  }

  /**
   * Обновить клиента в RetailCRM
   */
  async updateCustomer(
    id: string,
    customer: Partial<RetailCRMCustomer>,
    by: 'id' | 'externalId' = 'externalId',
    site?: string
  ): Promise<RetailCRMResponse> {
    return this.request(`customers/${id}/edit`, 'POST', {
      customer: JSON.stringify(customer),
      by,
      site,
    });
  }

  /**
   * Получить клиента из RetailCRM
   */
  async getCustomer(
    id: string,
    by: 'id' | 'externalId' = 'externalId',
    site?: string
  ): Promise<RetailCRMResponse<{ customer: RetailCRMCustomer }>> {
    return this.request(`customers/${id}`, 'GET', { by, site });
  }

  /**
   * Найти клиента по телефону
   */
  async findCustomerByPhone(phone: string): Promise<RetailCRMResponse<{ customers: RetailCRMCustomer[] }>> {
    return this.request('customers', 'GET', {
      filter: JSON.stringify({ phone }),
    });
  }

  // ===== СПРАВОЧНИКИ =====

  /**
   * Получить список статусов заказов
   */
  async getOrderStatuses(): Promise<RetailCRMResponse<{ statuses: Record<string, unknown>[] }>> {
    return this.request('reference/statuses', 'GET');
  }

  /**
   * Получить типы доставки
   */
  async getDeliveryTypes(): Promise<RetailCRMResponse<{ deliveryTypes: Record<string, unknown>[] }>> {
    return this.request('reference/delivery-types', 'GET');
  }

  /**
   * Получить способы оплаты
   */
  async getPaymentTypes(): Promise<RetailCRMResponse<{ paymentTypes: Record<string, unknown>[] }>> {
    return this.request('reference/payment-types', 'GET');
  }
}

// Singleton instance
export const retailCRM = new RetailCRMClient();

// ===== МАППИНГ СТАТУСОВ =====

// Маппинг статусов из Supabase в RetailCRM
export const STATUS_MAP_TO_CRM: Record<string, string> = {
  pending: 'new',
  confirmed: 'confirmed',
  preparing: 'assembling',
  delivering: 'delivering',
  completed: 'complete',
  cancelled: 'cancel-other',
};

// Маппинг статусов из RetailCRM в Supabase
export const STATUS_MAP_FROM_CRM: Record<string, string> = {
  new: 'pending',
  'client-confirmed': 'confirmed',
  confirmed: 'confirmed',
  assembling: 'preparing',
  'send-to-delivery': 'delivering',
  delivering: 'delivering',
  complete: 'completed',
  'cancel-other': 'cancelled',
  'no-call': 'cancelled',
  'no-product': 'cancelled',
};

// ===== ХЕЛПЕРЫ КОНВЕРТАЦИИ =====

/**
 * Конвертировать заказ из Supabase в формат RetailCRM
 */
export function convertOrderToRetailCRM(
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    delivery_address?: string;
    delivery_date?: string;
    delivery_time_slot?: string;
    comment?: string;
    status: string;
    total: number;
    delivery_cost?: number;
    items?: {
      product_name: string;
      product_id: string;
      quantity: number;
      price: number;
    }[];
    payment_method?: string;
    bonus_used?: number;
  }
): RetailCRMOrder {
  // Разбираем имя на части
  const nameParts = order.customer_name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Разбираем временной слот
  let timeFrom: string | undefined;
  let timeTo: string | undefined;
  if (order.delivery_time_slot) {
    const timeMatch = order.delivery_time_slot.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (timeMatch) {
      timeFrom = timeMatch[1];
      timeTo = timeMatch[2];
    }
  }

  return {
    externalId: order.id,
    number: order.order_number,
    firstName,
    lastName,
    phone: order.customer_phone,
    email: order.customer_email,
    customerComment: order.comment,
    status: STATUS_MAP_TO_CRM[order.status] || 'new',
    delivery: {
      code: 'courier', // или другой код доставки
      date: order.delivery_date,
      time: timeFrom && timeTo ? { from: timeFrom, to: timeTo } : undefined,
      address: {
        text: order.delivery_address,
      },
      cost: order.delivery_cost || 0,
    },
    items: (order.items || []).map((item) => ({
      offer: {
        externalId: item.product_id,
        name: item.product_name,
      },
      productName: item.product_name,
      initialPrice: item.price,
      quantity: item.quantity,
    })),
    payments: [
      {
        type: order.payment_method === 'card' ? 'bank-card' : 'cash',
        amount: order.total - (order.bonus_used || 0),
        status: 'not-paid',
      },
    ],
    customFields: order.bonus_used
      ? {
          bonus_used: order.bonus_used,
        }
      : undefined,
  };
}

/**
 * Конвертировать клиента из Supabase в формат RetailCRM
 */
export function convertCustomerToRetailCRM(profile: {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  bonus_balance?: number;
}): RetailCRMCustomer {
  const nameParts = (profile.name || '').split(' ');

  return {
    externalId: profile.id,
    firstName: nameParts[0] || undefined,
    lastName: nameParts.slice(1).join(' ') || undefined,
    email: profile.email,
    phones: [{ number: profile.phone }],
    customFields: {
      bonus_balance: profile.bonus_balance || 0,
    },
  };
}

export default retailCRM;
