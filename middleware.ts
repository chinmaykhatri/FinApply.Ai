import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_EMAIL = 'chinmaykhatri495@gmail.com';

export async function middleware(request: NextRequest) {
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

  const path = request.nextUrl.pathname;

  // ════════════════════════════════════════════════
  // ADMIN ROUTES — Invisible to non-admin users
  // ════════════════════════════════════════════════
  // Covers: /admin, /admin/*, /login, /api/admin/*
  // Non-admin users see the homepage — no 401, no hints

  if (path.startsWith('/admin') || path === '/login') {
    // Not logged in → silently redirect to homepage
    if (!user) {
      // Exception: allow /login page so admin can sign in
      if (path === '/login') {
        return response;
      }
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Logged in but NOT the admin → silently redirect to homepage
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Admin verified — allow access
    return response;
  }

  // Admin API routes — return 404 (not 401) for non-admins
  if (path.startsWith('/api/admin')) {
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
