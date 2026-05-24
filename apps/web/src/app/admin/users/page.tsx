'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminUsers() {
  const t = useTranslations('admin');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const roleLabel = (role: string) => {
    if (role === 'TEACHER') return t('teacher');
    if (role === 'STUDENT') return t('student');
    return t('admin');
  };

  async function fetchUsers() {
    const res = await apiRequest<any[]>('/admin/users');
    if (res.success && Array.isArray(res.data)) setUsers(res.data);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function toggleSuspend(userId: string, suspend: boolean) {
    await apiRequest(`/admin/users/${userId}/${suspend ? 'suspend' : 'activate'}`, { method: 'PATCH' });
    await fetchUsers();
  }

  if (loading) return <p>{t('loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('usersTitle')}</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-right">
              <th className="pb-3 font-medium text-gray-500">{t('name')}</th>
              <th className="pb-3 font-medium text-gray-500">{t('email')}</th>
              <th className="pb-3 font-medium text-gray-500">{t('role')}</th>
              <th className="pb-3 font-medium text-gray-500">{t('emailVerified')}</th>
              <th className="pb-3 font-medium text-gray-500">{t('provider')}</th>
              <th className="pb-3 font-medium text-gray-500">{t('status')}</th>
              <th className="pb-3 font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-b">
                <td className="py-3">{user.fullName}</td>
                <td className="py-3 text-gray-500">{user.email}</td>
                <td className="py-3">{roleLabel(user.role)}</td>
                <td className="py-3">
                  {user.emailVerified
                    ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                    : <XCircle className="h-4 w-4 text-red-400" />}
                </td>
                <td className="py-3 text-xs text-gray-400">{user.authProvider || 'local'}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${user.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {user.isSuspended ? t('suspended') : t('active')}
                  </span>
                </td>
                <td className="py-3">
                  <button onClick={() => toggleSuspend(user.id, !user.isSuspended)} className="text-xs text-red-600 hover:underline">
                    {user.isSuspended ? t('unsuspend') : t('suspend')}
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
