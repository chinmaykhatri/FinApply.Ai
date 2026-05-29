'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PillButton from '@/components/ui/PillButton';
import { PRACTICE_CASE } from '@/lib/cases/practice-case';
import PracticeCompletedBanner from '@/components/practice/PracticeCompletedBanner';
import FinApplyLogo from '@/components/ui/FinApplyLogo';

const PRACTICE_TIME = 15 * 60; // 15 minutes

const GUIDE_TABS = [
  { id: 'valuation', label: 'Valuation', hint: 'Assess the proposed 5x ARR price. What adjustments would you make and why?' },
  { id: 'risk', label: 'Risk Analysis', hint: 'Identify the top 3 risks. For each, explain probability, impact, and mitigation.' },
  { id: 'recommendation', label: 'Recommendation', hint: 'State your invest/pass decision clearly, then defend it with conditions.' },
];

export default function PracticePage() {
  const [phase, setPhase] = useState<'briefing' | 'active' | 'completed'>('briefing');
  const [timeLeft, setTimeLeft] = useState(PRACTICE_TIME);
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState('valuation');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const c = PRACTICE_CASE;

  // Timer
  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }, []);

  const handleSubmit = () => {
    if (wordCount < 10) return;
    setPhase('completed');
  };

  // ── Completed ──
  if (phase === 'completed') {
    return (
      <div style={{ minHeight: '100vh', background: '#000' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <FinApplyLogo size="sm" />
          </Link>
          <span style={{
            fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 100,
            background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.20)',
            color: '#16A34A',
          }}>
            Practice Mode
          </span>
        </nav>
        <PracticeCompletedBanner wordCount={wordCount} />
      </div>
    );
  }

  // ── Briefing ──
  if (phase === 'briefing') {
    return (
      <div style={{ minHeight: '100vh', background: '#000' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <FinApplyLogo size="sm" />
          </Link>
          <span style={{
            fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 100,
            background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)',
            color: '#2563EB',
          }}>
            Free Practice — No Registration Required
          </span>
        </nav>

        <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 24px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 24,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#2563EB' }}>PRACTICE CASE</span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            {c.title}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', marginBottom: 32 }}>
            15 minutes • Intermediate • Not scored
          </p>

          {/* Situation */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 24, marginBottom: 20,
          }}>
            <h3 style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginBottom: 12 }}>
              SITUATION
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.7, margin: 0 }}>
              {c.situation}
            </p>
          </div>

          {/* What to expect */}
          <div style={{
            background: 'rgba(22,163,74,0.04)', borderLeft: '3px solid rgba(22,163,74,0.30)',
            borderRadius: '0 12px 12px 0', padding: '16px 20px', marginBottom: 32,
          }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: '#16A34A' }}>What to expect:</strong> You&apos;ll receive full company data,
              financials, and market context. Write your analysis in a text editor with a 15-minute timer.
              This is unscored — just experience the format.
            </p>
          </div>

          {/* Start CTA */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <PillButton variant="primary" onClick={() => setPhase('active')}>
              Start Practice Case →
            </PillButton>
            <PillButton variant="outline" href="/">
              ← Back to Home
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  // ── Active Simulation ──
  const isUrgent = timeLeft <= 120;
  const isWarning = timeLeft <= 300 && !isUrgent;

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.90)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FinApplyLogo size="sm" />
          <span style={{
            fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100,
            background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)',
            color: '#2563EB',
          }}>
            Practice
          </span>
        </div>

        {/* Timer */}
        <div style={{
          fontSize: 18, fontWeight: 600, fontFamily: 'monospace',
          color: isUrgent ? '#DC2626' : isWarning ? '#D97706' : '#fff',
          padding: '4px 16px', borderRadius: 8,
          background: isUrgent ? 'rgba(220,38,38,0.10)' : 'transparent',
          transition: 'all 300ms ease',
        }}>
          {formatTime(timeLeft)}
        </div>

        {/* Word count + Submit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
            {wordCount} words
          </span>
          <button
            onClick={handleSubmit}
            disabled={wordCount < 10}
            style={{
              fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 100,
              border: 'none', cursor: wordCount < 10 ? 'not-allowed' : 'pointer',
              background: wordCount < 10 ? 'rgba(255,255,255,0.06)' : '#2563EB',
              color: wordCount < 10 ? 'rgba(255,255,255,0.30)' : '#fff',
              transition: 'all 200ms ease',
            }}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Main content — split layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel — case brief */}
        <div style={{
          width: '45%', overflowY: 'auto', padding: '28px 24px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
            {c.title}
          </h2>

          {/* Situation */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginBottom: 8 }}>SITUATION</h4>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{c.situation}</p>
          </div>

          {/* Company Overview */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginBottom: 8 }}>COMPANY OVERVIEW</h4>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{c.company_overview}</p>
          </div>

          {/* Financials Table */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginBottom: 8 }}>FINANCIALS</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {c.financials.headers.map((h, i) => (
                      <th key={i} style={{
                        textAlign: i === 0 ? 'left' : 'right', padding: '8px 10px',
                        borderBottom: '1px solid rgba(255,255,255,0.10)',
                        color: 'rgba(255,255,255,0.50)', fontWeight: 500, fontSize: 10,
                        letterSpacing: 1,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.financials.rows.map((row, ri) => (
                    <tr key={ri}>
                      <td style={{ padding: '7px 10px', color: 'rgba(255,255,255,0.60)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {row.label}
                      </td>
                      {row.values.map((v, vi) => (
                        <td key={vi} style={{
                          padding: '7px 10px', textAlign: 'right',
                          color: '#fff', fontFamily: 'monospace', fontSize: 12,
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Market Context */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginBottom: 8 }}>MARKET CONTEXT</h4>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{c.market_context}</p>
          </div>

          {/* Task */}
          <div style={{
            background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.12)',
            borderRadius: 12, padding: 16,
          }}>
            <h4 style={{ fontSize: 11, color: '#2563EB', letterSpacing: 2, marginBottom: 8 }}>YOUR TASK</h4>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {c.task}
            </div>
          </div>
        </div>

        {/* Right panel — editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px' }}>
          {/* Guide tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {GUIDE_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 100,
                  border: activeTab === tab.id ? '1px solid rgba(37,99,235,0.30)' : '1px solid rgba(255,255,255,0.10)',
                  background: activeTab === tab.id ? 'rgba(37,99,235,0.10)' : 'transparent',
                  color: activeTab === tab.id ? '#2563EB' : 'rgba(255,255,255,0.40)',
                  cursor: 'pointer', transition: 'all 200ms ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active hint */}
          <div style={{
            padding: '10px 16px', borderRadius: 10, marginBottom: 12,
            background: 'rgba(37,99,235,0.04)', borderLeft: '3px solid rgba(37,99,235,0.30)',
          }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', margin: 0, lineHeight: 1.5 }}>
              💡 {GUIDE_TABS.find(t => t.id === activeTab)?.hint}
            </p>
          </div>

          {/* Textarea */}
          <textarea
            ref={textAreaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Start typing your analysis here..."
            style={{
              flex: 1, width: '100%', resize: 'none',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: 20, color: '#fff', fontSize: 14,
              lineHeight: 1.8, outline: 'none', fontFamily: 'var(--font-family)',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="width: '45%'"] {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            max-height: 40vh;
          }
        }
      `}</style>
    </div>
  );
}
