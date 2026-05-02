import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendAcceptanceEmail, sendRejectionEmail } from '@/lib/email';

/* POST /api/admin/send-email — Send accept/reject emails directly via Resend */
export async function POST(request: NextRequest) {
  try {
    const { action, application_id } = await request.json();

    if (!action || !application_id) {
      return NextResponse.json({ error: 'Missing action or application_id' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: app, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finapply.vercel.app';

    if (action === 'accept') {
      await sendAcceptanceEmail({
        full_name: app.full_name,
        email: app.email,
        target_role: app.target_role || '',
        deal_room_url: `${appUrl}/dealroom/${app.deal_room_token}`,
      });
    } else {
      await sendRejectionEmail({
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
