'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import FinApplyLogo from '@/components/ui/FinApplyLogo';
import PillButton from '@/components/ui/PillButton';

interface CohortInsights {
  month: string;
  generated_at: string;
  cohort_size: number;
  average_score: number;
  dimensions: {
    financial_reasoning: number;
    structured_thinking: number;
    risk_identification: number;
    decision_clarity: number;
  };
  strongest_dimension: { name: string; avg: number };
  weakest_dimension: { name: string; avg: number };
  score_distribution: {
    elite: number;
    strong: number;
    developing: number;
    needs_work: number;
  };
  tracks: Record<string, { count: number; avgScore: number }>;
  key_insights: string[];
}

const DIM_LABELS = [
  { key: 'financial_reasoning' as const, label: 'Financial Reasoning', abbr: 'FR' },
  { key: 'structured_thinking' as const, label: 'Structured Thinking', abbr: 'ST' },
  { key: 'risk_identification' as const, label: 'Risk Identification', abbr: 'RI' },
  { key: 'decision_clarity' as const, label: 'Decision Clarity', abbr: 'DC' },
];

const DIST_COLORS: Record<string, string> = {
  elite: '#16A34A',
  strong: '#2563EB',
  developing: '#D97706',
  needs_work: '#DC2626',
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<CohortInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/cohort-insights', { method: 'POST' });
        const json = await res.json();
        if (res.ok && json.data) {
          setInsights(json.data);
        }
      } catch { /* fail silently */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.40)' }}>Loading insights...</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <h2 style={{ fontSize: 20, color: '#fff', marginBottom: 8 }}>No insights available yet</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, marginBottom: 24 }}>
            Cohort insights require at least 10 completed simulations in a month.
          </p>
          <PillButton variant="outline" href="/">← Back to Home</PillButton>
        </div>
      </div>
    );
  }

  const d = insights;

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', maxWidth: 720, margin: '0 auto',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}><FinApplyLogo size="sm" /></Link>
        <span style={{
          fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 100,
          background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)',
          color: '#2563EB',
        }}>
          Cohort Insights
        </span>
      </nav>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 120px' }}>
        {/* Header */}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 8 }}>
          MONTHLY COHORT REPORT
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
          {d.month}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', marginBottom: 40 }}>
          {d.cohort_size} candidates • Generated {new Date(d.generated_at).toLocaleDateString()}
        </p>

        {/* Top Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32,
        }}>
          {[
            { label: 'Cohort Size', value: d.cohort_size, unit: '' },
            { label: 'Average FISS', value: d.average_score, unit: '/100' },
            { label: 'Elite (80+)', value: d.score_distribution.elite, unit: '' },
          ].map(s => (
            <div key={s.label} style={{
              textAlign: 'center', padding: '20px 16px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
            }}>
              <p style={{ fontSize: 28, fontWeight: 600, color: '#fff', margin: 0 }}>
                {s.value}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.30)' }}>{s.unit}</span>
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Dimension Breakdown */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '24px', marginBottom: 24,
        }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginBottom: 16 }}>
            DIMENSION AVERAGES
          </p>
          {DIM_LABELS.map(dim => {
            const score = d.dimensions[dim.key];
            const pct = (score / 25) * 100;
            const isStrongest = dim.label === d.strongest_dimension.name;
            const isWeakest = dim.label === d.weakest_dimension.name;
            const color = isStrongest ? '#16A34A' : isWeakest ? '#DC2626' : '#2563EB';
            return (
              <div key={dim.key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)' }}>
                    {dim.label}
                    {isStrongest && <span style={{ fontSize: 10, color: '#16A34A', marginLeft: 8 }}>★ Strongest</span>}
                    {isWeakest && <span style={{ fontSize: 10, color: '#DC2626', marginLeft: 8 }}>▼ Weakest</span>}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{score}/25</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{
                    height: '100%', borderRadius: 3, width: `${pct}%`,
                    background: color, transition: 'width 800ms ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Score Distribution */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '24px', marginBottom: 24,
        }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginBottom: 16 }}>
            SCORE DISTRIBUTION
          </p>
          {[
            { label: 'Elite (80–100)', key: 'elite' as const },
            { label: 'Strong (60–79)', key: 'strong' as const },
            { label: 'Developing (40–59)', key: 'developing' as const },
            { label: 'Needs Work (0–39)', key: 'needs_work' as const },
          ].map(tier => {
            const count = d.score_distribution[tier.key];
            const pct = Math.round((count / d.cohort_size) * 100);
            return (
              <div key={tier.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', width: 130, flexShrink: 0 }}>{tier.label}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{
                    height: '100%', borderRadius: 4, width: `${pct}%`,
                    background: DIST_COLORS[tier.key], minWidth: count > 0 ? 4 : 0,
                  }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', width: 50, textAlign: 'right', flexShrink: 0 }}>
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>

        {/* Key Insights */}
        <div style={{
          background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.12)',
          borderRadius: 16, padding: 24, marginBottom: 40,
        }}>
          <p style={{ fontSize: 11, color: '#2563EB', letterSpacing: 2, fontWeight: 500, marginBottom: 16 }}>
            KEY INSIGHTS
          </p>
          {d.key_insights.map((insight, i) => (
            <p key={i} style={{
              fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6,
              paddingLeft: 12, borderLeft: '2px solid rgba(37,99,235,0.25)',
              marginBottom: 12,
            }}>
              {insight}
            </p>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <PillButton variant="primary" href="/#apply">
            Take Your FISS Simulation →
          </PillButton>
        </div>
      </main>
    </div>
  );
}
