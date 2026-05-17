'use client';

import { Card, CardContent } from '@oustadi/ui';

export default function TeacherProfile() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">ملفي الشخصي</h1>
      <Card className="mt-6">
        <CardContent className="p-6">
          <p className="text-gray-500">سيتم إضافة الملف الشخصي قريباً</p>
        </CardContent>
      </Card>
    </div>
  );
}
