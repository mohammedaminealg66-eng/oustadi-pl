'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, Button } from '@oustadi/ui';

export default function TeacherRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ received: any[] }>('/requests').then((res) => {
      if (res.success && res.data) setRequests((res.data as any).received || []);
      setLoading(false);
    });
  }, []);

  async function handleAction(requestId: string, action: 'accept' | 'reject') {
    await apiRequest(`/requests/${requestId}/${action}`, { method: 'PATCH' });
    const res = await apiRequest<{ received: any[] }>('/requests');
    if (res.success && res.data) setRequests((res.data as any).received || []);
  }

  if (loading) return <p>جار التحميل...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
      <div className="mt-6 space-y-3">
        {requests.map((req: any) => (
          <Card key={req.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">{req.student?.fullName}</p>
                <p className="text-sm text-gray-500">{req.message}</p>
              </div>
              <div className="flex gap-2">
                {req.status === 'PENDING' && (
                  <>
                    <Button size="sm" onClick={() => handleAction(req.id, 'accept')}>قبول</Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(req.id, 'reject')}>رفض</Button>
                  </>
                )}
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${req.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {req.status === 'ACCEPTED' ? 'مقبول' : req.status === 'REJECTED' ? 'مرفوض' : 'قيد الانتظار'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && <p className="text-center py-8 text-sm text-gray-400">لا توجد طلبات</p>}
      </div>
    </div>
  );
}
