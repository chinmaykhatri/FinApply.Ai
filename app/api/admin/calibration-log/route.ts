import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, auditLog } from '@/lib/security';

// POST: Log a calibration override
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 per minute per IP
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/admin/calibration-log' }, request);
      return limited;
    }

    const supabase = createAdminClient();
    const body = await request.json();
    const {
      application_id,
      admin_email,
      original_score,
      override_score,
      dimension,
      reason,
    } = body;

    if (!application_id || original_score === undefined || override_score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate numeric scores
    const origScore = Number(original_score);
    const overScore = Number(override_score);
    if (isNaN(origScore) || isNaN(overScore) || origScore < 0 || origScore > 100 || overScore < 0 || overScore > 100) {
      return NextResponse.json({ error: 'Scores must be numbers between 0 and 100' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('calibration_logs')
      .insert({
        application_id,
        admin_email: sanitizeString(admin_email || 'admin@finapply.ai', 254),
        original_score: origScore,
        override_score: overScore,
        dimension: sanitizeString(dimension || 'total_score', 50),
        reason: sanitizeString(reason || '', 500),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Table may not exist yet — log and return gracefully
      console.error('Calibration log insert error:', error);
      return NextResponse.json({ success: true, warning: 'Log table not configured' });
    }

    auditLog('admin.action', {
      action: 'calibration_override',
      application_id,
      original_score: origScore,
      override_score: overScore,
      dimension: dimension || 'total_score',
    }, request);

    return NextResponse.json({ success: true, log: data });
  } catch (err) {
    console.error('Calibration log error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// GET: Retrieve calibration history for a candidate
export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const limited = applyRateLimit(request, 'api');
    if (limited) return limited;

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');

    if (!applicationId) {
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(applicationId)) {
      return NextResponse.json({ error: 'Invalid application_id format' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('calibration_logs')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Calibration log fetch error:', error);
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json({ logs: data || [] });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
