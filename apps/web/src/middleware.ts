import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/forgot-password', '/teachers', '/reset-password', '/verify-email', '/auth/callback'];
const authPages = ['/login', '/register'];

function decodeToken(token: string): { role?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!token;
  const payload = token ? decodeToken(token) : null;
  const role = payload?.role;

  if (authPages.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const isPublic = publicPaths.some((p) => pathname.startsWith(p)) || pathname === '/';
  if (!isPublic && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((pathname === '/teacher' || pathname.startsWith('/teacher/')) && role !== 'TEACHER') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((pathname === '/student' || pathname.startsWith('/student/')) && role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};
