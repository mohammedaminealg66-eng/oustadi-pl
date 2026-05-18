'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Card, CardContent } from '@oustadi/ui';

export default function StudentFavorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any[]>('/students/favorites').then((res) => {
      if (res.success && res.data) setFavorites(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>جار التحميل...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">المفضلة</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((fav: any) => (
          <Card key={fav.id}>
            <CardContent className="p-4">
              <p className="font-medium text-gray-900">{fav.teacher?.user?.fullName || 'أستاذ'}</p>
              <p className="text-sm text-gray-500">{fav.teacher?.subjects?.[0]?.subject?.nameAr || ''}</p>
            </CardContent>
          </Card>
        ))}
        {favorites.length === 0 && <p className="col-span-full text-center py-8 text-sm text-gray-400">لا توجد مفضلة بعد</p>}
      </div>
    </div>
  );
}
