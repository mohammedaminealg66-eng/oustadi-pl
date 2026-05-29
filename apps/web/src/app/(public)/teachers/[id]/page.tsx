'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { subjectName } from '@/lib/subject';
import { getAvatarUrl, getYouTubeEmbedUrl } from '@/lib/asset';
import { useAuth } from '@/providers/auth-provider';

import { Footer } from '@/components/layout/footer';
import { Button, Card, CardContent, Badge, Breadcrumbs } from '@oustadi/ui';
import { OfficialBadge, VerifiedBadge } from '@/components/teacher/status-badges';
import {
  MapPin, BookOpen, Clock, Award, Heart, HeartOff, Star, MessageSquare,
  GraduationCap, Video, CheckCircle, Users, Zap, Calendar, ChevronLeft,
  Flag, Share2, ExternalLink, Globe, X,
} from 'lucide-react';

interface Review {
  id: string; rating: number; comment: string | null; createdAt: string;
  student: { id: string; fullName: string; avatarKey: string | null };
}
interface TeacherProfile {
  id: string; userId: string; bio: string | null; experience: number | null;
  price: number | null; teachingMode: string; city: string | null;
  showContact: boolean; isVerified: boolean; isOfficial: boolean; responseTime: string | null;
  introVideo: string | null; avgRating: number | null; studentCount: number;
  facebookUrl: string | null; instagramUrl: string | null; linkedinUrl: string | null;
  youtubeUrl: string | null; websiteUrl: string | null;
  user: { id: string; fullName: string; avatarKey: string | null; phone: string | null; createdAt: string; isOnline: boolean; lastSeen: string | null };
  subjects: { id: string; subject: { id: string; nameAr: string; nameFr: string }; levels: string[]; price: number | null }[];
  availability: { id: string; dayOfWeek: number; startTime: string; endTime: string }[];
  documents: { id: string; type: string; fileName: string; originalName: string; createdAt: string; isVerified: boolean }[];
  reviews: Review[];
  _count: { favorites: number; reviews: number };
}

const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const dayNamesFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

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
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('fake');
  const [reportDesc, setReportDesc] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportError, setReportError] = useState('');
  const [shareDone, setShareDone] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [lessonType, setLessonType] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE');
  const [bookingMsg, setBookingMsg] = useState('');
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const dn = locale === 'fr' ? dayNamesFr : dayNames;

  function timeAgo(dateStr: string, loc: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return loc === 'fr' ? `il y a ${min} min` : `${min} دقيقة`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return loc === 'fr' ? `il y a ${hr} h` : `${hr} ساعات`;
    const d = Math.floor(hr / 24);
    return loc === 'fr' ? `il y a ${d} j` : `${d} أيام`;
  }

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
    apiRequest<any[]>('/students/reviews/mine').then((res) => {
      if (res.success && res.data) {
        const existing = res.data.find((r: any) => r.teacherId === profile?.id);
        if (existing) { setCanReview(false); return; }
      }
      apiRequest<any>('/requests', { skipAuth: false }).then((r2: any) => {
        if (r2.success && r2.data) {
          const completed = (r2.data.sent || []).some((req: any) =>
            req.teacherId === profile?.userId && req.status === 'COMPLETED'
          );
          setCanReview(completed);
        }
      });
    });
  }, [user, profile]);

  async function toggleFav() {
    if (!user) { router.push('/login'); return; }
    setToggling(true);
    const res = await apiRequest(`/students/favorites/${profile?.id}`, { method: 'POST' });
    setToggling(false);
    if (res.success) setFaved(res.data?.favorited ?? !faved);
  }

  async function submitReview() {
    if (!profile || !reviewRating) return;
    setReviewing(true);
    const res = await apiRequest('/students/reviews', {
      method: 'POST',
      body: JSON.stringify({ teacherId: profile.id, rating: reviewRating, comment: reviewComment }),
    });
    setReviewing(false);
    if (res.success && res.data) {
      const newReview = res.data;
      setProfile({
        ...profile,
        reviews: [newReview, ...profile.reviews],
        avgRating: profile.reviews.length > 0
          ? (profile.reviews.reduce((s, r) => s + r.rating, 0) + reviewRating) / (profile.reviews.length + 1)
          : reviewRating,
        _count: { ...profile._count, reviews: profile._count.reviews + 1 },
      });
      setReviewRating(0);
      setReviewComment('');
      setCanReview(false);
      setReviewSubmitted(true);
    }
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

  const dateOptions = useMemo(() => {
    const opts: { dateStr: string; dayName: string; dayNum: number; slots: typeof daysAvail.days[0]['slots'] }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dow = d.getDay();
      const slots = daysAvail.days[dow]?.slots || [];
      if (slots.length > 0) {
        opts.push({
          dateStr: d.toISOString().split('T')[0],
          dayName: dn[dow],
          dayNum: d.getDate(),
          slots,
        });
      }
    }
    return opts;
  }, [daysAvail, dn]);

  useEffect(() => {
    if (dateOptions.length > 0 && !selectedDate) {
      setSelectedDate(dateOptions[0].dateStr);
      setSelectedTime(dateOptions[0].slots[0]?.startTime || '');
    }
  }, [dateOptions, selectedDate]);

  const certDocs = useMemo(() => profile?.documents.filter((d) => d.type === 'certificate') || [], [profile]);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-8"><div className="h-96 animate-pulse rounded-[3rem] bg-gray-100" /></div>;
  if (!profile) return <div className="py-16 text-center text-gray-500 font-black text-xl">{t('notFound')}</div>;

  const mainSubject = profile.subjects[0];

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-8 lg:py-16 text-right">
        <Breadcrumbs 
          locale={locale}
          items={[
            { label: locale === 'fr' ? 'Profs' : 'الأساتذة', href: '/teachers' },
            { label: profile.user.fullName }
          ]} 
        />
        <div className="lg:flex lg:gap-16">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Hero Header */}
            <div className="flex flex-col gap-10 pb-12 border-b border-gray-100 sm:flex-row sm:items-start">
              <div className="relative shrink-0 mx-auto sm:mx-0 order-last sm:order-first">
                <div className="h-40 w-40 rounded-[2.5rem] bg-primary-50 text-5xl font-black text-primary-600 flex items-center justify-center ring-12 ring-white shadow-2xl shadow-primary-900/10 overflow-hidden transition-transform hover:scale-105 duration-300">
                  {profile.user.avatarKey
                    ? <img src={getAvatarUrl(profile.user.avatarKey)} alt="" className="h-full w-full object-cover" />
                    : profile.user.fullName.charAt(0)}
                </div>
                {profile.user.isOnline && (
                  <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-4 border-white bg-green-500 shadow-lg" />
                )}
              </div>

              <div className="flex-1 text-center sm:text-right">
                <div className="flex flex-wrap items-center justify-center gap-4 mb-4 sm:justify-start">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter lg:text-5xl">{profile.user.fullName}</h1>
                  <div className="flex gap-2">
                    {profile.isOfficial ? <OfficialBadge /> : profile.isVerified ? <VerifiedBadge /> : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-500 sm:justify-start">
                  {mainSubject && (
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-primary-50 rounded-lg"><BookOpen className="h-5 w-5 text-primary-600" /></div>
                      <span className="font-black text-primary-900 text-lg">{subjectName(mainSubject.subject, locale)}</span>
                    </div>
                  )}
                  {profile.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-base font-bold text-gray-600">{profile.city}</span>
                    </div>
                  )}
                  {profile.avgRating && profile._count.reviews > 0 && (
                    <div className="flex items-center gap-3 bg-yellow-50 px-4 py-1.5 rounded-full border border-yellow-100 shadow-sm">
                      <StarRating rating={profile.avgRating} size="md" />
                      <span className="text-sm font-black text-yellow-700">{profile.avgRating.toFixed(1)} ({profile._count.reviews})</span>
                    </div>
                  )}
                </div>

                <div className="mt-10 grid grid-cols-2 gap-6 sm:flex sm:flex-wrap sm:gap-12">
                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm sm:bg-transparent sm:p-0 sm:border-0 sm:shadow-none">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">{t('students')}</p>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">{profile.studentCount}</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm sm:bg-transparent sm:p-0 sm:border-0 sm:shadow-none">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">{t('experience')}</p>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">{profile.experience || 0} {t('years')}</p>
                  </div>
                  {profile.responseTime && (
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm sm:bg-transparent sm:p-0 sm:border-0 sm:shadow-none">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">{t('responseTime') || 'سرعة الرد'}</p>
                      <p className="text-2xl font-black text-gray-900 tracking-tight">{profile.responseTime}</p>
                    </div>
                  )}
                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm sm:bg-transparent sm:p-0 sm:border-0 sm:shadow-none">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">{t('teachingMode')}</p>
                    <div className="flex gap-1.5 mt-1 justify-center sm:justify-start">
                      {profile.teachingMode === 'ONLINE' || profile.teachingMode === 'BOTH' ? <Badge variant="info" className="text-[10px] font-black">{t('online')}</Badge> : null}
                      {profile.teachingMode === 'IN_PERSON' || profile.teachingMode === 'BOTH' ? <Badge variant="warning" className="text-[10px] font-black">{t('inPerson')}</Badge> : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-12 space-y-20">
              {/* About Section */}
              {profile.bio && (
                <section>
                  <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">{t('about')}</h2>
                  <p className="text-gray-600 leading-[1.8] text-xl whitespace-pre-line max-w-none font-medium">{profile.bio}</p>
                </section>
              )}

              {/* Video Section */}
              {profile.introVideo && (
                <section>
                  <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-50 rounded-2xl flex items-center justify-center"><Video className="h-6 w-6 text-red-600" /></div> {t('introVideo')}
                  </h2>
                  <div className="aspect-video rounded-[3rem] overflow-hidden bg-black shadow-2xl ring-1 ring-gray-100 transition-transform hover:scale-[1.01] duration-500">
                    <iframe src={getYouTubeEmbedUrl(profile.introVideo)} className="h-full w-full" allowFullScreen />
                  </div>
                </section>
              )}

              {/* Subjects & Levels */}
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-50 rounded-2xl flex items-center justify-center"><BookOpen className="h-6 w-6 text-primary-600" /></div> {t('subjects')}
                </h2>
                <div className="grid gap-8 sm:grid-cols-2">
                  {profile.subjects.map((s) => (
                    <div key={s.id} className="group p-8 rounded-[2.5rem] border border-gray-100 bg-white hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-300">
                      <h3 className="font-black text-gray-900 text-2xl group-hover:text-primary-600 transition-colors">{subjectName(s.subject, locale)}</h3>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        {s.levels.map((l) => (
                          <span key={l} className="px-4 py-1.5 bg-gray-50 text-gray-700 rounded-2xl text-xs font-black border border-gray-100 uppercase tracking-widest">{l}</span>
                        ))}
                      </div>
                      {s.price && (
                        <p className="mt-8 text-2xl font-black text-primary-600 flex items-center gap-1">
                          {Number(s.price).toFixed(0)} <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{t('dh')}/H</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Certificates */}
              {certDocs.length > 0 && (
                <section>
                  <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center"><GraduationCap className="h-6 w-6 text-indigo-600" /></div> {t('certificates')}
                  </h2>
                  <div className="grid gap-6">
                    {certDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-6 bg-indigo-50/20 border border-indigo-100 rounded-[2rem] group hover:bg-white hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                            <Award className="h-8 w-8" />
                          </div>
                          <div className="text-right">
                            <p className="font-black text-gray-900 text-xl tracking-tight">{doc.originalName}</p>
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1 opacity-60">{new Date(doc.createdAt).getFullYear()}</p>
                          </div>
                        </div>
                        {doc.isVerified && (
                          <div className="flex items-center gap-2 bg-green-500 px-5 py-2 rounded-full shadow-lg shadow-green-200">
                            <CheckCircle className="h-4 w-4 text-white" />
                            <span className="text-[11px] font-black text-white uppercase tracking-wider">{t('verified')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews */}
              <section id="reviews">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="h-10 w-10 bg-yellow-50 rounded-2xl flex items-center justify-center"><Star className="h-6 w-6 text-yellow-500 fill-yellow-500" /></div> {t('reviews')}
                  </h2>
                  {profile.avgRating && (
                    <div className="flex items-center gap-4 font-black text-gray-900 bg-white px-6 py-4 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5">
                      <span className="text-4xl tracking-tighter leading-none">{profile.avgRating.toFixed(1)}</span>
                      <div className="flex flex-col">
                        <StarRating rating={profile.avgRating} size="md" />
                        <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-1 font-black">{profile._count.reviews} {t('reviews')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {canReview && (
                  <div className="mb-16 p-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-[3rem] border border-primary-200 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Star className="h-32 w-32 fill-current" /></div>
                    <h3 className="font-black text-primary-900 text-2xl text-center sm:text-right">{t('reviewPromptSection')}</h3>
                    <p className="text-primary-700 text-base mt-2 font-bold text-center sm:text-right">{t('reviewCompletedLesson')}</p>
                    <div className="mt-10 flex justify-center gap-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} onClick={() => setReviewRating(i)} className="transition-transform hover:scale-125 active:scale-90 duration-200">
                          <Star className={`h-16 w-16 transition-colors ${i <= reviewRating ? 'fill-yellow-400 text-yellow-400 drop-shadow-2xl' : 'fill-white text-gray-200'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder={t('reviewPlaceholder')} className="mt-10 w-full rounded-[2.5rem] border-0 ring-1 ring-primary-200 px-8 py-6 text-lg font-bold focus:ring-4 focus:ring-primary-500/20 transition-all shadow-sm text-right bg-white/80 backdrop-blur-sm" rows={4} />
                    <Button className="mt-8 w-full h-16 text-xl font-black rounded-3xl shadow-2xl shadow-primary-400/30 transition-all hover:scale-[1.01] active:scale-95" disabled={!reviewRating || reviewing} onClick={submitReview}>
                      {reviewing ? c('loading') : t('submitReview')}
                    </Button>
                  </div>
                )}

                {profile.reviews.length > 0 ? (
                  <div className="space-y-8">
                    {profile.reviews.map((r) => (
                      <div key={r.id} className="p-10 rounded-[2.5rem] bg-white border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500 text-right group">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-primary-50 text-primary-600 flex items-center justify-center font-black text-2xl border border-primary-100 shadow-sm group-hover:rotate-3 transition-transform">
                              {r.student.avatarKey ? <img src={getAvatarUrl(r.student.avatarKey)} alt="" className="h-full w-full rounded-[1.5rem] object-cover" /> : r.student.fullName.charAt(0)}
                            </div>
                            <div className="text-right">
                              <p className="font-black text-gray-900 text-xl leading-tight tracking-tight">{r.student.fullName}</p>
                              <div className="flex items-center gap-3 mt-2 justify-end">
                                <StarRating rating={r.rating} size="sm" />
                                <span className="text-[10px] font-black text-green-600 uppercase bg-green-50 px-3 py-1 rounded-full border border-green-100">{t('verifiedLesson')}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest opacity-60">
                            {new Date(r.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'ar-MA', { year: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        {r.comment && <p className="text-gray-600 text-lg leading-relaxed italic border-r-4 border-primary-100 pr-8 mr-1 font-medium">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
                    <Star className="h-20 w-20 text-gray-200 mx-auto mb-6 opacity-30 animate-pulse" />
                    <p className="text-gray-400 font-black text-2xl tracking-tight">{t('noReviewsYet')}</p>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="mt-12 lg:mt-0 lg:w-[400px] lg:shrink-0">
            <div className="space-y-10 lg:sticky lg:top-32">
              <div className="p-10 rounded-[3rem] bg-white border border-gray-100 shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100">
                {profile.price && (
                  <div className="mb-12 text-center p-10 rounded-[2.5rem] bg-primary-600 text-white shadow-2xl shadow-primary-600/40 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-[10px] font-black opacity-70 uppercase tracking-[0.3em] mb-3">{t('startingFrom') || 'ابتداءً من'}</p>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-7xl font-black tracking-tighter leading-none">{Number(profile.price).toFixed(0)}</span>
                      <span className="text-2xl font-black opacity-90">{t('dh')}/H</span>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  <Button className="w-full h-18 text-2xl font-black rounded-3xl shadow-2xl shadow-primary-300/40 transition-all hover:scale-[1.02] active:scale-95 py-8" onClick={() => { if (!user) router.push('/login'); else router.push(`/chat`); }}>
                    <MessageSquare className="ml-4 h-7 w-7" /> {t('messageTeacher')}
                  </Button>
                  <Button variant="outline" className="w-full h-18 text-2xl font-black rounded-3xl border-[5px] border-primary-600 text-primary-600 hover:bg-primary-50 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-gray-100 py-8" onClick={() => { if (!user) router.push('/login'); else setShowBooking(true); }}>
                    <Zap className="ml-4 h-7 w-7 fill-current" /> {t('reserveLesson')}
                  </Button>

                  {user && user.role === 'STUDENT' && (
                    <button onClick={toggleFav} disabled={toggling} className={`group flex w-full items-center justify-center gap-4 py-6 px-8 text-lg font-black rounded-3xl transition-all duration-300 ${faved ? 'bg-red-50 text-red-600 border border-red-100 shadow-inner scale-[0.98]' : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 border border-transparent'}`}>
                      {faved ? <HeartOff className="h-7 w-7 fill-current animate-pulse" /> : <Heart className="h-7 w-7 group-hover:fill-current transition-colors" />}
                      {faved ? t('removeFromFavorites') : t('saveToFavorites')}
                    </button>
                  )}

                  <div className="flex gap-4 mt-8 pt-8 border-t border-gray-100">
                    <button onClick={() => {
                      if (typeof navigator.share === 'function') {
                        navigator.share({ title: profile.user.fullName, url: window.location.href }).catch(() => {});
                      } else {
                        const ta = document.createElement('textarea');
                        ta.value = window.location.href; ta.style.position = 'fixed'; ta.style.opacity = '0';
                        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                      }
                      setShareDone(true); setTimeout(() => setShareDone(false), 2000);
                    }} className="flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-base font-black text-gray-600 hover:bg-white hover:shadow-xl transition-all duration-300">
                      <Share2 className="h-6 w-6" /> {shareDone ? t('shareSuccess') : t('share')}
                    </button>
                    {user && user.role === 'STUDENT' && (
                      <button onClick={() => setShowReport(true)} className="flex items-center justify-center gap-2 p-5 rounded-2xl border-2 border-red-100 bg-red-50/30 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm duration-300">
                        <Flag className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Availability */}
              {profile.availability.length > 0 && (
                <div className="p-10 rounded-[3rem] bg-white border border-gray-100 shadow-xl shadow-gray-900/5">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center justify-center sm:justify-start gap-3">
                    <div className="h-8 w-8 bg-primary-50 rounded-xl flex items-center justify-center"><Calendar className="h-5 w-5 text-primary-500" /></div> {t('availability')}
                  </h3>
                  <div className="space-y-4">
                    {daysAvail.days.filter((d) => d.slots.length > 0).map((d) => (
                      <div key={d.index} className="flex items-center justify-between text-base py-4 border-b border-gray-50 last:border-0 group">
                        <span className="font-black text-gray-700 group-hover:text-primary-600 transition-colors">{d.name}</span>
                        <span className="text-gray-500 font-bold bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 shadow-sm">{d.slots.map((s) => `${s.startTime}-${s.endTime}`).join('، ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(profile.facebookUrl || profile.instagramUrl || profile.linkedinUrl || profile.youtubeUrl || profile.websiteUrl) && (
                <div className="flex flex-wrap justify-center gap-5 px-6 pb-12">
                  {profile.facebookUrl && <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all hover:scale-110 shadow-lg shadow-blue-900/5"><ExternalLink className="h-6 w-6" /></a>}
                  {profile.instagramUrl && <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-pink-50 text-pink-600 hover:bg-gradient-to-br hover:from-purple-600 hover:to-orange-500 hover:text-white transition-all hover:scale-110 shadow-lg shadow-pink-900/5"><ExternalLink className="h-6 w-6" /></a>}
                  {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-800 hover:text-white transition-all hover:scale-110 shadow-lg shadow-blue-900/10"><ExternalLink className="h-6 w-6" /></a>}
                  {profile.youtubeUrl && <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all hover:scale-110 shadow-lg shadow-red-900/5"><ExternalLink className="h-6 w-6" /></a>}
                  {profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-900 hover:text-white transition-all hover:scale-110 shadow-lg shadow-gray-900/5"><Globe className="h-6 w-6" /></a>}
                </div>
              )}
            </div>
          </aside>
        </div>

        {showBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 animate-in fade-in duration-500">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[4rem] bg-white p-12 shadow-[0_40px_100px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-500 text-right relative">
              <div className="mb-12 flex items-center justify-between">
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{t('reserveLesson')}</h3>
                <button onClick={() => setShowBooking(false)} className="h-14 w-14 flex items-center justify-center rounded-[1.5rem] bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300">
                  <X className="h-8 w-8" />
                </button>
              </div>
              <div className="space-y-10">
                <div>
                  <label className="mb-4 block text-xs font-black text-gray-400 uppercase tracking-[0.3em]">{t('chooseSubject')}</label>
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full rounded-[2rem] border-[3px] border-gray-100 px-8 py-6 text-xl font-black focus:border-primary-500 focus:ring-0 transition-all outline-none text-right bg-gray-50/50">
                    <option value="">{t('chooseSubject')}</option>
                    {profile.subjects.map((s) => (
                      <option key={s.id} value={s.subject.id}>{subjectName(s.subject, locale)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-4 block text-xs font-black text-gray-400 uppercase tracking-[0.3em]">{t('date')}</label>
                  <div className="grid grid-cols-5 gap-4">
                    {dateOptions.map((opt) => (
                      <button key={opt.dateStr} onClick={() => { setSelectedDate(opt.dateStr); setSelectedTime(opt.slots[0]?.startTime || ''); }}
                        className={`rounded-[2rem] border-[3px] py-6 text-center transition-all duration-300 ${selectedDate === opt.dateStr ? 'border-primary-600 bg-primary-600 text-white shadow-2xl shadow-primary-600/30 scale-[1.05]' : 'border-gray-100 hover:bg-gray-50 text-gray-400'}`}>
                        <span className="block text-xs font-black uppercase tracking-tighter opacity-60 mb-1">{opt.dayName}</span>
                        <span className="block text-2xl font-black">{opt.dayNum}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {selectedDate && (() => {
                  const slots = dateOptions.find((o) => o.dateStr === selectedDate)?.slots || [];
                  return (
                    <div>
                      <label className="mb-4 block text-xs font-black text-gray-400 uppercase tracking-[0.3em]">{t('time')}</label>
                      <div className="flex flex-wrap gap-4 justify-end">
                        {slots.map((s) => (
                          <button key={`${s.startTime}-${s.endTime}`} onClick={() => setSelectedTime(s.startTime)}
                            className={`rounded-2xl border-[3px] px-8 py-4 text-lg font-black transition-all duration-300 ${selectedTime === s.startTime ? 'border-primary-600 bg-primary-600 text-white shadow-xl shadow-primary-600/30' : 'border-gray-100 hover:border-primary-200 text-gray-500 hover:text-primary-600'}`}>
                            {s.startTime} - {s.endTime}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <div>
                  <label className="mb-4 block text-xs font-black text-gray-400 uppercase tracking-[0.3em]">{t('teachingMode')}</label>
                  <div className="flex gap-6">
                    <label className="flex-1 flex items-center justify-center gap-4 border-[3px] border-gray-100 rounded-3xl py-6 px-8 cursor-pointer hover:bg-gray-50 transition-all duration-300 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700 has-[:checked]:scale-[1.02]">
                      <input type="radio" name="lessonType" value="ONLINE" checked={lessonType === 'ONLINE'} onChange={() => setLessonType('ONLINE')} className="hidden" />
                      <Video className="h-7 w-7" />
                      <span className="font-black text-lg">{t('online')}</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-4 border-[3px] border-gray-100 rounded-3xl py-6 px-8 cursor-pointer hover:bg-gray-50 transition-all duration-300 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700 has-[:checked]:scale-[1.02]">
                      <input type="radio" name="lessonType" value="IN_PERSON" checked={lessonType === 'IN_PERSON'} onChange={() => setLessonType('IN_PERSON')} className="hidden" />
                      <MapPin className="h-7 w-7" />
                      <span className="font-black text-lg">{t('inPerson')}</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="mb-4 block text-xs font-black text-gray-400 uppercase tracking-[0.3em]">{t('message')}</label>
                  <textarea value={bookingMsg} onChange={(e) => setBookingMsg(e.target.value)} placeholder={t('messagePlaceholder')} className="w-full rounded-[2.5rem] border-[3px] border-gray-100 px-8 py-6 text-xl font-bold focus:border-primary-500 focus:ring-0 transition-all outline-none shadow-inner text-right bg-gray-50/50" rows={4} />
                </div>
                <Button className="w-full h-20 text-2xl font-black rounded-[2rem] shadow-[0_20px_60px_rgba(var(--primary-600-rgb),0.3)] transition-all hover:scale-[1.01] active:scale-95 mt-4" onClick={async () => {
                  if (!selectedSubject) return;
                  setSending(true);
                  const res = await apiRequest('/requests', {
                    method: 'POST',
                    body: JSON.stringify({
                      teacherId: profile.userId,
                      subjectId: selectedSubject,
                      message: bookingMsg,
                      lessonType,
                      bookedDate: selectedDate,
                      bookedTime: selectedTime,
                    }),
                  });
                  setSending(false);
                  if (res.success) { setShowBooking(false); setBookingMsg(''); }
                }} disabled={sending || !selectedSubject || !selectedDate || !selectedTime}>
                  {sending ? c('loading') : t('sendRequest')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <div className="mt-32 border-t-8 border-gray-50 pt-24">
            <h2 className="mb-12 text-4xl font-black text-gray-900 tracking-tighter">{t('similarTeachers')}</h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((tch: any) => (
                <button key={tch.id} onClick={() => router.push(`/teachers/${tch.id}`)} className="group p-10 rounded-[3rem] border border-gray-100 bg-white text-right transition-all duration-500 hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-900/10 hover:-translate-y-2">
                  <div className="flex items-center gap-6 mb-6 justify-end">
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-xl group-hover:text-primary-600 transition-colors tracking-tight">{tch.fullName}</p>
                      {tch.subjects?.[0] && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{subjectName(tch.subjects[0], locale)}</p>}
                    </div>
                    <div className="h-16 w-16 rounded-[1.5rem] bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm">
                      {tch.avatarKey ? <img src={getAvatarUrl(tch.avatarKey)} alt="" className="h-full w-full rounded-[1.5rem] object-cover" /> : (tch.fullName || 'T').charAt(0)}
                    </div>
                  </div>
                  {tch.price && (
                    <p className="mt-6 text-2xl font-black text-primary-600 flex items-center gap-1.5 justify-end">
                      {Number(tch.price).toFixed(0)} <span className="text-xs text-gray-400 tracking-widest uppercase opacity-60">{t('dh')}/H</span>
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-gray-100 bg-white/90 backdrop-blur-xl p-5 lg:hidden shadow-[0_-20px_60px_rgba(0,0,0,0.1)]">
        <div className="mx-auto flex max-w-lg items-center gap-5">
          <div className="shrink-0 flex flex-col items-center px-6 border-l-2 border-gray-100">
            <span className="text-3xl font-black text-primary-600 leading-none tracking-tighter">{Number(profile.price).toFixed(0)}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('dh')}/H</span>
          </div>
          <Button className="flex-1 h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary-500/20" onClick={() => { if (!user) router.push('/login'); else router.push(`/chat`); }}>
            <MessageSquare className="ml-3 h-6 w-6" /> {t('messageTeacher')}
          </Button>
          <button onClick={() => { if (!user) router.push('/login'); else setShowBooking(true); }} className="h-16 w-16 flex items-center justify-center rounded-2xl bg-primary-50 text-primary-600 shadow-inner active:scale-90 transition-transform">
            <Zap className="h-8 w-8 fill-current" />
          </button>
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg rounded-[3.5rem] bg-white p-12 shadow-[0_40px_100px_rgba(0,0,0,0.3)] animate-in zoom-in-95 text-right relative">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{t('reportTitle')}</h3>
              <button onClick={() => { setShowReport(false); setReportDone(false); }} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"><X className="h-7 w-7" /></button>
            </div>
            {reportDone ? (
              <div className="text-center py-10">
                <div className="h-20 w-20 bg-green-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><CheckCircle className="h-10 w-10 text-green-600" /></div>
                <p className="text-2xl font-black text-gray-900">{t('reportSuccess')}</p>
              </div>
            ) : (
              <>
                <label className="mb-4 block text-xs font-black text-gray-400 uppercase tracking-widest">{t('reason') || 'السبب'}</label>
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full rounded-[2rem] border-[3px] border-gray-100 px-8 py-6 text-xl font-black focus:border-red-500 focus:ring-0 outline-none mb-8 text-right bg-gray-50/50">
                  <option value="fake">{t('reportReasons.fake')}</option>
                  <option value="wrong">{t('reportReasons.wrong')}</option>
                  <option value="harassment">{t('reportReasons.harassment')}</option>
                  <option value="spam">{t('reportReasons.spam')}</option>
                  <option value="other">{t('reportReasons.other')}</option>
                </select>
                <label className="mb-4 block text-xs font-black text-gray-400 uppercase tracking-widest">{t('reportDescription')}</label>
                <textarea value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} placeholder={t('reportDescription')} className="w-full rounded-[2rem] border-[3px] border-gray-100 px-8 py-6 text-xl font-bold focus:border-red-500 outline-none mb-8 text-right bg-gray-50/50 shadow-inner" rows={4} />
                {reportError && <p className="mb-6 text-base font-black text-red-600 flex items-center gap-2 justify-end"><X className="h-5 w-5" /> {reportError}</p>}
                <Button className="w-full h-18 text-2xl font-black rounded-3xl bg-red-600 hover:bg-red-700 shadow-2xl shadow-red-500/30 transition-all hover:scale-[1.01] active:scale-95" onClick={async () => {
                  setReporting(true); setReportError('');
                  try {
                    const res = await apiRequest(`/teachers/${id}/report`, {
                      method: 'POST', body: JSON.stringify({ reason: reportReason, description: reportDesc }),
                    });
                    if (res.success) setReportDone(true);
                    else setReportError((res as any).message || (res as any).error || c('error'));
                  } catch { setReportError(c('error')); }
                  setReporting(false);
                }} disabled={reporting}>
                  {reporting ? c('loading') : t('report')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="pb-32 lg:pb-0">
        <Footer />
      </div>
    </>
  );
}
