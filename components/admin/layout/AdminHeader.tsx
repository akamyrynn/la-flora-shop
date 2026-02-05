'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

interface AdminHeaderProps {
  sidebarCollapsed: boolean;
}

export default function AdminHeader({ sidebarCollapsed }: AdminHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'Новый заказ #12345', time: '5 мин назад', unread: true },
    { id: 2, text: 'Товар "Розы красные" заканчивается', time: '1 час назад', unread: true },
    { id: 3, text: 'Заказ #12340 доставлен', time: '3 часа назад', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={`fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-60'
      }`}
    >
      {/* Left side - Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск заказов, товаров, клиентов..."
            className="w-80 rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
          <RefreshCw size={18} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 px-4 py-3">
                <h3 className="font-medium">Уведомления</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-gray-50 px-4 py-3 hover:bg-gray-50 ${
                      notification.unread ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <p className="text-sm">{notification.text}</p>
                    <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 px-4 py-2">
                <Link
                  href="/admin/notifications"
                  className="text-sm text-primary hover:underline"
                >
                  Все уведомления
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <User size={16} />
            </div>
            <span className="text-sm font-medium">Админ</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="font-medium">Администратор</p>
                <p className="text-sm text-gray-500">admin@laflora.ru</p>
              </div>
              <div className="py-1">
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Настройки
                </Link>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                  <LogOut size={16} />
                  Выйти
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for closing menus */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
}
