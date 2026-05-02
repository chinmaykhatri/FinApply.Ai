import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST: Send follow-up email at 30/60/90 day milestones
export async function POST(req: Request) {
  try {
    const { application_id, milestone_day } = await req.json();

    if (!application_id || !milestone_day) {
      return NextResponse.json({ error: 'Missing application_id or milestone_day' }, { status: 400 });
    }

    // Get candidate details
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Import email utility dynamically to avoid build issues
    const { sendFollowUpEmail } = await import('@/lib/email');
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finapply.vercel.app';
    
    await sendFollowUpEmail({
      full_name: app.full_name,
      email: app.email,
      milestone_day,
      outcome_url: `${appUrl}/outcome?token=${app.report_token}`,
    });

    // Log the follow-up
    try {
      await supabase.from('outcome_tracking').insert({
        application_id,
        milestone_day,
        sent_at: new Date().toISOString(),
        status: 'sent',
      });
    } catch { /* table may not exist yet */ }

    return NextResponse.json({ success: true, milestone_day });
  } catch (err) {
    console.error('Follow-up email error:', err);
    return NextResponse.json({ error: 'Failed to send follow-up' }, { status: 500 });
  }
}
