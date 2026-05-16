import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, auditLog } from '@/lib/security';

// POST: Send follow-up email at 30/60/90 day milestones
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 per minute per IP
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/admin/send-followup' }, request);
      return limited;
    }

    const supabase = createAdminClient();
    const { application_id, milestone_day } = await request.json();

    if (!application_id || !milestone_day) {
      return NextResponse.json({ error: 'Missing application_id or milestone_day' }, { status: 400 });
    }

    // Validate milestone_day
    const validMilestones = [30, 60, 90];
    if (!validMilestones.includes(Number(milestone_day))) {
      return NextResponse.json({ error: 'Invalid milestone_day. Use 30, 60, or 90.' }, { status: 400 });
    }

    // Get candidate details
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('id, full_name, email, report_token')
      .eq('id', application_id)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Import email utility dynamically to avoid build issues
    const { sendFollowUpEmail } = await import('@/lib/email');
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finapply-ai-delta.vercel.app';
    
    await sendFollowUpEmail({
      full_name: app.full_name,
      email: app.email,
      milestone_day: Number(milestone_day),
      outcome_url: `${appUrl}/outcome?token=${app.report_token}`,
    });

    // Log the follow-up
    try {
      await supabase.from('outcome_tracking').insert({
        application_id,
        milestone_day: Number(milestone_day),
        sent_at: new Date().toISOString(),
        status: 'sent',
      });
    } catch { /* table may not exist yet */ }

    auditLog('admin.action', {
      action: 'send_followup',
      application_id,
      milestone_day,
    }, request);

    return NextResponse.json({ success: true, milestone_day });
  } catch (err) {
    console.error('Follow-up email error:', err);
    return NextResponse.json({ error: 'Failed to send follow-up' }, { status: 500 });
  }
}
