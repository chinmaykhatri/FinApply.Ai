import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

/* POST /api/register — Public registration (no beta gate) */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, college_or_firm, city, current_status, target_role, linkedin_url } = body;

    // Validation
    if (!full_name || !email || !college_or_firm || !city || !current_status || !target_role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Generate tokens
    const deal_room_token = crypto.randomUUID();
    const report_token = crypto.randomUUID();

    const { data, error } = await supabase
      .from('applications')
      .insert({
        full_name,
        email,
        college_or_firm,
        city,
        current_status,
        target_role,
        essay: linkedin_url ? `LinkedIn: ${linkedin_url}` : 'Direct registration',
        status: 'applied',
        deal_room_token,
        report_token,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate email — return existing tokens
      if (error.code === '23505' && error.message?.includes('email')) {
        const { data: existing } = await supabase
          .from('applications')
          .select('id, deal_room_token, report_token')
          .eq('email', email)
          .single();

        if (existing) {
          return NextResponse.json({
            success: true,
            existing: true,
            data: {
              id: existing.id,
              deal_room_token: existing.deal_room_token,
              report_token: existing.report_token,
            },
          }, { status: 200 });
        }
      }
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
    }

    // Send email notification to admin
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'FinApply <onboarding@resend.dev>',
          to: 'chinmay.finapply.ai@gmail.com',
          subject: `🚀 New Registration — ${full_name} — ${target_role}`,
          html: buildNotificationEmail({
            full_name,
            email,
            college_or_firm,
            city,
            current_status,
            target_role,
            linkedin_url,
          }),
        });
      }
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        deal_room_token,
        report_token,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildNotificationEmail(data: {
  full_name: string;
  email: string;
  college_or_firm: string;
  city: string;
  current_status: string;
  target_role: string;
  linkedin_url?: string;
}) {
  const roleLabels: Record<string, string> = {
    ib_analyst: 'Investment Banking Analyst',
    pe_analyst: 'Private Equity Analyst',
    big4_advisory: 'Big 4 Advisory',
    equity_research: 'Equity Research',
    corporate_finance: 'Corporate Finance',
  };

  const statusLabels: Record<string, string> = {
    final_year_student: 'Final Year Student',
    mba_student: 'MBA Student',
    working_0_2: 'Working Professional (0-2 yrs)',
    working_2_plus: 'Working Professional (2+ yrs)',
  };

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:16px;overflow:hidden">
  <!-- Header gradient -->
  <div style="height:4px;background:linear-gradient(90deg,#2563EB,#8B5CF6,#2563EB)"></div>
  
  <div style="padding:40px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
      <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#8B5CF6);display:flex;align-items:center;justify-content:center;font-size:18px">🚀</div>
      <div>
        <h1 style="font-size:20px;font-weight:700;margin:0;color:#fff">New User Registration</h1>
        <p style="font-size:12px;color:#666;margin:2px 0 0">FinApply.ai · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>

    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:24px;margin-bottom:20px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:10px 0;color:#666;font-size:13px;border-bottom:1px solid #1a1a1a;width:120px">Name</td>
          <td style="padding:10px 0;color:#fff;font-size:14px;font-weight:600;border-bottom:1px solid #1a1a1a">${data.full_name}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#666;font-size:13px;border-bottom:1px solid #1a1a1a">Email</td>
          <td style="padding:10px 0;font-size:13px;border-bottom:1px solid #1a1a1a"><a href="mailto:${data.email}" style="color:#2563EB;text-decoration:none">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#666;font-size:13px;border-bottom:1px solid #1a1a1a">Target Role</td>
          <td style="padding:10px 0;font-size:13px;border-bottom:1px solid #1a1a1a">
            <span style="display:inline-block;padding:3px 10px;background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.3);border-radius:100px;color:#2563EB;font-weight:500">${roleLabels[data.target_role] || data.target_role}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#666;font-size:13px;border-bottom:1px solid #1a1a1a">Status</td>
          <td style="padding:10px 0;color:#ccc;font-size:13px;border-bottom:1px solid #1a1a1a">${statusLabels[data.current_status] || data.current_status}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#666;font-size:13px;border-bottom:1px solid #1a1a1a">College/Firm</td>
          <td style="padding:10px 0;color:#ccc;font-size:13px;border-bottom:1px solid #1a1a1a">${data.college_or_firm}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#666;font-size:13px;border-bottom:1px solid #1a1a1a">City</td>
          <td style="padding:10px 0;color:#ccc;font-size:13px;border-bottom:1px solid #1a1a1a">${data.city}</td>
        </tr>
        ${data.linkedin_url ? `
        <tr>
          <td style="padding:10px 0;color:#666;font-size:13px">LinkedIn</td>
          <td style="padding:10px 0;font-size:13px">
            <a href="${data.linkedin_url}" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#0A66C2;color:#fff;border-radius:8px;text-decoration:none;font-size:12px;font-weight:500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              View Profile →
            </a>
          </td>
        </tr>` : ''}
      </table>
    </div>

    <div style="text-align:center;margin-top:24px">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://finapply.vercel.app'}/admin" style="display:inline-block;padding:10px 28px;background:linear-gradient(135deg,#2563EB,#1d4ed8);color:#fff;border-radius:100px;text-decoration:none;font-size:13px;font-weight:600">View in Admin Dashboard →</a>
    </div>

    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #222;text-align:center">
      <p style="font-size:11px;color:#444;margin:0">FinApply.ai · User Registration Notification</p>
    </div>
  </div>
</div>`;
}
