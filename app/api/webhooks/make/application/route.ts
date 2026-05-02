import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendAdminNotification } from '@/lib/email';
import crypto from 'crypto';

/* POST /api/webhooks/make/application — Receive Tally form data */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      full_name,
      email,
      linkedin_url,
      college_or_firm,
      city,
      current_status,
      target_role,
      essay,
      webhook_secret,
    } = body;

    // Validate webhook secret
    if (webhook_secret !== process.env.MAKE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!full_name || !email || !target_role) {
      return NextResponse.json({ error: 'Missing required fields: full_name, email, target_role' }, { status: 400 });
    }

    const supabase = await createClient();

    // Generate unique tokens
    const deal_room_token = crypto.randomUUID();
    const report_token = crypto.randomUUID();

    // Insert application
    const { data, error } = await supabase
      .from('applications')
      .insert({
        full_name,
        email,
        linkedin_url: linkedin_url || null,
        college_or_firm: college_or_firm || null,
        city: city || null,
        current_status: current_status || null,
        target_role,
        essay: essay || null,
        deal_room_token,
        report_token,
        status: 'applied',
      })
      .select()
      .single();

    if (error) {
      console.error('Application insert error:', error);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    // Send admin notification email (best-effort)
    try {
      await sendAdminNotification({
        full_name,
        email,
        target_role,
        college_or_firm: college_or_firm || '',
        linkedin_url,
      });
    } catch (emailErr) {
      console.error('Admin notification email failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      application_id: data.id,
      deal_room_token,
      report_token,
      deal_room_url: `https://finapply.ai/dealroom/${deal_room_token}`,
      report_url: `https://finapply.ai/report/${report_token}`,
    }, { status: 201 });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
