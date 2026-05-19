'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { subjectName } from '@/lib/subject';
import { Button, Card, CardContent } from '@oustadi/ui';
import {
  Save, Camera, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle, Clock,
  BookOpen, Award, GraduationCap, Video, Calendar, Eye, Upload, X,
} from 'lucide-react';

const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const dayNamesFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

type Section = 'basic' | 'subjects' | 'experience' | 'certificates' | 'video' | 'availability';

export default function TeacherProfile() {
  const locale = useLocale();
  const dn = locale === 'fr' ? dayNamesFr : dayNames;
  const d = useTranslations('dashboard');
  const t = useTranslations('teacher');
  const c = useTranslations('common');

  const [profile, setProfile] = useState<any>(null);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openSection, setOpenSection] = useState<Section>('basic');

  const [form, setForm] = useState({ city: '', price: '', teachingMode: 'BOTH', bio: '', introVideo: '' });
  const [newExp, setNewExp] = useState({ institution: '', position: '', duration: '' });
  const [addingSubj, setAddingSubj] = useState({ subjectId: '', levels: [] as string[], price: '' });
  const [availForm, setAvailForm] = useState<Record<number, { enabled: boolean; start: string; end: string }>>({});
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchProfile = useCallback(async () => {
    const res = await apiRequest('/users/me');
    if (res.success && res.data) {
      setProfile(res.data);
      const tp = res.data.teacherProfile;
      setForm({
        city: tp?.city || '',
        price: tp?.price ? String(tp.price) : '',
        teachingMode: tp?.teachingMode || 'BOTH',
        bio: tp?.bio || '',
        introVideo: tp?.introVideo || '',
      });
      const av: Record<number, { enabled: boolean; start: string; end: string }> = {};
      for (let i = 0; i < 7; i++) av[i] = { enabled: false, start: '09:00', end: '17:00' };
      tp?.availability?.forEach((s: any) => { av[s.dayOfWeek] = { enabled: true, start: s.startTime, end: s.endTime }; });
      setAvailForm(av);
    }
  }, []);

  useEffect(() => { fetchProfile(); apiRequest('/subjects', { skipAuth: true }).then((r) => { if (r.success) setAllSubjects(r.data); }); }, [fetchProfile]);

  const tp = profile?.teacherProfile;
  const subjects = tp?.subjects || [];
  const existingIds = new Set(subjects.map((s: any) => s.subjectId));
  const available = allSubjects.filter((s: any) => !existingIds.has(s.id));
  const certs = tp?.documents?.filter((d: any) => d.type === 'certificate') || [];
  const workExps = tp?.workExperiences || [];
  const reviews = tp?.reviews || [];

  const completion = useMemo(() => {
    let pct = 0;
    if (profile?.avatarKey) pct += 15;
    if (tp?.bio) pct += 15;
    if (subjects.length > 0) pct += 10;
    if (tp?.availability?.length > 0) pct += 10;
    if (certs.some((c: any) => c.isVerified)) pct += 20;
    if (tp?.introVideo) pct += 10;
    if (reviews.length > 0) pct += 20;
    return { pct, items: [
      { label: d('completionPhoto'), done: !!profile?.avatarKey, pct: 15 },
      { label: d('completionBio'), done: !!tp?.bio, pct: 15 },
      { label: d('completionSubjects'), done: subjects.length > 0, pct: 10 },
      { label: d('completionAvailability'), done: (tp?.availability?.length || 0) > 0, pct: 10 },
      { label: d('completionCertificate'), done: certs.some((c: any) => c.isVerified), pct: 20 },
      { label: d('completionVideo'), done: !!tp?.introVideo, pct: 10 },
      { label: d('completionReviews'), done: reviews.length > 0, pct: 20 },
    ] };
  }, [profile, tp, subjects, certs, reviews]);

  async function saveProfile() {
    setSaving(true); setSaved(false);
    await apiRequest('/teachers/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        city: form.city, price: form.price ? parseFloat(form.price) : null,
        teachingMode: form.teachingMode, bio: form.bio, introVideo: form.introVideo,
      }),
    });
    await apiRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ city: form.city, fullName: profile.fullName, phone: profile.phone }),
    });
    await fetchProfile();
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function addSubject() {
    if (!addingSubj.subjectId) return;
    await apiRequest('/teachers/subjects', {
      method: 'POST',
      body: JSON.stringify({ subjectId: addingSubj.subjectId, levels: addingSubj.levels, price: addingSubj.price ? parseFloat(addingSubj.price) : null }),
    });
    setAddingSubj({ subjectId: '', levels: [], price: '' });
    await fetchProfile();
  }

  async function removeSubject(id: string) {
    await apiRequest(`/teachers/subjects/${id}`, { method: 'DELETE' });
    await fetchProfile();
  }

  async function addExperience() {
    if (!newExp.institution || !newExp.position) return;
    await apiRequest('/teachers/experience', { method: 'POST', body: JSON.stringify(newExp) });
    setNewExp({ institution: '', position: '', duration: '' });
    await fetchProfile();
  }

  async function removeExperience(id: string) {
    await apiRequest(`/teachers/experience/${id}`, { method: 'DELETE' });
    await fetchProfile();
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { alert(d('invalidImageType')); return; }
    if (file.size > 5 * 1024 * 1024) { alert(d('maxFileSize')); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiRequest('/upload/avatar', { method: 'POST', body: fd, skipAuth: false, headers: {} as any });
    setUploading(false);
    if (res.success) await fetchProfile();
  }

  async function uploadCert(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    await apiRequest('/upload/document', { method: 'POST', body: fd, skipAuth: false, headers: {} as any });
    setUploading(false);
    await fetchProfile();
  }

  function toggleLevel(subjectId: string, level: string) {
    setAddingSubj((prev) => ({
      ...prev,
      levels: prev.levels.includes(level) ? prev.levels.filter((l) => l !== level) : [...prev.levels, level],
    }));
  }

  function toggleAvail(day: number) {
    setAvailForm((prev) => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }));
  }

  async function saveAvailability() {
    for (const slot of tp?.availability || []) {
      await apiRequest(`/teachers/availability/${slot.id}`, { method: 'DELETE' });
    }
    for (let i = 0; i < 7; i++) {
      if (availForm[i]?.enabled) {
        await apiRequest('/teachers/availability', {
          method: 'POST',
          body: JSON.stringify({ dayOfWeek: i, startTime: availForm[i].start, endTime: availForm[i].end }),
        });
      }
    }
    await fetchProfile();
  }

  const Section = ({ id, title, icon: Icon, children }: { id: Section; title: string; icon: any; children: React.ReactNode }) => {
    const open = openSection === id;
    return (
      <Card className="mt-6">
        <button onClick={() => setOpenSection(open ? '' as Section : id)} className="flex w-full items-center justify-between px-6 py-4 text-right">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          {open ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </button>
        {open && <CardContent className="border-t px-6 py-5">{children}</CardContent>}
      </Card>
    );
  };

  if (!profile) return <div className="text-center text-gray-500 py-16">{c('loading')}</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{d('myProfile')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/teachers/${tp?.id}`, '_blank')}>
            <Eye className="ml-1 h-4 w-4" /> {d('previewProfile')}
          </Button>
          <Button size="sm" onClick={saveProfile} disabled={saving}>
            <Save className="ml-1 h-4 w-4" />           {saving ? d('saving') : d('save')}
          </Button>
          {saved && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {d('savedSuccess')}</span>}
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{d('profileCompletion')}: {completion.pct}%</span>
            <span className="text-xs text-gray-400">{completion.items.filter((i) => i.done).length}/{completion.items.length}</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${completion.pct}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 sm:grid-cols-4 lg:grid-cols-7">
            {completion.items.map((item) => (
              <span key={item.label} className={`flex items-center gap-1 ${item.done ? 'text-green-600' : 'text-gray-400'}`}>
                {item.done ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                {item.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Section id="basic" title={d('basicInfo')} icon={Camera}>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col items-center gap-3 lg:w-40">
            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-3xl font-bold text-primary-600 ring-4 ring-primary-50">
              {profile.avatarKey
                ? <img src={profile.avatarKey} alt="" className="h-full w-full object-cover" />
                : profile.fullName?.charAt(0)}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white opacity-0 transition hover:opacity-100">
                <Camera className="h-6 w-6" />
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
            <span className="text-xs text-gray-400">{d('clickToUpload')}</span>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{d('fullName')}</label>
                <input value={profile.fullName} onChange={(e) => setProfile((p: any) => ({ ...p, fullName: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('city')}</label>
                <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{d('phone')}</label>
                <input value={profile.phone || ''} onChange={(e) => setProfile((p: any) => ({ ...p, phone: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('teachingMode')}</label>
                <select value={form.teachingMode} onChange={(e) => setForm((f) => ({ ...f, teachingMode: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="ONLINE">{t('online')}</option>
                  <option value="IN_PERSON">{t('inPerson')}</option>
                  <option value="BOTH">{t('both')}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('price')} ({t('dhPerHour')})</label>
                <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{d('bio')}</label>
              <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={4} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm" placeholder={d('bioPlaceholder')} />
            </div>
          </div>
        </div>
      </Section>

      <Section id="subjects" title={d('subjectsAndLevels')} icon={BookOpen}>
        {subjects.length > 0 && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {subjects.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border bg-white p-4">
                <div>
                  <p className="font-medium text-gray-900">{subjectName(s.subject, locale)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.levels?.map((l: string) => <span key={l} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{l}</span>)}
                  </div>
                  {s.price && <p className="mt-1 text-xs text-primary-600">{Number(s.price).toFixed(0)} {t('dh')}</p>}
                </div>
                <button onClick={() => removeSubject(s.id)} className="shrink-0 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
        <div className="rounded-xl border bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">{d('addSubject')}</p>
          <div className="flex flex-wrap gap-2">
            {available.slice(0, 20).map((s: any) => (
              <button key={s.id} onClick={() => setAddingSubj((p) => ({ ...p, subjectId: s.id }))}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${addingSubj.subjectId === s.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                {subjectName(s, locale)}
              </button>
            ))}
          </div>
          {addingSubj.subjectId && (
            <div className="mt-3">
              <p className="mb-1 text-xs text-gray-500">{d('selectLevels')}</p>
              <div className="flex flex-wrap gap-1">
                {['primaire', 'collège', 'lycée', 'bac'].map((l) => (
                  <button key={l} onClick={() => toggleLevel(addingSubj.subjectId, l)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${addingSubj.levels.includes(l) ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <input value={addingSubj.price} onChange={(e) => setAddingSubj((p) => ({ ...p, price: e.target.value }))} type="number" placeholder={t('price')} className="mt-2 w-32 rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
              <Button size="sm" className="mt-2" onClick={addSubject}><Plus className="ml-1 h-4 w-4" /> {d('add')}</Button>
            </div>
          )}
        </div>
      </Section>

      <Section id="experience" title={d('experience')} icon={Award}>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">{t('yearsExperience')}</label>
          <input type="number" value={tp?.experience || ''} onChange={async (e) => {
            await apiRequest('/teachers/profile', { method: 'PATCH', body: JSON.stringify({ experience: parseInt(e.target.value) || 0 }) });
            await fetchProfile();
          }} className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        {workExps.length > 0 && (
          <div className="mb-4 space-y-2">
            {workExps.map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{exp.position} — {exp.institution}</p>
                  {exp.duration && <p className="text-xs text-gray-500">{exp.duration}</p>}
                </div>
                <button onClick={() => removeExperience(exp.id)} className="text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
        <div className="rounded-xl border bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">{d('addExperience')}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={newExp.position} onChange={(e) => setNewExp((f) => ({ ...f, position: e.target.value }))} placeholder={d('positionPlaceholder')} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input value={newExp.institution} onChange={(e) => setNewExp((f) => ({ ...f, institution: e.target.value }))} placeholder={d('institutionPlaceholder')} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input value={newExp.duration} onChange={(e) => setNewExp((f) => ({ ...f, duration: e.target.value }))} placeholder={d('durationPlaceholder')} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <Button size="sm" className="mt-3" onClick={addExperience}><Plus className="ml-1 h-4 w-4" /> {d('add')}</Button>
        </div>
      </Section>

      <Section id="certificates" title={d('certificates')} icon={GraduationCap}>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {certs.map((doc: any) => (
            <div key={doc.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{doc.originalName}</p>
                  <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
                {doc.isVerified ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">{d('pendingVerification')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition hover:border-primary-400">
          <Upload className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">{uploading ? d('uploading') : d('uploadCertificate')}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={uploadCert} disabled={uploading} />
        </label>
      </Section>

      <Section id="video" title={d('introVideo')} icon={Video}>
        <p className="mb-3 text-xs text-gray-500">{d('videoHelp')}</p>
        <input value={form.introVideo} onChange={(e) => setForm((f) => ({ ...f, introVideo: e.target.value }))} placeholder="https://youtube.com/..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        {form.introVideo && (
          <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-black">
            <iframe src={form.introVideo.replace('watch?v=', 'embed/')} className="h-full w-full" allowFullScreen />
          </div>
        )}
      </Section>

      <Section id="availability" title={d('availability')} icon={Calendar}>
        <div className="overflow-hidden rounded-xl border">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={`flex items-center border-b px-4 py-3 last:border-0 ${availForm[i]?.enabled ? '' : 'bg-gray-50'}`}>
              <div className="flex w-24 items-center gap-2">
                <input type="checkbox" checked={availForm[i]?.enabled || false} onChange={() => toggleAvail(i)} className="h-4 w-4 rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">{dn[i]}</span>
              </div>
              {availForm[i]?.enabled ? (
                <div className="flex items-center gap-2">
                  <input type="time" value={availForm[i].start} onChange={(e) => setAvailForm((f) => ({ ...f, [i]: { ...f[i], start: e.target.value } }))} className="rounded border border-gray-300 px-2 py-1 text-sm" />
                  <span className="text-sm text-gray-400">→</span>
                  <input type="time" value={availForm[i].end} onChange={(e) => setAvailForm((f) => ({ ...f, [i]: { ...f[i], end: e.target.value } }))} className="rounded border border-gray-300 px-2 py-1 text-sm" />
                </div>
              ) : (
                <span className="text-sm text-gray-400">{d('unavailable')}</span>
              )}
            </div>
          ))}
        </div>
        <Button size="sm" className="mt-3" onClick={saveAvailability}><Clock className="ml-1 h-4 w-4" /> {d('saveAvailability')}</Button>
      </Section>

      {reviews.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Award className="h-5 w-5" /> {d('reviews')} ({reviews.length})</h2>
            <p className="mt-1 text-xs text-gray-500">{d('reviewsNote')}</p>
            <div className="mt-4 space-y-3">
              {reviews.slice(0, 5).map((r: any) => (
                <div key={r.id} className="rounded-xl border bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                      {r.student.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.student.fullName}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div key={i} className={`h-2.5 w-2.5 rounded-full ${i < r.rating ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="mr-auto text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
