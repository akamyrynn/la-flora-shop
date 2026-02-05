'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  CreditCard,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Gift,
  Layers,
  FileDown,
  ClipboardList,
  PackagePlus,
  PackageMinus,
  ArrowLeftRight,
  Tag,
  ClipboardCheck,
  Receipt,
  Clock,
  Monitor,
  Home,
  Menu,
  X,
  Flower2,
  type LucideIcon,
} from 'lucide-react';

interface MenuItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  badge?: number;
  children?: { name: string; href: string; icon?: LucideIcon }[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Каталог',
    icon: Package,
    children: [
      { name: 'Букеты', href: '/admin/products', icon: Flower2 },
      { name: 'Поштучно', href: '/admin/flowers', icon: Flower2 },
      { name: 'Дополнения', href: '/admin/addons', icon: Gift },
      { name: 'Коллекции', href: '/admin/collections', icon: Layers },
      { name: 'Импорт/Экспорт', href: '/admin/import-export', icon: FileDown },
    ],
  },
  {
    name: 'Заказы',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Клиенты',
    href: '/admin/customers',
    icon: Users,
  },
  {
    name: 'Склад',
    icon: Warehouse,
    children: [
      { name: 'Остатки', href: '/admin/inventory', icon: ClipboardList },
      { name: 'Поступления', href: '/admin/inventory/receipts', icon: PackagePlus },
      { name: 'Списания', href: '/admin/inventory/writeoffs', icon: PackageMinus },
      { name: 'Перемещения', href: '/admin/inventory/transfers', icon: ArrowLeftRight },
      { name: 'Переоценка', href: '/admin/inventory/revaluation', icon: Tag },
      { name: 'Инвентаризация', href: '/admin/inventory/stocktaking', icon: ClipboardCheck },
    ],
  },
  {
    name: 'Касса',
    icon: CreditCard,
    children: [
      { name: 'Транзакции', href: '/admin/pos/transactions', icon: Receipt },
      { name: 'Смены', href: '/admin/pos/shifts', icon: Clock },
      { name: 'Терминалы', href: '/admin/pos/terminals', icon: Monitor },
    ],
  },
  {
    name: 'Конструктор',
    href: '/admin/constructor',
    icon: Flower2,
  },
  {
    name: 'Отчёты',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    name: 'Настройки',
    icon: Settings,
    children: [
      { name: 'Общие', href: '/admin/settings' },
      { name: 'Бонусы', href: '/admin/settings/bonus' },
      { name: 'Доставка', href: '/admin/settings/delivery' },
      { name: 'Точки продаж', href: '/admin/settings/stores' },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['Каталог', 'Склад']);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const isChildActive = (children?: { href: string }[]) => {
    return children?.some((child) => isActive(child.href));
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-[#1d2327] text-[#c3c4c7] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#2c3338] px-4">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
              <Flower2 size={18} />
            </div>
            <span className="font-semibold text-white">La Flora</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#2c3338]"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100vh-8rem)] overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors hover:bg-[#2c3338] hover:text-white ${
                      isChildActive(item.children) ? 'bg-[#2c3338] text-white' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && (
                      <span>
                        {openMenus.includes(item.name) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </span>
                    )}
                  </button>
                  {!collapsed && openMenus.includes(item.name) && (
                    <ul className="ml-4 mt-1 space-y-1 border-l border-[#3c434a] pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors hover:bg-[#2c3338] hover:text-white ${
                              isActive(child.href)
                                ? 'bg-primary text-white'
                                : ''
                            }`}
                          >
                            {child.icon && <child.icon size={14} />}
                            <span>{child.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-[#2c3338] hover:text-white ${
                    isActive(item.href!)
                      ? 'bg-primary text-white'
                      : ''
                  }`}
                >
                  <item.icon size={18} />
                  {!collapsed && <span>{item.name}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto rounded bg-red-500 px-2 py-0.5 text-xs text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-[#2c3338] p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-[#2c3338] hover:text-white"
        >
          <Home size={18} />
          {!collapsed && <span>На сайт</span>}
        </Link>
      </div>
    </aside>
  );
}
