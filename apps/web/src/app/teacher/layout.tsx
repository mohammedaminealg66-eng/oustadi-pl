'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { 
  LayoutDashboard, MessageSquare, Settings, Users, 
  FileText, Menu, X, ChevronLeft, ChevronRight, 
  BookOpen, Calendar, HelpCircle, LifeBuoy, LogOut,
  Bell, Search, User
} from 'lucide-react';
import { Button, cn } from '@oustadi/ui';
import { getAvatarUrl } from '@/lib/asset';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'TEACHER') router.replace('/' + user.role.toLowerCase());
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
    </div>
  );

  const navGroups = [
    {
      title: t('dashboard.personal') || (locale === 'fr' ? 'Personnel' : 'الشخصي'),
      items: [
        { href: '/teacher', label: t('dashboard.overview'), icon: LayoutDashboard },
        { href: '/teacher/chat', label: t('dashboard.messages'), icon: MessageSquare, badge: 3 },
      ]
    },
    {
      title: t('dashboard.teaching') || (locale === 'fr' ? 'Enseignement' : 'التدريس'),
      items: [
        { href: '/teacher/requests', label: t('dashboard.requests'), icon: Users },
        { href: '/teacher/profile', label: t('dashboard.myProfile'), icon: FileText },
        { href: '/teacher/settings', label: t('dashboard.availability') || (locale === 'fr' ? 'Disponibilité' : 'التوفر'), icon: Calendar },
      ]
    },
    {
      title: t('dashboard.account') || (locale === 'fr' ? 'Compte' : 'الحساب'),
      items: [
        { href: '/teacher/settings', label: t('dashboard.settings'), icon: Settings },
        { href: '/help', label: t('dashboard.help') || (locale === 'fr' ? 'Aide' : 'المساعدة'), icon: HelpCircle },
      ]
    }
  ];

  const isActive = (href: string) => pathname === href || (href !== '/teacher' && pathname.startsWith(href));

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white transition-all duration-300 lg:static",
          isCompact ? "w-20" : "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-20 items-center justify-between px-6">
          <Link href="/" className={cn("flex items-center gap-3 transition-all", isCompact && "justify-center w-full")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-200">
              <BookOpen className="h-6 w-6" />
            </div>
            {!isCompact && <span className="text-xl font-black tracking-tighter text-gray-900">أستادي</span>}
          </Link>
          <button 
            onClick={() => setIsCompact(!isCompact)}
            className="hidden h-8 w-8 items-center justify-center rounded-lg border bg-gray-50 text-gray-400 hover:text-gray-900 lg:flex"
          >
            {isCompact ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4">
          <nav className="space-y-8">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-3">
                {!isCompact && (
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200",
                          active 
                            ? "bg-primary-600 text-white shadow-xl shadow-primary-200" 
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                          isCompact && "justify-center px-0"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-gray-400 group-hover:text-primary-600")} />
                        {!isCompact && <span>{item.label}</span>}
                        {!isCompact && item.badge && (
                          <span className={cn(
                            "absolute right-4 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                            active ? "bg-white text-primary-600" : "bg-primary-100 text-primary-600"
                          )}>
                            {item.badge}
                          </span>
                        )}
                        {isCompact && active && (
                          <div className="absolute left-0 h-8 w-1.5 rounded-r-full bg-white" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t p-4">
          {!isCompact ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-white shadow-sm">
                  {user.avatarKey ? (
                    <img src={getAvatarUrl(user.avatarKey)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary-100 font-black text-primary-600 uppercase">
                      {user.fullName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-gray-900">{user.fullName}</p>
                  <p className="truncate text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {locale === 'fr' ? 'Enseignant' : 'أستاذ'}
                  </p>
                </div>
                <button 
                  onClick={() => logout()}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => logout()}
              className="flex w-full justify-center rounded-xl p-3 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b bg-white px-6 lg:px-10">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg border p-2 text-gray-500">
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-lg font-black tracking-tighter text-gray-900">أستادي</span>
          </div>

          <div className="hidden flex-1 lg:flex max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={t('common.search') || (locale === 'fr' ? 'Rechercher...' : 'بحث...')}
                className="w-full rounded-2xl border-none bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-primary-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-xl border bg-white p-2.5 text-gray-500 hover:bg-gray-50 transition-all active:scale-95">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-600 ring-2 ring-white" />
            </button>
            <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block" />
            <Link href="/teacher/settings" className="hidden sm:flex items-center gap-3 rounded-xl hover:bg-gray-50 p-1.5 transition-all">
               <div className="h-9 w-9 overflow-hidden rounded-lg border border-gray-100">
                  {user.avatarKey ? (
                    <img src={getAvatarUrl(user.avatarKey)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-black text-gray-600">
                       {user.fullName?.charAt(0)}
                    </div>
                  )}
               </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6 lg:p-10">
             {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t bg-white/80 p-2 backdrop-blur-xl lg:hidden">
        {navGroups[0].items.concat(navGroups[1].items.slice(0, 2)).map((item) => {
          const active = isActive(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all",
                active ? "text-primary-600" : "text-gray-400"
              )}
            >
              <item.icon className={cn("h-6 w-6", active && "animate-pulse")} />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
