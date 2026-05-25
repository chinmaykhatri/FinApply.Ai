import { inngest } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildEvaluationPrompt } from '@/lib/evaluation/prompt';
import { getCaseByCode, resolveRoleTrack } from '@/lib/cases';
import type { ClaudeEvaluationResult } from '@/lib/evaluation/types';

/* ══════════════════════════════════════════════
   EVALUATE SUBMISSION — Inngest Step Function
   
   Broken into 4 STEPS so each step runs in its own
   Vercel invocation (~10s each). This works reliably
   on the free Hobby plan.

   Step 1: Fetch data from DB (1-2s)
   Step 2: Call Gemini for evaluation (5-15s)
   Step 3: Save report + share_id to DB (2-3s)
   Step 4: Generate PDF + send email (3-5s)
   
   Inngest provides:
     • Each step gets its own serverless invocation
     • Automatic retries with exponential backoff
     • Observable runs in the Inngest dashboard
   ══════════════════════════════════════════════ */

export const evaluateSubmission = inngest.createFunction(
  {
    id: 'evaluate-submission',
    retries: 3,
    triggers: [{ event: 'app/submission.completed' }],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ event, step }: { event: any; step: any }) => {
    const { application_id, simulation_id } = event.data;

    // ─── STEP 1: Fetch simulation + application data ───
    const fetchedData = await step.run('fetch-data', async () => {
      const supabase = createAdminClient();

      const { data: sim, error: simErr } = await supabase
        .from('simulations')
        .select('id, application_id, case_code, content, word_count, time_taken_seconds, started_at, submitted_at, tab_violations, paste_count, large_paste_count, typing_bursts, integrity_score')
        .eq('id', simulation_id)
        .single();

      if (simErr || !sim) {
        throw new Error('Simulation not found');
      }

      const { data: app, error: appErr } = await supabase
        .from('applications')
        .select('id, full_name, email, target_role, status, report_token, college_or_firm')
        .eq('id', application_id)
        .single();

      if (appErr || !app) {
        throw new Error('Application not found');
      }

      // Ensure report_token exists — legacy/edge-case records may be missing it
      if (!app.report_token) {
        const newToken = crypto.randomUUID();
        const adminSb = createAdminClient();
        await adminSb
          .from('applications')
          .update({ report_token: newToken })
          .eq('id', application_id);
        app.report_token = newToken;
        console.log(`[INNGEST] Generated missing report_token for app=${application_id}`);
      }

      return { sim, app };
    });

    // ─── STEP 2: Call Gemini for FISS evaluation ───
    const evaluation = await step.run('call-gemini', async () => {
      const { sim, app } = fetchedData;
      const caseCode = sim.case_code || 'IB-001';
      const dealCase = getCaseByCode(caseCode);
      const roleTrack = resolveRoleTrack(app.target_role);

      const prompt = buildEvaluationPrompt({
        case_code: caseCode,
        role_track: roleTrack,
        case_title: dealCase?.title || 'Unknown Case',
        admin_strong: dealCase?.admin_only?.strong_response || 'N/A',
        admin_critical_gap: dealCase?.admin_only?.critical_gap || 'N/A',
        non_obvious: dealCase?.admin_only?.non_obvious_signal || 'N/A',
        candidate_response: sim.content,
      });

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
      });

      console.log(`[INNGEST] Calling Gemini for app=${application_id}`);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON from response
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();

      let parsed: ClaudeEvaluationResult;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        console.error('[INNGEST] Gemini JSON parse error. Raw:', responseText.slice(0, 500));
        throw new Error('AI returned invalid JSON');
      }

      return { evaluation: parsed, roleTrack };
    });

    // ─── STEP 3: Save report to DB + generate share_id ───
    const savedData = await step.run('save-report', async () => {
      const { app } = fetchedData;
      const { evaluation: evalData, roleTrack } = evaluation;
      const supabase = createAdminClient();

      // Insert FISS report
      const { data: report, error: insertErr } = await supabase
        .from('fiss_reports')
        .insert({
          application_id,
          simulation_id,
          total_score: evalData.fiss_score,
          percentile: `Founding Cohort — ${roleTrack} Track`,
          financial_reasoning: {
            score: evalData.fr_score, grade: evalData.fr_grade,
            rationale: evalData.fr_rationale, evidence: evalData.fr_evidence,
            improvement: evalData.fr_improvement,
          },
          structured_thinking: {
            score: evalData.st_score, grade: evalData.st_grade,
            rationale: evalData.st_rationale, evidence: evalData.st_evidence,
            improvement: evalData.st_improvement,
          },
          risk_identification: {
            score: evalData.ri_score, grade: evalData.ri_grade,
            rationale: evalData.ri_rationale, evidence: evalData.ri_evidence,
            improvement: evalData.ri_improvement,
          },
          decision_clarity: {
            score: evalData.dc_score, grade: evalData.dc_grade,
            rationale: evalData.dc_rationale, evidence: evalData.dc_evidence,
            improvement: evalData.dc_improvement,
          },
          standout_strength: evalData.standout_strength,
          critical_gap: evalData.critical_gap,
          evaluator_summary: evalData.one_line_summary,
          employer_summary: evalData.employer_summary || null,
        })
        .select()
        .single();

      if (insertErr) {
        console.error('[INNGEST] Report insert error:', insertErr);
        throw new Error('Failed to save evaluation');
      }

      // Generate share_id
      let shareId = '';
      try {
        const { generateShareId, addCollisionSuffix } = await import('@/lib/share');
        shareId = generateShareId(app.full_name, evalData.fiss_score, app.target_role);

        const { data: existing } = await supabase
          .from('applications')
          .select('id')
          .eq('share_id', shareId)
          .maybeSingle();

        if (existing) {
          shareId = addCollisionSuffix(shareId);
        }
      } catch (shareErr) {
        console.error('[INNGEST] Share ID generation failed:', shareErr);
      }

      // Update application status to scored
      await supabase
        .from('applications')
        .update({
          status: 'scored',
          share_id: shareId || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', application_id);

      console.log(`[INNGEST] Report saved for app=${application_id}, score=${evalData.fiss_score}`);
      return { report, shareId, evalData };
    });

    // ─── STEP 4: Generate PDF + send email ───
    await step.run('send-email', async () => {
      const { app } = fetchedData;
      const { evaluation: evalData, roleTrack } = evaluation;
      const { shareId } = savedData;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fin-apply-ai.vercel.app';
      const supabase = createAdminClient();

      try {
        const { sendReportEmail } = await import('@/lib/email');
        const { generateFissReportBuffer } = await import('@/lib/generatePdfBuffer');

        // Generate PDF
        let pdfBuffer: Buffer | undefined;
        try {
          pdfBuffer = generateFissReportBuffer({
            candidateName: app.full_name,
            candidateCollege: app.college_or_firm || '',
            shareId: shareId || undefined,
            report: {
              total_score: evalData.fiss_score,
              percentile: `Founding Cohort — ${roleTrack} Track`,
              financial_reasoning: {
                score: evalData.fr_score, grade: evalData.fr_grade as 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap',
                rationale: evalData.fr_rationale, evidence: evalData.fr_evidence, improvement: evalData.fr_improvement,
              },
              structured_thinking: {
                score: evalData.st_score, grade: evalData.st_grade as 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap',
                rationale: evalData.st_rationale, evidence: evalData.st_evidence, improvement: evalData.st_improvement,
              },
              risk_identification: {
                score: evalData.ri_score, grade: evalData.ri_grade as 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap',
                rationale: evalData.ri_rationale, evidence: evalData.ri_evidence, improvement: evalData.ri_improvement,
              },
              decision_clarity: {
                score: evalData.dc_score, grade: evalData.dc_grade as 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap',
                rationale: evalData.dc_rationale, evidence: evalData.dc_evidence, improvement: evalData.dc_improvement,
              },
              standout_strength: evalData.standout_strength,
              critical_gap: evalData.critical_gap,
              evaluator_summary: evalData.one_line_summary,
              employer_summary: evalData.employer_summary || undefined,
            },
          });
        } catch (pdfErr) {
          console.error('[INNGEST] PDF generation failed:', pdfErr);
        }

        // Send email
        await sendReportEmail({
          full_name: app.full_name,
          email: app.email,
          fiss_score: evalData.fiss_score,
          percentile: 'Founding Cohort',
          role_track: roleTrack,
          fr_score: evalData.fr_score, fr_grade: evalData.fr_grade,
          st_score: evalData.st_score, st_grade: evalData.st_grade,
          ri_score: evalData.ri_score, ri_grade: evalData.ri_grade,
          dc_score: evalData.dc_score, dc_grade: evalData.dc_grade,
          one_liner: evalData.one_line_summary,
          report_url: `${appUrl}/report/${app.report_token}`,
          pdf_download_url: `${appUrl}/api/report/${app.report_token}/pdf`,
          dashboard_url: `${appUrl}/my-score?token=${app.report_token}`,
          share_url: shareId ? `${appUrl}/score/${shareId}` : undefined,
          candidateCollege: app.college_or_firm || '',
          pdfBuffer,
        });

        // Update status to report_sent
        await supabase
          .from('applications')
          .update({ status: 'report_sent', updated_at: new Date().toISOString() })
          .eq('id', application_id);

        console.log(`[INNGEST] Report emailed to ${app.email}`);
      } catch (emailErr) {
        console.error('[INNGEST] Email send failed:', emailErr);
        // Report is saved in DB already — email failure is non-critical
      }
    });

    return { success: true, application_id };
  }
);
