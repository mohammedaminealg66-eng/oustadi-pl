'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { Button, Card, CardContent, CardHeader } from '@oustadi/ui';

export default function TeacherProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [levels, setLevels] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    apiRequest('/users/me').then((res) => {
      if (res.success && res.data) setProfile(res.data);
    });
    apiRequest('/subjects', { skipAuth: true }).then((res) => {
      if (res.success && res.data) setAllSubjects(res.data);
    });
  }, []);

  async function addSubject() {
    if (!selectedSubject) return;
    setAdding(true);
    await apiRequest('/teachers/subjects', {
      method: 'POST',
      body: JSON.stringify({
        subjectId: selectedSubject,
        levels: levels.split(',').map((l) => l.trim()).filter(Boolean),
      }),
    });
    setAdding(false);
    setSelectedSubject('');
    setLevels('');
    const res = await apiRequest('/users/me');
    if (res.success && res.data) setProfile(res.data);
  }

  async function removeSubject(id: string) {
    await apiRequest(`/teachers/subjects/${id}`, { method: 'DELETE' });
    const res = await apiRequest('/users/me');
    if (res.success && res.data) setProfile(res.data);
  }

  const existingIds = new Set(profile?.teacherProfile?.subjects?.map((s: any) => s.subjectId) || []);
  const available = allSubjects.filter((s) => !existingIds.has(s.id));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">ملفي الشخصي</h1>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">المواد التي أدرسها</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.teacherProfile?.subjects?.length > 0 ? (
            <div className="space-y-2">
              {profile.teacherProfile.subjects.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <div>
                    <span className="font-medium text-gray-900">{s.subject.nameAr}</span>
                    {s.levels?.length > 0 && (
                      <div className="mt-1 flex gap-1">
                        {s.levels.map((l: string) => <span key={l} className="rounded-full bg-gray-200 px-2 py-0.5 text-xs">{l}</span>)}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => removeSubject(s.id)}>حذف</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">لم تضف أي مادة بعد</p>
          )}

          {available.length > 0 && (
            <div className="flex flex-wrap items-end gap-2 border-t pt-4">
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">اختر مادة</option>
                {available.map((s: any) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
              </select>
              <input value={levels} onChange={(e) => setLevels(e.target.value)} placeholder="المستويات (مفصولة بفواصل)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-48" />
              <Button size="sm" onClick={addSubject} disabled={adding || !selectedSubject}>إضافة</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">الملف العام</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            يمكنك تعديل معلومات ملفك الشخصي العامة (الاسم، المدينة، السيرة الذاتية، السعر، طريقة التدريس) من
            <a href="/settings" className="mx-1 text-primary-600 hover:underline">الإعدادات</a>
          </p>
          {profile && (
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-900">الاسم:</span> {profile.fullName}</p>
              <p><span className="font-medium text-gray-900">البريد:</span> {profile.email}</p>
              {profile.teacherProfile?.city && <p><span className="font-medium text-gray-900">المدينة:</span> {profile.teacherProfile.city}</p>}
              {profile.teacherProfile?.price && <p><span className="font-medium text-gray-900">السعر:</span> {profile.teacherProfile.price} درهم/للساعة</p>}
              {profile.teacherProfile?.teachingMode && (
                <p><span className="font-medium text-gray-900">طريقة التدريس:</span> {
                  profile.teacherProfile.teachingMode === 'ONLINE' ? 'عن بعد' :
                  profile.teacherProfile.teachingMode === 'IN_PERSON' ? 'حضوري' : 'الاثنين معاً'
                }</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
