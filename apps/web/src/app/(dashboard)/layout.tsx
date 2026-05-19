'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Heart, Settings, Users, BookOpen, FileText, BarChart3 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (pathname.startsWith('/student') && user.role !== 'STUDENT') router.replace('/' + user.role.toLowerCase());
    else if (pathname.startsWith('/teacher') && user.role !== 'TEACHER') router.replace('/' + user.role.toLowerCase());
    else if (pathname.startsWith('/admin') && user.role !== 'ADMIN') router.replace('/' + user.role.toLowerCase());
  }, [user, loading, router, pathname]);

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center text-gray-500">{t('common.loading')}</div>;

  const studentNav = [
    { href: '/student', label: t('dashboard.overview'), icon: LayoutDashboard },
    { href: '/student/favorites', label: t('dashboard.favorites'), icon: Heart },
    { href: '/chat', label: t('dashboard.messages'), icon: MessageSquare },
    { href: '/settings', label: t('dashboard.settings'), icon: Settings },
  ];

  const teacherNav = [
    { href: '/teacher', label: t('dashboard.overview'), icon: LayoutDashboard },
    { href: '/teacher/profile', label: t('dashboard.myProfile'), icon: FileText },
    { href: '/teacher/requests', label: t('dashboard.requests'), icon: Users },
    { href: '/chat', label: t('dashboard.messages'), icon: MessageSquare },
    { href: '/settings', label: t('dashboard.settings'), icon: Settings },
  ];

  const adminNav = [
    { href: '/admin', label: t('admin.dashboard'), icon: BarChart3 },
    { href: '/admin/users', label: t('admin.users'), icon: Users },
    { href: '/admin/teachers', label: t('admin.manageTeachers'), icon: FileText },
    { href: '/admin/subjects', label: t('admin.subjects'), icon: BookOpen },
    { href: '/admin/documents', label: t('admin.documents'), icon: FileText },
    { href: '/admin/reports', label: t('admin.reports'), icon: FileText },
    { href: '/settings', label: t('dashboard.settings'), icon: Settings },
  ];

  const nav = user.role === 'TEACHER' ? teacherNav : user.role === 'ADMIN' ? adminNav : studentNav;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-l bg-white p-4">
        <Link href="/" className="mb-6 block text-xl font-bold text-primary-600">{t('common.appName')}</Link>
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
