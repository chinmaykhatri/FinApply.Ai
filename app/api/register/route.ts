import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, isValidEmail, isValidURL, auditLog } from '@/lib/security';

/* POST /api/register — Public registration (no beta gate) */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 registrations per minute per IP
    const limited = applyRateLimit(request, 'register');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/register' }, request);
      return limited;
    }

    const body = await request.json();
    const { full_name, email, college_or_firm, city, current_status, target_role, linkedin_url } = body;

    // ── Input Validation ──
    if (!full_name || !email || !college_or_firm || !city || !current_status || !target_role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (linkedin_url && !isValidURL(linkedin_url)) {
      return NextResponse.json({ error: 'Invalid LinkedIn URL' }, { status: 400 });
    }

    // Whitelist allowed values for enum fields
    const validStatuses = ['final_year_student', 'mba_student', 'working_0_2', 'working_2_plus'];
    const validRoles = ['ib_analyst', 'pe_analyst', 'big4_advisory', 'equity_research', 'corporate_finance'];

    if (!validStatuses.includes(current_status)) {
      return NextResponse.json({ error: 'Invalid current status' }, { status: 400 });
    }
    if (!validRoles.includes(target_role)) {
      return NextResponse.json({ error: 'Invalid target role' }, { status: 400 });
    }

    // ── Sanitize ──
    const sanitized = {
      full_name: sanitizeString(full_name, 200),
      email: sanitizeString(email, 254).toLowerCase(),
      college_or_firm: sanitizeString(college_or_firm, 200),
      city: sanitizeString(city, 100),
      current_status,
      target_role,
      linkedin_url: linkedin_url ? sanitizeString(linkedin_url, 500) : null,
    };

    const supabase = createAdminClient();

    // Generate tokens
    const deal_room_token = crypto.randomUUID();
    const report_token = crypto.randomUUID();

    const { data, error } = await supabase
      .from('applications')
      .insert({
        ...sanitized,
        essay: sanitized.linkedin_url ? `LinkedIn: ${sanitized.linkedin_url}` : 'Direct registration',
        status: 'applied',
        deal_room_token,
        report_token,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate email — return existing tokens
      if (error.code === '23505' && error.message?.includes('email')) {
        const { data: existing } = await supabase
          .from('applications')
          .select('id, deal_room_token, report_token')
          .eq('email', sanitized.email)
          .single();

        if (existing) {
          return NextResponse.json({
            success: true,
            existing: true,
            data: {
              id: existing.id,
              deal_room_token: existing.deal_room_token,
              report_token: existing.report_token,
            },
          }, { status: 200 });
        }
      }
      console.error('Supabase insert error:', error.message);
      return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
    }

    auditLog('admin.action', {
      action: 'user_registered',
      email: sanitized.email,
      application_id: data.id,
    }, request);

    // Send emails (non-blocking)
    try {
      const { sendAdminNotification, sendWelcomeEmail } = await import('@/lib/email');
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finapply-ai-delta.vercel.app';

      await sendWelcomeEmail({
        full_name: sanitized.full_name,
        email: sanitized.email,
        deal_room_url: `${appUrl}/dealroom/${deal_room_token}`,
      });

      await sendAdminNotification({
        full_name: sanitized.full_name,
        email: sanitized.email,
        target_role: sanitized.target_role,
        college_or_firm: sanitized.college_or_firm,
      });
    } catch (emailErr: unknown) {
      const errMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error('Email notification failed:', errMsg);
      // Don't fail the registration if email fails
    }

    // Notify Slack (non-blocking)
    import('@/lib/slack').then(({ notifySlack }) => {
      notifySlack(`🔔 *New Registration*\n*Name:* ${sanitized.full_name}\n*Email:* ${sanitized.email}\n*Role:* ${sanitized.target_role}\n*College:* ${sanitized.college_or_firm}`).catch(() => {});
    }).catch(() => {});

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
