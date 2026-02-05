'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Package,
  Gift,
  LogOut,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Loader2,
  History,
  Plus,
  Minus,
  Flower2,
  Home,
  Heart,
  Settings,
  ChevronRight,
  CreditCard,
  Calendar,
  MapPin,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  delivery_date?: string;
  delivery_address?: string;
  items?: { name: string; quantity: number; price: number }[];
}

interface BonusTransaction {
  id: string;
  type: 'accrual' | 'usage' | 'expired' | 'adjustment';
  amount: number;
  description?: string;
  created_at: string;
  balance_after?: number;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  pending: { label: 'Ожидает', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', icon: Clock },
  confirmed: { label: 'Подтверждён', color: 'text-blue-400', bgColor: 'bg-blue-500/10', icon: CheckCircle },
  preparing: { label: 'Готовится', color: 'text-purple-400', bgColor: 'bg-purple-500/10', icon: Package },
  delivering: { label: 'Доставляется', color: 'text-orange-400', bgColor: 'bg-orange-500/10', icon: Truck },
  completed: { label: 'Выполнен', color: 'text-green-400', bgColor: 'bg-green-500/10', icon: CheckCircle },
  cancelled: { label: 'Отменён', color: 'text-red-400', bgColor: 'bg-red-500/10', icon: XCircle },
};

type TabType = 'orders' | 'bonuses' | 'favorites' | 'settings';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, favorites } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bonusHistory, setBonusHistory] = useState<BonusTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('orders');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', user.phone)
      .order('created_at', { ascending: false })
      .limit(20);

    if (ordersData) {
      setOrders(ordersData);
    }

    const { data: bonusData } = await supabase
      .from('bonus_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (bonusData) {
      setBonusHistory(bonusData);
    }

    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const menuItems = [
    { id: 'orders' as TabType, name: 'Мои заказы', icon: Package, count: orders.length },
    { id: 'bonuses' as TabType, name: 'Бонусы', icon: Gift },
    { id: 'favorites' as TabType, name: 'Избранное', icon: Heart, count: favorites.length },
    { id: 'settings' as TabType, name: 'Настройки', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="fixed left-0 top-14 z-30 h-[calc(100vh-56px)] w-64 bg-[#1d2327] text-[#c3c4c7] overflow-y-auto">
        {/* User Info */}
        <div className="p-4 border-b border-[#2c3338]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">
                {user.full_name || 'Пользователь'}
              </p>
              <p className="text-sm text-[#c3c4c7] truncate flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {user.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Bonus Card */}
        <div className="p-4 border-b border-[#2c3338]">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm">Баланс бонусов</span>
              <Gift className="w-5 h-5 text-white/60" />
            </div>
            <p className="text-2xl font-bold">{user.bonus_balance || 0} ₽</p>
            <p className="text-xs text-white/60 mt-1">1 бонус = 1 рубль</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between rounded px-3 py-2.5 text-sm transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-[#2c3338] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      activeTab === item.id ? 'bg-white/20' : 'bg-[#2c3338]'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick Links */}
        <div className="p-4 mt-4 border-t border-[#2c3338]">
          <p className="text-xs uppercase tracking-wider text-[#8c8f94] mb-3">Быстрые ссылки</p>
          <div className="space-y-1">
            <Link
              href="/catalog"
              className="flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-[#2c3338] hover:text-white transition-colors"
            >
              <Package size={16} />
              Каталог
            </Link>
            <Link
              href="/bouquet-builder"
              className="flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-[#2c3338] hover:text-white transition-colors"
            >
              <Flower2 size={16} />
              Конструктор
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-[#2c3338] hover:text-white transition-colors"
            >
              <Home size={16} />
              На главную
            </Link>
          </div>
        </div>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2c3338]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Выйти из аккаунта
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-[calc(100vh-56px)]">
        {/* Header */}
        <div className="bg-white border-b border-primary/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-serif italic text-primary">
                {activeTab === 'orders' && 'Мои заказы'}
                {activeTab === 'bonuses' && 'История бонусов'}
                {activeTab === 'favorites' && 'Избранное'}
                {activeTab === 'settings' && 'Настройки профиля'}
              </h1>
              <p className="text-sm text-primary/60 mt-1">
                {activeTab === 'orders' && `Всего заказов: ${orders.length}`}
                {activeTab === 'bonuses' && `Транзакций: ${bonusHistory.length}`}
                {activeTab === 'favorites' && `Товаров: ${favorites.length}`}
                {activeTab === 'settings' && 'Управление профилем'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-primary/10">
                      <Package className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                      <h3 className="text-lg font-serif italic text-primary">Заказов пока нет</h3>
                      <p className="text-primary/60 mt-2 mb-6">Самое время порадовать себя красивым букетом!</p>
                      <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-cream rounded-full hover:opacity-90 transition"
                      >
                        Перейти в каталог
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {orders.map((order) => {
                        const status = statusConfig[order.status] || statusConfig.pending;
                        const StatusIcon = status.icon;

                        return (
                          <div key={order.id} className="bg-white rounded-xl border border-primary/10 overflow-hidden">
                            <div className="flex items-center justify-between p-4 bg-primary/5">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${status.bgColor}`}>
                                  <StatusIcon className={`w-5 h-5 ${status.color}`} />
                                </div>
                                <div>
                                  <p className="font-medium text-primary">Заказ #{order.order_number}</p>
                                  <p className="text-sm text-primary/60 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(order.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                                  </p>
                                </div>
                              </div>
                              <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                                {status.label}
                              </div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div>
                                  <p className="text-xs text-primary/50 uppercase tracking-wider">Сумма</p>
                                  <p className="text-lg font-bold text-primary">{order.total.toLocaleString()} ₽</p>
                                </div>
                                {order.delivery_date && (
                                  <div>
                                    <p className="text-xs text-primary/50 uppercase tracking-wider">Доставка</p>
                                    <p className="text-sm text-primary flex items-center gap-1">
                                      <Truck className="w-4 h-4" />
                                      {format(new Date(order.delivery_date), 'd MMMM', { locale: ru })}
                                    </p>
                                  </div>
                                )}
                                {order.delivery_address && (
                                  <div>
                                    <p className="text-xs text-primary/50 uppercase tracking-wider">Адрес</p>
                                    <p className="text-sm text-primary flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {order.delivery_address.length > 30
                                        ? order.delivery_address.substring(0, 30) + '...'
                                        : order.delivery_address}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Bonuses Tab */}
              {activeTab === 'bonuses' && (
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-primary/50 uppercase tracking-wider">Текущий баланс</p>
                          <p className="text-xl font-bold text-primary">{user.bonus_balance || 0} ₽</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Plus className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-primary/50 uppercase tracking-wider">Всего начислено</p>
                          <p className="text-xl font-bold text-green-600">
                            +{bonusHistory
                              .filter(t => t.type === 'accrual' || (t.type === 'adjustment' && t.amount > 0))
                              .reduce((sum, t) => sum + Math.abs(t.amount), 0)} ₽
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Minus className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs text-primary/50 uppercase tracking-wider">Всего списано</p>
                          <p className="text-xl font-bold text-red-600">
                            -{bonusHistory
                              .filter(t => t.type === 'usage' || t.type === 'expired')
                              .reduce((sum, t) => sum + Math.abs(t.amount), 0)} ₽
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* History */}
                  {bonusHistory.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-primary/10">
                      <Gift className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                      <h3 className="text-lg font-serif italic text-primary">История пуста</h3>
                      <p className="text-primary/60 mt-2">Совершайте покупки и получайте бонусы!</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
                      <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
                        <h3 className="font-medium text-primary">История операций</h3>
                      </div>
                      <div className="divide-y divide-primary/10">
                        {bonusHistory.map((tx) => {
                          const isPositive = tx.type === 'accrual' || (tx.type === 'adjustment' && tx.amount > 0);

                          return (
                            <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-primary/5 transition">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                  {isPositive ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                                </div>
                                <div>
                                  <p className="font-medium text-primary">
                                    {tx.description || (isPositive ? 'Начисление бонусов' : 'Списание бонусов')}
                                  </p>
                                  <p className="text-sm text-primary/60">
                                    {format(new Date(tx.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                  {isPositive ? '+' : ''}{tx.amount} ₽
                                </p>
                                {tx.balance_after !== undefined && (
                                  <p className="text-xs text-primary/50">Баланс: {tx.balance_after} ₽</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div>
                  {favorites.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-primary/10">
                      <Heart className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                      <h3 className="text-lg font-serif italic text-primary">Список избранного пуст</h3>
                      <p className="text-primary/60 mt-2 mb-6">Добавляйте понравившиеся букеты, нажимая на сердечко</p>
                      <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-cream rounded-full hover:opacity-90 transition"
                      >
                        Перейти в каталог
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 border border-primary/10">
                      <p className="text-primary/60 mb-4">У вас {favorites.length} товаров в избранном</p>
                      <Link
                        href="/favorites"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-cream rounded-full hover:opacity-90 transition"
                      >
                        Открыть избранное
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
                    <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
                      <h3 className="font-medium text-primary">Личные данные</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-primary/50 uppercase tracking-wider mb-1">Имя</label>
                          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                            <User className="w-4 h-4 text-primary/50" />
                            <span className="text-primary">{user.full_name || 'Не указано'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-primary/50 uppercase tracking-wider mb-1">Телефон</label>
                          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                            <Phone className="w-4 h-4 text-primary/50" />
                            <span className="text-primary">{user.phone}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-primary/50 uppercase tracking-wider mb-1">Email</label>
                          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                            <Mail className="w-4 h-4 text-primary/50" />
                            <span className="text-primary">{user.email || 'Не указан'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-primary/50 uppercase tracking-wider mb-1">Бонусная карта</label>
                          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                            <CreditCard className="w-4 h-4 text-primary/50" />
                            <span className="text-primary">{user.bonus_card || 'Не привязана'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
                    <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
                      <h3 className="font-medium text-primary">Статистика</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-primary/5 rounded-lg">
                          <p className="text-2xl font-bold text-primary">{orders.length}</p>
                          <p className="text-xs text-primary/60 mt-1">Заказов</p>
                        </div>
                        <div className="text-center p-4 bg-primary/5 rounded-lg">
                          <p className="text-2xl font-bold text-primary">{user.bonus_balance || 0}</p>
                          <p className="text-xs text-primary/60 mt-1">Бонусов</p>
                        </div>
                        <div className="text-center p-4 bg-primary/5 rounded-lg">
                          <p className="text-2xl font-bold text-primary">{favorites.length}</p>
                          <p className="text-xs text-primary/60 mt-1">В избранном</p>
                        </div>
                        <div className="text-center p-4 bg-primary/5 rounded-lg">
                          <p className="text-2xl font-bold text-primary">
                            {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-primary/60 mt-1">₽ потрачено</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                    <h3 className="font-medium text-red-700 mb-2">Опасная зона</h3>
                    <p className="text-sm text-red-600 mb-4">Выход из аккаунта завершит текущую сессию</p>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Выйти из аккаунта
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
