'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { apiRequest } from '@/lib/api';
import { Button, Input, Card, CardContent, CardHeader } from '@oustadi/ui';
import { ArrowRight } from 'lucide-react';

export default function SettingsPage() {
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

  const dashboardHref = user?.role === 'TEACHER' ? '/teacher' : user?.role === 'ADMIN' ? '/admin' : '/student';

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6">
        <Link href={dashboardHref} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
          <ArrowRight className="h-4 w-4" /> {d('backToDashboard')}
        </Link>
      </div>
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">{d('settings')}</h1>
          {profile && <p className="text-sm text-gray-500">{profile.email} · {user?.role === 'TEACHER' ? a('teacher') : user?.role === 'ADMIN' ? 'مشرف' : a('student')}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input id="fullName" label={a('fullName')} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <Input id="phone" label="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">اللغة</label>
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
              </select>
            </div>

            {user?.role === 'STUDENT' && (
              <div className="space-y-3 rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-gray-900">الملف الشخصي للطالب</h2>
                <Input id="city" label={t('city')} value={studentForm.city} onChange={(e) => setStudentForm({ ...studentForm, city: e.target.value })} />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">نبذة عني</label>
                  <textarea value={studentForm.bio} onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={3} />
                </div>
              </div>
            )}

            {user?.role === 'TEACHER' && (
              <div className="space-y-3 rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-gray-900">الملف الشخصي للأستاذ</h2>
                <Input id="tcity" label={t('city')} value={teacherForm.city} onChange={(e) => setTeacherForm({ ...teacherForm, city: e.target.value })} />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">نبذة عني</label>
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
                  إظهار رقم الهاتف في الملف الشخصي
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
    </div>
  );
}
