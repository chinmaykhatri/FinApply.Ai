'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import FinApplyLogo from '@/components/ui/FinApplyLogo';
import PillButton from '@/components/ui/PillButton';
import { generatePlan, dimensionName } from '@/lib/improvement/generate-plan';
import type { DailyAction, Dimension } from '@/lib/improvement/improvement-plans';

interface FISSReport {
  financial_reasoning: number;
  structured_thinking: number;
  risk_identification: number;
  decision_clarity: number;
  total_score: number;
}

const TYPE_ICONS: Record<string, string> = {
  read: '📖',
  practice: '✍️',
  calculate: '📊',
  review: '🔍',
};

const TYPE_COLORS: Record<string, string> = {
  read: '#60A5FA',
  practice: '#16A34A',
  calculate: '#D97706',
  review: '#A855F7',
};

export default function ImprovementPage() {
  const params = useParams();
  const token = params.token as string;
  const [phase, setPhase] = useState<'loading' | 'plan' | 'error'>('loading');
  const [plan, setPlan] = useState<DailyAction[]>([]);
  const [weakest, setWeakest] = useState<[Dimension, Dimension]>(['FR', 'ST']);
  const [report, setReport] = useState<FISSReport | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  // Load completed state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`finapply_improvement_${token}`);
      if (saved) {
        try { setCompletedDays(new Set(JSON.parse(saved))); } catch { /* ignore */ }
      }
    }
  }, [token]);

  const toggleDay = useCallback((day: number) => {
    setCompletedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      localStorage.setItem(`finapply_improvement_${token}`, JSON.stringify([...next]));
      return next;
    });
  }, [token]);

  // Fetch report data
  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch(`/api/report/${token}`);
        const json = await res.json();
        if (res.ok && json.data) {
          const r = json.data.report;
          const reportData: FISSReport = {
            financial_reasoning: r.financial_reasoning ?? 0,
            structured_thinking: r.structured_thinking ?? 0,
            risk_identification: r.risk_identification ?? 0,
            decision_clarity: r.decision_clarity ?? 0,
            total_score: r.total_score ?? 0,
          };
          setReport(reportData);
          setCandidateName(json.data.full_name || '');
          const result = generatePlan(reportData);
          setPlan(result.plan);
          setWeakest(result.weakest);
          setPhase('plan');
        } else {
          setPhase('error');
        }
      } catch {
        setPhase('error');
      }
    }
    if (token) loadReport();
  }, [token]);

  const completedCount = completedDays.size;
  const progressPct = Math.round((completedCount / 30) * 100);

  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14 }}>Loading your improvement plan...</p>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <h2 style={{ fontSize: 20, color: '#fff', marginBottom: 8 }}>Plan not available</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, marginBottom: 24 }}>
            Your FISS report must be completed before accessing the improvement plan.
          </p>
          <PillButton variant="outline" href="/">← Back to Home</PillButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* Nav */}
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
          30-Day Plan
        </span>
      </nav>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 120px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 12 }}>
            YOUR PERSONALIZED IMPROVEMENT PLAN
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            {candidateName ? `${candidateName}'s` : 'Your'} 30-Day Plan
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6 }}>
            Based on your FISS Score of <strong style={{ color: '#fff' }}>{report?.total_score}</strong>, this plan
            targets your two areas for growth: <strong style={{ color: TYPE_COLORS.read }}>{dimensionName(weakest[0])}</strong> and{' '}
            <strong style={{ color: TYPE_COLORS.read }}>{dimensionName(weakest[1])}</strong>.
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '20px 24px', marginBottom: 32,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Progress</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#2563EB' }}>
              {completedCount}/30 days ({progressPct}%)
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{
              height: '100%', borderRadius: 3, width: `${progressPct}%`,
              background: progressPct === 100 ? '#16A34A' : '#2563EB',
              transition: 'width 500ms ease',
            }} />
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {Object.entries(TYPE_ICONS).map(([type, icon]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span style={{ fontSize: 11, color: TYPE_COLORS[type], textTransform: 'capitalize', fontWeight: 500 }}>
                {type}
              </span>
            </div>
          ))}
        </div>

        {/* Daily Actions */}
        {plan.map(action => {
          const isDone = completedDays.has(action.day);
          return (
            <div
              key={action.day}
              onClick={() => toggleDay(action.day)}
              style={{
                display: 'flex', gap: 16, padding: '16px 20px', marginBottom: 8,
                borderRadius: 12, cursor: 'pointer',
                background: isDone ? 'rgba(22,163,74,0.04)' : 'rgba(255,255,255,0.02)',
                border: isDone ? '1px solid rgba(22,163,74,0.15)' : '1px solid rgba(255,255,255,0.06)',
                opacity: isDone ? 0.7 : 1,
                transition: 'all 200ms ease',
              }}
            >
              {/* Day number + checkbox */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40, paddingTop: 2 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', marginBottom: 4 }}>DAY</span>
                <span style={{
                  fontSize: 18, fontWeight: 600,
                  color: isDone ? '#16A34A' : '#fff',
                }}>
                  {action.day}
                </span>
                <div style={{
                  width: 18, height: 18, borderRadius: 4, marginTop: 6,
                  border: isDone ? '2px solid #16A34A' : '2px solid rgba(255,255,255,0.15)',
                  background: isDone ? '#16A34A' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff',
                }}>
                  {isDone && '✓'}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{TYPE_ICONS[action.type]}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: 1,
                    color: TYPE_COLORS[action.type], textTransform: 'uppercase',
                  }}>
                    {action.type} — {action.dimension}
                  </span>
                </div>
                <p style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0,
                  textDecoration: isDone ? 'line-through' : 'none',
                }}>
                  {action.action}
                </p>
                {action.resource && (
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', marginTop: 4 }}>
                    📎 {action.resource}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Day 30 CTA */}
        <div style={{
          marginTop: 40, textAlign: 'center', padding: '32px 24px',
          background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.12)',
          borderRadius: 16,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            Ready to see your improvement?
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, marginBottom: 20 }}>
            After completing this plan, take a second simulation to measure your growth across all four dimensions.
          </p>
          <PillButton variant="primary" href="/#apply">
            Take a Second Simulation →
          </PillButton>
        </div>
      </main>
    </div>
  );
}
