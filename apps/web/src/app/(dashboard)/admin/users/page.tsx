'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Card, CardContent } from '@oustadi/ui';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ users: any[] }>('/admin/users').then((res) => {
      if (res.success && res.data) setUsers((res.data as any).users || []);
      setLoading(false);
    });
  }, []);

  async function toggleSuspend(userId: string, suspend: boolean) {
    await apiRequest(`/admin/users/${userId}/${suspend ? 'suspend' : 'activate'}`, { method: 'PATCH' });
    const res = await apiRequest<{ users: any[] }>('/admin/users');
    if (res.success && res.data) setUsers((res.data as any).users || []);
  }

  if (loading) return <p>جار التحميل...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">المستخدمون</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-right">
              <th className="pb-3 font-medium text-gray-500">الاسم</th>
              <th className="pb-3 font-medium text-gray-500">البريد</th>
              <th className="pb-3 font-medium text-gray-500">الدور</th>
              <th className="pb-3 font-medium text-gray-500">الحالة</th>
              <th className="pb-3 font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-b">
                <td className="py-3">{user.fullName}</td>
                <td className="py-3 text-gray-500">{user.email}</td>
                <td className="py-3">{user.role === 'TEACHER' ? 'أستاذ' : user.role === 'STUDENT' ? 'طالب' : 'مدير'}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${user.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {user.isSuspended ? 'موقوف' : 'نشط'}
                  </span>
                </td>
                <td className="py-3">
                  <button onClick={() => toggleSuspend(user.id, !user.isSuspended)} className="text-xs text-red-600 hover:underline">
                    {user.isSuspended ? 'إلغاء الإيقاف' : 'إيقاف'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
