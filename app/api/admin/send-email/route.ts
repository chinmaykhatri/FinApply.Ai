import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeEmail, sendDelayAlert } from '@/lib/email';

/* POST /api/admin/send-email — Send welcome or delay emails */
export async function POST(request: NextRequest) {
  try {
    const { action, application_id } = await request.json();

    if (!action || !application_id) {
      return NextResponse.json({ error: 'Missing action or application_id' }, { status: 400 });
    }

    if (!['accept', 'delay'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "accept" or "delay".' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: app, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fin-apply-ai.vercel.app';

    if (action === 'accept') {
      await sendWelcomeEmail({
        full_name: app.full_name,
        email: app.email,
        deal_room_url: `${appUrl}/dealroom/${app.deal_room_token}`,
      });
    } else if (action === 'delay') {
      await sendDelayAlert({
        full_name: app.full_name,
        email: app.email,
      });
    }

    return NextResponse.json({ success: true, message: `${action} email sent to ${app.email}` });
  } catch (err) {
    console.error('Send email error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
