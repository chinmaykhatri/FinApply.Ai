import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, isValidEmail, auditLog } from '@/lib/security';

/* POST /api/simulations/new — Create a new deal room attempt for returning users */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 per 5 minutes per IP (same as register)
    const limited = applyRateLimit(request, 'register');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/simulations/new' }, request);
      return limited;
    }

    const body = await request.json();
    const { email, target_role } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const validRoles = ['ib_analyst', 'pe_analyst', 'big4_advisory', 'equity_research', 'corporate_finance'];
    if (!target_role || !validRoles.includes(target_role)) {
      return NextResponse.json({ error: 'Invalid target role' }, { status: 400 });
    }

    const normalizedEmail = sanitizeString(email, 254).toLowerCase();
    const supabase = createAdminClient();

    // Verify the user actually exists and has at least one completed simulation
    const { data: existing, error: lookupError } = await supabase
      .from('applications')
      .select('id, full_name, email, college_or_firm, city, current_status, status')
      .ilike('email', normalizedEmail)
      .order('created_at', { ascending: false });

    if (lookupError || !existing || existing.length === 0) {
      return NextResponse.json({ error: 'No existing account found' }, { status: 404 });
    }

    // Must have at least one completed (scored/report_sent) simulation to start a new one
    const hasCompleted = existing.some(app =>
      app.status === 'scored' || app.status === 'report_sent'
    );

    // Also check if there's an active (in-progress) simulation
    const hasActive = existing.some(app =>
      app.status === 'applied' || app.status === 'dealroom_sent' || app.status === 'submitted'
    );

    if (hasActive) {
      return NextResponse.json({
        error: 'You already have an active simulation in progress. Complete it before starting a new one.',
      }, { status: 409 });
    }

    if (!hasCompleted) {
      return NextResponse.json({
        error: 'Complete your current simulation before starting a new one.',
      }, { status: 403 });
    }

    // Use the latest profile data
    const latest = existing[0];

    // Generate new tokens for this simulation attempt
    const deal_room_token = crypto.randomUUID();
    const report_token = crypto.randomUUID();

    const { data: newApp, error: insertError } = await supabase
      .from('applications')
      .insert({
        full_name: latest.full_name,
        email: normalizedEmail,
        college_or_firm: latest.college_or_firm,
        city: latest.city,
        current_status: latest.current_status,
        target_role: sanitizeString(target_role, 50),
        essay: `Repeat simulation — target: ${target_role}`,
        status: 'applied',
        deal_room_token,
        report_token,
      })
      .select()
      .single();

    if (insertError) {
      console.error('New simulation insert error:', insertError.message);
      return NextResponse.json({ error: 'Failed to create new simulation' }, { status: 500 });
    }

    auditLog('admin.action', {
      action: 'new_simulation_created',
      email: normalizedEmail,
      application_id: newApp.id,
      target_role,
      attempt_number: existing.length + 1,
    }, request);

    // Send welcome email for new deal room (non-blocking)
    try {
      const { sendWelcomeEmail } = await import('@/lib/email');
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fin-apply-ai.vercel.app';
      await sendWelcomeEmail({
        full_name: latest.full_name,
        email: normalizedEmail,
        deal_room_url: `${appUrl}/dealroom/${deal_room_token}`,
      });
    } catch (emailErr: unknown) {
      const errMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error('New simulation email failed:', errMsg);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newApp.id,
        deal_room_token,
        deal_room_url: `/dealroom/${deal_room_token}`,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
