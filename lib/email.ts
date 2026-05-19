import nodemailer from 'nodemailer';

/* ── Gmail SMTP Transport ── */
function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD not set');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

async function sendMail(to: string, subject: string, html: string) {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: `Chinmay from FinApply <${process.env.GMAIL_USER}>`,
    replyTo: 'chinmaykhatri495@gmail.com',
    to,
    subject,
    html,
  });
}

/* ─────────────────────────────────────────────
   Shared styles — dark, premium, minimal
   ───────────────────────────────────────────── */
const WRAPPER = `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:40px 32px;border-radius:0`;
const MUTED = `color:rgba(255,255,255,0.55);font-size:14px;line-height:1.7`;
const STRONG = `color:#fff;font-weight:600`;
const LINK_BTN = `display:inline-block;padding:14px 32px;background:#fff;color:#000;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.3px`;
const DIVIDER = `border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0`;
const FOOTER = `font-size:11px;color:rgba(255,255,255,0.25);margin-top:8px`;
const SIGNATURE = `<p style="margin:0;color:#fff;font-size:14px;font-weight:500">Chinmay Khatri</p>
<p style="margin:2px 0 0;font-size:12px;color:rgba(255,255,255,0.40)">Founder, FinApply.ai</p>
<p style="margin:2px 0 0;font-size:12px;color:rgba(255,255,255,0.30)">chinmaykhatri495@gmail.com</p>`;

/* ══════════════════════════════════════════════
   EMAIL 1 — WELCOME + DEAL ROOM ACCESS
   Sent immediately on registration
   ══════════════════════════════════════════════ */
function welcomeHTML(data: { full_name: string; deal_room_url: string }) {
  const firstName = data.full_name.split(' ')[0];
  return `
<div style="${WRAPPER}">
  <p style="${MUTED}">Hi ${firstName},</p>

  <p style="color:#fff;font-size:18px;font-weight:600;margin:20px 0 16px">You are in.</p>

  <p style="${MUTED}">Your Deal Room simulation is ready right now. Click the link below to access it:</p>

  <div style="text-align:center;margin:28px 0">
    <a href="${data.deal_room_url}" style="${LINK_BTN}">ACCESS YOUR DEAL ROOM →</a>
  </div>

  <p style="${MUTED};margin-bottom:4px">Before you begin, three things worth knowing:</p>

  <div style="margin:16px 0;padding:16px 20px;background:rgba(255,255,255,0.03);border-left:3px solid rgba(255,255,255,0.15);border-radius:0 8px 8px 0">
    <p style="${MUTED};margin:0 0 12px"><span style="${STRONG}">The timer starts the moment you click Begin</span> — not when you open the link. Take a minute to read the instructions first.</p>
    <p style="${MUTED};margin:0 0 12px"><span style="${STRONG}">You have 45 minutes once you start.</span> The case is a real company scenario — financials, market context, and a specific task. No multiple choice. No trick questions. Just how you think.</p>
    <p style="${MUTED};margin:0"><span style="${STRONG}">Your FISS Score Report arrives the same day you submit</span> — typically within a few hours. It will show your score across four dimensions with specific strengths, gaps, and what to work on — not a generic scorecard.</p>
  </div>

  <p style="${MUTED}">This link is yours. It does not expire but the 45-minute timer only runs once you begin.</p>

  <p style="${MUTED}">One thing I want to say directly: most candidates are nervous before starting. That is normal. The simulation is designed to be genuinely challenging — not impossible, but not easy either. What we are measuring is not whether you know every answer. We are measuring <span style="${STRONG}">how you think when the answer is not obvious.</span></p>

  <p style="${MUTED}">That is what employers cannot see from your resume. This is how you show them.</p>

  <p style="${MUTED}">Good luck. I will be reading your response personally.</p>

  <div style="margin-top:28px">
    ${SIGNATURE}
  </div>

  <hr style="${DIVIDER}"/>

  <p style="font-size:12px;color:rgba(255,255,255,0.30);font-style:italic;margin:0">P.S. If you run into any technical issue — timer not loading, page not opening, anything — reply to this email immediately. I will fix it within the hour.</p>

  <hr style="${DIVIDER}"/>
  <p style="${FOOTER}">FinApply.ai · Jaipur, India</p>
  <p style="${FOOTER}">You are receiving this because you applied for the FinApply founding cohort.</p>
</div>`;
}

/* ══════════════════════════════════════════════
   EMAIL 2 — FISS REPORT DELIVERY
   Sent after admin evaluates and approves
   ══════════════════════════════════════════════ */
function reportDeliveryHTML(data: {
  full_name: string;
  fiss_score: number;
  percentile: string;
  role_track: string;
  fr_score: number; fr_grade: string;
  st_score: number; st_grade: string;
  ri_score: number; ri_grade: string;
  dc_score: number; dc_grade: string;
  one_liner: string;
  report_url: string;
  loom_url?: string;
  feedback_url?: string;
}) {
  const firstName = data.full_name.split(' ')[0];
  const loomBlock = data.loom_url ? `
  <p style="${MUTED}">I also recorded a 90-second personal walkthrough of your results:</p>
  <div style="text-align:center;margin:20px 0">
    <a href="${data.loom_url}" style="${LINK_BTN};background:#7C3AED;color:#fff">▶ WATCH YOUR SCORE WALKTHROUGH</a>
  </div>
  <p style="${MUTED}">It covers the one thing you did that most candidates miss and the one thing that is holding your score back. Ninety seconds. Worth watching before you read the full report.</p>` : '';

  const feedbackBlock = data.feedback_url ? `
  <hr style="${DIVIDER}"/>
  <p style="font-size:15px;font-weight:600;color:#fff;margin:0 0 12px">ONE QUICK FAVOUR:</p>
  <p style="${MUTED}">You are one of the first 100 people to go through FinApply. Your experience directly shapes what this product becomes for the next ten thousand candidates.</p>
  <p style="${MUTED}">Three minutes of honest feedback here — it is the most useful thing you can do right now:</p>
  <div style="text-align:center;margin:20px 0">
    <a href="${data.feedback_url}" style="${LINK_BTN}">SHARE YOUR FEEDBACK →</a>
  </div>
  <p style="${MUTED}">No wrong answers. If the report missed the mark, I want to know. If it told you something useful, I want to know that too.</p>` : '';

  return `
<div style="${WRAPPER}">
  <p style="${MUTED}">Hi ${firstName},</p>

  <p style="color:#fff;font-size:16px;font-weight:500;margin:20px 0 8px">Your FISS Score Report is ready.</p>

  <div style="text-align:center;margin:28px 0;padding:28px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px">
    <p style="font-size:11px;color:rgba(255,255,255,0.40);letter-spacing:2px;margin:0 0 12px">FISS SCORE</p>
    <p style="font-size:48px;font-weight:700;color:#fff;margin:0">${data.fiss_score}<span style="font-size:20px;color:rgba(255,255,255,0.40)"> / 100</span></p>
    <p style="font-size:13px;color:rgba(255,255,255,0.50);margin:8px 0 0">${data.percentile} Percentile — ${data.role_track} Cohort</p>
  </div>

  <p style="${MUTED}">Your report is available at the link below. Everything you need is in there — your dimension breakdown, standout strength, critical gap, and four specific things to do differently next time.</p>

  <div style="text-align:center;margin:24px 0">
    <a href="${data.report_url}" style="${LINK_BTN}">VIEW FULL REPORT →</a>
  </div>

  ${loomBlock}

  <hr style="${DIVIDER}"/>

  <p style="font-size:15px;font-weight:600;color:#fff;margin:0 0 16px">YOUR SCORE AT A GLANCE:</p>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <tr><td style="padding:8px 0;color:rgba(255,255,255,0.50)">Financial Reasoning</td><td style="padding:8px 0;text-align:right;color:#fff;font-weight:600;font-family:monospace">${data.fr_score}/25</td><td style="padding:8px 0;text-align:right;color:rgba(255,255,255,0.40);padding-left:12px">${data.fr_grade}</td></tr>
    <tr><td style="padding:8px 0;color:rgba(255,255,255,0.50);border-top:1px solid rgba(255,255,255,0.06)">Structured Thinking</td><td style="padding:8px 0;text-align:right;color:#fff;font-weight:600;font-family:monospace;border-top:1px solid rgba(255,255,255,0.06)">${data.st_score}/25</td><td style="padding:8px 0;text-align:right;color:rgba(255,255,255,0.40);padding-left:12px;border-top:1px solid rgba(255,255,255,0.06)">${data.st_grade}</td></tr>
    <tr><td style="padding:8px 0;color:rgba(255,255,255,0.50);border-top:1px solid rgba(255,255,255,0.06)">Risk Identification</td><td style="padding:8px 0;text-align:right;color:#fff;font-weight:600;font-family:monospace;border-top:1px solid rgba(255,255,255,0.06)">${data.ri_score}/25</td><td style="padding:8px 0;text-align:right;color:rgba(255,255,255,0.40);padding-left:12px;border-top:1px solid rgba(255,255,255,0.06)">${data.ri_grade}</td></tr>
    <tr><td style="padding:8px 0;color:rgba(255,255,255,0.50);border-top:1px solid rgba(255,255,255,0.06)">Decision Clarity</td><td style="padding:8px 0;text-align:right;color:#fff;font-weight:600;font-family:monospace;border-top:1px solid rgba(255,255,255,0.06)">${data.dc_score}/25</td><td style="padding:8px 0;text-align:right;color:rgba(255,255,255,0.40);padding-left:12px;border-top:1px solid rgba(255,255,255,0.06)">${data.dc_grade}</td></tr>
  </table>

  <p style="font-size:13px;color:rgba(255,255,255,0.50);font-style:italic;margin:16px 0 0">"${data.one_liner}"</p>

  <hr style="${DIVIDER}"/>

  <p style="font-size:15px;font-weight:600;color:#fff;margin:0 0 16px">WHAT TO DO WITH THIS SCORE:</p>

  <p style="${MUTED}"><span style="${STRONG}">Share it with employers directly.</span> Paste your score and the report link into applications or send it alongside your CV. It tells employers something your resume cannot — how you perform under analytical pressure.</p>

  <p style="${MUTED}"><span style="${STRONG}">Post it on LinkedIn.</span> Your score, your dimension breakdown, and one line about what you learned. Employers in finance follow this more than you think.</p>

  <p style="${MUTED}"><span style="${STRONG}">Use it as interview context.</span> When an interviewer asks about your analytical approach, reference your strongest dimension specifically. "My structured thinking score was ${data.st_score}/25 — here is what that means in practice" is a better answer than anything generic.</p>

  ${feedbackBlock}

  <hr style="${DIVIDER}"/>
  <p style="${MUTED}">If you have questions about your score or want to talk through your results, reply to this email. I read and respond to every one.</p>

  <div style="margin-top:28px">
    ${SIGNATURE}
  </div>

  <hr style="${DIVIDER}"/>
  <p style="${FOOTER}">FinApply.ai · Jaipur, India</p>
</div>`;
}

/* ══════════════════════════════════════════════
   EMAIL 3 — DELAY ALERT
   Sent if report cannot be delivered same day
   ══════════════════════════════════════════════ */
function delayAlertHTML(data: { full_name: string; eta?: string }) {
  const firstName = data.full_name.split(' ')[0];
  const eta = data.eta || 'tomorrow by 6 PM IST';
  return `
<div style="${WRAPPER}">
  <p style="${MUTED}">Hi ${firstName},</p>

  <p style="${MUTED}">Your FISS Score Report is taking a little longer than our usual same-day delivery.</p>

  <p style="${MUTED}">Your report will reach you by <span style="${STRONG}">${eta}</span>. Not a delay — just making sure the evaluation is accurate before it reaches you.</p>

  <p style="${MUTED}">Every report is reviewed personally before delivery. Yours is being prepared now.</p>

  <div style="margin-top:28px">
    <p style="margin:0;color:#fff;font-size:14px;font-weight:500">Chinmay</p>
    <p style="margin:2px 0 0;font-size:12px;color:rgba(255,255,255,0.40)">FinApply.ai</p>
  </div>

  <hr style="${DIVIDER}"/>
  <p style="${FOOTER}">FinApply.ai · Jaipur, India</p>
</div>`;
}

/* ══════════════════════════════════════════════
   ADMIN NOTIFICATION — internal only
   ══════════════════════════════════════════════ */
function adminNotificationHTML(data: {
  full_name: string;
  email: string;
  target_role: string;
  college_or_firm: string;
  linkedin_url?: string;
}) {
  return `
<div style="${WRAPPER}">
  <div style="border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:20px;margin-bottom:24px">
    <h1 style="font-size:20px;font-weight:600;margin:0">New Application</h1>
    <p style="font-size:12px;color:rgba(255,255,255,0.30);margin-top:4px">FinApply.ai · Founding Cohort</p>
  </div>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:8px 0;color:rgba(255,255,255,0.40);font-size:13px">Name</td><td style="padding:8px 0;color:#fff;font-size:13px;font-weight:500">${data.full_name}</td></tr>
    <tr><td style="padding:8px 0;color:rgba(255,255,255,0.40);font-size:13px">Email</td><td style="padding:8px 0;color:#fff;font-size:13px">${data.email}</td></tr>
    <tr><td style="padding:8px 0;color:rgba(255,255,255,0.40);font-size:13px">Role</td><td style="padding:8px 0;color:#2563EB;font-size:13px;font-weight:500">${data.target_role}</td></tr>
    <tr><td style="padding:8px 0;color:rgba(255,255,255,0.40);font-size:13px">College/Firm</td><td style="padding:8px 0;color:#fff;font-size:13px">${data.college_or_firm}</td></tr>
    ${data.linkedin_url ? `<tr><td style="padding:8px 0;color:rgba(255,255,255,0.40);font-size:13px">LinkedIn</td><td style="padding:8px 0;font-size:13px"><a href="${data.linkedin_url}" style="color:#2563EB">Profile →</a></td></tr>` : ''}
  </table>
  <div style="margin-top:24px;text-align:center">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://finapply.vercel.app'}/admin" style="display:inline-block;padding:10px 24px;background:#2563EB;color:#fff;border-radius:100px;text-decoration:none;font-size:13px;font-weight:500">Review in Admin →</a>
  </div>
</div>`;
}

/* ══════════════════════════════════════════════
   FOLLOW-UP EMAILS — Day 30/60/90
   ══════════════════════════════════════════════ */
function followUpHTML(data: { full_name: string; milestone_day: number; outcome_url: string }) {
  const msgs: Record<number, string> = {
    30: `It has been 30 days since you completed your FISS assessment. We would love to hear how your career journey is progressing — whether you have landed interviews, received offers, or are still exploring.`,
    60: `Two months have passed since your FISS Score. Many of our founding cohort candidates have shared exciting updates. We would love to hear yours.`,
    90: `It has been 90 days since your FISS assessment — a perfect time to reflect on progress. Whether you have secured a role or are still on the path, your outcome data helps calibrate our scoring system.`,
  };
  const firstName = data.full_name.split(' ')[0];
  return `
<div style="${WRAPPER}">
  <p style="${MUTED}">Hi ${firstName},</p>
  <p style="${MUTED}">${msgs[data.milestone_day] || msgs[30]}</p>
  <div style="text-align:center;margin:24px 0">
    <a href="${data.outcome_url}" style="${LINK_BTN}">Share Your Update →</a>
  </div>
  <div style="margin-top:28px">${SIGNATURE}</div>
  <hr style="${DIVIDER}"/>
  <p style="${FOOTER}">FinApply.ai · Jaipur, India</p>
</div>`;
}

/* ═══════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════ */

/** EMAIL 1 — Welcome + Deal Room link (sent on registration) */
export async function sendWelcomeEmail(data: {
  full_name: string;
  email: string;
  deal_room_url: string;
}) {
  return sendMail(
    data.email,
    `Your Deal Room is ready — let's see how you think`,
    welcomeHTML(data),
  );
}

/** EMAIL 2 — FISS Report delivery (sent after admin evaluation) */
export async function sendReportEmail(data: {
  full_name: string;
  email: string;
  fiss_score: number;
  percentile: string;
  role_track: string;
  fr_score: number; fr_grade: string;
  st_score: number; st_grade: string;
  ri_score: number; ri_grade: string;
  dc_score: number; dc_grade: string;
  one_liner: string;
  report_url: string;
  loom_url?: string;
  feedback_url?: string;
}) {
  const firstName = data.full_name.split(' ')[0];
  return sendMail(
    data.email,
    `Your FISS Score: ${data.fiss_score}/100 — ${firstName}`,
    reportDeliveryHTML(data),
  );
}

/** EMAIL 3 — 48h delay alert */
export async function sendDelayAlert(data: {
  full_name: string;
  email: string;
  eta?: string;
}) {
  return sendMail(
    data.email,
    `Your FISS Report — small update`,
    delayAlertHTML(data),
  );
}

/** Admin notification — internal */
export async function sendAdminNotification(data: {
  full_name: string;
  email: string;
  target_role: string;
  college_or_firm: string;
  linkedin_url?: string;
}) {
  return sendMail(
    process.env.ADMIN_EMAIL || process.env.GMAIL_USER || 'chinmaykhatri495@gmail.com',
    `🔔 New Application — ${data.full_name} — ${data.target_role}`,
    adminNotificationHTML(data),
  );
}

/** Follow-up emails — Day 30/60/90 */
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
  return sendMail(
    data.email,
    subjects[data.milestone_day] || `Career Update — FinApply Check-in`,
    followUpHTML(data),
  );
}

// Legacy aliases for backward compatibility
export const sendAcceptanceEmail = sendWelcomeEmail;
