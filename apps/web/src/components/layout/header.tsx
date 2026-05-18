'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@oustadi/ui';

const languages = [
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
];

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = languages.find((l) => l.code === (user?.language || 'ar')) || languages[0];

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
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="text-sm text-gray-600 hover:text-primary-600 px-2 py-1 rounded border min-w-[2.5rem]">{currentLang.label}</button>
            {langOpen && (
              <div className="absolute left-0 mt-1 w-24 rounded border bg-white shadow-lg z-50">
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => { setLangOpen(false); document.documentElement.lang = lang.code; document.documentElement.dir = lang.code === 'ar' ? 'rtl' : 'ltr'; }} className="block w-full px-3 py-1 text-sm text-right text-gray-700 hover:bg-gray-100">{lang.name}</button>
                ))}
              </div>
            )}
          </div>
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
