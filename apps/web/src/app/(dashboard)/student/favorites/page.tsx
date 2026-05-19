'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { Card, CardContent } from '@oustadi/ui';
import { MapPin, Award, Clock, X, ArrowRight } from 'lucide-react';

export default function StudentFavorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const d = useTranslations('dashboard');
  const t = useTranslations('teacher');
  const c = useTranslations('common');

  useEffect(() => {
    apiRequest<any[]>('/students/favorites').then((res) => {
      if (res.success && res.data) setFavorites(res.data);
      setLoading(false);
    });
  }, []);

  async function removeFavorite(favId: string, teacherProfileId: string) {
    await apiRequest(`/students/favorites/${teacherProfileId}`, { method: 'POST' });
    setFavorites((prev) => prev.filter((f) => f.id !== favId));
  }

  if (loading) return <p className="text-gray-500">{c('loading')}</p>;

  return (
    <div>
      <div className="mb-4">
        <Link href="/student" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
          <ArrowRight className="h-4 w-4" /> {d('backToDashboard')}
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{d('favorites')}</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((fav: any) => {
          const tch = fav.teacher;
          return (
            <Card key={fav.id} className="relative transition hover:shadow-md">
              <button onClick={() => removeFavorite(fav.id, tch.id)} className="absolute left-2 top-2 z-10 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"><X className="h-4 w-4" /></button>
              <Link href={`/teachers/${tch.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-base font-bold text-primary-600">
                      {tch.user?.fullName?.charAt(0) || 'أ'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{tch.user?.fullName || 'أستاذ'}</p>
                      {tch.city && <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3 w-3" /> {tch.city}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tch.subjects?.slice(0, 2).map((s: any) => (
                      <span key={s.id} className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">{s.subject?.nameAr}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {tch.experience || 0} {t('yearsExperience')}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {tch.teachingMode === 'ONLINE' ? t('online') : tch.teachingMode === 'IN_PERSON' ? t('inPerson') : t('both')}</span>
                  </div>
                  {tch.price && <p className="mt-2 text-left text-sm font-semibold text-primary-600">{tch.price} {t('dh')}</p>}
                </CardContent>
              </Link>
            </Card>
          );
        })}
        {favorites.length === 0 && <p className="col-span-full py-8 text-center text-sm text-gray-400">{d('noFavorites')}</p>}
      </div>
    </div>
  );
}
