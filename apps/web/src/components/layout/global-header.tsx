'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { apiRequest } from '@/lib/api';
import { Button } from '@oustadi/ui';
import { Bell, LogOut, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'fr', label: 'FR', name: 'Français' },
];

function switchLocale(code: string) {
  document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.lang = code;
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
}

export function GlobalHeader() {
  const t = useTranslations();
  const { user, logout, isAuthenticated } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const currentLang = languages.find((l) => l.code === (typeof window !== 'undefined' ? document.documentElement.lang : 'ar')) || languages[0];

  function fetchNotifications() {
    if (!isAuthenticated) return;
    apiRequest('/notifications').then((res) => {
      if (res.success && res.data) setNotifications(res.data);
    });
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    window.addEventListener('refresh-notifications', fetchNotifications);
    return () => { clearInterval(interval); window.removeEventListener('refresh-notifications', fetchNotifications); };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!profileOpen && !langOpen && !notifOpen) return;
    const handler = () => { setLangOpen(false); setNotifOpen(false); setProfileOpen(false); };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [profileOpen, langOpen, notifOpen]);

  async function markAllRead() {
    await apiRequest('/notifications/read-all', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative h-8 w-8 overflow-hidden">
            <Image src="/logo.png" alt="Oustadi" width={32} height={32} className="h-full w-full object-contain" priority />
          </div>
          <span className="hidden sm:inline text-lg font-bold text-primary-600">أستادي</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/teachers" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
            {t('common.teachers')}
          </Link>
          {isAuthenticated && (
            <Link href={user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/student'} className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              {t('dashboard.overview')}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }} className="text-xs text-gray-600 hover:text-primary-600 px-2 py-1 rounded border min-w-[2.2rem]">{currentLang.label}</button>
            {langOpen && (
              <div className="absolute left-0 mt-1 w-24 rounded border bg-white shadow-lg z-50">
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => { setLangOpen(false); switchLocale(lang.code); window.location.reload(); }} className="block w-full px-3 py-1.5 text-sm text-right text-gray-700 hover:bg-gray-100">{lang.name}</button>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); }} className="relative p-1.5 text-gray-500 hover:text-primary-600 transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-medium">{unreadCount > 9 ? '9+' : unreadCount}</span>
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

              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }} className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.email}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>
                {profileOpen && (
                  <div className="absolute left-0 mt-1 w-44 rounded-lg border bg-white shadow-lg z-50">
                    <div className="border-b px-3 py-2 text-xs text-gray-500 truncate">{user?.email}</div>
                    <Link href={user?.role === 'TEACHER' ? '/teacher/settings' : user?.role === 'ADMIN' ? '/admin/settings' : '/student/settings'} onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      {t('dashboard.settings')}
                    </Link>
                    <button onClick={() => { setProfileOpen(false); logout(); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm">{t('common.login')}</Button></Link>
              <Link href="/register"><Button size="sm">{t('common.register')}</Button></Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
