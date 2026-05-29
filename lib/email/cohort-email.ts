/* ═══════════════════════════════════════════════
   Cohort Email Template — FinApply.ai
   Generates personalized monthly cohort HTML email.
   ═══════════════════════════════════════════════ */

interface CohortEmailData {
  candidateName: string;
  candidateScore: number;
  candidateRole: string;
  month: string;
  cohortSize: number;
  averageScore: number;
  strongestDim: { name: string; avg: number };
  weakestDim: { name: string; avg: number };
  keyInsights: string[];
}

export function generateCohortEmail(data: CohortEmailData): string {
  const isAboveAvg = data.candidateScore >= data.averageScore;
  const diff = Math.abs(data.candidateScore - data.averageScore);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinApply — ${data.month} Cohort Insights</title>
</head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding:0 0 32px;">
              <span style="font-size:18px;font-weight:600;color:#fff;letter-spacing:-0.5px;">Fin<span style="color:#2563EB;">Apply</span></span>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:0 0 8px;">
              <span style="font-size:11px;font-weight:500;color:rgba(255,255,255,0.40);letter-spacing:3px;">MONTHLY COHORT INSIGHTS</span>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <h1 style="font-size:24px;font-weight:600;color:#fff;margin:0;">${data.month} — Your Cohort Results</h1>
            </td>
          </tr>

          <!-- Personalized greeting -->
          <tr>
            <td style="padding:0 0 20px;">
              <p style="font-size:14px;color:rgba(255,255,255,0.60);line-height:1.7;margin:0;">
                Hi ${data.candidateName},
              </p>
              <p style="font-size:14px;color:rgba(255,255,255,0.60);line-height:1.7;margin:8px 0 0;">
                Here's how the ${data.month} cohort of <strong style="color:#fff;">${data.cohortSize}</strong> ${data.candidateRole} candidates performed.
                Your FISS Score of <strong style="color:#fff;">${data.candidateScore}</strong> was
                <strong style="color:${isAboveAvg ? '#16A34A' : '#D97706'};">${diff} points ${isAboveAvg ? 'above' : 'below'} the cohort average of ${data.averageScore}</strong>.
              </p>
            </td>
          </tr>

          <!-- Cohort Stats Card -->
          <tr>
            <td style="padding:0 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
                <tr>
                  <td style="padding:20px;text-align:center;border-right:1px solid rgba(255,255,255,0.06);">
                    <p style="font-size:28px;font-weight:600;color:#fff;margin:0;">${data.cohortSize}</p>
                    <p style="font-size:11px;color:rgba(255,255,255,0.40);margin:4px 0 0;">Candidates</p>
                  </td>
                  <td style="padding:20px;text-align:center;border-right:1px solid rgba(255,255,255,0.06);">
                    <p style="font-size:28px;font-weight:600;color:#fff;margin:0;">${data.averageScore}</p>
                    <p style="font-size:11px;color:rgba(255,255,255,0.40);margin:4px 0 0;">Avg FISS Score</p>
                  </td>
                  <td style="padding:20px;text-align:center;">
                    <p style="font-size:28px;font-weight:600;color:#2563EB;margin:0;">${data.candidateScore}</p>
                    <p style="font-size:11px;color:rgba(255,255,255,0.40);margin:4px 0 0;">Your Score</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dimension Spotlight -->
          <tr>
            <td style="padding:0 0 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="padding:12px 16px;background:rgba(22,163,74,0.06);border-left:3px solid #16A34A;border-radius:0 8px 8px 0;">
                    <p style="font-size:10px;font-weight:600;color:#16A34A;letter-spacing:2px;margin:0 0 4px;">COHORT STRENGTH</p>
                    <p style="font-size:13px;color:rgba(255,255,255,0.60);margin:0;">${data.strongestDim.name} (${data.strongestDim.avg}/25 avg)</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding:12px 16px;background:rgba(220,38,38,0.06);border-left:3px solid #DC2626;border-radius:0 8px 8px 0;">
                    <p style="font-size:10px;font-weight:600;color:#DC2626;letter-spacing:2px;margin:0 0 4px;">COHORT CHALLENGE</p>
                    <p style="font-size:13px;color:rgba(255,255,255,0.60);margin:0;">${data.weakestDim.name} (${data.weakestDim.avg}/25 avg)</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Key Insights -->
          <tr>
            <td style="padding:16px 0 24px;">
              <p style="font-size:10px;font-weight:500;color:rgba(255,255,255,0.40);letter-spacing:2px;margin:0 0 12px;">KEY INSIGHTS</p>
              ${data.keyInsights.map(insight => `
                <p style="font-size:13px;color:rgba(255,255,255,0.60);line-height:1.6;margin:0 0 8px;padding-left:12px;border-left:2px solid rgba(37,99,235,0.20);">
                  ${insight}
                </p>
              `).join('')}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:24px 0;">
              <a href="https://finapply.ai/#apply"
                 style="display:inline-block;background:#2563EB;color:#fff;font-size:14px;font-weight:500;padding:12px 32px;border-radius:100px;text-decoration:none;">
                Take Another Simulation →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 0 0;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="font-size:11px;color:rgba(255,255,255,0.25);text-align:center;">
                FinApply.ai — Finance capability assessment platform<br>
                You're receiving this because you completed a FISS simulation.<br>
                <a href="https://finapply.ai/unsubscribe" style="color:rgba(255,255,255,0.25);">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
