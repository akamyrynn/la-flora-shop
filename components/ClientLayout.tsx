'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import ScrollToTop from './ScrollToTop';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Header />}
      <main className={!isAdmin ? 'pt-14' : ''}>
        {children}
      </main>
    </>
  );
}
