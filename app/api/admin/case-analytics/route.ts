import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/* GET /api/admin/case-analytics — aggregate per-case metrics */
export async function GET(request: NextRequest) {
  // Verify admin auth
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { searchParams } = new URL(request.url);
  const trackFilter = searchParams.get('track'); // IB, PE, B4, ER, CF
  const difficultyFilter = searchParams.get('difficulty');
  const days = parseInt(searchParams.get('days') || '0') || 0;

  // 1. Fetch all simulations with their FISS reports
  let simQuery = supabase
    .from('simulations')
    .select(`
      id,
      case_code,
      word_count,
      time_taken_seconds,
      submitted_at,
      case_variables,
      application_id,
      fiss_reports (
        total_score,
        financial_reasoning,
        structured_thinking,
        risk_identification,
        decision_clarity,
        non_obvious_found,
        non_obvious_note
      )
    `)
    .not('case_code', 'is', null);

  if (days > 0) {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    simQuery = simQuery.gte('submitted_at', since);
  }

  const { data: sims, error: simErr } = await simQuery;
  if (simErr) {
    return NextResponse.json({ error: simErr.message }, { status: 500 });
  }

  // 2. Fetch calibration overrides
  const { data: overrides } = await supabase
    .from('calibration_log')
    .select('application_id, dimension, original_score, override_score, reason, created_at');

  // 3. Build per-case aggregation
  interface CaseMetrics {
    case_code: string;
    title: string;
    track: string;
    difficulty: string;
    total_uses: number;
    scores: number[];
    times: number[];
    non_obvious_found_count: number;
    override_count: number;
    override_entries: Array<{
      date: string;
      dimension: string;
      original: number;
      override: number;
      reason: string;
    }>;
    fr_scores: number[];
    st_scores: number[];
    ri_scores: number[];
    dc_scores: number[];
    completion_count: number;
    opened_count: number;
  }

  const caseMap = new Map<string, CaseMetrics>();

  for (const sim of (sims || [])) {
    const code = sim.case_code;
    if (!code) continue;

    // Parse track from case code (e.g. IB-001 → IB)
    const track = code.split('-')[0];
    if (trackFilter && track !== trackFilter) continue;

    if (!caseMap.has(code)) {
      caseMap.set(code, {
        case_code: code,
        title: '',
        track,
        difficulty: '',
        total_uses: 0,
        scores: [],
        times: [],
        non_obvious_found_count: 0,
        override_count: 0,
        override_entries: [],
        fr_scores: [],
        st_scores: [],
        ri_scores: [],
        dc_scores: [],
        completion_count: 0,
        opened_count: 0,
      });
    }

    const metrics = caseMap.get(code)!;
    metrics.total_uses++;
    metrics.opened_count++;

    if (sim.time_taken_seconds > 0) {
      metrics.times.push(Math.round(sim.time_taken_seconds / 60));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const report = (sim.fiss_reports as any)?.[0];
    if (report) {
      metrics.completion_count++;
      if (report.total_score) metrics.scores.push(report.total_score);
      if (report.non_obvious_found) metrics.non_obvious_found_count++;

      const fr = report.financial_reasoning as { score?: number } | null;
      const st = report.structured_thinking as { score?: number } | null;
      const ri = report.risk_identification as { score?: number } | null;
      const dc = report.decision_clarity as { score?: number } | null;
      if (fr?.score) metrics.fr_scores.push(fr.score);
      if (st?.score) metrics.st_scores.push(st.score);
      if (ri?.score) metrics.ri_scores.push(ri.score);
      if (dc?.score) metrics.dc_scores.push(dc.score);
    }

    // Check for overrides on this application
    if (overrides) {
      const appOverrides = overrides.filter(o => o.application_id === sim.application_id);
      if (appOverrides.length > 0) {
        metrics.override_count++;
        for (const o of appOverrides) {
          metrics.override_entries.push({
            date: o.created_at,
            dimension: o.dimension,
            original: o.original_score,
            override: o.override_score,
            reason: o.reason || '',
          });
        }
      }
    }
  }

  // 4. Enrich with case library metadata
  const { getCaseByCode } = await import('@/lib/cases');

  const results = Array.from(caseMap.values()).map((m) => {
    const dealCase = getCaseByCode(m.case_code);
    if (dealCase) {
      m.title = dealCase.title;
      m.difficulty = dealCase.difficulty;
    }

    if (difficultyFilter && m.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()) {
      return null;
    }

    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : 0;

    const avgFiss = avg(m.scores);
    const completionPct = m.opened_count > 0 ? Math.round(m.completion_count / m.opened_count * 100) : 0;
    const avgTime = avg(m.times);
    const nonObviousPct = m.completion_count > 0 ? Math.round(m.non_obvious_found_count / m.completion_count * 100) : 0;
    const overridePct = m.completion_count > 0 ? Math.round(m.override_count / m.completion_count * 100) : 0;

    // Score distribution
    const scoreBands = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '50-59': 0, '<50': 0 };
    for (const s of m.scores) {
      if (s >= 90) scoreBands['90-100']++;
      else if (s >= 80) scoreBands['80-89']++;
      else if (s >= 70) scoreBands['70-79']++;
      else if (s >= 60) scoreBands['60-69']++;
      else if (s >= 50) scoreBands['50-59']++;
      else scoreBands['<50']++;
    }

    // Time distribution
    const timeBands = { '<15': 0, '15-25': 0, '25-35': 0, '35-45': 0, '45+': 0 };
    for (const t of m.times) {
      if (t < 15) timeBands['<15']++;
      else if (t < 25) timeBands['15-25']++;
      else if (t < 35) timeBands['25-35']++;
      else if (t < 45) timeBands['35-45']++;
      else timeBands['45+']++;
    }

    // Case health score
    const fissScore = avgFiss >= 62 && avgFiss <= 74 ? 100 : avgFiss > 78 ? Math.max(0, 100 - (avgFiss - 78) * 5) : avgFiss < 55 ? Math.max(0, 100 - (55 - avgFiss) * 5) : 80;
    const compScore = completionPct >= 80 ? 100 : completionPct >= 65 ? 70 : Math.max(0, completionPct * 1.2);
    const nonObvScore = nonObviousPct >= 15 && nonObviousPct <= 40 ? 100 : nonObviousPct > 40 ? Math.max(0, 100 - (nonObviousPct - 40) * 3) : Math.max(0, nonObviousPct * 5);
    const timeScore = avgTime >= 25 && avgTime <= 42 ? 100 : avgTime < 25 ? Math.max(0, avgTime * 4) : Math.max(0, 100 - (avgTime - 42) * 5);
    const overrideScore = overridePct <= 10 ? 100 : overridePct <= 30 ? 70 : Math.max(0, 100 - overridePct * 2);

    const healthScore = Math.round(
      fissScore * 0.25 +
      compScore * 0.25 +
      nonObvScore * 0.20 +
      timeScore * 0.15 +
      overrideScore * 0.15,
    );

    // Status
    let status = 'Active';
    if (m.total_uses > 500) status = 'Retired';
    else if (m.total_uses > 400) status = 'Retiring Soon';
    else if (avgFiss > 78 || completionPct < 65 || nonObviousPct > 40 || overridePct > 30) status = 'Review Needed';

    return {
      case_code: m.case_code,
      title: m.title || m.case_code,
      track: m.track,
      difficulty: m.difficulty,
      total_uses: m.total_uses,
      avg_fiss: avgFiss,
      completion_pct: completionPct,
      avg_time: avgTime,
      non_obvious_pct: nonObviousPct,
      override_pct: overridePct,
      health_score: healthScore,
      status,
      score_distribution: scoreBands,
      time_distribution: timeBands,
      dimension_averages: {
        fr: avg(m.fr_scores),
        st: avg(m.st_scores),
        ri: avg(m.ri_scores),
        dc: avg(m.dc_scores),
      },
      recent_overrides: m.override_entries.slice(-10),
    };
  }).filter(Boolean);

  results.sort((a, b) => (b?.total_uses || 0) - (a?.total_uses || 0));

  return NextResponse.json({ data: results });
}
