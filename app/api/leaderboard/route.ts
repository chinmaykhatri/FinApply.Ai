import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* GET /api/leaderboard — Public cohort leaderboard */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('fiss_reports')
      .select(`
        total_score,
        created_at,
        application_id,
        applications!inner (
          full_name,
          college_or_firm,
          target_role
        )
      `)
      .order('total_score', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Leaderboard query error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Anonymize names for privacy (first name + last initial)
    const leaderboard = (data || []).map((entry: any, idx: number) => {
      const app = entry.applications;
      const nameParts = (app?.full_name || 'Anonymous').split(' ');
      const displayName = nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
        : nameParts[0];

      return {
        rank: idx + 1,
        name: displayName,
        college: app?.college_or_firm || 'Unknown',
        role: app?.target_role || 'Unknown',
        score: entry.total_score,
        date: entry.created_at,
      };
    });

    return NextResponse.json({ success: true, data: leaderboard });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
