'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { Button, Input, Card, CardContent, CardHeader } from '@oustadi/ui';

export default function SettingsPage() {
  const { user } = useAuth();
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

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">الإعدادات</h1>
          {profile && <p className="text-sm text-gray-500">{profile.email} · {profile.role === 'TEACHER' ? 'أستاذ' : profile.role === 'ADMIN' ? 'مشرف' : 'طالب'}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input id="fullName" label="الاسم الكامل" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
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
                <Input id="city" label="المدينة" value={studentForm.city} onChange={(e) => setStudentForm({ ...studentForm, city: e.target.value })} />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">نبذة عني</label>
                  <textarea value={studentForm.bio} onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={3} />
                </div>
              </div>
            )}

            {user?.role === 'TEACHER' && (
              <div className="space-y-3 rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-gray-900">الملف الشخصي للأستاذ</h2>
                <Input id="tcity" label="المدينة" value={teacherForm.city} onChange={(e) => setTeacherForm({ ...teacherForm, city: e.target.value })} />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">نبذة عني</label>
                  <textarea value={teacherForm.bio} onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={3} />
                </div>
                <Input id="exp" label="سنوات الخبرة" type="number" value={teacherForm.experience} onChange={(e) => setTeacherForm({ ...teacherForm, experience: Number(e.target.value) })} />
                <Input id="price" label="السعر (د.ج)" type="number" value={teacherForm.price} onChange={(e) => setTeacherForm({ ...teacherForm, price: Number(e.target.value) })} />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">طريقة التدريس</label>
                  <select value={teacherForm.teachingMode} onChange={(e) => setTeacherForm({ ...teacherForm, teachingMode: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="IN_PERSON">حضوري</option>
                    <option value="ONLINE">عن بعد</option>
                    <option value="BOTH">الاثنين</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={teacherForm.showContact} onChange={(e) => setTeacherForm({ ...teacherForm, showContact: e.target.checked })} className="rounded border-gray-300" />
                  إظهار رقم الهاتف في الملف الشخصي
                </label>
              </div>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? 'جار الحفظ...' : 'حفظ التغييرات'}
            </Button>
            {saved && <p className="text-sm text-emerald-600">تم الحفظ بنجاح</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
