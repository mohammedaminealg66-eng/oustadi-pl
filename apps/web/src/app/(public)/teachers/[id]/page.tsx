'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { subjectName } from '@/lib/subject';
import { getAvatarUrl, getYouTubeEmbedUrl } from '@/lib/asset';
import { useAuth } from '@/providers/auth-provider';

import { Footer } from '@/components/layout/footer';
import { Button, Card, CardContent, Badge, Skeleton, cn } from '@oustadi/ui';
import { OfficialBadge, VerifiedBadge } from '@/components/teacher/status-badges';
import { SocialLinks } from '@/components/teacher/social-links';
import {
  MapPin, BookOpen, Clock, Award, Heart, HeartOff, Star, MessageSquare,
  GraduationCap, Video, CheckCircle, Users, Zap, Calendar, ChevronLeft,
  Flag, Share2, ExternalLink, Globe, X, Plus, Play, ShieldCheck,
  TrendingUp, ArrowRight, Award as AwardIcon, MoreHorizontal
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
  tiktokUrl: string | null; twitterUrl: string | null; telegramUrl: string | null;
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
  const d = useTranslations('dashboard');
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [faved, setFaved] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [shareDone, setShareDone] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

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

  const daysAvail = useMemo(() => {
    const d = profile?.availability ?? [];
    const days = Array.from({ length: 7 }, (_, i) => ({
      index: i, name: dn[i],
      slots: d.filter((s) => s.dayOfWeek === i),
    }));
    return { days };
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

  if (loading) return <ProfileSkeleton locale={locale} />;
  if (!profile) return <div className="py-32 text-center font-black text-2xl text-gray-400">{t('notFound')}</div>;

  const mainSubject = profile.subjects[0];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Cinematic Hero Section */}
      <section className="relative">
        <div className="h-64 w-full bg-gradient-to-r from-gray-900 via-primary-900 to-gray-900 lg:h-96">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
           <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>
        
        <div className="mx-auto max-w-6xl px-4 -mt-24 lg:-mt-32">
           <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <div className="relative group">
                 <div className="h-48 w-48 rounded-[3.5rem] bg-white p-2 shadow-2xl transition-transform duration-500 group-hover:scale-105 lg:h-64 lg:w-64">
                    <div className="h-full w-full overflow-hidden rounded-[3rem] bg-gray-100 flex items-center justify-center font-black text-gray-300 text-6xl">
                       {profile.user.avatarKey 
                         ? <img src={getAvatarUrl(profile.user.avatarKey)} alt="" className="h-full w-full object-cover" />
                         : profile.user.fullName.charAt(0)
                       }
                    </div>
                 </div>
                 {profile.user.isOnline && (
                   <span className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-8 border-white bg-green-500 shadow-lg" />
                 )}
              </div>

              <div className="flex-1 text-center lg:text-right pb-4">
                 <div className="flex flex-wrap items-center justify-center gap-4 mb-4 lg:justify-start flex-row-reverse lg:flex-row">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter lg:text-6xl">{profile.user.fullName}</h1>
                    <div className="flex gap-2">
                       {profile.isOfficial ? <OfficialBadge /> : profile.isVerified ? <VerifiedBadge /> : null}
                    </div>
                 </div>
                 <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 lg:justify-start text-lg font-medium flex-row-reverse lg:flex-row">
                    {mainSubject && (
                      <div className="flex items-center gap-2">
                         <BookOpen className="h-5 w-5 text-primary-600" />
                         <span className="font-black text-gray-900">{subjectName(mainSubject.subject, locale)}</span>
                      </div>
                    )}
                    {profile.city && (
                      <div className="flex items-center gap-2">
                         <MapPin className="h-5 w-5" />
                         <span>{profile.city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-yellow-50 px-4 py-1.5 rounded-full border border-yellow-100">
                       <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                       <span className="font-black text-yellow-700">{profile.avgRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-3 mb-4">
                 <Button 
                   variant="outline" 
                   className={cn("h-14 w-14 rounded-2xl border-gray-200 shadow-xl shadow-gray-900/5", faved && "bg-red-50 border-red-100 text-red-600")}
                   onClick={() => !toggling && toggleFav()}
                   disabled={toggling}
                 >
                    {faved ? <Heart className="h-6 w-6 fill-current" /> : <Heart className="h-6 w-6" />}
                 </Button>
                 <Button className="h-14 rounded-2xl px-10 font-black text-lg shadow-2xl shadow-primary-900/20 lg:hidden">
                    {t('bookSession')}
                 </Button>
              </div>
           </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-16 lg:grid-cols-3">
          {/* 2. Main Content Column */}
          <div className="lg:col-span-2 space-y-24 order-2 lg:order-1">
             
             {/* Stats Strip */}
             <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 text-center group hover:bg-white hover:shadow-2xl transition-all">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t('students')}</p>
                   <p className="text-3xl font-black text-gray-900">{profile.studentCount}</p>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 text-center group hover:bg-white hover:shadow-2xl transition-all">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t('experience')}</p>
                   <p className="text-3xl font-black text-gray-900">{profile.experience || 0} {t('years')}</p>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 text-center group hover:bg-white hover:shadow-2xl transition-all">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t('responseTime')}</p>
                   <p className="text-3xl font-black text-gray-900">{profile.responseTime || '1h'}</p>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 text-center group hover:bg-white hover:shadow-2xl transition-all">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t('completedLessons')}</p>
                   <p className="text-3xl font-black text-gray-900">124</p>
                </div>
             </div>

             {/* About & Social */}
             <section className="space-y-10">
                <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                   <div className="flex-1 space-y-6">
                      <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('about')}</h2>
                      <p className="text-xl font-medium text-gray-600 leading-[1.8] whitespace-pre-line">
                         {profile.bio}
                      </p>
                   </div>
                   <div className="md:w-48 shrink-0">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">{t('socialLinks')}</h3>
                      <SocialLinks 
                        links={{
                          facebook: profile.facebookUrl,
                          instagram: profile.instagramUrl,
                          linkedin: profile.linkedinUrl,
                          youtube: profile.youtubeUrl,
                          tiktok: profile.tiktokUrl,
                          twitter: profile.twitterUrl,
                          telegram: profile.telegramUrl,
                          website: profile.websiteUrl,
                        }} 
                      />
                   </div>
                </div>
             </section>

             {/* Featured Content / Video */}
             {profile.introVideo && (
               <section className="space-y-10">
                  <h2 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-4">
                     <div className="h-10 w-10 rounded-2xl bg-red-50 flex items-center justify-center"><Video className="h-5 w-5 text-red-600" /></div>
                     {t('introVideo')}
                  </h2>
                  <div className="aspect-video rounded-[3rem] overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-gray-100">
                     <iframe src={getYouTubeEmbedUrl(profile.introVideo)} className="h-full w-full" allowFullScreen />
                  </div>
               </section>
             )}

             {/* Subjects Cards */}
             <section className="space-y-10">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-2xl bg-primary-50 flex items-center justify-center"><BookOpen className="h-5 w-5 text-primary-600" /></div>
                   {t('subjects')}
                </h2>
                <div className="grid gap-8 sm:grid-cols-2">
                   {profile.subjects.map((s) => (
                     <Card key={s.id} className="group border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100 transition-all hover:ring-primary-100 hover:shadow-2xl">
                        <CardContent className="p-8">
                           <h3 className="text-2xl font-black text-gray-900 mb-4">{subjectName(s.subject, locale)}</h3>
                           <div className="flex flex-wrap gap-2 mb-8">
                              {s.levels.map((l) => (
                                <Badge key={l} className="bg-gray-50 text-gray-600 border-none font-black text-[10px] py-1.5 uppercase tracking-widest">{l}</Badge>
                              ))}
                           </div>
                           <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('price')}</span>
                              <p className="text-3xl font-black text-primary-600">{s.price || profile.price} <span className="text-xs text-gray-400">{t('dh')}/H</span></p>
                           </div>
                        </CardContent>
                     </Card>
                   ))}
                </div>
             </section>

             {/* Testimonials / Reviews */}
             <section className="space-y-10">
                <div className="flex items-center justify-between">
                   <h2 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-yellow-50 flex items-center justify-center"><Star className="h-5 w-5 text-yellow-500 fill-yellow-500" /></div>
                      {t('studentTestimonials')}
                   </h2>
                   <Button variant="ghost" className="font-black text-primary-600">{c('viewAll')}</Button>
                </div>

                <div className="grid gap-6">
                   {profile.reviews.slice(0, 3).map((review) => (
                     <div key={review.id} className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 relative group transition-all hover:bg-white hover:shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm">
                              {review.student.avatarKey 
                                ? <img src={getAvatarUrl(review.student.avatarKey)} alt="" className="h-full w-full object-cover" />
                                : <div className="h-full w-full flex items-center justify-center font-black bg-primary-50 text-primary-600">{review.student.fullName.charAt(0)}</div>
                              }
                           </div>
                           <div>
                              <p className="font-black text-gray-900">{review.student.fullName}</p>
                              <StarRating rating={review.rating} size="sm" />
                           </div>
                           <div className="ml-auto hidden sm:block">
                              <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]">Verified Lesson</Badge>
                           </div>
                        </div>
                        <p className="text-lg font-medium text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                     </div>
                   ))}
                </div>
             </section>
          </div>

          {/* 3. Sidebar Booking Column */}
          <div className="space-y-8 order-1 lg:order-2">
             <Card className="sticky top-10 border-none bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] ring-1 ring-gray-100 rounded-[3rem] overflow-hidden">
                <CardContent className="p-0">
                   {/* Header of widget */}
                   <div className="bg-gray-900 p-8 text-white">
                      <div className="flex items-center justify-between mb-4 text-right flex-row-reverse">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('price')}</span>
                         <Badge className="bg-primary-600 text-white border-none font-black">-15% {locale === 'fr' ? 'Promo' : 'خصم'}</Badge>
                      </div>
                      <div className="flex items-baseline gap-2 justify-end">
                         <h4 className="text-5xl font-black">{profile.price || 150}</h4>
                         <span className="text-xl font-bold text-gray-400">{t('dh')}/H</span>
                      </div>
                   </div>

                   {/* Booking Form Mini */}
                   <div className="p-8 space-y-8">
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block text-right">{t('availability')}</label>
                         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 flex-row-reverse">
                            {dateOptions.slice(0, 5).map((opt) => (
                              <button key={opt.dateStr} className="flex flex-col items-center gap-1 min-w-[64px] p-3 rounded-2xl border border-gray-100 bg-gray-50 hover:border-primary-500 transition-all active:scale-90 group">
                                 <span className="text-[10px] font-black text-gray-400 group-hover:text-primary-600 uppercase">{opt.dayName}</span>
                                 <span className="text-lg font-black text-gray-900 group-hover:text-primary-600">{opt.dayNum}</span>
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4">
                         <Button className="w-full h-16 rounded-2xl font-black text-xl shadow-2xl shadow-primary-900/20 transition-all hover:scale-[1.02]">
                            {t('reserveLesson')}
                         </Button>
                         <Button variant="outline" className="w-full h-16 rounded-2xl font-black text-lg border-2 hover:bg-gray-50">
                            <MessageSquare className="mr-2 h-5 w-5" />
                            {t('messageTeacher')}
                         </Button>
                      </div>

                      {/* Trust Indicators */}
                      <div className="pt-8 border-t border-gray-50 space-y-4">
                         <div className="flex items-center gap-3 text-right flex-row-reverse">
                            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center"><ShieldCheck className="h-4 w-4 text-emerald-600" /></div>
                            <div className="flex-1">
                               <p className="text-xs font-black text-gray-900 leading-none">{t('guarantee')}</p>
                               <p className="text-[10px] text-gray-400 mt-1 font-medium">{t('guaranteeDesc')}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 text-right flex-row-reverse">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-blue-600" /></div>
                            <div className="flex-1">
                               <p className="text-xs font-black text-gray-900 leading-none">{t('responseFast')}</p>
                               <p className="text-[10px] text-gray-400 mt-1 font-medium">{locale === 'fr' ? 'Moins de 2h en moyenne' : 'أقل من ساعتين في المتوسط'}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>

             {/* Secondary Actions Sidebar */}
             <div className="p-8 space-y-6">
                <Button variant="ghost" className="w-full justify-start text-gray-500 font-black h-12 rounded-xl hover:text-gray-900 group flex-row-reverse">
                   <Share2 className="ml-4 h-5 w-5 group-hover:text-primary-600" /> {t('shareProfile')}
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-500 font-black h-12 rounded-xl hover:text-red-600 group flex-row-reverse">
                   <Flag className="ml-4 h-5 w-5 group-hover:text-red-600" /> {t('reportProfile')}
                </Button>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ProfileSkeleton({ locale }: { locale: string }) {
  return (
    <div className="animate-pulse space-y-12">
       <div className="h-64 bg-gray-100 lg:h-96" />
       <div className="mx-auto max-w-6xl px-4 -mt-24 lg:-mt-32 flex flex-col gap-10">
          <div className="h-48 w-48 rounded-[3.5rem] bg-gray-200 lg:h-64 lg:w-64" />
          <div className="flex-1 space-y-4">
             <Skeleton className="h-12 w-64 rounded-xl" />
             <Skeleton className="h-6 w-48 rounded-xl" />
          </div>
       </div>
       <div className="mx-auto max-w-6xl px-4 grid gap-16 lg:grid-cols-3 py-16">
          <div className="lg:col-span-2 space-y-12">
             <div className="grid grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-[2.5rem]" />)}
             </div>
             <Skeleton className="h-64 rounded-[3.5rem]" />
             <Skeleton className="h-96 rounded-[3.5rem]" />
          </div>
          <Skeleton className="h-[600px] rounded-[3rem]" />
       </div>
    </div>
  );
}
