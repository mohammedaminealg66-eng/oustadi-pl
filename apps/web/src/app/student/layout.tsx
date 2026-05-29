'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Heart, Settings, Users, Menu, X } from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'STUDENT') router.replace('/' + user.role.toLowerCase());
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center text-gray-500">{t('common.loading')}</div>;

  const nav = [
    { href: '/student', label: t('dashboard.overview'), icon: LayoutDashboard },
    { href: '/student/requests', label: t('dashboard.myRequests'), icon: Users },
    { href: '/student/favorites', label: t('dashboard.favorites'), icon: Heart },
    { href: '/student/chat', label: t('dashboard.messages'), icon: MessageSquare },
    { href: '/student/settings', label: t('dashboard.settings'), icon: Settings },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed bottom-4 left-4 z-50 rounded-full bg-primary-600 p-3 text-white shadow-lg lg:hidden" aria-label="Toggle menu">
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-l bg-white p-4 transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Link href="/" className="mb-6 block text-lg font-bold text-primary-600">أستادي</Link>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">{children}</main>
    </div>
  );
}
