import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { applyRateLimit, sanitizeString, isValidEmail, auditLog, verifyHMAC } from '@/lib/security';
import crypto from 'crypto';

/* POST /api/webhooks/make/application — Receive Tally form data via Make.com */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 per minute (webhooks can be bursty)
    const limited = applyRateLimit(request, 'webhook');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/webhooks/make/application' }, request);
      return limited;
    }

    // ── Webhook Authentication ──
    // Check Authorization header first (preferred), fall back to body secret
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.MAKE_WEBHOOK_SECRET;

    const rawBody = await request.text();
    let body: Record<string, unknown>;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Verify via header or body secret
    const headerMatch = authHeader === `Bearer ${webhookSecret}`;
    const bodyMatch = body.webhook_secret === webhookSecret;

    if (!headerMatch && !bodyMatch) {
      auditLog('webhook.invalid', {
        endpoint: '/api/webhooks/make/application',
        reason: 'Invalid webhook secret',
      }, request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      full_name, email, linkedin_url,
      college_or_firm, city, current_status, target_role, essay,
    } = body as Record<string, string>;

    if (!full_name || !email || !target_role) {
      return NextResponse.json({ error: 'Missing required fields: full_name, email, target_role' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Sanitize all inputs
    const sanitized = {
      full_name: sanitizeString(full_name, 200),
      email: sanitizeString(email, 254).toLowerCase(),
      linkedin_url: linkedin_url ? sanitizeString(linkedin_url, 500) : null,
      college_or_firm: sanitizeString(college_or_firm, 200) || null,
      city: sanitizeString(city, 100) || null,
      current_status: sanitizeString(current_status, 50) || null,
      target_role: sanitizeString(target_role, 50),
      essay: sanitizeString(essay, 10_000) || null,
    };

    const supabase = await createClient();

    // Generate unique tokens
    const deal_room_token = crypto.randomUUID();
    const report_token = crypto.randomUUID();

    // Insert application
    const { data, error } = await supabase
      .from('applications')
      .insert({
        ...sanitized,
        deal_room_token,
        report_token,
        status: 'applied',
      })
      .select()
      .single();

    if (error) {
      console.error('Application insert error:', error.message);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    auditLog('webhook.received', {
      action: 'application_created',
      email: sanitized.email,
      application_id: data.id,
    }, request);

    // Send admin notification email (best-effort)
    try {
      const { sendAdminNotification } = await import('@/lib/email');
      await sendAdminNotification({
        full_name: sanitized.full_name,
        email: sanitized.email,
        target_role: sanitized.target_role,
        college_or_firm: sanitized.college_or_firm || '',
        linkedin_url: sanitized.linkedin_url || undefined,
      });
    } catch (emailErr) {
      console.error('Admin notification email failed:', emailErr instanceof Error ? emailErr.message : emailErr);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finapply-ai-delta.vercel.app';

    return NextResponse.json({
      success: true,
      application_id: data.id,
      deal_room_token,
      report_token,
      deal_room_url: `${appUrl}/dealroom/${deal_room_token}`,
      report_url: `${appUrl}/report/${report_token}`,
    }, { status: 201 });
  } catch (err) {
    console.error('Webhook error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
