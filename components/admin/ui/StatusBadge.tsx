'use client';

type StatusVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default'
  | 'primary';

interface StatusBadgeProps {
  variant?: StatusVariant;
  children: React.ReactNode;
  dot?: boolean;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-primary-100 text-primary-800',
};

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  default: 'bg-gray-500',
  primary: 'bg-primary-500',
};

export default function StatusBadge({
  variant = 'default',
  children,
  dot = false,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} />
      )}
      {children}
    </span>
  );
}

// Предустановленные статусы для заказов
export const orderStatusConfig: Record<string, { label: string; variant: StatusVariant }> = {
  new: { label: 'Новый', variant: 'info' },
  pending: { label: 'Ожидает', variant: 'warning' },
  confirmed: { label: 'Подтверждён', variant: 'primary' },
  preparing: { label: 'Готовится', variant: 'warning' },
  delivering: { label: 'Доставляется', variant: 'info' },
  completed: { label: 'Выполнен', variant: 'success' },
  cancelled: { label: 'Отменён', variant: 'error' },
};

// Предустановленные статусы для документов
export const documentStatusConfig: Record<string, { label: string; variant: StatusVariant }> = {
  draft: { label: 'Черновик', variant: 'default' },
  confirmed: { label: 'Проведён', variant: 'success' },
  cancelled: { label: 'Отменён', variant: 'error' },
};

// Хелпер для отображения статуса заказа
export function OrderStatusBadge({ status }: { status: string }) {
  const config = orderStatusConfig[status] || { label: status, variant: 'default' as StatusVariant };
  return (
    <StatusBadge variant={config.variant} dot>
      {config.label}
    </StatusBadge>
  );
}

// Хелпер для отображения статуса документа
export function DocumentStatusBadge({ status }: { status: string }) {
  const config = documentStatusConfig[status] || { label: status, variant: 'default' as StatusVariant };
  return (
    <StatusBadge variant={config.variant} dot>
      {config.label}
    </StatusBadge>
  );
}
