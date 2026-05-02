import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { token, outcome, company, role, feedback, finapply_helpful } = body;

    if (!outcome) {
      return NextResponse.json({ error: 'Outcome is required' }, { status: 400 });
    }

    // Look up application by report_token if provided
    let applicationId = null;
    if (token) {
      const { data: app } = await supabase
        .from('applications')
        .select('id')
        .eq('report_token', token)
        .single();
      if (app) applicationId = app.id;
    }

    const { error } = await supabase
      .from('outcome_responses')
      .insert({
        application_id: applicationId,
        outcome,
        company: company || null,
        role: role || null,
        feedback: feedback || null,
        finapply_helpful: finapply_helpful || null,
        submitted_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Outcome insert error:', error);
      // Table may not exist yet
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Outcome API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
