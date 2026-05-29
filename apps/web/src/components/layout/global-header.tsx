'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { apiRequest } from '@/lib/api';
import { Button } from '@oustadi/ui';
import { Bell, LogOut, ChevronDown, Menu, X } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    if (!profileOpen && !langOpen && !notifOpen && !mobileMenuOpen) return;
    const handler = () => { setLangOpen(false); setNotifOpen(false); setProfileOpen(false); setMobileMenuOpen(false); };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [profileOpen, langOpen, notifOpen, mobileMenuOpen]);

  async function markAllRead() {
    await apiRequest('/notifications/read-all', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const dashboardHref = user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/student';

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="Oustadi" width={36} height={36} className="shrink-0" priority unoptimized />
            <span className="text-xl font-bold text-primary-600 tracking-tight whitespace-nowrap shrink-0">{t('common.appName')}</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/teachers" className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">
            {t('common.teachers')}
          </Link>
          {isAuthenticated && (
            <Link href={dashboardHref} className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">
              {t('dashboard.overview')}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }} className="text-xs font-bold text-gray-500 hover:text-primary-600 px-2.5 py-1 rounded-md border border-gray-200 transition-colors min-w-[2.5rem]">{currentLang.label}</button>
            {langOpen && (
              <div className="absolute left-0 mt-2 w-32 rounded-xl border bg-white shadow-xl z-50 overflow-hidden">
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => { setLangOpen(false); switchLocale(lang.code); window.location.reload(); }} className="block w-full px-4 py-2.5 text-sm text-right font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">{lang.name}</button>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); }} className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-bold ring-2 ring-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute left-0 mt-3 w-80 rounded-2xl border bg-white shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between border-b bg-gray-50/50 px-4 py-3">
                      <span className="text-sm font-bold text-gray-900">{t('common.notifications')}</span>
                      <button onClick={markAllRead} className="text-xs font-semibold text-primary-600 hover:text-primary-700">{t('common.markAllRead')}</button>
                    </div>
                    <div className="max-h-[24rem] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                          <Bell className="h-8 w-8 text-gray-200 mb-2" />
                          <p className="text-sm font-medium text-gray-400">{t('common.noNotifications')}</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <Link key={n.id} href={n.link || '#'} onClick={() => setNotifOpen(false)} className={`block border-b px-4 py-4 text-sm transition-colors hover:bg-gray-50 ${n.isRead ? 'bg-white' : 'bg-primary-50/50'}`}>
                            <p className="font-semibold text-gray-900 leading-snug">{n.title}</p>
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{n.body}</p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }} className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-200 transition-all">
                  <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-[10px]">
                    {user?.avatarKey ? <Image src={apiRequest(`/upload/avatar/${user.avatarKey}`)} alt="" width={28} height={28} className="rounded-full" /> : user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {profileOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-2xl border bg-white shadow-2xl z-50 overflow-hidden">
                    <div className="bg-gray-50/50 px-4 py-3 border-b">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link href={user?.role === 'TEACHER' ? '/teacher/settings' : user?.role === 'ADMIN' ? '/admin/settings' : '/student/settings'} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        {t('dashboard.settings')}
                      </Link>
                      <button onClick={() => { setProfileOpen(false); logout(); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-1">
                        <LogOut className="h-4 w-4" /> {t('common.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:block"><Button variant="ghost" size="sm" className="font-bold">{t('common.login')}</Button></Link>
              <Link href="/register"><Button size="sm" className="font-bold px-5">{t('common.register')}</Button></Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <nav className="fixed inset-y-0 right-0 w-[280px] bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <Image src="/logo.png" alt="Oustadi" width={32} height={32} unoptimized />
                <span className="font-bold text-primary-600 text-lg">{t('common.appName')}</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/teachers" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-base font-bold text-gray-700 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all border border-transparent active:border-primary-100">
                {t('common.teachers')}
              </Link>
              {isAuthenticated && (
                <Link href={dashboardHref} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-base font-bold text-gray-700 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all border border-transparent active:border-primary-100">
                  {t('dashboard.overview')}
                </Link>
              )}
            </div>

            <div className="mt-auto pt-6 border-t">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-bold h-12 rounded-xl">{t('common.login')}</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full font-bold h-12 rounded-xl">{t('common.register')}</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                      {user?.fullName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="flex w-full items-center justify-center gap-2 px-4 py-3 font-bold text-red-600 bg-red-50 rounded-xl active:bg-red-100 transition-colors">
                    <LogOut className="h-5 w-5" /> {t('common.logout')}
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
