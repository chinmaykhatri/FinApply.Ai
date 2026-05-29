'use client';
import React from 'react';
import PillButton from '@/components/ui/PillButton';

const MOCK_DIMENSIONS = [
  { abbr: 'FR', name: 'Financial Reasoning', score: '??', grade: '—', color: '#2563EB' },
  { abbr: 'ST', name: 'Structured Thinking', score: '??', grade: '—', color: '#2563EB' },
  { abbr: 'RI', name: 'Risk Identification', score: '??', grade: '—', color: '#2563EB' },
  { abbr: 'DC', name: 'Decision Clarity', score: '??', grade: '—', color: '#2563EB' },
];

export default function PracticeCompletedBanner({ wordCount }: { wordCount: number }) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
      {/* Completion badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.25)',
        borderRadius: 100, padding: '8px 20px', marginBottom: 24,
      }}>
        <span style={{ fontSize: 16 }}>✓</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#16A34A' }}>
          Practice Simulation Complete
        </span>
      </div>

      <h2 style={{ fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
        Nice work.
      </h2>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, marginBottom: 40 }}>
        You wrote {wordCount.toLocaleString()} words in 15 minutes. In the real Deal Room, our AI evaluates
        your analysis across four dimensions and generates a verified FISS Score.
      </p>

      {/* Mock FISS Preview */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '32px 28px', marginBottom: 40, textAlign: 'left',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.30)',
          letterSpacing: 3, marginBottom: 20, textAlign: 'center',
        }}>
          YOUR FISS REPORT WOULD LOOK LIKE THIS
        </div>

        {/* Score ring preview */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            border: '6px solid rgba(37,99,235,0.20)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: 'rgba(255,255,255,0.25)' }}>??</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', marginTop: 8 }}>/100 — FISS Score</p>
        </div>

        {/* Dimension bars */}
        {MOCK_DIMENSIONS.map(d => (
          <div key={d.abbr} style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#2563EB', width: 20, flexShrink: 0 }}>
              {d.abbr}
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', width: 150, flexShrink: 0 }}>
              {d.name}
            </span>
            <div style={{
              flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden',
            }}>
              <div style={{
                width: '65%', height: '100%', borderRadius: 100,
                background: 'linear-gradient(90deg, rgba(37,99,235,0.30), rgba(37,99,235,0.08))',
                animation: 'shimmer 2s ease-in-out infinite',
              }} />
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', width: 40, textAlign: 'right', flexShrink: 0 }}>
              {d.score}/25
            </span>
          </div>
        ))}

        {/* Locked sections */}
        {['EVALUATOR SUMMARY', 'STANDOUT STRENGTH', 'CRITICAL GAP'].map(s => (
          <div key={s} style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)',
          }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.20)', letterSpacing: 2, margin: 0 }}>
              🔒 {s}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <PillButton variant="primary" href="/#apply">
          Get Your Real FISS Score →
        </PillButton>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>
          45-minute simulation • AI-scored • Verified report in 24 hours
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
