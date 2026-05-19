'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, Button } from '@oustadi/ui';

export default function TeacherDashboard() {
  const [requests, setRequests] = useState<any>({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [rejecting, setRejecting] = useState<Record<string, boolean>>({});
  const d = useTranslations('dashboard');
  const c = useTranslations('common');

  useEffect(() => {
    apiRequest('/requests').then((res) => {
      if (res.success && res.data) setRequests(res.data);
      setLoading(false);
    });
  }, []);

  async function handleAction(requestId: string, action: 'accept' | 'reject') {
    const notes = action === 'reject' ? rejectNotes[requestId] : undefined;
    await apiRequest(`/requests/${requestId}/${action}`, {
      method: 'PATCH',
      body: notes ? JSON.stringify({ notes }) : undefined,
    });
    const res = await apiRequest('/requests');
    if (res.success && res.data) setRequests(res.data);
  }

  if (loading) return <p className="text-gray-500">{c('loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{d('teacherDashboard')}</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-4">
        <Card><CardContent className="p-6"><p className="text-2xl font-bold text-primary-600">{requests.received?.length}</p><p className="text-sm text-gray-500">{d('incomingRequests')}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-2xl font-bold text-emerald-600">{requests.received?.filter((r: any) => r.status === 'ACCEPTED').length}</p><p className="text-sm text-gray-500">{d('accepted')}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-2xl font-bold text-yellow-600">{requests.received?.filter((r: any) => r.status === 'PENDING').length}</p><p className="text-sm text-gray-500">{d('pending')}</p></CardContent></Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">{d('incomingRequests')}</h2>
        <div className="mt-4 space-y-3">
          {requests.received?.map((req: any) => (
            <Card key={req.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{req.student?.fullName}</p>
                  <p className="text-sm text-gray-500">{req.message}</p>
                </div>
                <div className="flex gap-2">
                  {req.status === 'PENDING' && (
                    <div className="flex flex-col gap-2">
                      {rejecting[req.id] ? (
                        <>
                          <textarea
                            value={rejectNotes[req.id] || ''}
                            onChange={(e) => setRejectNotes((r) => ({ ...r, [req.id]: e.target.value }))}
                            placeholder={d('confirmReject')}
                            className="w-48 rounded border px-2 py-1 text-xs"
                            rows={2}
                          />
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => handleAction(req.id, 'accept')}>{d('accept')}</Button>
                            <Button size="sm" variant="outline" onClick={() => { handleAction(req.id, 'reject'); setRejecting((r) => ({ ...r, [req.id]: false })); }}>{d('reject')}</Button>
                            <button onClick={() => setRejecting((r) => ({ ...r, [req.id]: false }))} className="text-xs text-gray-400">{c('cancel')}</button>
                          </div>
                        </>
                      ) : (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleAction(req.id, 'accept')}>{d('accept')}</Button>
                          <Button size="sm" variant="outline" onClick={() => setRejecting((r) => ({ ...r, [req.id]: true }))}>{d('reject')}</Button>
                        </div>
                      )}
                    </div>
                  )}
                  {req.status === 'ACCEPTED' && (
                    <Link href="/chat"><Button size="sm" variant="outline">{d('message')}</Button></Link>
                  )}
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    req.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                    req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{req.status === 'ACCEPTED' ? d('accepted') : req.status === 'REJECTED' ? d('rejected') : d('pending')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {requests.received?.length === 0 && <p className="text-center py-8 text-sm text-gray-400">{d('noIncomingRequests')}</p>}
        </div>
      </div>
    </div>
  );
}
