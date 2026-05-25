import { NextResponse, NextRequest, after } from 'next/server';
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

    // Check if user already has an active (non-completed) application
    const { data: existingApps } = await supabase
      .from('applications')
      .select('id, status, deal_room_token')
      .ilike('email', sanitized.email);

    if (existingApps && existingApps.length > 0) {
      const activeApp = existingApps.find(a =>
        a.status === 'applied' || a.status === 'dealroom_sent' || a.status === 'submitted'
      );
      if (activeApp) {
        return NextResponse.json({
          success: true,
          existing: true,
          message: 'You already have an active simulation. Check your email for your Deal Room link or visit your dashboard.',
          data: {
            id: activeApp.id,
            deal_room_token: activeApp.deal_room_token,
          },
        }, { status: 200 });
      }
    }

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
      console.error('Supabase insert error:', error.message);
      return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
    }

    auditLog('admin.action', {
      action: 'user_registered',
      email: sanitized.email,
      application_id: data.id,
    }, request);

    // ── Send emails in background (truly non-blocking) ──
    // The response is returned immediately; emails fire in parallel behind the scenes.
    // Using void + catch to ensure they never throw into the response path.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fin-apply-ai.vercel.app';

    const emailPromise = import('@/lib/email').then(async ({ sendWelcomeEmail, sendAdminNotification }) => {
      await Promise.allSettled([
        sendWelcomeEmail({
          full_name: sanitized.full_name,
          email: sanitized.email,
          deal_room_url: `${appUrl}/dealroom/${deal_room_token}`,
        }).then(() => {
          console.log(`[EMAIL] Welcome email sent to ${sanitized.email}`);
        }),
        sendAdminNotification({
          full_name: sanitized.full_name,
          email: sanitized.email,
          target_role: sanitized.target_role,
          college_or_firm: sanitized.college_or_firm,
        }).then(() => {
          console.log(`[EMAIL] Admin notification sent for ${sanitized.email}`);
        }),
      ]);
    }).catch((emailErr: unknown) => {
      const errMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error('[EMAIL] Email notification failed:', errMsg);
    });

    // Notify Slack in background (non-blocking)
    const slackPromise = import('@/lib/slack').then(({ notifySlack }) => {
      return notifySlack(`🔔 *New Registration*\n*Name:* ${sanitized.full_name}\n*Email:* ${sanitized.email}\n*Role:* ${sanitized.target_role}\n*College:* ${sanitized.college_or_firm}`);
    }).catch(() => {});

    // Use Next.js 15 `after()` to run background tasks after the response is sent,
    // keeping the serverless function alive for email delivery.
    after(async () => {
      await emailPromise;
      await slackPromise;
    });

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
