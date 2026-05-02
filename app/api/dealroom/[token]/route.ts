import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* GET /api/dealroom/[token] — Validate deal room token and fetch application */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Find application by deal_room_token
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('*, simulations(*)')
      .eq('deal_room_token', token)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Only allow access if status is dealroom_sent (admin approved)
    if (app.status !== 'dealroom_sent' && app.status !== 'submitted') {
      return NextResponse.json({ error: 'Deal room access not yet granted' }, { status: 403 });
    }

    return NextResponse.json({ data: app });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
