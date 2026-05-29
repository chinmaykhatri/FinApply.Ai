'use client';
import React, { useEffect, useState, useCallback } from 'react';
import CaseDetailDrawer from './CaseDetailDrawer';

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

const TRACKS = ['All', 'IB', 'PE', 'B4', 'ER', 'CF'];
const DIFFICULTIES = ['All', 'Intermediate', 'Advanced', 'Expert'];
const DATE_RANGES = [
  { label: 'Last 30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: 'All time', days: 0 },
];

export default function CaseAnalytics() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackFilter, setTrackFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [dateRange, setDateRange] = useState(0);
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (trackFilter !== 'All') params.set('track', trackFilter);
      if (difficultyFilter !== 'All') params.set('difficulty', difficultyFilter);
      if (dateRange > 0) params.set('days', String(dateRange));

      const res = await fetch(`/api/admin/case-analytics?${params}`);
      const json = await res.json();
      if (json.data) setCases(json.data);
    } catch { /* handle error */ }
    finally { setLoading(false); }
  }, [trackFilter, difficultyFilter, dateRange]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const fissColor = (v: number) => {
    if (v > 78) return '#DC2626';
    if (v >= 65) return '#16A34A';
    if (v >= 55) return '#D97706';
    return '#DC2626';
  };

  const completionColor = (v: number) => {
    if (v >= 80) return '#16A34A';
    if (v >= 65) return '#D97706';
    return '#DC2626';
  };

  const timeColor = (v: number) => {
    if (v < 25) return '#DC2626';
    if (v <= 42) return '#16A34A';
    return '#D97706';
  };

  const nonObvColor = (v: number) => {
    if (v > 40) return '#DC2626';
    if (v >= 15) return '#16A34A';
    return '#D97706';
  };

  const overrideColor = (v: number) => {
    if (v > 30) return '#DC2626';
    if (v > 10) return '#D97706';
    return '#16A34A';
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, { bg: string; border: string; color: string }> = {
      'Active': { bg: 'rgba(22,163,74,0.10)', border: 'rgba(22,163,74,0.25)', color: '#16A34A' },
      'Review Needed': { bg: 'rgba(217,119,6,0.10)', border: 'rgba(217,119,6,0.25)', color: '#D97706' },
      'Retiring Soon': { bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.25)', color: '#F97316' },
      'Retired': { bg: 'rgba(220,38,38,0.10)', border: 'rgba(220,38,38,0.25)', color: '#DC2626' },
    };
    const s = styles[status] || styles['Active'];
    return (
      <span style={{
        fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
        background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      }}>
        {status}
      </span>
    );
  };

  const usesColor = (v: number) => {
    if (v >= 50) return 'rgba(255,255,255,1)';
    if (v >= 10) return 'rgba(255,255,255,0.70)';
    return 'rgba(255,255,255,0.40)';
  };

  const pillStyle = (active: boolean) => ({
    fontSize: 12,
    fontWeight: 500 as const,
    padding: '6px 14px',
    borderRadius: 100,
    border: active ? '1px solid rgba(37,99,235,0.40)' : '1px solid rgba(255,255,255,0.10)',
    background: active ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.04)',
    color: active ? '#2563EB' : 'rgba(255,255,255,0.50)',
    cursor: 'pointer' as const,
    transition: 'all 200ms ease',
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Case Performance Analytics</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginTop: 4 }}>
          Real-time difficulty calibration from candidate submissions
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Track filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {TRACKS.map((t) => (
            <button key={t} onClick={() => setTrackFilter(t)} style={pillStyle(trackFilter === t)}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.10)' }} />

        {/* Difficulty filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {DIFFICULTIES.map((d) => (
            <button key={d} onClick={() => setDifficultyFilter(d)} style={pillStyle(difficultyFilter === d)}>
              {d}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.10)' }} />

        {/* Date range */}
        <div style={{ display: 'flex', gap: 4 }}>
          {DATE_RANGES.map((dr) => (
            <button key={dr.days} onClick={() => setDateRange(dr.days)} style={pillStyle(dateRange === dr.days)}>
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 1.5fr 0.6fr 0.8fr 0.8fr 0.7fr 0.7fr 0.7fr 100px',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
          fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.40)',
          letterSpacing: 1, textTransform: 'uppercase',
        }}>
          <span>Code</span>
          <span>Case Title</span>
          <span>Uses</span>
          <span>Avg FISS</span>
          <span>Complete %</span>
          <span>Avg Time</span>
          <span>Non-Obv %</span>
          <span>Override %</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ color: 'rgba(255,255,255,0.40)', marginTop: 16, fontSize: 14 }}>Loading analytics...</p>
          </div>
        ) : cases.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14 }}>
              No case data yet. Cases will appear here after candidates submit simulations.
            </p>
          </div>
        ) : (
          cases.map((c) => (
            <div
              key={c.case_code}
              onClick={() => setSelectedCase(c)}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1.5fr 0.6fr 0.8fr 0.8fr 0.7fr 0.7fr 0.7fr 100px',
                padding: '12px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'background 200ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#2563EB', fontWeight: 600 }}>
                {c.case_code}
              </span>
              <span style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.title.length > 28 ? c.title.slice(0, 28) + '…' : c.title}
              </span>
              <span style={{ color: usesColor(c.total_uses) }}>{c.total_uses}</span>
              <span style={{ fontWeight: 600, fontSize: 15, color: fissColor(c.avg_fiss) }}>
                {c.avg_fiss || '—'}
              </span>
              <span style={{ color: completionColor(c.completion_pct) }}>
                {c.completion_pct}%
              </span>
              <span style={{ color: timeColor(c.avg_time) }}>
                {c.avg_time ? `${c.avg_time}m` : '—'}
              </span>
              <span style={{ color: nonObvColor(c.non_obvious_pct) }}>
                {c.non_obvious_pct}%
              </span>
              <span style={{ color: overrideColor(c.override_pct) }}>
                {c.override_pct}%
              </span>
              <span>{statusBadge(c.status)}</span>
            </div>
          ))
        )}
      </div>

      {/* Detail Drawer */}
      <CaseDetailDrawer
        caseData={selectedCase}
        onClose={() => setSelectedCase(null)}
      />
    </div>
  );
}
