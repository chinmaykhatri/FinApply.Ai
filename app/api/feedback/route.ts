import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* POST /api/feedback — Candidate submits feedback on their FISS report */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      application_id,
      accuracy_rating,
      usefulness_rating,
      would_recommend,
      open_feedback,
    } = body;

    if (!application_id || !accuracy_rating || !usefulness_rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        application_id,
        accuracy_rating,
        usefulness_rating,
        would_recommend: would_recommend ?? true,
        open_feedback: open_feedback || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Feedback insert error:', error);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
