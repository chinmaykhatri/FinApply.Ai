'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import FinApplyLogo from '@/components/ui/FinApplyLogo';
import PillButton from '@/components/ui/PillButton';
import DealRoomPreview from '@/components/employer/DealRoomPreview';
import EmployerDashboardMockup from '@/components/employer/EmployerDashboardMockup';
import anime from 'animejs';

const STEPS = [
  { id: 'dealroom', label: 'What Candidates Experience', icon: '📝' },
  { id: 'report', label: 'What You Receive', icon: '📄' },
  { id: 'dashboard', label: 'Your Dashboard', icon: '📊' },
];

const SAMPLE_DIMS = [
  { name: 'Financial Reasoning', score: 21, total: 25, grade: 'Strong', color: '#16A34A' },
  { name: 'Structured Thinking', score: 17, total: 25, grade: 'Adequate', color: '#D97706' },
  { name: 'Risk Identification', score: 19, total: 25, grade: 'Strong', color: '#16A34A' },
  { name: 'Decision Clarity', score: 14, total: 25, grade: 'Developing', color: '#DC2626' },
];

export default function EmployerDemoPage() {
  const [step, setStep] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Animate content on step change
  useEffect(() => {
    if (contentRef.current) {
      anime({
        targets: contentRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
      });
    }
  }, [step]);

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <FinApplyLogo size="sm" />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 100,
            background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)',
            color: '#2563EB',
          }}>
            Employer Demo
          </span>
          <PillButton variant="outline" href="/pricing">
            Start a Pilot →
          </PillButton>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 120px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 12 }}>
            EMPLOYER WALKTHROUGH
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            See How FinApply Works
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            A 3-step guided tour of the candidate experience, FISS scoring,
            and what your employer dashboard looks like.
          </p>
        </div>

        {/* Step Navigation */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40,
        }}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 100, border: 'none', cursor: 'pointer',
                background: step === i ? 'rgba(37,99,235,0.10)' : 'rgba(255,255,255,0.03)',
                borderWidth: 1, borderStyle: 'solid',
                borderColor: step === i ? 'rgba(37,99,235,0.30)' : 'rgba(255,255,255,0.08)',
                color: step === i ? '#2563EB' : 'rgba(255,255,255,0.40)',
                fontSize: 13, fontWeight: 500,
                transition: 'all 200ms ease',
              }}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
              {step > i && (
                <span style={{ color: '#16A34A', fontSize: 12 }}>✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: step === i ? 24 : 8, height: 8, borderRadius: 4,
                background: step >= i ? '#2563EB' : 'rgba(255,255,255,0.10)',
                transition: 'all 300ms ease',
              }}
            />
          ))}
        </div>

        {/* Step Content */}
        <div ref={contentRef}>
          {/* Step 1: Deal Room */}
          {step === 0 && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                  The Deal Room Simulation
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6 }}>
                  Candidates receive a real-world finance case — M&A, PE, credit, or advisory — and have
                  45 minutes to write their analysis. The environment is proctored with webcam, fullscreen
                  mode, and tab-switch monitoring.
                </p>
              </div>
              <DealRoomPreview />
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20,
              }}>
                {[
                  { label: 'Dynamic Cases', desc: 'Each candidate gets unique financial data — no two simulations are identical.' },
                  { label: 'Integrity Monitoring', desc: 'Tab switches, paste detection, and typing pattern analysis ensure authentic work.' },
                  { label: 'Role-Specific', desc: '5 tracks: IB, PE, Big 4, Corporate Finance, and Equity Research.' },
                ].map(f => (
                  <div key={f.label} style={{
                    padding: '16px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{f.label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: FISS Report */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                  The FISS Score Report
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6 }}>
                  AI evaluates each candidate across four dimensions. You receive a detailed breakdown
                  with evidence, rationale, and improvement guidance for each candidate.
                </p>
              </div>

              {/* Mini report preview */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '28px', marginBottom: 20,
              }}>
                {/* Score header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: 3, marginBottom: 8 }}>
                    FISS SCORE REPORT
                  </p>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
                    Priya Sharma
                  </h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
                    SRCC, Delhi University · IB Analyst
                  </p>
                  <div style={{
                    margin: '20px auto', width: 100, height: 100, borderRadius: '50%',
                    border: '4px solid rgba(37,99,235,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>74</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#2563EB' }}>Top 28th Percentile</p>
                </div>

                {/* Dimension bars */}
                {SAMPLE_DIMS.map(d => (
                  <div key={d.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)' }}>{d.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{d.score}/25</span>
                        <span style={{
                          fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                          color: d.color, background: `${d.color}15`,
                        }}>{d.grade}</span>
                      </div>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{
                        height: '100%', borderRadius: 3, width: `${(d.score / d.total) * 100}%`,
                        background: d.color,
                      }} />
                    </div>
                  </div>
                ))}

                {/* Summary sections */}
                <div style={{ marginTop: 20 }}>
                  <div style={{
                    padding: '12px 16px', borderRadius: 8, marginBottom: 10,
                    background: 'rgba(22,163,74,0.04)', borderLeft: '3px solid rgba(22,163,74,0.30)',
                  }}>
                    <p style={{ fontSize: 10, color: '#16A34A', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>STANDOUT STRENGTH</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, margin: 0 }}>
                      Identified non-obvious customer concentration risk — the rarest analyst signal.
                    </p>
                  </div>
                  <div style={{
                    padding: '12px 16px', borderRadius: 8,
                    background: 'rgba(220,38,38,0.04)', borderLeft: '3px solid rgba(220,38,38,0.30)',
                  }}>
                    <p style={{ fontSize: 10, color: '#DC2626', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>CRITICAL GAP</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, margin: 0 }}>
                      Final recommendation lacked conviction. Work on decisive conclusions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Verifiable badge */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                padding: '12px 20px', borderRadius: 12,
                background: 'rgba(22,163,74,0.04)', border: '1px solid rgba(22,163,74,0.12)',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
                </svg>
                <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 500 }}>
                  Every FISS Score is cryptographically verifiable at finapply.ai/verify/[id]
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Dashboard */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                  Your Employer Dashboard
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6 }}>
                  View all candidates ranked by FISS score. Compare dimensions side-by-side.
                  Export reports, set minimum score thresholds, and build your pipeline.
                </p>
              </div>
              <EmployerDashboardMockup />
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 40, paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              fontSize: 13, fontWeight: 500, padding: '10px 20px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.10)', background: 'transparent',
              color: step === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.60)',
              cursor: step === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Previous
          </button>

          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>
            Step {step + 1} of {STEPS.length}
          </span>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
              style={{
                fontSize: 13, fontWeight: 500, padding: '10px 20px', borderRadius: 100,
                border: 'none', background: '#2563EB', color: '#fff', cursor: 'pointer',
              }}
            >
              Next →
            </button>
          ) : (
            <PillButton variant="primary" href="/pricing">
              Start a Pilot →
            </PillButton>
          )}
        </div>
      </main>
    </div>
  );
}
