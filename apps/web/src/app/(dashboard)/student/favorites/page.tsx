'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Card, CardContent } from '@oustadi/ui';
import { MapPin, Award, Clock, X } from 'lucide-react';

export default function StudentFavorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>جار التحميل...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">المفضلة</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((fav: any) => {
          const t = fav.teacher;
          return (
            <Card key={fav.id} className="relative transition hover:shadow-md">
              <button onClick={() => removeFavorite(fav.id, t.id)} className="absolute left-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"><X className="h-4 w-4" /></button>
              <Link href={`/teachers/${t.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-base font-bold text-primary-600">
                      {t.user?.fullName?.charAt(0) || 'أ'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{t.user?.fullName || 'أستاذ'}</p>
                      {t.city && <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3 w-3" /> {t.city}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {t.subjects?.slice(0, 2).map((s: any) => (
                      <span key={s.id} className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">{s.subject?.nameAr}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {t.experience || 0} سنوات</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t.teachingMode === 'ONLINE' ? 'عن بعد' : t.teachingMode === 'IN_PERSON' ? 'حضوري' : 'الاثنين معاً'}</span>
                  </div>
                  {t.price && <p className="mt-2 text-left text-sm font-semibold text-primary-600">{t.price} درهم</p>}
                </CardContent>
              </Link>
            </Card>
          );
        })}
        {favorites.length === 0 && <p className="col-span-full text-center py-8 text-sm text-gray-400">لا توجد مفضلة بعد</p>}
      </div>
    </div>
  );
}
