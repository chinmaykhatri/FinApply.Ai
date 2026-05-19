'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { generateLinkedInPost, generateBadgeHtml } from '@/lib/share';
import { trackEvent, EVENTS } from '@/lib/analytics';
import type { DimensionScore } from '@/lib/types';

interface ScoreData {
  full_name: string;
  target_role: string;
  registered_at: string;
  report: {
    total_score: number;
    percentile: string;
    financial_reasoning: DimensionScore;
    structured_thinking: DimensionScore;
    risk_identification: DimensionScore;
    decision_clarity: DimensionScore;
    evaluator_summary: string;
    created_at: string;
  };
}

const GRADE_BAR_COLORS: Record<string, string> = {
  'Strong': '#16A34A',
  'Adequate': '#D97706',
  'Developing': '#F97316',
  'Critical Gap': '#EF4444',
};

const GRADE_PILL: Record<string, { bg: string; border: string; text: string }> = {
  'Strong': { bg: 'rgba(22,163,74,0.12)', border: 'rgba(22,163,74,0.25)', text: '#16A34A' },
  'Adequate': { bg: 'rgba(215,119,6,0.12)', border: 'rgba(215,119,6,0.25)', text: '#D97706' },
  'Developing': { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)', text: '#F97316' },
  'Critical Gap': { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#EF4444' },
};

export default function PublicScorePage() {
  const params = useParams();
  const shareId = params.id as string;

  const [data, setData] = useState<ScoreData | null>(null);
  const [phase, setPhase] = useState<'loading' | 'not_found' | 'ready'>('loading');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [postCopyState, setPostCopyState] = useState<'idle' | 'copied'>('idle');
  const [badgeCopyState, setBadgeCopyState] = useState<'idle' | 'copied'>('idle');
  const [showBadge, setShowBadge] = useState(false);
  const barsRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch(`/api/score/${shareId}`);
        if (!res.ok) { setPhase('not_found'); return; }
        const json = await res.json();
        setData(json.data);
        setPhase('ready');
        trackEvent(EVENTS.SAMPLE_REPORT_VIEW);
      } catch {
        setPhase('not_found');
      }
    }
    if (shareId) fetchScore();
  }, [shareId]);

  // Animate bars on mount
  useEffect(() => {
    if (phase !== 'ready' || !barsRef.current) return;
    const fills = barsRef.current.querySelectorAll<HTMLDivElement>('[data-bar-fill]');
    fills.forEach((el, i) => {
      const target = el.dataset.barFill || '0';
      el.style.width = '0%';
      setTimeout(() => {
        el.style.transition = 'width 1s cubic-bezier(0.16,1,0.3,1)';
        el.style.width = `${target}%`;
      }, 300 + i * 200);
    });
  }, [phase]);

  // Animate ring on mount
  useEffect(() => {
    if (phase !== 'ready' || !ringRef.current || !data) return;
    const circumference = 2 * Math.PI * 78;
    const offset = circumference - (data.report.total_score / 100) * circumference;
    ringRef.current.style.strokeDasharray = `${circumference}`;
    ringRef.current.style.strokeDashoffset = `${circumference}`;
    setTimeout(() => {
      if (ringRef.current) {
        ringRef.current.style.transition = 'stroke-dashoffset 1.5s ease-out';
        ringRef.current.style.strokeDashoffset = `${offset}`;
      }
    }, 200);
  }, [phase, data]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch { /* fallback */ }
  };

  const handleLinkedInShare = () => {
    if (!data) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const handleCopyPost = async () => {
    if (!data) return;
    const text = generateLinkedInPost({
      score: data.report.total_score,
      percentile: data.report.percentile,
      role: data.target_role,
      fr: { score: data.report.financial_reasoning.score, grade: data.report.financial_reasoning.grade },
      st: { score: data.report.structured_thinking.score, grade: data.report.structured_thinking.grade },
      ri: { score: data.report.risk_identification.score, grade: data.report.risk_identification.grade },
      dc: { score: data.report.decision_clarity.score, grade: data.report.decision_clarity.grade },
      summary: data.report.evaluator_summary,
    });
    try {
      await navigator.clipboard.writeText(text);
      setPostCopyState('copied');
      setTimeout(() => setPostCopyState('idle'), 2000);
    } catch { /* fallback */ }
  };

  const handleCopyBadge = async () => {
    if (!data) return;
    const html = generateBadgeHtml(shareId, data.report.total_score);
    try {
      await navigator.clipboard.writeText(html);
      setBadgeCopyState('copied');
      setTimeout(() => setBadgeCopyState('idle'), 2000);
    } catch { /* fallback */ }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      });
    } catch { return ''; }
  };

  // ── Loading ──
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.40)', marginTop: 16, fontSize: 14 }}>
            Loading FISS Score...
          </p>
        </div>
      </div>
    );
  }

  // ── Not Found ──
  if (phase === 'not_found' || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>Score Not Found</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, margin: '0 0 32px' }}>
            This FISS Score link is invalid or has not been published yet.
          </p>
          <Link href="/" style={{
            display: 'inline-block', background: '#2563EB', color: '#fff',
            borderRadius: 100, padding: '10px 24px', fontSize: 14, fontWeight: 500,
            textDecoration: 'none',
          }}>
            Go to FinApply.ai
          </Link>
        </div>
      </div>
    );
  }

  const { report } = data;
  const dims = [
    { abbr: 'FR', name: 'Financial Reasoning', dim: report.financial_reasoning },
    { abbr: 'ST', name: 'Structured Thinking', dim: report.structured_thinking },
    { abbr: 'RI', name: 'Risk Identification', dim: report.risk_identification },
    { abbr: 'DC', name: 'Decision Clarity', dim: report.decision_clarity },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* ── Simplified Navbar ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', maxWidth: 680, margin: '0 auto',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#2563EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff',
          }}>F</div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: -0.3 }}>FinApply.ai</span>
        </Link>
        <Link href="/#apply" style={{
          background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.25)',
          borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 500,
          color: '#2563EB', textDecoration: 'none', transition: 'background 200ms ease',
        }}>
          Get Your FISS Score →
        </Link>
      </nav>

      {/* ── Main Content ── */}
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 40px' }}>

        {/* Verification Badge */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.25)',
            borderRadius: 100, padding: '8px 20px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>
              Verified FISS Score — FinApply.ai
            </span>
          </div>
        </div>

        {/* Candidate Info */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff', margin: 0 }}>
            {data.full_name}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', margin: '8px 0 0' }}>
            {data.target_role} · Founding Cohort 2026
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>
            Simulation completed {formatDate(report.created_at)}
          </p>
        </div>

        {/* Score Ring */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ display: 'block', margin: '0 auto' }}>
            {/* Background ring */}
            <circle
              cx="90" cy="90" r="78"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <circle
              ref={ringRef}
              cx="90" cy="90" r="78"
              fill="none"
              stroke="#2563EB"
              strokeWidth="8"
              strokeLinecap="round"
              transform="rotate(-90 90 90)"
              style={{ strokeDasharray: `${2 * Math.PI * 78}`, strokeDashoffset: `${2 * Math.PI * 78}` }}
            />
            {/* Score text */}
            <text x="90" y="85" textAnchor="middle" fill="#fff" fontSize="48" fontWeight="600" fontFamily="inherit">
              {report.total_score}
            </text>
            <text x="90" y="110" textAnchor="middle" fill="rgba(255,255,255,0.30)" fontSize="16" fontFamily="inherit">
              /100
            </text>
          </svg>

          {/* Percentile badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', marginTop: 16,
            background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)',
            borderRadius: 100, padding: '6px 18px',
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#2563EB' }}>
              {report.percentile}
            </span>
          </div>
        </div>

        {/* Dimension Bars */}
        <div style={{ marginTop: 40 }} ref={barsRef}>
          <div style={{
            fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.30)',
            letterSpacing: 3, marginBottom: 20,
          }}>
            DIMENSION BREAKDOWN
          </div>

          {dims.map((d) => {
            const gradeStyle = GRADE_PILL[d.dim.grade] || GRADE_PILL['Developing'];
            return (
              <div key={d.abbr} style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
              }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#2563EB', width: 20, flexShrink: 0 }}>
                  {d.abbr}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', width: 160, flexShrink: 0 }}>
                  {d.name}
                </span>
                <div style={{
                  flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden',
                }}>
                  <div
                    data-bar-fill={`${(d.dim.score / 25) * 100}`}
                    style={{
                      height: '100%', borderRadius: 100, width: '0%',
                      background: GRADE_BAR_COLORS[d.dim.grade] || '#D97706',
                    }}
                  />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', width: 40, textAlign: 'right', flexShrink: 0 }}>
                  {d.dim.score}/25
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 500, borderRadius: 100, padding: '2px 8px', flexShrink: 0,
                  background: gradeStyle.bg, border: `1px solid ${gradeStyle.border}`, color: gradeStyle.text,
                }}>
                  {d.dim.grade}
                </span>
              </div>
            );
          })}
        </div>

        {/* Evaluator Summary */}
        <div style={{
          marginTop: 32, background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.30)', letterSpacing: 3, marginBottom: 8 }}>
            EVALUATOR SUMMARY
          </div>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic',
            lineHeight: 1.6, margin: 0,
          }}>
            &ldquo;{report.evaluator_summary}&rdquo;
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', margin: '8px 0 0' }}>
            Evaluated by FinApply AI · Human-reviewed · {formatDate(report.created_at)}
          </p>
        </div>

        {/* Employer CTA */}
        <div style={{
          marginTop: 32, background: 'rgba(37,99,235,0.06)',
          border: '1px solid rgba(37,99,235,0.15)', borderRadius: 16, padding: '24px 28px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#2563EB', letterSpacing: 2, marginBottom: 8 }}>
            FOR EMPLOYERS
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>
            Interested in this candidate?
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 0 16px' }}>
            Access 100+ verified FISS Score profiles from our founding cohort.
            See how candidates think before the first interview.
          </p>
          <Link href="/#employers" style={{
            display: 'inline-block', background: '#2563EB', color: '#fff',
            borderRadius: 100, padding: '10px 24px', fontSize: 13, fontWeight: 500,
            textDecoration: 'none', transition: 'opacity 200ms ease',
          }}>
            Request Employer Access
          </Link>
        </div>

        {/* Share Tools */}
        <div style={{
          marginTop: 32, background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 28px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.30)', letterSpacing: 2, marginBottom: 16 }}>
            SHARE YOUR SCORE
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 100, padding: '9px 18px', fontSize: 13,
                color: copyState === 'copied' ? '#16A34A' : 'rgba(255,255,255,0.70)',
                transition: 'all 200ms ease',
              }}
            >
              {copyState === 'copied' ? (
                <><span>✓</span> Copied</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Copy Link
                </>
              )}
            </button>

            {/* LinkedIn Share */}
            <button
              onClick={handleLinkedInShare}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                background: 'rgba(10,102,194,0.12)', border: '1px solid rgba(10,102,194,0.25)',
                borderRadius: 100, padding: '9px 18px', fontSize: 13,
                color: '#3B82F6', transition: 'all 200ms ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Share on LinkedIn
            </button>

            {/* Copy Post Text */}
            <button
              onClick={handleCopyPost}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 100, padding: '9px 18px', fontSize: 13,
                color: postCopyState === 'copied' ? '#16A34A' : 'rgba(255,255,255,0.50)',
                transition: 'all 200ms ease',
              }}
            >
              {postCopyState === 'copied' ? '✓ Post Copied' : 'Copy Post Text'}
            </button>
          </div>

          {/* Badge toggle */}
          <button
            onClick={() => setShowBadge(!showBadge)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              background: 'transparent', border: 'none', padding: 0,
              fontSize: 12, color: '#2563EB', fontWeight: 500,
            }}
          >
            {showBadge ? '▾ Hide' : '▸ Show'} Email Signature Badge
          </button>

          {showBadge && (
            <div style={{ marginTop: 16 }}>
              {/* Badge preview */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 10,
                padding: '16px 20px', marginBottom: 12,
              }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', margin: '0 0 10px' }}>
                  PREVIEW
                </p>
                <div
                  dangerouslySetInnerHTML={{ __html: generateBadgeHtml(shareId, report.total_score) }}
                />
              </div>
              <button
                onClick={handleCopyBadge}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 100, padding: '8px 16px', fontSize: 12,
                  color: badgeCopyState === 'copied' ? '#16A34A' : 'rgba(255,255,255,0.60)',
                  transition: 'all 200ms ease',
                }}
              >
                {badgeCopyState === 'copied' ? '✓ HTML Copied' : 'Copy Badge HTML'}
              </button>
            </div>
          )}
        </div>

        {/* Footer branding */}
        <div style={{ marginTop: 40, paddingBottom: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, margin: 0 }}>
            This score was generated by FinApply.ai — the finance candidate capability assessment platform.
          </p>
          <Link href="/#apply" style={{
            display: 'inline-block', fontSize: 12, color: '#2563EB', fontWeight: 500,
            textDecoration: 'none', marginTop: 8,
          }}>
            Apply for your FISS Score →
          </Link>
        </div>
      </main>
    </div>
  );
}
