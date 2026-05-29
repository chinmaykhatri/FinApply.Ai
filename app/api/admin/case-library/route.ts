import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getCaseByCode, CASE_LIBRARY } from '@/lib/cases';
import type { RoleTrack } from '@/lib/cases';

/* GET  /api/admin/case-library          — list all cases with metadata
   POST /api/admin/case-library          — seed or sync case_metadata from code
   PATCH /api/admin/case-library?code=XX — update a case's metadata/status */

export async function GET(request: NextRequest) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const trackFilter = searchParams.get('track');
  const statusFilter = searchParams.get('status');

  // Get all cases from code
  const allCases: Array<{
    code: string; title: string; track: string;
    difficulty: string; role: string;
  }> = [];

  for (const [track, cases] of Object.entries(CASE_LIBRARY)) {
    for (const c of cases) {
      allCases.push({
        code: c.code, title: c.title,
        track, difficulty: c.difficulty, role: c.role,
      });
    }
  }

  // Get metadata from DB
  const { data: metadata } = await supabase
    .from('case_metadata')
    .select('*');

  const metaMap = new Map((metadata || []).map(m => [m.case_code, m]));

  // Merge code + DB metadata
  let results = allCases.map(c => {
    const meta = metaMap.get(c.code);
    return {
      case_code: c.code,
      title: c.title,
      track: c.track,
      difficulty: c.difficulty,
      role: c.role,
      status: meta?.status || 'active',
      total_uses: meta?.total_uses || 0,
      last_updated: meta?.last_updated || null,
      market_context_updated_at: meta?.market_context_updated_at || null,
      updated_by: meta?.updated_by || null,
      market_context_override: meta?.market_context_override || null,
      financial_data_override: meta?.financial_data_override || null,
      has_metadata: !!meta,
    };
  });

  // Apply filters
  if (trackFilter) results = results.filter(r => r.track === trackFilter);
  if (statusFilter) results = results.filter(r => r.status === statusFilter);

  // Sort: active first, then by track and code
  results.sort((a, b) => {
    const statusOrder: Record<string, number> = { active: 0, review_needed: 1, retiring_soon: 2, retired: 3 };
    const sa = statusOrder[a.status] ?? 4;
    const sb = statusOrder[b.status] ?? 4;
    if (sa !== sb) return sa - sb;
    if (a.track !== b.track) return a.track.localeCompare(b.track);
    return a.case_code.localeCompare(b.case_code);
  });

  return NextResponse.json({ data: results, total: results.length });
}

/** POST — seed case_metadata from code library */
export async function POST() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  let seeded = 0;

  for (const [track, cases] of Object.entries(CASE_LIBRARY)) {
    for (const c of cases) {
      const { error } = await supabase
        .from('case_metadata')
        .upsert({
          case_code: c.code,
          title: c.title,
          role_track: track,
          difficulty: c.difficulty,
          status: 'active',
          last_updated: new Date().toISOString(),
          market_context_updated_at: new Date().toISOString(),
        }, { onConflict: 'case_code' });

      if (!error) seeded++;
    }
  }

  return NextResponse.json({ success: true, seeded });
}

/** PATCH — update a case's metadata */
export async function PATCH(request: NextRequest) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });

  const body = await request.json();
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (body.status) updates.status = body.status;
  if (body.market_context_override !== undefined) {
    updates.market_context_override = body.market_context_override;
    updates.market_context_updated_at = new Date().toISOString();
  }
  if (body.financial_data_override !== undefined) {
    updates.financial_data_override = body.financial_data_override;
  }
  updates.updated_by = user.email || 'admin';
  updates.last_updated = new Date().toISOString();

  const { error } = await supabase
    .from('case_metadata')
    .upsert({ case_code: code, ...updates }, { onConflict: 'case_code' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
