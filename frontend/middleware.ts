import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get('access_token')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const isAuthPath = path.startsWith('/(auth)') || path.startsWith('/login') || path.startsWith('/register');
  const isOwnerPath = path.startsWith('/(owner)') || path.startsWith('/dashboard') || path.startsWith('/vehicles');
  const isDriverPath = path.startsWith('/(driver)') || path.startsWith('/driver');

  if (!accessToken) {
    if (isAuthPath || path === '/') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPath) {
    if (userRole === 'OWNER') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (userRole === 'DRIVER') {
      return NextResponse.redirect(new URL('/driver', request.url));
    }
  }

  if (isOwnerPath && userRole !== 'OWNER') {
    return NextResponse.redirect(new URL('/driver', request.url));
  }

  if (isDriverPath && userRole !== 'DRIVER') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/vehicles/:path*',
    '/driver/:path*',
    '/(owner)/:path*',
    '/(driver)/:path*',
  ],
};
