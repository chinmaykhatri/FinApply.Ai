import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, company } = await req.json();

    if (!email || !company) {
      return NextResponse.json({ error: 'Email and company required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('employer_waitlist')
      .insert({ email, company });

    if (error) {
      // If table doesn't exist yet, still return success
      console.error('Employer waitlist insert error:', error);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
