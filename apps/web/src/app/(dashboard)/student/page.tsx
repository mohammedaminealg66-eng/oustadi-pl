'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@oustadi/ui';

export default function StudentDashboard() {
  const [requests, setRequests] = useState<any>({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/requests').then((res) => {
      if (res.success && res.data) setRequests(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>جار التحميل...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم الطالب</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6"><p className="text-2xl font-bold text-primary-600">{requests.sent?.length}</p><p className="text-sm text-gray-500">الطلبات المرسلة</p></CardContent>
        </Card>
        <Card>
          <CardContent className="p-6"><p className="text-2xl font-bold text-emerald-600">{requests.sent?.filter((r: any) => r.status === 'ACCEPTED').length}</p><p className="text-sm text-gray-500">المقبولة</p></CardContent>
        </Card>
        <Card>
          <CardContent className="p-6"><p className="text-2xl font-bold text-red-600">{requests.sent?.filter((r: any) => r.status === 'PENDING').length}</p><p className="text-sm text-gray-500">قيد الانتظار</p></CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">طلباتي</h2>
        <div className="mt-4 space-y-3">
          {requests.sent?.map((req: any) => (
            <Card key={req.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{req.teacher?.fullName}</p>
                  <p className="text-sm text-gray-500">{req.subject?.nameAr}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  req.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                  req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{req.status === 'ACCEPTED' ? 'مقبول' : req.status === 'REJECTED' ? 'مرفوض' : 'قيد الانتظار'}</span>
              </CardContent>
            </Card>
          ))}
          {requests.sent?.length === 0 && <p className="text-sm text-gray-400 text-center py-8">لا توجد طلبات بعد</p>}
        </div>
      </div>
    </div>
  );
}
