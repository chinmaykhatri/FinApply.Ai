'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DimensionCard from '@/components/ui/DimensionCard';
import { generateLinkedInPost, generateBadgeHtml } from '@/lib/share';
import type { DimensionScore } from '@/lib/types';

interface SimData {
  case_code: string | null;
  word_count: number;
  time_taken_seconds: number;
  submitted_at: string;
}

interface DashboardData {
  id: string;
  full_name: string;
  college_or_firm: string;
  target_role: string;
  share_id: string | null;
  created_at: string;
  simulations: SimData[];
  fiss_reports: Array<{
    total_score: number;
    percentile: string;
    financial_reasoning: DimensionScore;
    structured_thinking: DimensionScore;
    risk_identification: DimensionScore;
    decision_clarity: DimensionScore;
    standout_strength: string;
    critical_gap: string;
    evaluator_summary: string;
    created_at: string;
  }>;
}

const GRADE_PILL: Record<string, { bg: string; border: string; text: string }> = {
  'Strong': { bg: 'rgba(22,163,74,0.12)', border: 'rgba(22,163,74,0.25)', text: '#16A34A' },
  'Adequate': { bg: 'rgba(215,119,6,0.12)', border: 'rgba(215,119,6,0.25)', text: '#D97706' },
  'Developing': { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)', text: '#F97316' },
  'Critical Gap': { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#EF4444' },
};
const BAR_COLORS: Record<string, string> = {
  'Strong': '#16A34A', 'Adequate': '#D97706', 'Developing': '#F97316', 'Critical Gap': '#EF4444',
};

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
  catch { return ''; }
}

function MyScoreInner() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [phase, setPhase] = useState<'loading' | 'invalid' | 'pending' | 'ready'>('loading');
  const [appStatus, setAppStatus] = useState<string>('');
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const [copyLink, setCopyLink] = useState(false);
  const [copyPost, setCopyPost] = useState(false);
  const [copyBadge, setCopyBadge] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<string>('');

  const loadData = useCallback(async (t: string) => {
    try {
      const res = await fetch(`/api/my-score?token=${t}`);
      if (!res.ok) { setPhase('invalid'); return; }
      const json = await res.json();
      setData(json.data);
      if (json.pending) {
        setAppStatus(json.status || 'submitted');
        setPhase('pending');
      } else {
        setPhase('ready');
      }
    } catch { setPhase('invalid'); }
  }, []);

  useEffect(() => {
    // Token: URL param first, then localStorage
    let token = searchParams.get('token');
    if (token) {
      localStorage.setItem('fa_token', token);
    } else {
      token = localStorage.getItem('fa_token');
    }
    if (!token) { setPhase('invalid'); return; }
    tokenRef.current = token;
    loadData(token);
  }, [searchParams, loadData]);

  // ── Retry evaluation handler ──
  const handleRetryEvaluation = async () => {
    if (!data?.id || retrying) return;
    setRetrying(true);
    setRetryError('');

    try {
      const res = await fetch('/api/evaluate-retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: data.id,
          email: '', // We use deal_room_token approach below, but as fallback
        }),
      });

      const json = await res.json();

      if (json.success) {
        // Evaluation succeeded — reload dashboard data
        const token = tokenRef.current;
        if (token) {
          // Small delay to let DB propagate
          await new Promise(r => setTimeout(r, 1500));
          await loadData(token);
        }
      } else {
        setRetryError(json.error || 'Evaluation failed. Please try again in a moment.');
      }
    } catch {
      setRetryError('Network error. Please check your connection and try again.');
    } finally {
      setRetrying(false);
    }
  };

  // ── Auto-poll when pending (check every 30s if report is ready) ──
  useEffect(() => {
    if (phase !== 'pending') return;
    const interval = setInterval(() => {
      const token = tokenRef.current;
      if (token) loadData(token);
    }, 30_000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [phase, loadData]);

  // Animate ring
  useEffect(() => {
    if (phase !== 'ready' || !ringRef.current || !data?.fiss_reports?.[0]) return;
    const circ = 2 * Math.PI * 54;
    const off = circ - (data.fiss_reports[0].total_score / 100) * circ;
    ringRef.current.style.strokeDasharray = `${circ}`;
    ringRef.current.style.strokeDashoffset = `${circ}`;
    setTimeout(() => {
      if (ringRef.current) {
        ringRef.current.style.transition = 'stroke-dashoffset 1.5s ease-out';
        ringRef.current.style.strokeDashoffset = `${off}`;
      }
    }, 200);
  }, [phase, data]);

  // Animate bars
  useEffect(() => {
    if (phase !== 'ready' || !barsRef.current) return;
    const fills = barsRef.current.querySelectorAll<HTMLDivElement>('[data-bar]');
    fills.forEach((el, i) => {
      const target = el.dataset.bar || '0';
      el.style.width = '0%';
      setTimeout(() => {
        el.style.transition = 'width 1s cubic-bezier(0.16,1,0.3,1)';
        el.style.width = `${target}%`;
      }, 400 + i * 150);
    });
  }, [phase]);

  // ── Loading ──
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.40)', marginTop: 16, fontSize: 14 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Invalid ──
  if (phase === 'invalid' || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>This link is invalid or expired.</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, margin: '0 0 8px' }}>
            If you believe this is an error, please email us for help.
          </p>
          <a href="mailto:chinmay.finapply.ai@gmail.com" style={{ fontSize: 14, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
            chinmay.finapply.ai@gmail.com
          </a>
          <div style={{ marginTop: 32 }}>
            <Link href="/" style={{ display: 'inline-block', background: '#2563EB', color: '#fff', borderRadius: 100, padding: '10px 24px', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              Go to FinApply.ai
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Pending / Eval Failed — Show retry button ──
  if (phase === 'pending') {
    const sim = data.simulations?.[0];
    const firstName = data.full_name.split(' ')[0];
    const isFailed = appStatus === 'eval_failed';

    return (
      <div style={{ minHeight: '100vh', background: '#000' }}>
        {/* Navbar */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: 760, margin: '0 auto', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>F</div>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: -0.3 }}>FinApply.ai</span>
          </Link>
          <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', textDecoration: 'none' }}>Back to Home</Link>
        </nav>

        <main style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          {/* Status icon */}
          <div style={{
            width: 80, height: 80, borderRadius: 20, margin: '0 auto 32px',
            background: isFailed
              ? 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))'
              : 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(139,92,246,0.12))',
            border: `1px solid ${isFailed ? 'rgba(239,68,68,0.20)' : 'rgba(37,99,235,0.20)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
          }}>
            {isFailed ? '⚠️' : '⏳'}
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff', margin: '0 0 12px', lineHeight: 1.3 }}>
            {isFailed
              ? `${firstName}, your evaluation needs a retry`
              : `${firstName}, your report is being generated`}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 0 40px' }}>
            {isFailed
              ? 'The AI evaluation encountered an issue. Click below to generate your FISS Score — it takes about 1-2 minutes.'
              : 'Your submission is being evaluated by our AI engine. This usually takes 1-2 minutes. This page will automatically refresh when ready.'}
          </p>

          {/* Submission details card */}
          {sim && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 24, marginBottom: 32, textAlign: 'left',
            }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.30)', letterSpacing: 2, marginBottom: 16 }}>YOUR SUBMISSION</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Case', value: sim.case_code || '—' },
                  { label: 'Words', value: `${sim.word_count} words` },
                  { label: 'Time Used', value: `${Math.round(sim.time_taken_seconds / 60)} minutes` },
                  { label: 'Submitted', value: formatDate(sim.submitted_at) },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>{item.label}</p>
                    <p style={{ fontSize: 14, color: '#fff', fontWeight: 500, margin: 0 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retry button (show for eval_failed, or as fallback if pending too long) */}
          {isFailed ? (
            <div>
              <button
                onClick={handleRetryEvaluation}
                disabled={retrying}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '14px 32px', borderRadius: 100,
                  fontSize: 15, fontWeight: 600,
                  cursor: retrying ? 'not-allowed' : 'pointer',
                  background: retrying ? 'rgba(37,99,235,0.30)' : '#2563EB',
                  border: 'none', color: '#fff',
                  transition: 'all 200ms ease',
                  opacity: retrying ? 0.7 : 1,
                }}
              >
                {retrying ? (
                  <>
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Evaluating... (1-2 min)
                  </>
                ) : (
                  '🚀 Generate My FISS Score'
                )}
              </button>

              {retryError && (
                <div style={{
                  marginTop: 16, padding: '12px 20px', borderRadius: 12,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)',
                }}>
                  <p style={{ fontSize: 13, color: '#EF4444', margin: 0 }}>{retryError}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Pulsing dots for "processing" state */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#2563EB',
                    animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                Auto-refreshing every 30 seconds...
              </p>
              {/* Also show retry button as fallback after some time */}
              <button
                onClick={handleRetryEvaluation}
                disabled={retrying}
                style={{
                  marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', borderRadius: 100,
                  fontSize: 13, fontWeight: 500,
                  cursor: retrying ? 'not-allowed' : 'pointer',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.60)',
                  transition: 'all 200ms ease',
                }}
              >
                {retrying ? 'Evaluating...' : 'Not ready yet? Click to retry'}
              </button>
            </div>
          )}

          {/* Status pill */}
          <div style={{ marginTop: 32 }}>
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '4px 14px', borderRadius: 100,
              background: isFailed ? 'rgba(239,68,68,0.10)' : 'rgba(37,99,235,0.10)',
              border: `1px solid ${isFailed ? 'rgba(239,68,68,0.20)' : 'rgba(37,99,235,0.20)'}`,
              color: isFailed ? '#EF4444' : '#2563EB',
            }}>
              Status: {isFailed ? 'Evaluation Failed' : 'Processing'}
            </span>
          </div>
        </main>

        <style jsx>{`
          @keyframes pulse-dot {
            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  const report = data.fiss_reports[0];
  const sim = data.simulations?.[0];
  const firstName = data.full_name.split(' ')[0];
  const dims = [
    { abbr: 'FR', name: 'Financial Reasoning', dim: report.financial_reasoning },
    { abbr: 'ST', name: 'Structured Thinking', dim: report.structured_thinking },
    { abbr: 'RI', name: 'Risk Identification', dim: report.risk_identification },
    { abbr: 'DC', name: 'Decision Clarity', dim: report.decision_clarity },
  ];

  const scoreUrl = data.share_id ? `${window.location.origin}/score/${data.share_id}` : '';

  const handleCopyLink = async () => {
    if (!scoreUrl) return;
    await navigator.clipboard.writeText(scoreUrl);
    setCopyLink(true); setTimeout(() => setCopyLink(false), 2000);
  };

  const handleCopyPost = async () => {
    const text = generateLinkedInPost({
      score: report.total_score, percentile: report.percentile, role: data.target_role,
      fr: { score: report.financial_reasoning.score, grade: report.financial_reasoning.grade },
      st: { score: report.structured_thinking.score, grade: report.structured_thinking.grade },
      ri: { score: report.risk_identification.score, grade: report.risk_identification.grade },
      dc: { score: report.decision_clarity.score, grade: report.decision_clarity.grade },
      summary: report.evaluator_summary,
    });
    await navigator.clipboard.writeText(text);
    setCopyPost(true); setTimeout(() => setCopyPost(false), 2000);
  };

  const handleCopyBadge = async () => {
    if (!data.share_id) return;
    const html = generateBadgeHtml(data.share_id, report.total_score);
    await navigator.clipboard.writeText(html);
    setCopyBadge(true); setTimeout(() => setCopyBadge(false), 2000);
  };

  const handleDownloadPdf = async () => {
    try {
      // Try server-side PDF via API (consistent with email attachment)
      const token = searchParams.get('token') || localStorage.getItem('fa_token');
      if (token) {
        const pdfUrl = `/api/report/${token}/pdf`;
        const res = await fetch(pdfUrl);
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `FISS_Report_${(data.full_name || 'Candidate').replace(/\s+/g, '_')}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }
      }
      // Fallback: client-side generation
      throw new Error('API fallback');
    } catch {
      try {
        const { generateFissReportPdf } = await import('@/lib/generatePdf');
        generateFissReportPdf({
          candidateName: data.full_name,
          candidateCollege: data.college_or_firm,
          report: {
            total_score: report.total_score, percentile: report.percentile,
            financial_reasoning: report.financial_reasoning, structured_thinking: report.structured_thinking,
            risk_identification: report.risk_identification, decision_clarity: report.decision_clarity,
            standout_strength: report.standout_strength, critical_gap: report.critical_gap,
            evaluator_summary: report.evaluator_summary,
          },
        });
      } catch { alert('PDF generation failed. Please try again.'); }
    }
  };

  const simMinutes = sim ? Math.round(sim.time_taken_seconds / 60) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* ── Navbar ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: 760, margin: '0 auto', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>F</div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: -0.3 }}>FinApply.ai</span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', textDecoration: 'none' }}>Back to Home</Link>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
        {/* ── Welcome Header ── */}
        <div style={{ padding: '64px 0 32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)', borderRadius: 100, padding: '6px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', letterSpacing: 1.5 }}>YOUR FISS SCORE</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 500, margin: 0, lineHeight: 1.3, background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.60) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hi {firstName}. Here is<br />how you think.
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 12, fontFamily: 'monospace' }}>
            Simulation completed {formatDate(sim?.submitted_at || report.created_at)}
            {sim?.case_code ? ` · ${sim.case_code}` : ''}
            {simMinutes ? ` · ${simMinutes} minutes used` : ''}
          </p>
        </div>

        {/* ── Score Overview Card ── */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 40 }}>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Score Ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140 }}>
              <svg width="130" height="130" viewBox="0 0 130 130" style={{ display: 'block' }}>
                <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <circle ref={ringRef} cx="65" cy="65" r="54" fill="none" stroke="#2563EB" strokeWidth="7" strokeLinecap="round" transform="rotate(-90 65 65)" style={{ strokeDasharray: `${2 * Math.PI * 54}`, strokeDashoffset: `${2 * Math.PI * 54}` }} />
                <text x="65" y="62" textAnchor="middle" fill="#fff" fontSize="40" fontWeight="600" fontFamily="inherit">{report.total_score}</text>
                <text x="65" y="82" textAnchor="middle" fill="rgba(255,255,255,0.30)" fontSize="14" fontFamily="inherit">/100</text>
              </svg>
              <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 12, background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)', borderRadius: 100, padding: '4px 14px' }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#2563EB' }}>{report.percentile}</span>
              </div>
            </div>

            {/* Dimension Bars */}
            <div style={{ flex: 1, minWidth: 280 }} ref={barsRef}>
              {dims.map((d) => {
                const g = GRADE_PILL[d.dim.grade] || GRADE_PILL['Developing'];
                return (
                  <div key={d.abbr} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', width: 150, flexShrink: 0 }}>{d.name}</span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                      <div data-bar={`${(d.dim.score / 25) * 100}`} style={{ height: '100%', borderRadius: 100, width: '0%', background: BAR_COLORS[d.dim.grade] || '#D97706' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', width: 38, textAlign: 'right', flexShrink: 0 }}>{d.dim.score}/25</span>
                    <span style={{ fontSize: 10, fontWeight: 500, borderRadius: 100, padding: '2px 8px', flexShrink: 0, background: g.bg, border: `1px solid ${g.border}`, color: g.text }}>{d.dim.grade}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Three Action Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }} className="action-grid">
          {/* Share */}
          <div style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🔗</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>Share with employers</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.5, margin: '0 0 16px' }}>Send your public score page or post on LinkedIn.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={handleCopyLink} disabled={!data.share_id} style={{ padding: '8px 16px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: data.share_id ? 'pointer' : 'not-allowed', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: copyLink ? '#16A34A' : '#2563EB', transition: 'all 200ms' }}>
                {copyLink ? '✓ Link Copied' : 'Copy Score Link'}
              </button>
              <button onClick={handleCopyPost} style={{ padding: '8px 16px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: copyPost ? '#16A34A' : 'rgba(255,255,255,0.60)', transition: 'all 200ms' }}>
                {copyPost ? '✓ Post Copied' : 'LinkedIn Post'}
              </button>
            </div>
          </div>

          {/* Download */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>📄</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>Your full PDF report</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.5, margin: '0 0 16px' }}>Detailed breakdown with improvement actions for each dimension.</p>
            <button onClick={handleDownloadPdf} style={{ padding: '8px 16px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.70)', transition: 'all 200ms' }}>
              Download PDF
            </button>
          </div>

          {/* Badge */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🏅</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>FISS Score badge</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.5, margin: '0 0 16px' }}>Add a verified score badge to your email signature.</p>
            <button onClick={handleCopyBadge} disabled={!data.share_id} style={{ padding: '8px 16px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: data.share_id ? 'pointer' : 'not-allowed', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: copyBadge ? '#16A34A' : 'rgba(255,255,255,0.70)', transition: 'all 200ms' }}>
              {copyBadge ? '✓ HTML Copied' : 'Copy Badge HTML'}
            </button>
          </div>
        </div>

        {/* ── Full Report Sections ── */}
        <div style={{ marginTop: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.30)', letterSpacing: 3, marginBottom: 20 }}>YOUR FULL EVALUATION</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="dim-grid">
            <DimensionCard name="Financial Reasoning" score={report.financial_reasoning.score} maxScore={25} grade={report.financial_reasoning.grade} rationale={report.financial_reasoning.rationale} evidence={report.financial_reasoning.evidence} improvement={report.financial_reasoning.improvement} delay={200} />
            <DimensionCard name="Structured Thinking" score={report.structured_thinking.score} maxScore={25} grade={report.structured_thinking.grade} rationale={report.structured_thinking.rationale} evidence={report.structured_thinking.evidence} improvement={report.structured_thinking.improvement} delay={400} />
            <DimensionCard name="Risk Identification" score={report.risk_identification.score} maxScore={25} grade={report.risk_identification.grade} rationale={report.risk_identification.rationale} evidence={report.risk_identification.evidence} improvement={report.risk_identification.improvement} delay={600} />
            <DimensionCard name="Decision Clarity" score={report.decision_clarity.score} maxScore={25} grade={report.decision_clarity.grade} rationale={report.decision_clarity.rationale} evidence={report.decision_clarity.evidence} improvement={report.decision_clarity.improvement} delay={800} />
          </div>
        </div>

        {/* Standout Strength */}
        <div style={{ marginTop: 48, background: 'rgba(22,163,74,0.08)', borderLeft: '3px solid #16A34A', borderRadius: '0 12px 12px 0', padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#16A34A', letterSpacing: 2, marginBottom: 8 }}>STANDOUT STRENGTH</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6, margin: 0 }}>{report.standout_strength}</p>
        </div>

        {/* Critical Gap */}
        <div style={{ marginTop: 16, background: 'rgba(215,119,6,0.08)', borderLeft: '3px solid #D97706', borderRadius: '0 12px 12px 0', padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#D97706', letterSpacing: 2, marginBottom: 8 }}>CRITICAL GAP</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6, margin: 0 }}>{report.critical_gap}</p>
        </div>

        {/* Evaluator Summary */}
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
            &ldquo;{report.evaluator_summary}&rdquo;
          </p>
        </div>

        {/* ── Feedback Prompt ── */}
        <div style={{ marginTop: 40, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 15, color: '#fff', margin: 0, maxWidth: 400 }}>Did this report tell you something true that you didn&apos;t already know?</p>
          <a href={`/report/${localStorage.getItem('fa_token') || ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.70)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all 200ms' }}>
            Share feedback →
          </a>
        </div>

        {/* ── Footer ── */}
        <div style={{ marginTop: 48, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>This dashboard is powered by FinApply.ai · FISS Score v1.0</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.20)', marginTop: 4 }}>Your token is stored locally — bookmark this page to return anytime.</p>
        </div>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          .action-grid { grid-template-columns: 1fr !important; }
          .dim-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function MyScorePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.40)', marginTop: 16, fontSize: 14 }}>Loading your dashboard...</p>
        </div>
      </div>
    }>
      <MyScoreInner />
    </Suspense>
  );
}
