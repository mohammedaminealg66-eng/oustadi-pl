'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { Button, Input, Card, CardContent, CardHeader } from '@oustadi/ui';

export default function SettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', language: 'ar' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, fullName: user.email?.split('@')[0] || '' }));
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify(form) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">الإعدادات</h1>
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
