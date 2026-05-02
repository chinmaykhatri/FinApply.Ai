import { Resend } from 'resend';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  return new Resend(key);
}

/* ── Email Templates ── */

function adminNotificationHTML(data: {
  full_name: string;
  email: string;
  target_role: string;
  college_or_firm: string;
  linkedin_url?: string;
  essay?: string;
}) {
  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:40px;border-radius:16px">
  <div style="border-bottom:1px solid #222;padding-bottom:20px;margin-bottom:24px">
    <h1 style="font-size:20px;font-weight:600;margin:0">New Beta Application</h1>
    <p style="font-size:12px;color:#666;margin-top:4px">FinApply.ai · Founding Cohort</p>
  </div>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:8px 0;color:#666;font-size:13px">Name</td><td style="padding:8px 0;color:#fff;font-size:13px;font-weight:500">${data.full_name}</td></tr>
    <tr><td style="padding:8px 0;color:#666;font-size:13px">Email</td><td style="padding:8px 0;color:#fff;font-size:13px">${data.email}</td></tr>
    <tr><td style="padding:8px 0;color:#666;font-size:13px">Role</td><td style="padding:8px 0;color:#2563EB;font-size:13px;font-weight:500">${data.target_role}</td></tr>
    <tr><td style="padding:8px 0;color:#666;font-size:13px">College/Firm</td><td style="padding:8px 0;color:#fff;font-size:13px">${data.college_or_firm}</td></tr>
    ${data.linkedin_url ? `<tr><td style="padding:8px 0;color:#666;font-size:13px">LinkedIn</td><td style="padding:8px 0;font-size:13px"><a href="${data.linkedin_url}" style="color:#2563EB">Profile →</a></td></tr>` : ''}
  </table>
  ${data.essay ? `
  <div style="margin-top:24px;padding:16px;background:#111;border-radius:10px">
    <p style="font-size:11px;color:#666;margin:0 0 6px">ESSAY</p>
    <p style="font-size:13px;color:#999;line-height:1.5;margin:0">${data.essay}</p>
  </div>` : ''}
  <div style="margin-top:24px;text-align:center">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://finapply.vercel.app'}/admin" style="display:inline-block;padding:10px 24px;background:#2563EB;color:#fff;border-radius:100px;text-decoration:none;font-size:13px;font-weight:500">Review in Admin →</a>
  </div>
</div>`;
}

function acceptanceHTML(data: { full_name: string; target_role: string; deal_room_url: string }) {
  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:40px;border-radius:16px">
  <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #222">
    <p style="font-size:11px;color:#2563EB;letter-spacing:3px;font-weight:600;margin:0">FINAPPLY.AI</p>
  </div>
  <div style="padding:32px 0;text-align:center">
    <div style="display:inline-block;background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.2);border-radius:100px;padding:6px 16px;margin-bottom:20px">
      <span style="font-size:12px;color:#16A34A;font-weight:500">✓ ACCEPTED</span>
    </div>
    <h1 style="font-size:24px;font-weight:600;margin:0 0 8px">Congratulations, ${data.full_name}!</h1>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0">You have been accepted into FinApply's founding cohort of 100 candidates.</p>
  </div>
  <div style="background:#111;border-radius:12px;padding:24px;margin:16px 0;border:1px solid #222">
    <p style="font-size:12px;color:#666;margin:0 0 8px">YOUR DEAL ROOM</p>
    <p style="font-size:14px;color:#fff;line-height:1.5;margin:0 0 16px">Your personalized simulation is ready. You'll analyze a real ${data.target_role} case and receive your FISS report.</p>
    <div style="text-align:center">
      <a href="${data.deal_room_url}" style="display:inline-block;padding:12px 32px;background:#2563EB;color:#fff;border-radius:100px;text-decoration:none;font-size:14px;font-weight:500">Enter Deal Room →</a>
    </div>
  </div>
  <div style="margin-top:20px;padding:16px;background:rgba(217,119,6,0.06);border-left:3px solid #D97706;border-radius:0 8px 8px 0">
    <p style="font-size:12px;color:#D97706;margin:0 0 4px;font-weight:500">⏱ Important</p>
    <p style="font-size:13px;color:#999;line-height:1.5;margin:0">You have <strong style="color:#fff">90 minutes</strong> to complete your analysis once you start.</p>
  </div>
  <div style="margin-top:32px;padding-top:20px;border-top:1px solid #222;text-align:center">
    <p style="font-size:11px;color:#444;margin:0">FinApply.ai · Founding Cohort · Batch 1</p>
  </div>
</div>`;
}

function rejectionHTML(data: { full_name: string }) {
  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:40px;border-radius:16px">
  <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #222">
    <p style="font-size:11px;color:#2563EB;letter-spacing:3px;font-weight:600;margin:0">FINAPPLY.AI</p>
  </div>
  <div style="padding:32px 0">
    <h1 style="font-size:22px;font-weight:600;margin:0 0 16px">Hi ${data.full_name},</h1>
    <p style="font-size:14px;color:#999;line-height:1.7;margin:0 0 16px">Thank you for your interest in FinApply's founding cohort.</p>
    <p style="font-size:14px;color:#999;line-height:1.7;margin:0 0 16px">Applications have been extremely competitive — we received far more qualified applications than available spots in this cohort.</p>
    <p style="font-size:14px;color:#999;line-height:1.7;margin:0 0 16px">We were unable to offer you a spot in this batch, but your application stood out and we encourage you to apply again when the next cohort opens.</p>
    <div style="margin-top:24px;padding:16px;background:#111;border-radius:10px;border:1px solid #222">
      <p style="font-size:13px;color:#666;line-height:1.5;margin:0">We'll notify you via email when Batch 2 applications open.</p>
    </div>
  </div>
  <div style="margin-top:16px;padding-top:20px;border-top:1px solid #222;text-align:center">
    <p style="font-size:11px;color:#444;margin:0">FinApply.ai · Founding Cohort</p>
  </div>
</div>`;
}

function reportHTML(data: {
  full_name: string;
  fiss_score: number;
  evaluator_summary: string;
  standout_strength: string;
  critical_gap: string;
  report_url: string;
  pdf_url?: string;
  loom_url?: string;
}) {
  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:40px;border-radius:16px">
  <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #222">
    <p style="font-size:11px;color:#2563EB;letter-spacing:3px;font-weight:600;margin:0">FINAPPLY.AI</p>
  </div>
  <div style="padding:32px 0;text-align:center">
    <p style="font-size:11px;color:#666;letter-spacing:2px;margin:0 0 12px">YOUR FISS SCORE</p>
    <div style="display:inline-block;width:100px;height:100px;border-radius:50%;border:3px solid #2563EB;line-height:100px;text-align:center;margin-bottom:16px">
      <span style="font-size:36px;font-weight:700">${data.fiss_score}</span>
    </div>
    <p style="font-size:11px;color:#666;margin:0">out of 100</p>
  </div>
  <div style="background:#111;border-radius:12px;padding:20px;margin:16px 0;border:1px solid #222">
    <p style="font-size:12px;color:#666;margin:0 0 6px">EVALUATOR SUMMARY</p>
    <p style="font-size:14px;color:#ccc;line-height:1.6;margin:0;font-style:italic">"${data.evaluator_summary}"</p>
  </div>
  <div style="padding:14px;background:rgba(22,163,74,0.06);border-left:3px solid #16A34A;border-radius:0 8px 8px 0;margin:16px 0">
    <p style="font-size:10px;color:#16A34A;letter-spacing:1px;margin:0 0 4px;font-weight:600">STRENGTH</p>
    <p style="font-size:12px;color:#999;line-height:1.4;margin:0">${data.standout_strength}</p>
  </div>
  <div style="padding:14px;background:rgba(217,119,6,0.06);border-left:3px solid #D97706;border-radius:0 8px 8px 0;margin:16px 0">
    <p style="font-size:10px;color:#D97706;letter-spacing:1px;margin:0 0 4px;font-weight:600">AREA TO DEVELOP</p>
    <p style="font-size:12px;color:#999;line-height:1.4;margin:0">${data.critical_gap}</p>
  </div>
  ${data.loom_url ? `
  <div style="text-align:center;margin:20px 0">
    <a href="${data.loom_url}" style="display:inline-block;padding:10px 24px;background:#7C3AED;color:#fff;border-radius:100px;text-decoration:none;font-size:13px;font-weight:500">▶ Watch Your Walkthrough</a>
  </div>` : ''}
  <div style="text-align:center;margin-top:24px">
    <a href="${data.report_url}" style="display:inline-block;padding:12px 32px;background:#2563EB;color:#fff;border-radius:100px;text-decoration:none;font-size:14px;font-weight:500;margin-bottom:12px">View Full Report →</a>
    ${data.pdf_url ? `<br/><a href="${data.pdf_url}" style="font-size:12px;color:#666;text-decoration:underline">Download PDF Report</a>` : ''}
  </div>
  <div style="margin-top:32px;padding-top:20px;border-top:1px solid #222;text-align:center">
    <p style="font-size:11px;color:#444;margin:0">Evaluated by human + AI collaboration</p>
    <p style="font-size:10px;color:#333;margin-top:4px">FinApply.ai · FISS Score v1.0</p>
  </div>
</div>`;
}

/* ── Public API ── */

const FROM_EMAIL = 'FinApply <onboarding@resend.dev>';

export async function sendAdminNotification(data: {
  full_name: string;
  email: string;
  target_role: string;
  college_or_firm: string;
  linkedin_url?: string;
  essay?: string;
}) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to: process.env.ADMIN_EMAIL || 'chinmaykhatri495@gmail.com',
    subject: `🔔 New Application — ${data.full_name} — ${data.target_role}`,
    html: adminNotificationHTML(data),
  });
}

export async function sendAcceptanceEmail(data: {
  full_name: string;
  email: string;
  target_role: string;
  deal_room_url: string;
}) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `You're in — Your Deal Room is ready, ${data.full_name}`,
    html: acceptanceHTML(data),
  });
}

export async function sendRejectionEmail(data: { full_name: string; email: string }) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: 'FinApply Beta — Application Update',
    html: rejectionHTML(data),
  });
}

export async function sendReportEmail(data: {
  full_name: string;
  email: string;
  fiss_score: number;
  evaluator_summary: string;
  standout_strength: string;
  critical_gap: string;
  report_url: string;
  pdf_url?: string;
  loom_url?: string;
}) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Your FISS Score Report is Ready — ${data.fiss_score}/100`,
    html: reportHTML(data),
  });
}

/* ── Follow-up / Outcome Tracking Emails ── */

function followUpHTML(data: { full_name: string; milestone_day: number; outcome_url: string }) {
  const milestoneMessages: Record<number, { subject: string; body: string }> = {
    30: {
      subject: 'How are things going?',
      body: `It's been 30 days since you completed your FISS assessment. We'd love to hear how your career journey is progressing — whether you've landed interviews, received offers, or are still exploring.`,
    },
    60: {
      subject: 'Quick check-in',
      body: `Two months have passed since your FISS Score. Many of our founding cohort candidates have shared exciting updates. We'd love to hear yours — your progress helps us improve FinApply for everyone.`,
    },
    90: {
      subject: 'Your 90-day update',
      body: `It's been 90 days since your FISS assessment — a perfect time to reflect on progress. Whether you've secured a role or are still on the path, your outcome data helps calibrate our scoring system.`,
    },
  };

  const msg = milestoneMessages[data.milestone_day] || milestoneMessages[30];

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:40px;border-radius:16px">
  <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #222">
    <p style="font-size:11px;color:#2563EB;letter-spacing:3px;font-weight:600;margin:0">FINAPPLY.AI</p>
  </div>
  <div style="padding:32px 0">
    <div style="display:inline-block;background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.2);border-radius:100px;padding:6px 16px;margin-bottom:20px">
      <span style="font-size:12px;color:#2563EB;font-weight:500">DAY ${data.milestone_day} CHECK-IN</span>
    </div>
    <h1 style="font-size:22px;font-weight:600;margin:0 0 16px">Hi ${data.full_name.split(' ')[0]},</h1>
    <p style="font-size:14px;color:#999;line-height:1.7;margin:0 0 24px">${msg.body}</p>
    <div style="text-align:center">
      <a href="${data.outcome_url}" style="display:inline-block;padding:12px 32px;background:#2563EB;color:#fff;border-radius:100px;text-decoration:none;font-size:14px;font-weight:500">Share Your Update →</a>
    </div>
  </div>
  <div style="margin-top:20px;padding:16px;background:#111;border-radius:10px;border:1px solid #222">
    <p style="font-size:12px;color:#666;line-height:1.5;margin:0">Your response takes 2 minutes and helps us build a better platform for future candidates.</p>
  </div>
  <div style="margin-top:24px;padding-top:20px;border-top:1px solid #222;text-align:center">
    <p style="font-size:11px;color:#444;margin:0">FinApply.ai · Founding Cohort</p>
  </div>
</div>`;
}

export async function sendFollowUpEmail(data: {
  full_name: string;
  email: string;
  milestone_day: number;
  outcome_url: string;
}) {
  const subjects: Record<number, string> = {
    30: `Day 30 — How's your journey going, ${data.full_name.split(' ')[0]}?`,
    60: `Day 60 Check-in — Quick update from FinApply`,
    90: `Day 90 — Share your career progress`,
  };

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: subjects[data.milestone_day] || `Career Update — FinApply Check-in`,
    html: followUpHTML(data),
  });
}
