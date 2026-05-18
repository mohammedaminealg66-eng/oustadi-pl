'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@oustadi/ui';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary-600">
          أستادي
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/teachers" className="text-sm font-medium text-gray-600 hover:text-primary-600">
            الأساتذة
          </Link>
          {isAuthenticated && (
            <Link href={user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/student'} className="text-sm font-medium text-gray-600 hover:text-primary-600">
              لوحة التحكم
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/settings">
                <Button variant="ghost" size="sm">{user?.email}</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>تسجيل الخروج</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">تسجيل الدخول</Button></Link>
              <Link href="/register"><Button size="sm">إنشاء حساب</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
