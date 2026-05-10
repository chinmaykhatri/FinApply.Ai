import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { applyRateLimit, sanitizeString, isValidEmail, auditLog } from '@/lib/security';

/* POST /api/applications — Submit beta application (legacy) */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 per minute per IP
    const limited = applyRateLimit(request, 'register');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/applications' }, request);
      return limited;
    }

    const body = await request.json();
    const { full_name, email, college_or_firm, city, current_status, target_role, essay } = body;

    // Validation
    if (!full_name || !email || !college_or_firm || !city || !current_status || !target_role || !essay) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Sanitize all inputs
    const sanitized = {
      full_name: sanitizeString(full_name, 200),
      email: sanitizeString(email, 254).toLowerCase(),
      college_or_firm: sanitizeString(college_or_firm, 200),
      city: sanitizeString(city, 100),
      current_status: sanitizeString(current_status, 50),
      target_role: sanitizeString(target_role, 50),
      essay: sanitizeString(essay, 10_000),
    };

    const supabase = await createClient();

    // Generate tokens
    const deal_room_token = crypto.randomUUID();
    const report_token = crypto.randomUUID();

    const { data, error } = await supabase
      .from('applications')
      .insert({
        ...sanitized,
        status: 'applied',
        deal_room_token,
        report_token,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    auditLog('admin.action', {
      action: 'application_submitted',
      email: sanitized.email,
      application_id: data.id,
    }, request);

    // Return minimal data — don't expose full record
    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        deal_room_token,
        report_token,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
