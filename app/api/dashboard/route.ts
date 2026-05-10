import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { applyRateLimit, sanitizeString, isValidEmail, auditLog } from '@/lib/security';

/* POST /api/dashboard — Lookup user applications by email */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: aggressive — 10 per minute per IP (prevents email enumeration)
    const limited = applyRateLimit(request, 'scrape');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/dashboard' }, request);
      return limited;
    }

    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const normalizedEmail = sanitizeString(email, 254).toLowerCase();
    const supabase = await createClient();

    // Fetch applications — EXCLUDE sensitive tokens from response
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        full_name,
        email,
        target_role,
        status,
        created_at,
        updated_at
      `)
      .ilike('email', normalizedEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Dashboard lookup error:', error.message);
      return NextResponse.json({ error: 'Failed to lookup applications' }, { status: 500 });
    }

    if (!applications || applications.length === 0) {
      // Return generic message — don't confirm email existence
      return NextResponse.json({ error: 'No applications found' }, { status: 404 });
    }

    // For each application, fetch report and simulation (without exposing tokens)
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const { data: reports } = await supabase
          .from('fiss_reports')
          .select('id, total_score, created_at')
          .eq('application_id', app.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const { data: sims } = await supabase
          .from('simulations')
          .select('id, case_code, word_count, time_taken_seconds, submitted_at')
          .eq('application_id', app.id)
          .order('submitted_at', { ascending: false })
          .limit(1);

        return {
          ...app,
          // SECURITY: deal_room_token and report_token are deliberately EXCLUDED
          report: reports?.[0] || null,
          simulation: sims?.[0] || null,
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
