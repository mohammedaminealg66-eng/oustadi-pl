'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Settings, Users, FileText } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'TEACHER') router.replace('/' + user.role.toLowerCase());
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center text-gray-500">{t('common.loading')}</div>;

  const nav = [
    { href: '/teacher', label: t('dashboard.overview'), icon: LayoutDashboard },
    { href: '/teacher/profile', label: t('dashboard.myProfile'), icon: FileText },
    { href: '/teacher/requests', label: t('dashboard.requests'), icon: Users },
    { href: '/teacher/chat', label: t('dashboard.messages'), icon: MessageSquare },
    { href: '/teacher/settings', label: t('dashboard.settings'), icon: Settings },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="w-64 border-l bg-white p-4">
        <Link href="/" className="mb-6 block text-lg font-bold text-primary-600">أستادي</Link>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">{children}</main>
    </div>
  );
}
