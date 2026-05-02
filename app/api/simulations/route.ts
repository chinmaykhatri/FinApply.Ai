import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* POST /api/simulations — Submit deal room work */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { application_id, content, word_count, time_taken_seconds, started_at } = body;

    if (!application_id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // Insert simulation
    const { data: sim, error: simError } = await supabase
      .from('simulations')
      .insert({
        application_id,
        content,
        word_count: word_count || 0,
        time_taken_seconds: time_taken_seconds || 0,
        started_at: started_at || new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (simError) {
      console.error('Simulation insert error:', simError);
      return NextResponse.json({ error: 'Failed to save simulation' }, { status: 500 });
    }

    // Update application status
    await supabase
      .from('applications')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', application_id);

    return NextResponse.json({ success: true, data: sim }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
