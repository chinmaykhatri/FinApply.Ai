'use client';
import React from 'react';
import PillButton from '@/components/ui/PillButton';

const SAMPLE_REPORT = {
  candidateName: 'Priya Sharma',
  college: 'SRCC, Delhi University',
  targetRole: 'Investment Banking Analyst',
  totalScore: 74,
  percentile: 'Top 28th Percentile',
  reportDate: 'April 25, 2026',
  dimensions: [
    {
      name: 'Financial Reasoning',
      score: 21, total: 25, grade: 'Strong',
      gradeColor: '#16A34A', gradeBg: 'rgba(22,163,74,0.12)',
      rationale: 'Demonstrated strong ability to interpret financial statements and identify key valuation drivers. Connected revenue quality metrics to DCF assumptions with clear logic.',
      evidence: 'Correctly identified that 72% revenue concentration from a single client creates material risk to terminal value assumptions.',
      improvement: 'Could strengthen scenario analysis by incorporating more granular sensitivity tables for key assumptions.',
    },
    {
      name: 'Structured Thinking',
      score: 17, total: 25, grade: 'Adequate',
      gradeColor: '#D97706', gradeBg: 'rgba(217,119,6,0.12)',
      rationale: 'Organized analysis in a logical framework but occasionally jumped between topics without clear transitions.',
      evidence: 'Used a MECE structure for market analysis but the competitive positioning section lacked systematic comparison criteria.',
      improvement: 'Practice using numbered frameworks (e.g., "Three key factors drive this decision: ...") to create clearer analytical scaffolding.',
    },
    {
      name: 'Risk Identification',
      score: 19, total: 25, grade: 'Strong',
      gradeColor: '#16A34A', gradeBg: 'rgba(22,163,74,0.12)',
      rationale: 'Identified both obvious and non-obvious risks including customer concentration, margin pressure, and regulatory headwinds.',
      evidence: 'Surfaced the working capital cycle risk that most analysts miss — showing genuine analytical depth beyond surface-level pattern matching.',
      improvement: 'Quantify risk impacts more precisely using probability-weighted scenarios rather than qualitative assessments.',
    },
    {
      name: 'Decision Clarity',
      score: 14, total: 25, grade: 'Developing',
      gradeColor: '#DC2626', gradeBg: 'rgba(220,38,38,0.12)',
      rationale: 'Final recommendation was hedged with too many qualifiers, reducing conviction signal. The "it depends" framing weakened an otherwise solid analysis.',
      evidence: 'Conclusion used phrases like "could potentially" and "might consider" rather than taking a clear directional stance.',
      improvement: 'Practice the "newspaper test" — if your recommendation appeared as a headline, would it be clear? State your view first, then add nuance.',
    },
  ],
  standoutStrength: 'You identified non-obvious customer concentration risk that surface readers miss — the rarest analyst signal. This pattern-breaking insight is exactly what senior bankers look for in junior analysts.',
  criticalGap: 'Your analysis was thorough but your final recommendation lacked conviction. In IB, partners need to trust that you can synthesize complexity into a clear directional view. Work on "landing the plane" with decisive conclusions.',
  evaluatorSummary: 'Priya demonstrates strong analytical fundamentals with particularly impressive risk identification skills. Her ability to surface non-obvious risks places her in the top tier of candidates. The main development area is translating thorough analysis into decisive, high-conviction recommendations — a skill that can be rapidly improved with deliberate practice.',
};

export default function SampleReportPage() {
  const d = SAMPLE_REPORT;

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '60px 24px 120px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.25)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 24,
        }}>
          <span style={{ fontSize: 12, color: '#2563EB', fontWeight: 600 }}>SAMPLE REPORT — FOR ILLUSTRATION ONLY</span>
        </div>

        {/* Report Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 20, padding: 40,
        }}>
          {/* Masthead */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3 }}>
              FISS SCORE REPORT
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)' }}>
              {d.reportDate}
            </span>
          </div>

          {/* Candidate info */}
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '16px 0 4px' }}>
            {d.candidateName}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', margin: 0 }}>
            {d.college} · {d.targetRole}
          </p>

          {/* Score */}
          <div style={{
            textAlign: 'center', margin: '40px 0 32px',
            padding: 32, borderRadius: 16,
            background: 'rgba(37,99,235,0.04)',
            border: '1px solid rgba(37,99,235,0.12)',
          }}>
            <span style={{ fontSize: 72, fontWeight: 700, color: '#fff' }}>{d.totalScore}</span>
            <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.30)', marginLeft: 4 }}>/100</span>
            <p style={{ fontSize: 14, color: '#2563EB', fontWeight: 500, marginTop: 8 }}>
              {d.percentile} — IB Analyst Cohort
            </p>
          </div>

          {/* Evaluator Summary */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 20, marginBottom: 32,
          }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginBottom: 10 }}>
              EVALUATOR SUMMARY
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.7 }}>
              {d.evaluatorSummary}
            </p>
          </div>

          {/* Dimension Breakdown */}
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 20 }}>
            DIMENSION BREAKDOWN
          </p>

          {d.dimensions.map((dim, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: 24, marginBottom: 16,
            }}>
              {/* Dimension header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{dim.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                    {dim.score}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.30)' }}>/{dim.total}</span>
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: dim.gradeColor,
                    background: dim.gradeBg, borderRadius: 100,
                    padding: '3px 10px',
                  }}>
                    {dim.grade}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 6, borderRadius: 3,
                background: 'rgba(255,255,255,0.06)', marginBottom: 16,
              }}>
                <div style={{
                  height: '100%', borderRadius: 3, width: `${(dim.score / dim.total) * 100}%`,
                  background: dim.gradeColor, transition: 'width 800ms ease',
                }} />
              </div>

              {/* Details */}
              {[
                { label: 'RATIONALE', text: dim.rationale },
                { label: 'KEY EVIDENCE', text: dim.evidence },
                { label: 'HOW TO IMPROVE', text: dim.improvement },
              ].map((section) => (
                <div key={section.label} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.30)', letterSpacing: 2, marginBottom: 4 }}>
                    {section.label}
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, margin: 0 }}>
                    {section.text}
                  </p>
                </div>
              ))}
            </div>
          ))}

          {/* Standout Strength */}
          <div style={{
            background: 'rgba(22,163,74,0.06)',
            borderLeft: '3px solid #16A34A',
            borderRadius: '0 12px 12px 0',
            padding: 20, marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', letterSpacing: 2, marginBottom: 8 }}>
              STANDOUT STRENGTH
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6 }}>
              {d.standoutStrength}
            </p>
          </div>

          {/* Critical Gap */}
          <div style={{
            background: 'rgba(220,38,38,0.06)',
            borderLeft: '3px solid #DC2626',
            borderRadius: '0 12px 12px 0',
            padding: 20, marginBottom: 32,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#DC2626', letterSpacing: 2, marginBottom: 8 }}>
              CRITICAL GAP
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6 }}>
              {d.criticalGap}
            </p>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 20, textAlign: 'center',
          }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              This is a sample report for illustration purposes. Your actual FISS report will reflect your unique simulation performance.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PillButton variant="primary" href="/#apply">
            Apply for Your FISS Score
          </PillButton>
          <PillButton variant="outline" href="/">
            ← Back to Home
          </PillButton>
        </div>
      </div>
    </div>
  );
}
