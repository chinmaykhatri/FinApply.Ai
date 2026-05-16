import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ADMIN_EMAIL } from '@/lib/constants';
import { applyRateLimit, auditLog } from '@/lib/security';

/* GET /api/admin/test-dealroom?role=IB
   Admin-only endpoint to generate a mock application
   so the admin can test any Deal Room simulation.
   Authentication is handled by middleware — no need for getUser() here. */
export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const limited = applyRateLimit(request, 'api');
    if (limited) return limited;

    // NOTE: Middleware already verifies admin session for /api/admin/* routes.
    // No need for redundant getUser() check which fails on admin client.

    // Get the desired role from query params
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'Investment Banking Analyst';

    // Validate role against whitelist
    const validRoles = [
      'Investment Banking Analyst',
      'Private Equity Associate',
      'Big 4 Advisory Analyst',
      'Corporate Finance Analyst',
      'Equity Research Analyst',
    ];

    const sanitizedRole = validRoles.includes(role) ? role : 'Investment Banking Analyst';

    // Return a mock application object matching the shape of a real one
    const mockApp = {
      id: `admin-test-${Date.now()}`,
      full_name: 'Admin Test User',
      email: ADMIN_EMAIL,
      target_role: sanitizedRole,
      status: 'dealroom_sent',
      deal_room_token: 'admin-test',
      simulations: [],
    };

    auditLog('admin.action', {
      action: 'test_dealroom',
      role: sanitizedRole,
    }, request);

    return NextResponse.json({ data: mockApp, admin_mode: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
