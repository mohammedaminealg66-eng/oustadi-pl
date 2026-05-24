'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { apiRequest } from '@/lib/api';
import { Button, Input, Card, CardContent, CardHeader } from '@oustadi/ui';
import { ArrowRight, Shield, Mail, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';

export default function SettingsPage({ dashboardHref }: { dashboardHref: string }) {
  const { user } = useAuth();
  const d = useTranslations('dashboard');
  const a = useTranslations('auth');
  const t = useTranslations('teacher');
  const c = useTranslations('common');

  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ fullName: '', phone: '', language: 'ar' });
  const [studentForm, setStudentForm] = useState({ city: '', bio: '' });
  const [teacherForm, setTeacherForm] = useState({ city: '', bio: '', experience: 0, price: 0, teachingMode: 'BOTH', showContact: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    apiRequest('/users/me').then((res) => {
      if (res.success && res.data) {
        setProfile(res.data);
        setForm({ fullName: res.data.fullName || '', phone: res.data.phone || '', language: res.data.language || 'ar' });
        if (res.data.studentProfile) setStudentForm({ city: res.data.studentProfile.city || '', bio: res.data.studentProfile.bio || '' });
        if (res.data.teacherProfile) setTeacherForm({
          city: res.data.teacherProfile.city || '',
          bio: res.data.teacherProfile.bio || '',
          experience: res.data.teacherProfile.experience || 0,
          price: res.data.teacherProfile.price || 0,
          teachingMode: res.data.teacherProfile.teachingMode || 'BOTH',
          showContact: res.data.teacherProfile.showContact ?? false,
        });
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify(form) });
    if (user?.role === 'STUDENT') await apiRequest('/students/profile', { method: 'PATCH', body: JSON.stringify(studentForm) });
    if (user?.role === 'TEACHER') await apiRequest('/teachers/profile', { method: 'PATCH', body: JSON.stringify(teacherForm) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function resendVerification() {
    if (!profile?.email) return;
    setResending(true);
    setResendMsg('');
    const res = await apiRequest('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email: profile.email }), skipAuth: true });
    setResendMsg(res.success ? a('verificationSent') : (res.error || c('error')));
    setResending(false);
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6">
        <Link href={dashboardHref} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
          <ArrowRight className="h-4 w-4" /> {d('backToDashboard')}
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">{d('settings')}</h1>
          {profile && <p className="text-sm text-gray-500">{profile.email} · {user?.role === 'TEACHER' ? a('teacher') : user?.role === 'ADMIN' ? a('admin') : a('student')}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input id="fullName" label={a('fullName')} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <Input id="phone" label={d('phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{d('language')}</label>
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
              </select>
            </div>

            {user?.role === 'STUDENT' && (
              <div className="space-y-3 rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-gray-900">{d('studentProfile')}</h2>
                <Input id="city" label={t('city')} value={studentForm.city} onChange={(e) => setStudentForm({ ...studentForm, city: e.target.value })} />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">{d('aboutMe')}</label>
                  <textarea value={studentForm.bio} onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={3} />
                </div>
              </div>
            )}

            {user?.role === 'TEACHER' && (
              <div className="space-y-3 rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-gray-900">{d('teacherProfile')}</h2>
                <Input id="tcity" label={t('city')} value={teacherForm.city} onChange={(e) => setTeacherForm({ ...teacherForm, city: e.target.value })} />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">{d('aboutMe')}</label>
                  <textarea value={teacherForm.bio} onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={3} />
                </div>
                <Input id="exp" label={t('yearsExperience')} type="number" value={teacherForm.experience} onChange={(e) => setTeacherForm({ ...teacherForm, experience: Number(e.target.value) })} />
                <Input id="price" label={`${t('price')} (${t('dh')})`} type="number" value={teacherForm.price} onChange={(e) => setTeacherForm({ ...teacherForm, price: Number(e.target.value) })} />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">{t('teachingMode')}</label>
                  <select value={teacherForm.teachingMode} onChange={(e) => setTeacherForm({ ...teacherForm, teachingMode: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="IN_PERSON">{t('inPerson')}</option>
                    <option value="ONLINE">{t('online')}</option>
                    <option value="BOTH">{t('both')}</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={teacherForm.showContact} onChange={(e) => setTeacherForm({ ...teacherForm, showContact: e.target.checked })} className="rounded border-gray-300" />
                  {d('showPhone')}
                </label>
              </div>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? d('saving') : d('saveChanges')}
            </Button>
            {saved && <p className="text-sm text-emerald-600">{d('saved')}</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><Shield className="h-5 w-5" /> {d('security')}</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{d('emailStatus')}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile?.emailVerified ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="h-4 w-4" /> {d('verified')}</span>
              ) : (
                <>
                  <span className="flex items-center gap-1 text-xs text-amber-600"><AlertTriangle className="h-4 w-4" /> {d('notVerified')}</span>
                  <Button variant="outline" size="sm" onClick={resendVerification} disabled={resending}>
                    {resending ? c('loading') : d('resend')}
                  </Button>
                </>
              )}
            </div>
          </div>
          {resendMsg && <p className="text-sm text-gray-600">{resendMsg}</p>}

          {profile?.authProvider === 'google' && (
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <div>
                <p className="text-sm font-medium text-gray-900">{d('googleLinked')}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
            </div>
          )}

          <Link href="/forgot-password" className="block rounded-lg border p-4 text-sm font-medium text-primary-600 hover:bg-gray-50">
            {d('changePassword')}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
