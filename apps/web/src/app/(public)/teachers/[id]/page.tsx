'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button, Card, CardContent } from '@oustadi/ui';
import { MapPin, BookOpen, Clock, Award, MessageSquare, Heart, HeartOff } from 'lucide-react';

interface TeacherProfile {
  id: string;
  userId: string;
  bio: string | null;
  experience: number | null;
  price: number | null;
  teachingMode: string;
  city: string | null;
  showContact: boolean;
  user: { id: string; fullName: string; avatarKey: string | null; phone: string | null; createdAt: string };
  subjects: { id: string; subject: { id: string; nameAr: string; nameFr: string }; levels: string[]; price: number | null }[];
  availability: { id: string; dayOfWeek: number; startTime: string; endTime: string }[];
  _count: { favorites: number };
}

const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestMsg, setRequestMsg] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetch() {
      const res = await apiRequest<TeacherProfile>(`/teachers/${id}`, { skipAuth: true });
      if (res.success && res.data) setProfile(res.data as TeacherProfile);
      setLoading(false);
    }
    fetch();
  }, [id]);

  async function sendRequest() {
    if (!user) { router.push('/login'); return; }
    if (!selectedSubject) { alert('الرجاء اختيار المادة'); return; }
    setSending(true);
    const res = await apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify({ teacherId: profile?.userId, subjectId: selectedSubject, message: requestMsg }),
    });
    setSending(false);
    if (res.success) {
      setRequestMsg('');
      alert('تم إرسال الطلب بنجاح');
    } else {
      alert(res.error || 'فشل إرسال الطلب');
    }
  }

  if (loading) return <><Header /><main className="mx-auto max-w-4xl px-4 py-8"><div className="h-96 animate-pulse rounded-xl bg-gray-100" /></main></>;
  if (!profile) return <><Header /><main className="py-16 text-center text-gray-500">الأستاذ غير موجود</main></>;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-600">
                {profile.user.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.user.fullName}</h1>
                {profile.city && <p className="mt-1 flex items-center gap-1 text-gray-500"><MapPin className="h-4 w-4" /> {profile.city}</p>}
                <div className="mt-2 flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Award className="h-4 w-4" /> {profile.experience || 0} سنوات خبرة</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {profile.teachingMode === 'ONLINE' ? 'عن بعد' : profile.teachingMode === 'IN_PERSON' ? 'حضوري' : profile.teachingMode === 'BOTH' ? 'الاثنين معاً' : 'الاثنين معاً'}</span>
                  {profile.showContact && profile.user.phone && <span className="text-sm text-gray-500">📞 {profile.user.phone}</span>}
                </div>
              </div>
              {profile.price && (
                <div className="text-left">
                  <p className="text-2xl font-bold text-primary-600">{profile.price}</p>
                  <p className="text-sm text-gray-500">درهم/للساعة</p>
                </div>
              )}
            </div>

            {profile.bio && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">عن الأستاذ</h2>
                <p className="mt-2 text-gray-600">{profile.bio}</p>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><BookOpen className="h-5 w-5" /> المواد</h2>
              <div className="mt-2 space-y-2">
                {profile.subjects.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                    <span className="font-medium text-gray-900">{s.subject.nameAr}</span>
                    <div className="flex gap-2">
                      {s.levels.map((l) => <span key={l} className="rounded-full bg-gray-200 px-2 py-0.5 text-xs">{l}</span>)}
                      {s.price && <span className="text-sm text-primary-600">{s.price} درهم</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {profile.availability.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">أوقات التوفر</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.availability.map((slot) => (
                    <span key={slot.id} className="rounded-full bg-secondary-50 px-3 py-1 text-sm text-secondary-700">
                      {dayNames[slot.dayOfWeek]} {slot.startTime}-{slot.endTime}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900">إرسال طلب درس</h2>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="mt-3 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">اختر المادة</option>
                {profile.subjects.length > 0 ? profile.subjects.map((s) => (
                  <option key={s.id} value={s.subject.id}>{s.subject.nameAr}</option>
                )) : (
                  <option disabled>هذا الأستاذ لم يضف مواد بعد</option>
                )}
              </select>
              <textarea
                value={requestMsg}
                onChange={(e) => setRequestMsg(e.target.value)}
                placeholder="اكتب رسالتك للأستاذ..."
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
                rows={3}
              />
              <div className="mt-4 flex gap-3">
                <Button onClick={sendRequest} disabled={sending || !requestMsg || profile.subjects.length === 0}>
                  {sending ? 'جار الإرسال...' : 'إرسال الطلب'}
                </Button>
                {user && user.role === 'STUDENT' && profile && (
                  <FavoriteButton profileId={profile.id} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}

function FavoriteButton({ profileId }: { profileId: string }) {
  const [faved, setFaved] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function toggle() {
    setToggling(true);
    const res = await apiRequest(`/students/favorites/${profileId}`, { method: 'POST' });
    setToggling(false);
    if (res.success) setFaved(res.data?.favorited ?? !faved);
  }

  return (
    <Button variant="outline" onClick={toggle} disabled={toggling}>
      {faved ? <HeartOff className="ml-1 h-4 w-4" /> : <Heart className="ml-1 h-4 w-4" />}
      {faved ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
    </Button>
  );
}
