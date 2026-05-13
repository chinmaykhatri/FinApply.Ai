import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, auditLog } from '@/lib/security';

/* GET /api/leaderboard — Public cohort leaderboard */
export async function GET(request: NextRequest) {
  try {
    // Rate limit: 10 per minute per IP (prevent scraping)
    const limited = applyRateLimit(request, 'scrape');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/leaderboard' }, request);
      return limited;
    }

    const supabase = createAdminClient();

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
      console.error('Leaderboard query error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Anonymize names for privacy — only first name + last initial
    const leaderboard = (data || []).map((entry: Record<string, unknown>, idx: number) => {
      const app = entry.applications as Record<string, string> | null;
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

    return NextResponse.json(
      { success: true, data: leaderboard },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
