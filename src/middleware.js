import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request) {
  const host = request.headers.get('host') || '';

  // 1. Canonical domain redirect: ensure all *.vercel.app domains redirect to davinciwalebhaiya.com
  // so Razorpay's registered domain validation always matches and never gets blocked
  if (host.includes('vercel.app')) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.host = 'davinciwalebhaiya.com';
    canonicalUrl.protocol = 'https:';
    canonicalUrl.port = '';
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const pathname = request.nextUrl.pathname;

  // 2. Skip Supabase auth session refresh for public API endpoints
  if (
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/account')
  ) {
    return NextResponse.next({ request });
  }

  // 3. Check if request carries any Supabase auth cookies
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some((c) => c.name.startsWith('sb-'));

  // If visitor is an anonymous guest and not visiting protected admin/account areas, skip Supabase auth network roundtrip
  if (!hasAuthCookie && !pathname.startsWith('/admin') && !pathname.startsWith('/account')) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          }),
      },
    }
  );

  try {
    await supabase.auth.getUser();
  } catch (err) {
    // Ignore network/auth refresh error in middleware
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|mp4|webm|zip|tar|gz)$).*)',
  ],
};
