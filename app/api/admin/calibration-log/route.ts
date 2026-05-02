import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST: Log a calibration override
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      application_id,
      admin_email,
      original_score,
      override_score,
      dimension,
      reason,
    } = body;

    if (!application_id || !original_score || !override_score) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('calibration_logs')
      .insert({
        application_id,
        admin_email: admin_email || 'admin@finapply.ai',
        original_score,
        override_score,
        dimension: dimension || 'total_score',
        reason: reason || '',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Table may not exist yet — log and return gracefully
      console.error('Calibration log insert error:', error);
      return NextResponse.json({ success: true, warning: 'Log table not configured' });
    }

    return NextResponse.json({ success: true, log: data });
  } catch (err) {
    console.error('Calibration log error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// GET: Retrieve calibration history for a candidate
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('application_id');

    if (!applicationId) {
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('calibration_logs')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Calibration log fetch error:', error);
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json({ logs: data || [] });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
