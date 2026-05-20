'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { subjectName } from '@/lib/subject';
import { getAvatarUrl } from '@/lib/asset';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button, Card, CardContent } from '@oustadi/ui';
import { MapPin, SlidersHorizontal, X, Star, Filter, Search, ChevronDown } from 'lucide-react';

const levels = ['primaire', 'collège', 'lycée', 'bac', 'université'];
const teachingModes = [
  { value: 'ONLINE', ar: 'عن بعد', fr: 'En ligne' },
  { value: 'IN_PERSON', ar: 'حضوري', fr: 'Présentiel' },
  { value: 'BOTH', ar: 'الاثنين', fr: 'Les deux' },
];
const sortOptions = [
  { value: '', ar: 'الأحدث', fr: 'Plus récents' },
  { value: 'price_asc', ar: 'السعر: الأقل', fr: 'Prix: croissant' },
  { value: 'price_desc', ar: 'السعر: الأعلى', fr: 'Prix: décroissant' },
  { value: 'experience', ar: 'الأكثر خبرة', fr: 'Plus expérimentés' },
];

function lastSeenText(lastSeen: string | null, locale: string, t: any): string {
  if (!lastSeen) return '';
  const diff = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('online');
  if (mins < 60) return locale === 'fr' ? `il y a ${mins} min` : `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return locale === 'fr' ? `il y a ${hours} h` : `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return locale === 'fr' ? `il y a ${days} j` : `منذ ${days} يوم`;
}

export default function TeachersPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const locale = useLocale();
  const h = useTranslations('home');
  const t = useTranslations('teacher');
  const c = useTranslations('common');

  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    query: sp.get('query') || '',
    subjectId: sp.get('subjectId') || '',
    level: sp.get('level') || '',
    city: sp.get('city') || '',
    maxPrice: sp.get('maxPrice') || '',
    minPrice: sp.get('minPrice') || '',
    teachingMode: sp.get('teachingMode') || '',
    gender: sp.get('gender') || '',
    minRating: sp.get('minRating') || '',
    verifiedOnly: sp.get('verifiedOnly') === 'true',
    availableToday: sp.get('availableToday') === 'true',
    sort: sp.get('sort') || '',
  });

  useEffect(() => {
    apiRequest('/subjects', { skipAuth: true }).then((r) => { if (r.success) setSubjects(r.data); });
  }, []);

  const buildQuery = useCallback((cursorVal?: string) => {
    const p = new URLSearchParams();
    if (filters.query) p.set('query', filters.query);
    if (filters.subjectId) p.set('subjectId', filters.subjectId);
    if (filters.level) p.set('levels', filters.level);
    if (filters.city) p.set('city', filters.city);
    if (filters.maxPrice) p.set('maxPrice', filters.maxPrice);
    if (filters.teachingMode) p.set('teachingMode', filters.teachingMode);
    if (filters.gender) p.set('gender', filters.gender);
    if (filters.minRating) p.set('minRating', filters.minRating);
    if (filters.verifiedOnly) p.set('verifiedOnly', 'true');
    if (filters.availableToday) p.set('availableToday', 'true');
    if (filters.sort) p.set('sort', filters.sort);
    if (cursorVal) p.set('cursor', cursorVal);
    p.set('limit', '20');
    return p.toString();
  }, [filters]);

  const fetchTeachers = useCallback(async (cursorVal?: string) => {
    setLoading(true);
    const res = await apiRequest<{ data: any[]; hasMore: boolean; cursor: string | null }>(
      `/teachers?${buildQuery(cursorVal)}`, { skipAuth: true }
    );
    if (res.success && res.data) {
      if (cursorVal) setTeachers((prev) => [...prev, ...res.data!.data]);
      else setTeachers(res.data!.data);
      setHasMore(res.data!.hasMore);
      setCursor(res.data!.cursor);
    }
    setLoading(false);
  }, [buildQuery]);

  useEffect(() => {
    fetchTeachers();
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, String(v)); });
    const qs = p.toString();
    router.replace(`/teachers${qs ? '?' + qs : ''}`, { scroll: false });
  }, [
    filters.query, filters.subjectId, filters.level, filters.city,
    filters.maxPrice, filters.teachingMode, filters.gender,
    filters.minRating, filters.verifiedOnly, filters.availableToday, filters.sort,
  ]);

  function setFilter(key: string, value: any) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setTeachers([]);
    setCursor(null);
  }

  function resetFilters() {
    setFilters({
      query: '', subjectId: '', level: '', city: '', maxPrice: '', minPrice: '',
      teachingMode: '', gender: '', minRating: '', verifiedOnly: false,
      availableToday: false, sort: '',
    });
    setTeachers([]);
    setCursor(null);
  }

  const hasActiveFilters = Object.values(filters).some((v) => Boolean(v));

  function FilterContent() {
    return (
      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{h('searchPlaceholder')}</label>
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <input value={filters.query} onChange={(e) => setFilter('query', e.target.value)}
              placeholder={h('searchPlaceholder')}
              className="w-full rounded-lg border border-gray-300 py-2 pr-10 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{t('subject')}</label>
          <select value={filters.subjectId} onChange={(e) => setFilter('subjectId', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">{c('all')}</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{subjectName(s, locale)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{t('level')}</label>
          <select value={filters.level} onChange={(e) => setFilter('level', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">{c('all')}</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l === 'université' ? (locale === 'fr' ? 'Université' : 'جامعة') : l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{t('city')}</label>
          <input value={filters.city} onChange={(e) => setFilter('city', e.target.value)}
            placeholder={t('city')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{t('price')} {filters.maxPrice ? `≤ ${filters.maxPrice} ${t('dh')}` : ''}</label>
          <input type="range" min="20" max="300" value={filters.maxPrice || '300'}
            onChange={(e) => setFilter('maxPrice', e.target.value === '300' ? '' : e.target.value)}
            className="w-full" />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>20 {t('dh')}</span>
            <span>300 {t('dh')}</span>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{t('teachingMode')}</label>
          <select value={filters.teachingMode} onChange={(e) => setFilter('teachingMode', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">{c('all')}</option>
            {teachingModes.map((m) => (
              <option key={m.value} value={m.value}>{locale === 'fr' ? m.fr : m.ar}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{t('gender')}</label>
          <select value={filters.gender} onChange={(e) => setFilter('gender', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">{c('all')}</option>
            <option value="MALE">{locale === 'fr' ? 'Homme' : 'ذكر'}</option>
            <option value="FEMALE">{locale === 'fr' ? 'Femme' : 'أنثى'}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{t('rating')}</label>
          <select value={filters.minRating} onChange={(e) => setFilter('minRating', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">{c('all')}</option>
            <option value="4">⭐ 4+</option>
            <option value="4.5">⭐ 4.5+</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filters.verifiedOnly}
            onChange={(e) => setFilter('verifiedOnly', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300" />
          {t('verifiedOnly')}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filters.availableToday}
            onChange={(e) => setFilter('availableToday', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300" />
          {t('availableToday')}
        </label>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{h('searchTeachers')}</h1>
          <div className="flex items-center gap-3">
            <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{locale === 'fr' ? o.fr : o.ar}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(true)}>
              <SlidersHorizontal className="ml-1 h-4 w-4" /> {t('filters')}
            </Button>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-xs text-red-500 hover:underline">{c('reset')}</button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="rounded-xl border bg-white p-4 sticky top-24">
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            {loading && teachers.length === 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}><CardContent className="h-40 animate-pulse bg-gray-100" /></Card>
                ))}
              </div>
            ) : teachers.length === 0 ? (
              <div className="py-16 text-center text-gray-500">{c('noResults')}</div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {teachers.map((teacher) => (
                    <Link key={teacher.id} href={`/teachers/${teacher.id}`}>
                      <Card className="transition hover:shadow-md h-full">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="relative shrink-0">
                              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                                {teacher.avatarKey
                                  ? <img src={getAvatarUrl(teacher.avatarKey)} alt="" className="h-full w-full object-cover" />
                                  : teacher.fullName?.charAt(0)}
                              </div>
                              {teacher.isOnline && <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 flex-wrap">
                                <h3 className="font-semibold text-gray-900 truncate">{teacher.fullName}</h3>
                                {teacher.isOfficial && <span className="shrink-0 text-sm">🔵</span>}
                                {teacher.isVerified && !teacher.isOfficial && <span className="shrink-0 text-[10px] text-green-600">✅</span>}
                                {teacher.gender && <span className="text-[10px] text-gray-400">{teacher.gender === 'MALE' ? '♂' : '♀'}</span>}
                              </div>
                              {teacher.city && (
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3" /> {teacher.city}
                                </p>
                              )}
                              <p className="mt-0.5 text-[10px] text-gray-400">
                                {teacher.isOnline ? t('online') : lastSeenText(teacher.lastSeen, locale, t)}
                              </p>
                            </div>
                          </div>
                          {teacher.bio && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{teacher.bio}</p>}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {teacher.subjects?.slice(0, 3).map((s: any) => (
                              <span key={s.id} className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] text-primary-700">
                                {subjectName(s, locale)}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-gray-500">{teacher.experience || 0} {t('yearsExperience')}</span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                              {teacher.teachingMode === 'ONLINE' ? t('online') : teacher.teachingMode === 'IN_PERSON' ? t('inPerson') : t('both')}
                            </span>
                            <div className="flex items-center gap-1">
                              {teacher.reviewCount > 0 && <span className="flex items-center gap-0.5 text-yellow-500"><Star className="h-3 w-3 fill-current" /></span>}
                              <span className="font-semibold text-primary-600">{teacher.price ? `${teacher.price} ${t('dh')}` : ''}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-8 text-center">
                    <Button variant="outline" onClick={() => fetchTeachers(cursor ?? undefined)} disabled={loading}>
                      {loading ? c('loading') : t('loadMore')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{t('filters')}</h2>
              <button onClick={() => setShowFilters(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <FilterContent />
            <Button className="mt-6 w-full" onClick={() => setShowFilters(false)}>{c('apply')}</Button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
