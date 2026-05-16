import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'chinmaykhatri495@gmail.com';

/**
 * Edge-compatible constant-time string comparison.
 * Prevents timing attacks on secret comparison.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ═══════════════════════════════════════════════
  // FAST PATH — Skip auth check for non-admin routes
  // ═══════════════════════════════════════════════
  const isAdminRoute = path.startsWith('/admin') || path === '/login';
  const isAdminApi = path.startsWith('/api/admin');

  if (!isAdminRoute && !isAdminApi) {
    return NextResponse.next();
  }

  // ═══════════════════════════════════════════════
  // LOGIN RATE LIMITING — prevent brute force
  // 10 attempts per 15 minutes per IP
  // ═══════════════════════════════════════════════
  if (path === '/login') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { ok } = rateLimit(`login:${ip}`, 10, 15 * 60_000);
    if (!ok) {
      // Log rate-limited login attempt
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'auth.rate_limited',
        ip,
        path,
      }));

      return new NextResponse(
        '<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui"><div style="text-align:center"><h1>Too Many Attempts</h1><p style="color:#666">Please wait 15 minutes before trying again.</p></div></body></html>',
        {
          status: 429,
          headers: {
            'Content-Type': 'text/html',
            'Retry-After': '900',
          },
        }
      );
    }
  }

  // Only create Supabase client for admin-protected routes
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
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
  // AUDIT LOG — all admin access attempts
  // ════════════════════════════════════════════════
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (user) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: user.email === ADMIN_EMAIL ? 'auth.login_success' : 'auth.login_failed',
      ip,
      email: user.email,
      path,
    }));
  }

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

  // Admin API routes — return 404 (not 401) for non-admins (security through obscurity)
  if (isAdminApi) {
    // Allow internal server-to-server calls
    const internalSecret = request.headers.get('x-internal-secret');
    const expectedSecret = process.env.ADMIN_API_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (internalSecret && expectedSecret && constantTimeEqual(internalSecret, expectedSecret)) {
      return response;
    }

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
