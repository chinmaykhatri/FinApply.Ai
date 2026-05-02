import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_EMAIL = 'chinmaykhatri495@gmail.com';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ═══════════════════════════════════════════════════
  // FAST PATH — Skip auth check for non-admin routes
  // This eliminates the Supabase round-trip on every page load
  // ═══════════════════════════════════════════════════
  const isAdminRoute = path.startsWith('/admin') || path === '/login';
  const isAdminApi = path.startsWith('/api/admin');

  if (!isAdminRoute && !isAdminApi) {
    return NextResponse.next();
  }

  // Only create Supabase client for admin-protected routes
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ════════════════════════════════════════════════
  // ADMIN ROUTES — Invisible to non-admin users
  // ════════════════════════════════════════════════
  if (isAdminRoute) {
    if (!user) {
      if (path === '/login') return response;
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // Admin API routes — return 404 (not 401) for non-admins
  if (isAdminApi) {
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    // Only match admin routes and login — skip all static/public routes
    '/admin/:path*',
    '/login',
    '/api/admin/:path*',
  ],
};
