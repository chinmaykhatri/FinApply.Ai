'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ScoreRing from '@/components/report/ScoreRing';
import DimensionCard from '@/components/ui/DimensionCard';
import PillButton from '@/components/ui/PillButton';
import type { FissReport } from '@/lib/types';
import { trackEvent, EVENTS } from '@/lib/analytics';

type ReportData = Omit<FissReport, 'id' | 'application_id' | 'simulation_id' | 'created_at'>;

export default function ReportPage() {
  const params = useParams();
  const token = params.token as string;
  const reportRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<'loading' | 'invalid' | 'no_report' | 'ready'>('loading');
  const [report, setReport] = useState<ReportData | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [candidateCollege, setCandidateCollege] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [appId, setAppId] = useState('');
  const [shareId, setShareId] = useState<string | null>(null);
  const [employerSummary, setEmployerSummary] = useState<string | null>(null);
  const [linkedInCopied, setLinkedInCopied] = useState(false);
  const [badgeCopied, setBadgeCopied] = useState(false);

  // Feedback state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [accuracyRating, setAccuracyRating] = useState(0);
  const [usefulnessRating, setUsefulnessRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [openFeedback, setOpenFeedback] = useState('');
  const [loomUrl, setLoomUrl] = useState<string | null>(null);

  // Fetch report data from token
  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/report/${token}`);
        const json = await res.json();
        if (res.ok && json.data) {
          const app = json.data;
          setCandidateName(app.full_name);
          setAppId(app.id);
          setCandidateCollege(app.college_or_firm);
          setTargetRole(app.target_role || '');
          if (app.share_id) setShareId(app.share_id);

          // Only display real report data — no fake fallbacks
          if (app.fiss_reports && app.fiss_reports.length > 0) {
            const r = app.fiss_reports[0];
            setReport({
              total_score: r.total_score,
              percentile: r.percentile || 'Founding Cohort — Batch 1',
              financial_reasoning: r.financial_reasoning,
              structured_thinking: r.structured_thinking,
              risk_identification: r.risk_identification,
              decision_clarity: r.decision_clarity,
              standout_strength: r.standout_strength || '',
              critical_gap: r.critical_gap || '',
              evaluator_summary: r.evaluator_summary || '',
              employer_summary: r.employer_summary || undefined,
            });
            if (r.employer_summary) setEmployerSummary(r.employer_summary);
            if (r.loom_url) setLoomUrl(r.loom_url);
            setPhase('ready');
            trackEvent(EVENTS.REPORT_VIEW);
            // Fetch or generate share ID
            try {
              const shareRes = await fetch('/api/share/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ report_token: token }),
              });
              const shareJson = await shareRes.json();
              if (shareJson.share_id) setShareId(shareJson.share_id);
            } catch { /* non-blocking */ }
          } else {
            // Application exists but no report yet
            setPhase('no_report');
          }
        } else {
          setPhase('invalid');
        }
      } catch {
        setPhase('invalid');
      }
    }
    if (token) fetchReport();
  }, [token]);

  const handleDownloadPdf = async () => {
    if (!report) return;
    trackEvent(EVENTS.REPORT_DOWNLOAD);
    try {
      // Try server-side PDF via API (higher quality, consistent with email attachment)
      const pdfUrl = `/api/report/${token}/pdf`;
      const res = await fetch(pdfUrl);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FISS_Report_${(candidateName || 'Candidate').replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
      // Fallback to client-side generation
      throw new Error('API PDF failed, using client-side fallback');
    } catch {
      try {
        const { generateFissReportPdf } = await import('@/lib/generatePdf');
        generateFissReportPdf({
          candidateName: candidateName || 'Candidate',
          candidateCollege: candidateCollege || '',
          report,
        });
      } catch (err) {
        console.error('PDF generation error:', err);
        alert('PDF generation failed. Please try again.');
      }
    }
  };

  // Loading state
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.40)', marginTop: 16, fontSize: 14 }}>
            Loading your FISS Report...
          </p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (phase === 'invalid') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🔒</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>Report Not Found</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', marginTop: 16, lineHeight: 1.6 }}>
            This report link may be outdated or invalid. If you&apos;ve re-registered, please check your latest email for the updated report link.
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PillButton variant="primary" href="/dashboard">
              Go to Dashboard
            </PillButton>
            <PillButton variant="outline" href="/">
              Return Home
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  // Application found but report not yet generated
  if (phase === 'no_report') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>⏳</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>Report In Progress</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', marginTop: 16, lineHeight: 1.6 }}>
            {candidateName ? `Hi ${candidateName}, your` : 'Your'} FISS Score Report is being generated.
            You&apos;ll receive an email once it&apos;s ready — typically within a few hours.
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <PillButton variant="secondary" href="/dashboard">
              Go to Dashboard
            </PillButton>
            <PillButton variant="outline" href="/">
              Return Home
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  // Guard: if report is null at this point, show error
  if (!report) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>⚠️</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>Something Went Wrong</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', marginTop: 16, lineHeight: 1.6 }}>
            We couldn&apos;t load your report data. Please try refreshing the page or contact support.
          </p>
          <div style={{ marginTop: 32 }}>
            <PillButton variant="secondary" href="/">
              Return to FinApply.ai
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* Nav */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 60px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>FinApply.ai</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <PillButton variant="outline" onClick={handleDownloadPdf}>
            Download PDF
          </PillButton>
          <PillButton
            variant="primary"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://finapply.ai/report/${token}`)}`}
          >
            Share on LinkedIn
          </PillButton>
          <button
            onClick={async () => {
              const url = `${window.location.origin}/report/${token}`;
              await navigator.clipboard.writeText(url);
              alert('Report link copied to clipboard!');
            }}
            style={{
              fontSize: 12, fontWeight: 500, padding: '10px 16px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.60)', cursor: 'pointer', transition: 'all 200ms',
            }}
          >
            📋 Copy Link
          </button>
        </div>
      </header>

      {/* Share Score Card */}
      <div style={{
        maxWidth: 800, margin: '0 auto', padding: '0 24px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(139,92,246,0.06))',
          border: '1px solid rgba(37,99,235,0.15)',
          borderRadius: 16, padding: 24, marginTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#2563EB', letterSpacing: 2, marginBottom: 6 }}>
              SHARE YOUR ACHIEVEMENT
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', lineHeight: 1.5, margin: 0, maxWidth: 400 }}>
              Let your network know you scored <strong style={{ color: '#fff' }}>{report.total_score}/100</strong> on
              the FISS — the industry&apos;s first simulation-based finance assessment.
            </p>
            {shareId && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '8px 0 0' }}>
                Public score page: <a href={`/score/${shareId}`} style={{ color: '#2563EB', textDecoration: 'none' }}>
                  finapply.ai/score/{shareId}
                </a>
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {shareId && (
              <a
                href={`/score/${shareId}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', borderRadius: 100,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: 13, fontWeight: 500, textDecoration: 'none',
                  transition: 'all 200ms',
                }}
              >
                View Public Score →
              </a>
            )}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareId ? `https://fin-apply-ai.vercel.app/score/${shareId}` : `https://fin-apply-ai.vercel.app`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 100,
                background: '#0A66C2', color: '#fff',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
                transition: 'all 200ms',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Share on LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 120px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.40)',
              letterSpacing: 3,
              marginBottom: 24,
            }}
          >
            FINANCIAL INTELLIGENCE SIMULATION SCORE
          </p>

          {/* Score Ring */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <ScoreRing score={report.total_score} />
          </div>

          {/* Percentile */}
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', marginBottom: 8 }}>
            {report.percentile}
          </p>

          {/* Percentile Rank Indicator */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 16,
          }}>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 600, letterSpacing: 1 }}>COHORT PERCENTILE</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)' }}>·</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', fontStyle: 'italic' }}>
              Available after Batch 1 completion (25+ candidates)
            </span>
          </div>

          {/* Candidate */}
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#fff',
              marginTop: 24,
            }}
          >
            {candidateName || 'Candidate Report'}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.40)', marginTop: 4 }}>
            {candidateCollege} · Founding Cohort · Batch 1
          </p>

          {/* Live Score Link */}
          {shareId && (
            <div style={{
              marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '8px 16px',
            }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>LIVE SCORE:</span>
              <a
                href={`/score/${shareId}`}
                style={{ fontSize: 13, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}
              >
                finapply.ai/score/{shareId}
              </a>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(`${window.location.origin}/score/${shareId}`);
                  alert('Score link copied!');
                }}
                style={{
                  fontSize: 11, background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.40)', cursor: 'pointer',
                }}
              >
                📋
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '40px 0' }} />

        {/* Evaluator Summary */}
        <div style={{ marginBottom: 48 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.40)',
              letterSpacing: 3,
              marginBottom: 16,
            }}
          >
            EVALUATOR SUMMARY
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: '#fff',
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}
          >
            &ldquo;{report.evaluator_summary}&rdquo;
          </p>
        </div>

        {/* Dimensions */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.40)',
            letterSpacing: 3,
            marginBottom: 20,
          }}
        >
          DIMENSION BREAKDOWN
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }}
        >
          <DimensionCard
            name="Financial Reasoning"
            score={report.financial_reasoning.score}
            maxScore={25}
            grade={report.financial_reasoning.grade}
            rationale={report.financial_reasoning.rationale}
            evidence={report.financial_reasoning.evidence}
            improvement={report.financial_reasoning.improvement}
            delay={200}
          />
          <DimensionCard
            name="Structured Thinking"
            score={report.structured_thinking.score}
            maxScore={25}
            grade={report.structured_thinking.grade}
            rationale={report.structured_thinking.rationale}
            evidence={report.structured_thinking.evidence}
            improvement={report.structured_thinking.improvement}
            delay={400}
          />
          <DimensionCard
            name="Risk Identification"
            score={report.risk_identification.score}
            maxScore={25}
            grade={report.risk_identification.grade}
            rationale={report.risk_identification.rationale}
            evidence={report.risk_identification.evidence}
            improvement={report.risk_identification.improvement}
            delay={600}
          />
          <DimensionCard
            name="Decision Clarity"
            score={report.decision_clarity.score}
            maxScore={25}
            grade={report.decision_clarity.grade}
            rationale={report.decision_clarity.rationale}
            evidence={report.decision_clarity.evidence}
            improvement={report.decision_clarity.improvement}
            delay={800}
          />
        </div>

        {/* Standout Strength */}
        <div
          style={{
            marginTop: 48,
            background: 'rgba(22,163,74,0.08)',
            borderLeft: '3px solid #16A34A',
            borderRadius: '0 12px 12px 0',
            padding: 24,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#16A34A',
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            STANDOUT STRENGTH
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6 }}>
            {report.standout_strength}
          </p>
        </div>

        {/* Critical Gap — fixed to amber per spec */}
        <div
          style={{
            marginTop: 16,
            background: 'rgba(215,119,6,0.08)',
            borderLeft: '3px solid #D97706',
            borderRadius: '0 12px 12px 0',
            padding: 24,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#D97706',
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            CRITICAL GAP
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6 }}>
            {report.critical_gap}
          </p>
        </div>

        {/* ── FOR EMPLOYERS ── */}
        <div
          style={{
            marginTop: 48,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(139,92,246,0.04))',
            border: '1px solid rgba(37,99,235,0.12)',
            borderRadius: 16,
            padding: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#2563EB',
              letterSpacing: 2, textTransform: 'uppercase',
            }}>
              FOR EMPLOYERS
            </span>
            <span style={{
              fontSize: 10, color: 'rgba(255,255,255,0.30)',
              background: 'rgba(255,255,255,0.04)', borderRadius: 4,
              padding: '2px 8px',
            }}>
              EXECUTIVE SUMMARY
            </span>
          </div>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: 0,
          }}>
            {employerSummary || `This candidate completed FinApply's FISS Deal Room — a 45-minute timed case simulation that evaluates Financial Reasoning, Structured Thinking, Risk Identification, and Decision Clarity under realistic deal conditions. Their total FISS Score of ${report.total_score}/100 reflects live analytical performance, not self-reported skills or interview coaching. Contact FinApply for detailed evaluation data.`}
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {shareId && (
              <a
                href={`/score/${shareId}`}
                style={{
                  fontSize: 12, fontWeight: 500, color: '#2563EB',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                View verified score →
              </a>
            )}
            <a
              href="mailto:team@finapply.ai?subject=Candidate%20Inquiry"
              style={{
                fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.40)',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              Contact FinApply →
            </a>
          </div>
        </div>

        {/* ── LINKEDIN SHARING HEADLINE ── */}
        <div
          style={{
            marginTop: 24,
            background: 'rgba(10,102,194,0.06)',
            border: '1px solid rgba(10,102,194,0.12)',
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#0A66C2', letterSpacing: 2 }}>
              LINKEDIN POST — READY TO SHARE
            </span>
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 16,
            fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.7,
            fontFamily: 'monospace', whiteSpace: 'pre-wrap',
          }}>
{`I just received my FISS Score from @FinApply — a 45-minute finance deal simulation that tests how you actually think, not just what you know.

My score: ${report.total_score}/100
${report.percentile}

Breakdown:
→ Financial Reasoning: ${report.financial_reasoning.score}/25 (${report.financial_reasoning.grade})
→ Structured Thinking: ${report.structured_thinking.score}/25 (${report.structured_thinking.grade})
→ Risk Identification: ${report.risk_identification.score}/25 (${report.risk_identification.grade})
→ Decision Clarity: ${report.decision_clarity.score}/25 (${report.decision_clarity.grade})

${report.evaluator_summary}

If you're targeting finance roles and want a verified signal beyond your resume:
👉 finapply.ai${shareId ? `

Verify my score: finapply.ai/score/${shareId}` : ''}

#FinApply #FinanceCareers #FISS`}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <button
              onClick={async () => {
                const { generateLinkedInPost } = await import('@/lib/share');
                const text = generateLinkedInPost({
                  score: report.total_score,
                  percentile: report.percentile,
                  role: targetRole,
                  fr: report.financial_reasoning,
                  st: report.structured_thinking,
                  ri: report.risk_identification,
                  dc: report.decision_clarity,
                  summary: report.evaluator_summary,
                });
                await navigator.clipboard.writeText(text);
                setLinkedInCopied(true);
                setTimeout(() => setLinkedInCopied(false), 2000);
              }}
              style={{
                padding: '8px 18px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                background: linkedInCopied ? 'rgba(22,163,74,0.12)' : 'rgba(10,102,194,0.12)',
                border: `1px solid ${linkedInCopied ? 'rgba(22,163,74,0.25)' : 'rgba(10,102,194,0.25)'}`,
                color: linkedInCopied ? '#16A34A' : '#0A66C2', cursor: 'pointer',
                transition: 'all 200ms',
              }}
            >
              {linkedInCopied ? '✓ Copied to clipboard' : '📋 Copy LinkedIn Post'}
            </button>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareId ? `https://fin-apply-ai.vercel.app/score/${shareId}` : 'https://fin-apply-ai.vercel.app')}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                background: '#0A66C2', color: '#fff', textDecoration: 'none',
                transition: 'all 200ms',
              }}
            >
              Open LinkedIn →
            </a>
          </div>
        </div>

        {/* ── HTML BADGE FOR EMAIL SIGNATURES ── */}
        <div
          style={{
            marginTop: 24,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 24,
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginBottom: 12 }}>
            EMAIL SIGNATURE BADGE
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 12, lineHeight: 1.5 }}>
            Add this HTML badge to your email signature to display your FISS Score.
          </p>
          {/* Badge preview */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 100, padding: '6px 14px', marginBottom: 12,
          }}>
            <span style={{ color: '#2563EB', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>FISS</span>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{report.total_score}/100</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>FinApply.ai</span>
          </div>
          <div>
            <button
              onClick={async () => {
                const { generateBadgeHtml } = await import('@/lib/share');
                const html = generateBadgeHtml(shareId || '', report.total_score);
                await navigator.clipboard.writeText(html);
                setBadgeCopied(true);
                setTimeout(() => setBadgeCopied(false), 2000);
              }}
              style={{
                padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 500,
                background: badgeCopied ? 'rgba(22,163,74,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${badgeCopied ? 'rgba(22,163,74,0.25)' : 'rgba(255,255,255,0.08)'}`,
                color: badgeCopied ? '#16A34A' : 'rgba(255,255,255,0.50)', cursor: 'pointer',
                transition: 'all 200ms',
              }}
            >
              {badgeCopied ? '✓ Badge HTML Copied' : '📋 Copy Badge HTML'}
            </button>
          </div>
        </div>

        {/* Loom Walkthrough */}
        {loomUrl && (
          <div
            style={{
              marginTop: 48,
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.12)',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#8B5CF6',
                letterSpacing: 2,
                marginBottom: 16,
              }}
            >
              🎥 VIDEO WALKTHROUGH
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', marginBottom: 16, lineHeight: 1.5 }}>
              Watch a personalized walkthrough of your simulation performance and scoring rationale.
            </p>
            <div
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <iframe
                src={loomUrl.replace('/share/', '/embed/')}
                frameBorder="0"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
          </div>
        )}

        {!feedbackSubmitted ? (
          <div
            style={{
              marginTop: 60,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 32,
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Help us improve</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: 24 }}>Your feedback helps improve FISS scoring for future candidates.</p>

            {/* Accuracy */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', marginBottom: 8 }}>How accurate was this evaluation?</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setAccuracyRating(n)}
                    style={{
                      fontSize: 20, cursor: 'pointer', background: 'none', border: 'none',
                      opacity: n <= accuracyRating ? 1 : 0.3,
                      transition: 'opacity 200ms',
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Usefulness */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', marginBottom: 8 }}>How useful is this report?</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setUsefulnessRating(n)}
                    style={{
                      fontSize: 20, cursor: 'pointer', background: 'none', border: 'none',
                      opacity: n <= usefulnessRating ? 1 : 0.3,
                      transition: 'opacity 200ms',
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Recommend */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', marginBottom: 8 }}>Would you recommend FinApply to a friend?</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setWouldRecommend(true)}
                  style={{
                    padding: '6px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    background: wouldRecommend === true ? 'rgba(22,163,74,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${wouldRecommend === true ? 'rgba(22,163,74,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: wouldRecommend === true ? '#16A34A' : 'rgba(255,255,255,0.50)',
                  }}
                >
                  👍 Yes
                </button>
                <button
                  onClick={() => setWouldRecommend(false)}
                  style={{
                    padding: '6px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    background: wouldRecommend === false ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${wouldRecommend === false ? 'rgba(220,38,38,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: wouldRecommend === false ? '#DC2626' : 'rgba(255,255,255,0.50)',
                  }}
                >
                  👎 No
                </button>
              </div>
            </div>

            {/* Open feedback */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', marginBottom: 8 }}>Any other feedback?</p>
              <textarea
                placeholder="The risk section was spot on..."
                value={openFeedback}
                onChange={(e) => setOpenFeedback(e.target.value)}
                style={{
                  width: '100%', minHeight: 80, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                  padding: 12, color: '#fff', fontSize: 13, resize: 'vertical',
                }}
              />
            </div>

            <button
              onClick={async () => {
                if (!accuracyRating || !usefulnessRating) return alert('Please rate accuracy and usefulness.');
                setFeedbackLoading(true);
                try {
                  await fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      application_id: appId,
                      accuracy_rating: accuracyRating,
                      usefulness_rating: usefulnessRating,
                      would_recommend: wouldRecommend ?? true,
                      open_feedback: openFeedback || null,
                    }),
                  });
                  setFeedbackSubmitted(true);
                } catch {
                  alert('Failed to submit feedback.');
                } finally {
                  setFeedbackLoading(false);
                }
              }}
              disabled={feedbackLoading}
              style={{
                padding: '10px 24px', borderRadius: 100, fontSize: 13, fontWeight: 500,
                background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
                color: '#2563EB', cursor: feedbackLoading ? 'wait' : 'pointer',
              }}
            >
              {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        ) : (
          <div
            style={{
              marginTop: 60,
              textAlign: 'center',
              background: 'rgba(22,163,74,0.06)',
              border: '1px solid rgba(22,163,74,0.15)',
              borderRadius: 16,
              padding: 32,
            }}
          >
            <p style={{ fontSize: 16, color: '#16A34A', fontWeight: 500 }}>Thank you for your feedback ✓</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginTop: 8 }}>It helps us improve FISS scoring for future candidates.</p>
          </div>
        )}

        {/* Share Buttons */}
        <div
          style={{
            marginTop: 48,
            textAlign: 'center',
            padding: '24px 0',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: 16 }}>
            SHARE YOUR SCORE
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PillButton
              variant="outline"
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
              }}
            >
              Share on LinkedIn
            </PillButton>
            <PillButton
              variant="outline"
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(`Just scored ${report.total_score}/100 on my @FinApplyAI FISS assessment! 🎯`);
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
              }}
            >
              Share on X
            </PillButton>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 20,
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 40,
          }}
        >
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>
            This report was generated by FinApply.ai · FISS Score v1.0
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.20)', marginTop: 4 }}>
            Evaluated by human + AI collaboration · Not a guarantee of employment outcomes
          </p>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          header { padding: 16px 24px !important; }
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
