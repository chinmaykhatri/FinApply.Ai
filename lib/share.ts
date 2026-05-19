/* ══════════════════════════════════════════════
   SHARE ID GENERATION
   
   Generates a clean, human-readable public share ID
   for FISS Score pages.
   
   Format: [first-name]-[score]-[role-abbrev]
   Collision: append 4 random digits
   ══════════════════════════════════════════════ */

const ROLE_ABBREVIATIONS: Record<string, string> = {
  'Investment Banking': 'ib',
  'Private Equity': 'pe',
  'Equity Research': 'er',
  'Corporate Finance': 'cf',
  'Big 4 Advisory': 'big4',
  'Venture Capital': 'vc',
  'Asset Management': 'am',
  'Hedge Fund': 'hf',
  'Consulting': 'mc',
  'Financial Planning': 'fp',
};

/**
 * Generate a public share ID from candidate data.
 * Returns e.g. "arjun-74-ib"
 */
export function generateShareId(
  fullName: string,
  score: number,
  targetRole: string
): string {
  const firstName = fullName
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  const roleAbbrev = ROLE_ABBREVIATIONS[targetRole] || targetRole
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .toLowerCase()
    .slice(0, 3);

  return `${firstName}-${score}-${roleAbbrev}`;
}

/**
 * Append random suffix to handle collisions.
 * Returns e.g. "arjun-74-ib-3847"
 */
export function addCollisionSuffix(shareId: string): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${shareId}-${suffix}`;
}

/**
 * Generate the FISS badge HTML for email signatures.
 */
export function generateBadgeHtml(shareId: string, score: number): string {
  const url = `https://fin-apply-ai.vercel.app/score/${shareId}`;
  return `<a href="${url}" style="display:inline-flex;align-items:center;gap:8px;background:#0A0A0F;border:1px solid rgba(255,255,255,0.15);border-radius:100px;padding:6px 14px;text-decoration:none;font-family:Arial,sans-serif;"><span style="color:#2563EB;font-size:11px;font-weight:700;letter-spacing:1px;">FISS</span><span style="color:white;font-size:12px;font-weight:600;">${score}/100</span><span style="color:rgba(255,255,255,0.4);font-size:11px;">FinApply.ai</span></a>`;
}

/**
 * Generate pre-populated LinkedIn post text.
 */
export function generateLinkedInPost(data: {
  score: number;
  percentile: string;
  role: string;
  fr: { score: number; grade: string };
  st: { score: number; grade: string };
  ri: { score: number; grade: string };
  dc: { score: number; grade: string };
  summary: string;
}): string {
  const roleHashtag = data.role.replace(/\s+/g, '');
  return `I just received my FISS Score from @FinApply — a 45-minute finance deal simulation that tests how you actually think, not just what you know.

My score: ${data.score}/100
${data.percentile}

Breakdown:
→ Financial Reasoning: ${data.fr.score}/25 (${data.fr.grade})
→ Structured Thinking: ${data.st.score}/25 (${data.st.grade})
→ Risk Identification: ${data.ri.score}/25 (${data.ri.grade})
→ Decision Clarity: ${data.dc.score}/25 (${data.dc.grade})

${data.summary}

If you're targeting finance roles and want a verified signal that goes beyond your resume:
👉 finapply.ai

#FinApply #FinanceCareers #${roleHashtag} #FISS`;
}
