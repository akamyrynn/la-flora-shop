'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminHeader from '@/components/admin/layout/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <AdminHeader sidebarCollapsed={sidebarCollapsed} />
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
