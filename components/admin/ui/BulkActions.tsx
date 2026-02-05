'use client';

import { X, type LucideIcon } from 'lucide-react';

export interface BulkAction {
  key: string;
  label: string;
  icon?: LucideIcon;
  variant?: 'default' | 'danger';
  onClick: () => void;
}

interface BulkActionsProps {
  selectedCount: number;
  actions: BulkAction[];
  onClearSelection: () => void;
}

export default function BulkActions({
  selectedCount,
  actions,
  onClearSelection,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-lg bg-primary-50 px-4 py-3">
      <div className="flex items-center gap-4">
        <button
          onClick={onClearSelection}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
          <span>Снять выделение</span>
        </button>
        <span className="text-sm font-medium text-primary">
          Выбрано: {selectedCount}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={action.onClick}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              action.variant === 'danger'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
