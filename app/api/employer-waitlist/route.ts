import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, isValidEmail, auditLog } from '@/lib/security';

/* POST /api/employer-waitlist — Employer signs up for waitlist */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 per minute per IP (prevent spam)
    const limited = applyRateLimit(request, 'register');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/employer-waitlist' }, request);
      return limited;
    }

    const { email, company } = await request.json();

    if (!email || !isValidEmail(email) || !company) {
      return NextResponse.json({ error: 'Valid email and company required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('employer_waitlist')
      .insert({
        email: sanitizeString(email, 254),
        company: sanitizeString(company, 200),
      });

    if (error) {
      // If table doesn't exist yet, still return success
      console.error('Employer waitlist insert error:', error.message);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
