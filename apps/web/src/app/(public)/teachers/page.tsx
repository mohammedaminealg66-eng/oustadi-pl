'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Input, Button, Card, CardContent } from '@oustadi/ui';
import { Search, MapPin, BookOpen, DollarSign } from 'lucide-react';

interface TeacherCard {
  id: string;
  fullName: string;
  avatarKey: string | null;
  bio: string | null;
  experience: number | null;
  price: number | null;
  teachingMode: string;
  city: string | null;
  subjects: { id: string; nameAr: string; nameFr: string; levels: string[] }[];
  favoriteCount: number;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    async function fetch() {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (city) params.set('city', city);
      params.set('limit', '30');

      const res = await apiRequest<{ data: TeacherCard[] }>(`/teachers?${params}`, { skipAuth: true });
      if (res.success && res.data) setTeachers(res.data.data);
      setLoading(false);
    }
    fetch();
  }, [query, city]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">البحث عن أساتذة</h1>
          <div className="mt-4 flex gap-4">
            <div className="flex-1">
              <Input
                id="search"
                placeholder="ابحث عن أستاذ، مادة..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Input
                id="city"
                placeholder="المدينة"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="h-48 animate-pulse bg-gray-100" />
              </Card>
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="py-16 text-center text-gray-500">لا توجد نتائج</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <Link key={teacher.id} href={`/teachers/${teacher.id}`}>
                <Card className="transition hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                        {teacher.fullName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{teacher.fullName}</h3>
                        {teacher.city && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" /> {teacher.city}
                          </p>
                        )}
                      </div>
                    </div>
                    {teacher.bio && <p className="mt-3 text-sm text-gray-600 line-clamp-2">{teacher.bio}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {teacher.subjects?.slice(0, 3).map((s) => (
                        <span key={s.id} className="rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700">
                          {s.nameAr}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-gray-500">{teacher.experience || 0} سنوات خبرة</span>
                      {teacher.price && <span className="font-semibold text-primary-600">{teacher.price} درهم</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
