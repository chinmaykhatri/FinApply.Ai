import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* GET /api/report/[token] — Fetch FISS report by report token */
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

    // Find application by report token
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('*, fiss_reports(*)')
      .eq('report_token', token)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ data: app });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
