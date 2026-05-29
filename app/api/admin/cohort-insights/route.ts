import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/* POST /api/admin/cohort-insights — Generate monthly cohort insights
   Aggregates FISS data from the previous month's completions.
   Can be triggered manually from admin or via a cron job.     */
export async function POST(request: NextRequest) {
  try {
    // Basic admin auth check
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;
    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Calculate date range for last month
    const now = new Date();
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthName = firstOfLastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Fetch all reports from last month
    const { data: reports, error } = await supabase
      .from('fiss_reports')
      .select(`
        total_score,
        percentile,
        financial_reasoning,
        structured_thinking,
        risk_identification,
        decision_clarity,
        evaluator_summary,
        created_at,
        application_id,
        applications (
          target_role,
          full_name,
          email
        )
      `)
      .gte('created_at', firstOfLastMonth.toISOString())
      .lt('created_at', firstOfThisMonth.toISOString());

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reports', detail: error.message }, { status: 500 });
    }

    if (!reports || reports.length < 10) {
      return NextResponse.json({
        error: 'Insufficient data',
        detail: `Only ${reports?.length ?? 0} completions in ${monthName}. Minimum 10 required for meaningful insights.`,
        month: monthName,
        count: reports?.length ?? 0,
      }, { status: 400 });
    }

    // ── Aggregate metrics ──
    const cohortSize = reports.length;
    const avgScore = Math.round(reports.reduce((s, r) => s + (r.total_score ?? 0), 0) / cohortSize);
    const avgFR = Math.round(reports.reduce((s, r) => s + (r.financial_reasoning ?? 0), 0) / cohortSize);
    const avgST = Math.round(reports.reduce((s, r) => s + (r.structured_thinking ?? 0), 0) / cohortSize);
    const avgRI = Math.round(reports.reduce((s, r) => s + (r.risk_identification ?? 0), 0) / cohortSize);
    const avgDC = Math.round(reports.reduce((s, r) => s + (r.decision_clarity ?? 0), 0) / cohortSize);

    // Find strongest and weakest dimensions across cohort
    const dimScores = [
      { name: 'Financial Reasoning', abbr: 'FR', avg: avgFR },
      { name: 'Structured Thinking', abbr: 'ST', avg: avgST },
      { name: 'Risk Identification', abbr: 'RI', avg: avgRI },
      { name: 'Decision Clarity', abbr: 'DC', avg: avgDC },
    ].sort((a, b) => a.avg - b.avg);

    const weakestDim = dimScores[0];
    const strongestDim = dimScores[dimScores.length - 1];

    // Score distribution
    const scoreRanges = {
      elite: reports.filter(r => (r.total_score ?? 0) >= 80).length,
      strong: reports.filter(r => (r.total_score ?? 0) >= 60 && (r.total_score ?? 0) < 80).length,
      developing: reports.filter(r => (r.total_score ?? 0) >= 40 && (r.total_score ?? 0) < 60).length,
      needs_work: reports.filter(r => (r.total_score ?? 0) < 40).length,
    };

    // Track breakdown
    type AppData = { target_role?: string; full_name?: string; email?: string };
    const trackCounts: Record<string, { count: number; avgScore: number; totalScore: number }> = {};
    reports.forEach(r => {
      const apps = r.applications as unknown as AppData | AppData[] | null;
      const app = Array.isArray(apps) ? apps[0] : apps;
      const role = app?.target_role || 'Unknown';
      if (!trackCounts[role]) trackCounts[role] = { count: 0, avgScore: 0, totalScore: 0 };
      trackCounts[role].count++;
      trackCounts[role].totalScore += r.total_score ?? 0;
    });
    Object.values(trackCounts).forEach(t => {
      t.avgScore = Math.round(t.totalScore / t.count);
    });

    const insights = {
      month: monthName,
      generated_at: new Date().toISOString(),
      cohort_size: cohortSize,
      average_score: avgScore,
      dimensions: {
        financial_reasoning: avgFR,
        structured_thinking: avgST,
        risk_identification: avgRI,
        decision_clarity: avgDC,
      },
      strongest_dimension: { name: strongestDim.name, avg: strongestDim.avg },
      weakest_dimension: { name: weakestDim.name, avg: weakestDim.avg },
      score_distribution: scoreRanges,
      tracks: trackCounts,
      key_insights: [
        `The ${monthName} cohort of ${cohortSize} candidates averaged a FISS score of ${avgScore}/100.`,
        `${strongestDim.name} was the strongest dimension (avg ${strongestDim.avg}/25), while ${weakestDim.name} was the most challenging (avg ${weakestDim.avg}/25).`,
        `${scoreRanges.elite} candidate${scoreRanges.elite !== 1 ? 's' : ''} scored 80+ (Elite tier), representing ${Math.round((scoreRanges.elite / cohortSize) * 100)}% of the cohort.`,
        `${Math.round((scoreRanges.developing + scoreRanges.needs_work) / cohortSize * 100)}% of candidates scored below 60, suggesting significant room for improvement in ${weakestDim.name}.`,
      ],
    };

    return NextResponse.json({ data: insights });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
