'use client';

import React from 'react';

const MOCK_CANDIDATES = [
  { name: 'Priya Sharma', college: 'SRCC, Delhi University', role: 'IB Analyst', score: 74, fr: 21, st: 17, ri: 19, dc: 14, percentile: 'Top 28%', grade: 'Strong' },
  { name: 'Arjun Mehta', college: 'IIM Ahmedabad', role: 'IB Analyst', score: 82, fr: 22, st: 20, ri: 21, dc: 19, percentile: 'Top 12%', grade: 'Elite' },
  { name: 'Sneha Reddy', college: 'NMIMS Mumbai', role: 'PE Analyst', score: 68, fr: 19, st: 18, ri: 17, dc: 14, percentile: 'Top 35%', grade: 'Adequate' },
  { name: 'Rohan Gupta', college: 'ISB Hyderabad', role: 'Big 4 Advisory', score: 71, fr: 18, st: 19, ri: 18, dc: 16, percentile: 'Top 30%', grade: 'Strong' },
  { name: 'Ananya Iyer', college: 'XLRI Jamshedpur', role: 'IB Analyst', score: 59, fr: 16, st: 14, ri: 15, dc: 14, percentile: 'Top 45%', grade: 'Developing' },
  { name: 'Karan Singh', college: 'FMS Delhi', role: 'Corporate Finance', score: 87, fr: 23, st: 22, ri: 21, dc: 21, percentile: 'Top 5%', grade: 'Elite' },
];

const gradeColor = (grade: string) => {
  switch (grade) {
    case 'Elite': return '#16A34A';
    case 'Strong': return '#2563EB';
    case 'Adequate': return '#D97706';
    default: return '#DC2626';
  }
};

export default function EmployerDashboardMockup() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: '28px', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
            Goldman Sachs — IB Summer Analyst 2026
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', margin: 0 }}>
            6 candidates • Simulation window: Apr 15–30, 2026
          </p>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 500, padding: '6px 14px', borderRadius: 100,
          background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.20)',
          color: '#16A34A',
        }}>
          ● Active Campaign
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Avg FISS', value: '73.5', color: '#fff' },
          { label: 'Elite (80+)', value: '2', color: '#16A34A' },
          { label: 'Completion Rate', value: '100%', color: '#2563EB' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, textAlign: 'center', padding: '14px 12px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 22, fontWeight: 600, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Rank', 'Candidate', 'FISS', 'FR', 'ST', 'RI', 'DC', 'Percentile', 'Grade'].map(h => (
                <th key={h} style={{
                  textAlign: h === 'Candidate' ? 'left' : 'center', padding: '10px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.40)', fontWeight: 500, fontSize: 10,
                  letterSpacing: 1,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_CANDIDATES.sort((a, b) => b.score - a.score).map((c, i) => (
              <tr key={c.name} style={{
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}>
                <td style={{ textAlign: 'center', padding: '10px 8px', color: 'rgba(255,255,255,0.30)', fontWeight: 600 }}>
                  {i + 1}
                </td>
                <td style={{ padding: '10px 8px' }}>
                  <div style={{ color: '#fff', fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{c.college}</div>
                </td>
                <td style={{ textAlign: 'center', padding: '10px 8px', color: '#fff', fontWeight: 600, fontSize: 16 }}>
                  {c.score}
                </td>
                {[c.fr, c.st, c.ri, c.dc].map((s, si) => (
                  <td key={si} style={{
                    textAlign: 'center', padding: '10px 8px',
                    color: s >= 20 ? '#16A34A' : s >= 15 ? 'rgba(255,255,255,0.60)' : '#D97706',
                    fontFamily: 'monospace', fontSize: 12,
                  }}>
                    {s}
                  </td>
                ))}
                <td style={{ textAlign: 'center', padding: '10px 8px', color: '#2563EB', fontSize: 12 }}>
                  {c.percentile}
                </td>
                <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                    color: gradeColor(c.grade),
                    background: `${gradeColor(c.grade)}15`,
                  }}>
                    {c.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 16, textAlign: 'center' }}>
        Click any candidate to view their full FISS report, simulation transcript, and integrity metrics.
      </p>
    </div>
  );
}
