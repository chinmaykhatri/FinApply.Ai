'use client';
import React from 'react';

interface CaseData {
  case_code: string;
  title: string;
  track: string;
  difficulty: string;
  total_uses: number;
  avg_fiss: number;
  completion_pct: number;
  avg_time: number;
  non_obvious_pct: number;
  override_pct: number;
  health_score: number;
  status: string;
  score_distribution: Record<string, number>;
  time_distribution: Record<string, number>;
  dimension_averages: { fr: number; st: number; ri: number; dc: number };
  recent_overrides: Array<{
    date: string;
    dimension: string;
    original: number;
    override: number;
    reason: string;
  }>;
}

interface Props {
  caseData: CaseData | null;
  onClose: () => void;
}

export default function CaseDetailDrawer({ caseData, onClose }: Props) {
  if (!caseData) return null;

  const c = caseData;
  const healthColor = c.health_score >= 80 ? '#16A34A' : c.health_score >= 60 ? '#D97706' : '#DC2626';
  const healthLabel = c.health_score >= 80 ? 'Well Calibrated' : c.health_score >= 60 ? 'Needs Review' : 'Recalibrate';

  const maxScoreBand = Math.max(...Object.values(c.score_distribution), 1);
  const maxTimeBand = Math.max(...Object.values(c.time_distribution), 1);

  const dimensionBar = (label: string, value: number, key: string) => {
    const pct = Math.min((value / 25) * 100, 100);
    const isLow = value < 12;
    return (
      <div key={key} style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)' }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: isLow ? '#DC2626' : '#fff' }}>
            {value}/25
          </span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: isLow
              ? 'linear-gradient(90deg, #DC2626, #F87171)'
              : 'linear-gradient(90deg, #2563EB, #60A5FA)',
            borderRadius: 3,
            transition: 'width 600ms ease',
          }} />
        </div>
      </div>
    );
  };

  // Detect override patterns
  const reasonCounts: Record<string, number> = {};
  for (const o of c.recent_overrides) {
    const r = o.reason.toLowerCase().trim();
    if (r) reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  }
  const patternReasons = Object.entries(reasonCounts).filter(([, count]) => count >= 3);

  // Calibration recommendations
  const recommendations: Array<{ type: string; title: string; body: string; color: string; border: string }> = [];

  if (c.avg_fiss > 78) {
    recommendations.push({
      type: 'easy', title: 'CASE TOO EASY',
      body: `Average FISS of ${c.avg_fiss} is above the 78 threshold. Strong candidates are scoring very high without genuine differentiation.\n\nRecommended actions:\n→ Add a second non-obvious signal\n→ Increase data complexity in the financial tables\n→ Add a constraining factor that limits obvious solutions`,
      color: 'rgba(239,68,68,0.08)', border: '#EF4444',
    });
  }

  if (c.completion_pct < 65 && c.total_uses >= 10) {
    recommendations.push({
      type: 'completion', title: 'COMPLETION RISK',
      body: `Only ${c.completion_pct}% of candidates who open this case complete it. This may indicate the analytical scope is too broad for 45 minutes.\n\nRecommended actions:\n→ Reduce the number of task deliverables from 4 to 3\n→ Simplify one financial calculation requirement\n→ Check if case text length is causing cognitive overload`,
      color: 'rgba(217,119,6,0.08)', border: '#D97706',
    });
  }

  if (c.non_obvious_pct > 40 && c.total_uses >= 10) {
    recommendations.push({
      type: 'obvious', title: 'SIGNAL TOO OBVIOUS',
      body: `${c.non_obvious_pct}% of candidates are finding the non-obvious signal — above the 40% ceiling.\n\nRecommended actions:\n→ Bury the signal deeper in the financial data\n→ Add a misleading surface signal that draws attention away\n→ Remove the explicit mention of the risk category that contains the signal`,
      color: 'rgba(249,115,22,0.08)', border: '#F97316',
    });
  }

  // Low dimension callouts
  const dimLabels: Record<string, string> = { fr: 'Financial Reasoning', st: 'Structured Thinking', ri: 'Risk Identification', dc: 'Decision Clarity' };
  const lowDims = (Object.entries(c.dimension_averages) as [string, number][])
    .filter(([, v]) => v < 12 && v > 0);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.50)', zIndex: 90,
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
        background: '#0A0A0F',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        zIndex: 100,
        overflowY: 'auto',
        padding: 32,
        animation: 'slideIn 250ms ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#2563EB', fontWeight: 600 }}>
              {c.case_code}
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 4 }}>{c.title}</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginTop: 2 }}>
              {c.track} • {c.difficulty} • {c.total_uses} submissions
            </p>
          </div>
          <button onClick={onClose} style={{
            fontSize: 18, color: 'rgba(255,255,255,0.40)', background: 'none',
            border: 'none', cursor: 'pointer', padding: '4px 8px',
          }}>
            ✕
          </button>
        </div>

        {/* Case Health Score */}
        <div style={{
          textAlign: 'center', padding: 24,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, marginBottom: 24,
        }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, textTransform: 'uppercase' }}>
            Case Health
          </p>
          <p style={{ fontSize: 48, fontWeight: 700, color: healthColor, marginTop: 8 }}>
            {c.health_score}
          </p>
          <p style={{ fontSize: 12, fontWeight: 600, color: healthColor, marginTop: 4 }}>
            {healthLabel}
          </p>
        </div>

        {/* Score Distribution */}
        <div style={{ marginBottom: 28 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Score Distribution</h4>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 120 }}>
            {Object.entries(c.score_distribution).map(([band, count]) => (
              <div key={band} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.50)', marginBottom: 4 }}>{count}</span>
                <div style={{
                  width: '100%',
                  height: `${Math.max((count / maxScoreBand) * 90, 4)}%`,
                  background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                  borderRadius: '4px 4px 0 0',
                  position: 'relative',
                }}>
                  {(band === '60-69' || band === '70-79') && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                      borderTop: '2px dashed rgba(22,163,74,0.60)',
                    }} />
                  )}
                </div>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{band}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', marginTop: 6, textAlign: 'center' }}>
            Dashed line marks target range (62-74)
          </p>
        </div>

        {/* Dimension Averages */}
        <div style={{ marginBottom: 28 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Dimension Averages</h4>
          {dimensionBar('Financial Reasoning (FR)', c.dimension_averages.fr, 'fr')}
          {dimensionBar('Structured Thinking (ST)', c.dimension_averages.st, 'st')}
          {dimensionBar('Risk Identification (RI)', c.dimension_averages.ri, 'ri')}
          {dimensionBar('Decision Clarity (DC)', c.dimension_averages.dc, 'dc')}

          {lowDims.map(([key, val]) => (
            <div key={key} style={{
              marginTop: 8, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)',
              fontSize: 12, color: 'rgba(255,255,255,0.60)', lineHeight: 1.5,
            }}>
              ⚠ <strong style={{ color: '#D97706' }}>{dimLabels[key]}</strong> average is {val}/25 — significantly below other dimensions.
              Consider whether the task is clear enough in the case briefing.
            </div>
          ))}
        </div>

        {/* Time Distribution */}
        <div style={{ marginBottom: 28 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Time Distribution</h4>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
            {Object.entries(c.time_distribution).map(([band, count]) => (
              <div key={band} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.50)', marginBottom: 4 }}>{count}</span>
                <div style={{
                  width: '100%',
                  height: `${Math.max((count / maxTimeBand) * 80, 4)}%`,
                  background: 'linear-gradient(180deg, #8B5CF6, #6D28D9)',
                  borderRadius: '4px 4px 0 0',
                }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{band}m</span>
              </div>
            ))}
          </div>
        </div>

        {/* Override Log */}
        {c.recent_overrides.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
              Override Log (Last {c.recent_overrides.length})
            </h4>
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, overflow: 'hidden' }}>
              {c.recent_overrides.map((o, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '80px 60px 80px 1fr',
                  padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  fontSize: 11, color: 'rgba(255,255,255,0.50)',
                }}>
                  <span>{new Date(o.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  <span style={{ color: '#D97706', fontWeight: 600 }}>{o.dimension}</span>
                  <span>{o.original} → {o.override}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.reason}</span>
                </div>
              ))}
            </div>

            {/* Pattern detection */}
            {patternReasons.map(([reason, count]) => (
              <div key={reason} style={{
                marginTop: 8, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)',
                fontSize: 12, color: 'rgba(255,255,255,0.60)', lineHeight: 1.5,
              }}>
                <strong style={{ color: '#DC2626' }}>PATTERN DETECTED:</strong> Gemini consistently gets overridden on this case.
                Reason appearing {count}× : &quot;{reason}&quot;.
                Recommendation: Update the evaluation prompt with additional case-specific guidance.
              </div>
            ))}
          </div>
        )}

        {/* Calibration Recommendations */}
        {recommendations.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Calibration Recommendations</h4>
            {recommendations.map((r) => (
              <div key={r.type} style={{
                padding: '14px 16px', borderRadius: 12, marginBottom: 8,
                background: r.color, borderLeft: `3px solid ${r.border}`,
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: r.border, marginBottom: 8 }}>{r.title}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
