'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Heart, Settings, Users, BookOpen, FileText, BarChart3 } from 'lucide-react';

const studentNav = [
  { href: '/student', label: 'نظرة عامة', icon: LayoutDashboard },
  { href: '/student/favorites', label: 'المفضلة', icon: Heart },
  { href: '/chat', label: 'الرسائل', icon: MessageSquare },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

const teacherNav = [
  { href: '/teacher', label: 'نظرة عامة', icon: LayoutDashboard },
  { href: '/teacher/profile', label: 'ملفي الشخصي', icon: FileText },
  { href: '/teacher/requests', label: 'الطلبات', icon: Users },
  { href: '/chat', label: 'الرسائل', icon: MessageSquare },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

const adminNav = [
  { href: '/admin', label: 'لوحة التحكم', icon: BarChart3 },
  { href: '/admin/users', label: 'المستخدمون', icon: Users },
  { href: '/admin/subjects', label: 'المواد', icon: BookOpen },
  { href: '/admin/reports', label: 'البلاغات', icon: FileText },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center">جار التحميل...</div>;

  const nav = user.role === 'TEACHER' ? teacherNav : user.role === 'ADMIN' ? adminNav : studentNav;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-l bg-white p-4">
        <Link href="/" className="mb-6 block text-xl font-bold text-primary-600">أستادي</Link>
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
