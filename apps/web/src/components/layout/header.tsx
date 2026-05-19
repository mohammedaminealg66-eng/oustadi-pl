'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { apiRequest } from '@/lib/api';
import { Button } from '@oustadi/ui';
import { Bell } from 'lucide-react';

const languages = [
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'fr', label: 'FR', name: 'Français' },
];

function switchLocale(code: string) {
  document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.lang = code;
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
}

export function Header() {
  const t = useTranslations();
  const { user, logout, isAuthenticated } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const currentLang = languages.find((l) => l.code === (typeof window !== 'undefined' ? document.documentElement.lang : 'ar')) || languages[0];

  useEffect(() => {
    if (!isAuthenticated) return;
    apiRequest('/notifications').then((res) => {
      if (res.success && res.data) setNotifications(res.data);
    });
  }, [isAuthenticated]);

  async function markAllRead() {
    await apiRequest('/notifications/read-all', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary-600">
          {t('common.appName')}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/teachers" className="text-sm font-medium text-gray-600 hover:text-primary-600">
            {t('common.teachers')}
          </Link>
          {isAuthenticated && (
            <Link href={user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/student'} className="text-sm font-medium text-gray-600 hover:text-primary-600">
              {t('dashboard.overview')}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="text-sm text-gray-600 hover:text-primary-600 px-2 py-1 rounded border min-w-[2.5rem]">{currentLang.label}</button>
            {langOpen && (
              <div className="absolute left-0 mt-1 w-24 rounded border bg-white shadow-lg z-50">
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => { setLangOpen(false); switchLocale(lang.code); window.location.reload(); }} className="block w-full px-3 py-1 text-sm text-right text-gray-700 hover:bg-gray-100">{lang.name}</button>
                ))}
              </div>
            )}
          </div>
          {isAuthenticated && (
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-1 text-gray-500 hover:text-primary-600">
                <Bell className="h-5 w-5" />
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">{notifications.filter((n) => !n.isRead).length}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-lg border bg-white shadow-lg z-50">
                  <div className="flex items-center justify-between border-b px-4 py-2">
                    <span className="text-sm font-semibold text-gray-900">{t('common.notifications')}</span>
                    <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">{t('common.markAllRead')}</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-sm text-gray-400">{t('common.noNotifications')}</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <Link key={n.id} href={n.link || '#'} onClick={() => setNotifOpen(false)} className={`block border-b px-4 py-3 text-sm transition ${n.isRead ? 'bg-white' : 'bg-primary-50'}`}>
                          <p className="font-medium text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500">{n.body}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {isAuthenticated ? (
            <>
              <Link href="/settings">
                <Button variant="ghost" size="sm">{user?.email}</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>{t('common.logout')}</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">{t('common.login')}</Button></Link>
              <Link href="/register"><Button size="sm">{t('common.register')}</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
