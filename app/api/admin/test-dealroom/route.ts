import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL } from '@/lib/constants';

/* GET /api/admin/test-dealroom?role=IB
   Admin-only endpoint to generate a mock application
   so the admin can test any Deal Room simulation */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verify the caller is the admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Get the desired role from query params
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'Investment Banking Analyst';

    // Return a mock application object matching the shape of a real one
    const mockApp = {
      id: `admin-test-${Date.now()}`,
      full_name: 'Admin Test User',
      email: ADMIN_EMAIL,
      target_role: role,
      status: 'dealroom_sent',
      deal_room_token: 'admin-test',
      simulations: [],
    };

    return NextResponse.json({ data: mockApp, admin_mode: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
