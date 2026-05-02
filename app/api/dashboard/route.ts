import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* POST /api/dashboard — Lookup user applications by email */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = await createClient();

    // Fetch all applications for this email
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        full_name,
        email,
        target_role,
        status,
        deal_room_token,
        report_token,
        created_at,
        updated_at
      `)
      .ilike('email', normalizedEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Dashboard lookup error:', error);
      return NextResponse.json({ error: 'Failed to lookup applications' }, { status: 500 });
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({ error: 'No applications found for this email' }, { status: 404 });
    }

    // For each application, check if there's a FISS report
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const { data: reports } = await supabase
          .from('fiss_reports')
          .select('id, total_score, created_at')
          .eq('application_id', app.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const { data: sims } = await supabase
          .from('simulations')
          .select('id, case_code, word_count, time_taken_seconds, submitted_at')
          .eq('application_id', app.id)
          .order('submitted_at', { ascending: false })
          .limit(1);

        return {
          ...app,
          report: reports?.[0] || null,
          simulation: sims?.[0] || null,
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
