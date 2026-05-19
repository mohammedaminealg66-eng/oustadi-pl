'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { subjectName } from '@/lib/subject';
import { useAuth } from '@/providers/auth-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button, Card, CardContent } from '@oustadi/ui';
import {
  MapPin, BookOpen, Clock, Award, Heart, HeartOff, Star, MessageSquare,
  GraduationCap, Video, CheckCircle, Users, Zap, Calendar, ChevronLeft,
} from 'lucide-react';

interface Review {
  id: string; rating: number; comment: string | null; createdAt: string;
  student: { id: string; fullName: string; avatarKey: string | null };
}
interface TeacherProfile {
  id: string; userId: string; bio: string | null; experience: number | null;
  price: number | null; teachingMode: string; city: string | null;
  showContact: boolean; isVerified: boolean; responseTime: string | null;
  introVideo: string | null; avgRating: number | null; studentCount: number;
  user: { id: string; fullName: string; avatarKey: string | null; phone: string | null; createdAt: string };
  subjects: { id: string; subject: { id: string; nameAr: string; nameFr: string }; levels: string[]; price: number | null }[];
  availability: { id: string; dayOfWeek: number; startTime: string; endTime: string }[];
  documents: { id: string; type: string; fileName: string; originalName: string; createdAt: string; isVerified: boolean }[];
  reviews: Review[];
  _count: { favorites: number; reviews: number };
}

const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const dayNamesFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${s} ${i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
      ))}
    </div>
  );
}

export default function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('teacher');
  const c = useTranslations('common');
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestMsg, setRequestMsg] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [faved, setFaved] = useState(false);
  const [toggling, setToggling] = useState(false);

  const dn = locale === 'fr' ? dayNamesFr : dayNames;

  useEffect(() => {
    async function fetch() {
      const res = await apiRequest<TeacherProfile>(`/teachers/${id}`, { skipAuth: true });
      if (res.success && res.data) setProfile(res.data as TeacherProfile);
      setLoading(false);
    }
    fetch();

    apiRequest('/teachers?limit=4', { skipAuth: true }).then((r: any) => {
      const items = r.data?.data || r.data || [];
      setSimilar(Array.isArray(items) ? items.filter((t: any) => t.id !== id).slice(0, 3) : []);
    });
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') return;
    apiRequest<any[]>('/students/favorites').then((res) => {
      if (res.success && res.data) setFaved(res.data.some((fav: any) => profile && fav.teacherId === profile.id));
    });
  }, [user, profile]);

  async function toggleFav() {
    if (!user) { router.push('/login'); return; }
    setToggling(true);
    const res = await apiRequest(`/students/favorites/${profile?.id}`, { method: 'POST' });
    setToggling(false);
    if (res.success) setFaved(res.data?.favorited ?? !faved);
  }

  async function sendRequest() {
    if (!user) { router.push('/login'); return; }
    if (!selectedSubject) return;
    setSending(true);
    await apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify({ teacherId: profile?.userId, subjectId: selectedSubject, message: requestMsg }),
    });
    setSending(false);
    setRequestMsg('');
  }

  const daysAvail = useMemo(() => {
    const d = profile?.availability ?? [];
    const days = Array.from({ length: 7 }, (_, i) => ({
      index: i, name: dn[i],
      slots: d.filter((s) => s.dayOfWeek === i),
    }));
    const today = new Date().getDay();
    const hasToday = days[today]?.slots.length > 0;
    return { days, hasToday };
  }, [profile, dn]);

  const certDocs = useMemo(() => profile?.documents.filter((d) => d.type === 'certificate') || [], [profile]);

  if (loading) return <><Header /><div className="mx-auto max-w-6xl px-4 py-8"><div className="h-96 animate-pulse rounded-xl bg-gray-100" /></div></>;
  if (!profile) return <><Header /><div className="py-16 text-center text-gray-500">{t('notFound')}</div></>;

  const mainSubject = profile.subjects[0];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 lg:py-8">
        <div className="lg:flex lg:gap-8">
          <div className="flex-1 space-y-6">
            <Card>
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="flex shrink-0 flex-col items-center gap-3 sm:items-start">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-3xl font-bold text-primary-600 ring-4 ring-primary-50 lg:h-28 lg:w-28">
                      {profile.user.avatarKey
                        ? <img src={profile.user.avatarKey} alt="" className="h-full w-full object-cover" />
                        : profile.user.fullName.charAt(0)}
                    </div>
                    {profile.isVerified && (
                      <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                        <CheckCircle className="h-3 w-3" /> {t('verified')}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-right">
                    <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">{profile.user.fullName}</h1>
                    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
                      {mainSubject && (
                        <span className="text-sm font-medium text-primary-600">{subjectName(mainSubject.subject, locale)}</span>
                      )}
                      {profile.city && (
                        <span className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-3.5 w-3.5" /> {profile.city}</span>
                      )}
                    </div>
                    {profile.avgRating && profile._count.reviews > 0 && (
                      <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                        <StarRating rating={profile.avgRating} />
                        <span className="text-sm text-gray-600">{profile.avgRating.toFixed(1)} ({profile._count.reviews} {t('reviews')})</span>
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 sm:justify-start">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {profile.studentCount} {t('students')}</span>
                      <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> {profile.experience || 0} {t('yearsExperience')}</span>
                      {profile.responseTime && (
                        <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> {profile.responseTime}</span>
                      )}
                    </div>
                  </div>
                  {profile.price && (
                    <div className="hidden shrink-0 text-left lg:block">
                      <p className="text-3xl font-bold text-primary-600">{Number(profile.price).toFixed(0)}</p>
                      <p className="text-xs text-gray-500">{t('dhPerHour')}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {profile.teachingMode === 'ONLINE' && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{t('online')}</span>}
                  {profile.teachingMode === 'IN_PERSON' && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">{t('inPerson')}</span>}
                  {profile.teachingMode === 'BOTH' && (
                    <>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{t('online')}</span>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">{t('inPerson')}</span>
                    </>
                  )}
                  {daysAvail.hasToday ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                      <Calendar className="h-3 w-3" /> {t('availableToday')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                      {t('notAvailableToday')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {profile.bio && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900">{t('about')}</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><BookOpen className="h-5 w-5" /> {t('subjects')}</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {profile.subjects.map((s) => (
                    <div key={s.id} className="rounded-xl border bg-white p-4">
                      <p className="font-medium text-gray-900">{subjectName(s.subject, locale)}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.levels.map((l) => <span key={l} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{l}</span>)}
                      </div>
                      {s.price && <p className="mt-2 text-sm font-semibold text-primary-600">{Number(s.price).toFixed(0)} {t('dh')}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {profile.experience !== null && profile.experience !== undefined && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Award className="h-5 w-5" /> {t('experience')}</h2>
                  <p className="mt-2 text-sm text-gray-600">{profile.experience} {t('yearsExperience')}</p>
                </CardContent>
              </Card>
            )}

            {profile.introVideo && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Video className="h-5 w-5" /> {t('introVideo')}</h2>
                  <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-black">
                    <video controls className="h-full w-full" src={profile.introVideo} />
                  </div>
                </CardContent>
              </Card>
            )}

            {certDocs.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><GraduationCap className="h-5 w-5" /> {t('certificates')}</h2>
                  <div className="mt-3 space-y-2">
                    {certDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                          <p className="text-xs text-gray-500">{new Date(doc.createdAt).getFullYear()}</p>
                        </div>
                        {doc.isVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.availability.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Calendar className="h-5 w-5" /> {t('availability')}</h2>
                  <div className="mt-3 overflow-hidden rounded-xl border">
                    {daysAvail.days.map((d) => (
                      <div key={d.index} className={`flex items-center border-b px-4 py-3 last:border-0 ${d.slots.length > 0 ? '' : 'bg-gray-50'}`}>
                        <span className="w-20 text-sm font-medium text-gray-700">{d.name}</span>
                        {d.slots.length > 0 ? (
                          <span className="text-sm text-gray-600">{d.slots.map((s) => `${s.startTime}-${s.endTime}`).join('، ')}</span>
                        ) : (
                          <span className="text-sm text-gray-400">{t('unavailable')}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Star className="h-5 w-5" /> {t('reviews')}
                  {profile.avgRating && <span className="text-sm font-normal text-gray-500">— {profile.avgRating.toFixed(1)} ({profile._count.reviews})</span>}
                </h2>
                {profile.reviews.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {profile.reviews.map((r) => (
                      <div key={r.id} className="rounded-xl border bg-white p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                            {r.student.avatarKey ? <img src={r.student.avatarKey} alt="" className="h-full w-full rounded-full object-cover" /> : r.student.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{r.student.fullName}</p>
                            <StarRating rating={r.rating} size="sm" />
                          </div>
                          <span className="mr-auto text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'ar-MA', { year: 'numeric', month: 'short' })}</span>
                        </div>
                        {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-400">{t('noReviewsYet')}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="mt-6 lg:mt-0 lg:w-80 lg:shrink-0">
            <div className="space-y-4 lg:sticky lg:top-24">
              <Card>
                <CardContent className="p-5">
                  {profile.price && (
                    <div className="mb-4 text-center">
                      <p className="text-3xl font-bold text-primary-600">{Number(profile.price).toFixed(0)} <span className="text-sm font-normal text-gray-500">{t('dh')}/{t('hour')}</span></p>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Button className="w-full" onClick={() => { if (!user) router.push('/login'); else router.push(`/chat`); }}>
                      <MessageSquare className="ml-2 h-4 w-4" /> {t('messageTeacher')}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => document.getElementById('request-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      <BookOpen className="ml-2 h-4 w-4" /> {t('reserveLesson')}
                    </Button>
                    {user && user.role === 'STUDENT' && (
                      <Button variant="ghost" className="w-full" onClick={toggleFav} disabled={toggling}>
                        {faved ? <HeartOff className="ml-2 h-4 w-4" /> : <Heart className="ml-2 h-4 w-4" />}
                        {faved ? t('removeFromFavorites') : t('saveToFavorites')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900">{t('availability')}</h3>
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    {daysAvail.days.filter((d) => d.slots.length > 0).slice(0, 4).map((d) => (
                      <p key={d.index}>{d.name}: {d.slots.map((s) => `${s.startTime}-${s.endTime}`).join(', ')}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        <div id="request-section" className="mt-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">{t('sendLessonRequest')}</h2>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="mt-3 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">{t('chooseSubject')}</option>
                {profile.subjects.map((s) => (
                  <option key={s.id} value={s.subject.id}>{subjectName(s.subject, locale)}</option>
                ))}
              </select>
              <textarea value={requestMsg} onChange={(e) => setRequestMsg(e.target.value)} placeholder={t('messagePlaceholder')} className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm" rows={3} />
              <div className="mt-4 flex gap-3">
                <Button onClick={sendRequest} disabled={sending || !requestMsg || profile.subjects.length === 0}>
                  {sending ? t('sending') : t('sendRequest')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {similar.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('similarTeachers')}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((tch: any) => (
                <button key={tch.id} onClick={() => router.push(`/teachers/${tch.id}`)} className="rounded-xl border bg-white p-4 text-right transition hover:shadow-md">
                  <p className="font-medium text-gray-900">{tch.fullName}</p>
                  {tch.subjects?.[0] && <p className="text-xs text-gray-500">{subjectName(tch.subjects[0], locale)}</p>}
                  {tch.price && <p className="mt-1 text-sm font-semibold text-primary-600">{Number(tch.price).toFixed(0)} {t('dh')}</p>}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {profile.price && <span className="text-lg font-bold text-primary-600">{Number(profile.price).toFixed(0)} {t('dh')}/{t('hour')}</span>}
          <Button className="flex-1" size="sm" onClick={() => { if (!user) router.push('/login'); else router.push(`/chat`); }}>
            <MessageSquare className="ml-1 h-4 w-4" /> {t('messageTeacher')}
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => document.getElementById('request-section')?.scrollIntoView({ behavior: 'smooth' })}>
            {t('reserveLesson')}
          </Button>
        </div>
      </div>

      <div className="pb-20 lg:pb-0">
        <Footer />
      </div>
    </>
  );
}
