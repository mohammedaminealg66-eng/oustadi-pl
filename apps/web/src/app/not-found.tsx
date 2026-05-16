import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500">الصفحة غير موجودة</p>
      <Link href="/" className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700">
        العودة للرئيسية
      </Link>
    </div>
  );
}
