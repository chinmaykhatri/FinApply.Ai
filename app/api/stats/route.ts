/* ═══════════════════════════════════════════════
   Stats API — FinApply.ai
   Returns anonymized platform statistics
   for dynamic social proof on the landing page.
   ═══════════════════════════════════════════════ */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Cache stats for 5 minutes to avoid hammering Supabase on every page load
let cachedCount: number | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    const now = Date.now();

    // Return cached value if fresh
    if (cachedCount !== null && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, count: cachedCount }, { status: 200 });
    }

    const supabase = createAdminClient();

    // Count distinct scored or report_sent applications — only real completions
    const { count, error } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .in('status', ['scored', 'report_sent', 'submitted']);

    if (error) {
      console.error('[Stats] Error fetching count:', error.message);
      return NextResponse.json({ success: false, count: 0 }, { status: 200 });
    }

    cachedCount = count ?? 0;
    cacheTimestamp = now;

    return NextResponse.json({ success: true, count: cachedCount }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, count: 0 }, { status: 200 });
  }
}
