import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* POST /api/simulations — Submit deal room work + auto-evaluate */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      application_id, case_code, content, word_count,
      time_taken_seconds, started_at, tab_violations, violation_log,
    } = body;

    if (!application_id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Insert simulation
    const { data: sim, error: simError } = await supabase
      .from('simulations')
      .insert({
        application_id,
        case_code: case_code || null,
        content,
        word_count: word_count || 0,
        time_taken_seconds: time_taken_seconds || 0,
        started_at: started_at || new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        tab_violations: tab_violations || 0,
        violation_log: violation_log || null,
      })
      .select()
      .single();

    if (simError) {
      console.error('Simulation insert error:', simError);
      return NextResponse.json({ error: 'Failed to save simulation' }, { status: 500 });
    }

    // 2. Update application status to submitted
    await supabase
      .from('applications')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', application_id);

    // 3. Auto-trigger AI evaluation (non-blocking)
    // Fire-and-forget — candidate gets immediate "submitted" response
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finapply-ai-delta.vercel.app';
    fetch(`${baseUrl}/api/admin/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id,
        simulation_id: sim.id,
      }),
    }).catch((err) => {
      console.error('Auto-evaluate trigger failed (non-blocking):', err);
    });

    return NextResponse.json({ success: true, data: sim }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
