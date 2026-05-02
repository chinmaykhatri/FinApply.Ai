import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ONE-TIME setup route to create admin user
// DELETE THIS FILE after creating your admin account!
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Sign up the user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm the email
    });

    if (error) {
      // Try regular signup if admin API fails
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        return NextResponse.json({ error: signUpError.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'User created via signup. You may need to confirm your email in Supabase dashboard.',
        user: signUpData.user?.email,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created and confirmed!',
      user: data.user?.email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}
