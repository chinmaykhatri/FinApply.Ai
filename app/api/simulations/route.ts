import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, auditLog } from '@/lib/security';

/* POST /api/simulations — Submit deal room work + auto-evaluate */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 submissions per 5 minutes per IP
    const limited = applyRateLimit(request, 'ai');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/simulations' }, request);
      return limited;
    }

    const body = await request.json();
    const {
      application_id, deal_room_token, case_code, content, word_count,
      time_taken_seconds, started_at, tab_violations, violation_log,
    } = body;

    if (!application_id || !content || !deal_room_token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // ══════════════════════════════════════════════
    // OWNERSHIP CHECK — verify deal_room_token matches application_id
    // Prevents IDOR: attacker cannot submit for another user's application
    // ══════════════════════════════════════════════
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('id, status')
      .eq('id', application_id)
      .eq('deal_room_token', deal_room_token)
      .single();

    if (appError || !app) {
      auditLog('api.suspicious', {
        endpoint: '/api/simulations',
        reason: 'IDOR attempt — token/id mismatch',
        application_id,
      }, request);
      return NextResponse.json({ error: 'Invalid submission credentials' }, { status: 403 });
    }

    // Prevent double submissions
    if (app.status === 'submitted' || app.status === 'scored' || app.status === 'report_sent') {
      return NextResponse.json({ error: 'Simulation already submitted' }, { status: 409 });
    }

    // Sanitize content (allow longer text for essay responses)
    const sanitizedContent = sanitizeString(content, 50_000);
    if (!sanitizedContent || sanitizedContent.length < 10) {
      return NextResponse.json({ error: 'Submission content is too short' }, { status: 400 });
    }

    // 1. Insert simulation
    const { data: sim, error: simError } = await supabase
      .from('simulations')
      .insert({
        application_id,
        case_code: sanitizeString(case_code, 20) || null,
        content: sanitizedContent,
        word_count: Math.min(Math.max(0, Number(word_count) || 0), 100_000),
        time_taken_seconds: Math.min(Math.max(0, Number(time_taken_seconds) || 0), 86_400),
        started_at: started_at || new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        tab_violations: Math.min(Math.max(0, Number(tab_violations) || 0), 10_000),
        violation_log: violation_log ? sanitizeString(JSON.stringify(violation_log), 10_000) : null,
      })
      .select()
      .single();

    if (simError) {
      console.error('Simulation insert error:', simError.message);
      return NextResponse.json({ error: 'Failed to save simulation' }, { status: 500 });
    }

    // 2. Update application status to submitted
    await supabase
      .from('applications')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', application_id);

    // 3. Auto-trigger AI evaluation (non-blocking, with internal auth)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finapply-ai-delta.vercel.app';
    const internalSecret = process.env.ADMIN_API_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    fetch(`${baseUrl}/api/admin/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': internalSecret,
      },
      body: JSON.stringify({
        application_id,
        simulation_id: sim.id,
      }),
    }).catch((err) => {
      console.error('Auto-evaluate trigger failed (non-blocking):', err.message);
    });

    auditLog('admin.action', {
      action: 'simulation_submitted',
      application_id,
      simulation_id: sim.id,
    }, request);

    return NextResponse.json({ success: true, data: { id: sim.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
