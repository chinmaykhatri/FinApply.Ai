import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* POST /api/applications — Submit beta application */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, college_or_firm, city, current_status, target_role, essay } = body;

    // Validation
    if (!full_name || !email || !college_or_firm || !city || !current_status || !target_role || !essay) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Generate tokens
    const deal_room_token = crypto.randomUUID();
    const report_token = crypto.randomUUID();

    const { data, error } = await supabase
      .from('applications')
      .insert({
        full_name,
        email,
        college_or_firm,
        city,
        current_status,
        target_role,
        essay,
        status: 'applied',
        deal_room_token,
        report_token,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
