'use client';
import React, { useState, useEffect } from 'react';
import PillButton from '@/components/ui/PillButton';

const ROLE_LABELS: Record<string, string> = {
  ib_analyst: 'Investment Banking',
  pe_analyst: 'Private Equity',
  big4_advisory: 'Big 4 Advisory',
  equity_research: 'Equity Research',
  corporate_finance: 'Corporate Finance',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  applied: { label: 'Registered', color: '#2563EB', bg: 'rgba(37,99,235,0.10)', border: 'rgba(37,99,235,0.25)' },
  dealroom_sent: { label: 'Deal Room Sent', color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)' },
  submitted: { label: 'Submitted', color: '#D97706', bg: 'rgba(217,119,6,0.10)', border: 'rgba(217,119,6,0.25)' },
  scored: { label: 'Scored', color: '#16A34A', bg: 'rgba(22,163,74,0.10)', border: 'rgba(22,163,74,0.25)' },
  report_sent: { label: 'Report Delivered', color: '#16A34A', bg: 'rgba(22,163,74,0.10)', border: 'rgba(22,163,74,0.25)' },
  rejected: { label: 'Rejected', color: '#DC2626', bg: 'rgba(220,38,38,0.10)', border: 'rgba(220,38,38,0.25)' },
};

interface AppData {
  id: string;
  full_name: string;
  email: string;
  target_role: string;
  status: string;
  has_deal_room: boolean;
  has_report: boolean;
  deal_room_token?: string;
  created_at: string;
  updated_at: string;
  report: {
    id: string; total_score: number; created_at: string;
    financial_reasoning?: { score: number };
    structured_thinking?: { score: number };
    risk_identification?: { score: number };
    decision_clarity?: { score: number };
  } | null;
  simulation: { id: string; case_code: string; word_count: number; time_taken_seconds: number; submitted_at: string } | null;
}

export default function DashboardPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(true);
  const [applications, setApplications] = useState<AppData[] | null>(null);
  const [error, setError] = useState('');
  const [remembered, setRemembered] = useState(false);
  const [showNewSim, setShowNewSim] = useState(false);
  const [newSimRole, setNewSimRole] = useState('ib_analyst');
  const [newSimLoading, setNewSimLoading] = useState(false);
  const [newSimError, setNewSimError] = useState('');

  const handleStartNewSim = async () => {
    setNewSimLoading(true);
    setNewSimError('');
    try {
      const res = await fetch('/api/simulations/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), target_role: newSimRole }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        localStorage.setItem('finapply_deal_token', json.data.deal_room_token);
        localStorage.setItem('finapply_registered', 'true');
        window.location.href = json.data.deal_room_url;
      } else {
        setNewSimError(json.error || 'Failed to create new simulation');
      }
    } catch {
      setNewSimError('Something went wrong. Please try again.');
    } finally {
      setNewSimLoading(false);
    }
  };

  // Check localStorage for remembered email
  useEffect(() => {
    const saved = localStorage.getItem('finapply_dashboard_email');
    if (saved) {
      setEmail(saved);
      setRemembered(true);
    } else {
      setAutoLoading(false);
    }
  }, []);

  // Auto-lookup if we have a remembered email
  useEffect(() => {
    if (remembered && email) {
      handleLookup().finally(() => setAutoLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remembered]);

  const handleLookup = async (silent = false) => {
    if (!email.trim()) {
      if (!silent) setError('Please enter your email address');
      return;
    }

    if (!silent) {
      setLoading(true);
      setError('');
      setApplications(null);
    }

    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const json = await res.json();

      if (res.ok && json.data) {
        setApplications(json.data);
        localStorage.setItem('finapply_dashboard_email', email.trim());
        // Sync deal_room_token to localStorage if available from API
        const activeApp = json.data.find((a: AppData) => a.deal_room_token);
        if (activeApp?.deal_room_token) {
          localStorage.setItem('finapply_deal_token', activeApp.deal_room_token);
        }
      } else if (!silent) {
        setError(json.error || 'No applications found');
      }
    } catch {
      if (!silent) setError('Something went wrong. Please try again.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Auto-poll every 15s when any application is pending evaluation
  // Stops polling once all evaluations are complete
  useEffect(() => {
    const hasPending = applications?.some(
      (app) => app.status === 'submitted' && !app.report
    );

    if (!hasPending || !email.trim()) return;

    const interval = setInterval(() => {
      handleLookup(true); // silent refresh — no loading spinner
    }, 15_000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications, email]);

  const handleLogout = () => {
    localStorage.removeItem('finapply_dashboard_email');
    setApplications(null);
    setEmail('');
    setRemembered(false);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative' }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 700, margin: '0 auto', padding: '80px 24px 120px',
        position: 'relative', zIndex: 10,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 16 }}>
              FINAPPLY.AI
            </p>
          </a>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>
            Your Dashboard
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
            Track your simulation status and access your FISS reports.
          </p>
        </div>

        {/* Email lookup or logged-in state */}
        {autoLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.40)' }}>Loading your profile...</p>
          </div>
        ) : !applications ? (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 40, textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
              Find Your Application
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 28, lineHeight: 1.5 }}>
              Enter the email you registered with to view your status and reports.
            </p>

            <div style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto' }}>
              <input
                id="dashboard-email-input"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="your.email@example.com"
                style={{
                  flex: 1, padding: '12px 18px', fontSize: 14,
                  background: 'rgba(255,255,255,0.06)',
                  border: error ? '1px solid rgba(220,38,38,0.40)' : '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 12, color: '#fff', outline: 'none',
                  fontFamily: 'var(--font-family)',
                  transition: 'border-color 200ms ease',
                }}
              />
              <PillButton variant="primary" onClick={handleLookup} loading={loading}>
                Look Up
              </PillButton>
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#DC2626', marginTop: 16 }}>
                {error}
              </p>
            )}

            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 24 }}>
              Haven&apos;t registered yet? <a href="/#apply" style={{ color: '#2563EB', textDecoration: 'none' }}>Apply now →</a>
            </p>
          </div>
        ) : (
          <>
            {/* Logged-in header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 24, flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#fff',
                }}>
                  {applications[0]?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 }}>
                    {applications[0]?.full_name}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', margin: 0 }}>
                    {email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: 12, fontWeight: 500, padding: '6px 14px',
                  borderRadius: 100, border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.50)',
                  cursor: 'pointer', transition: 'all 200ms ease',
                }}
              >
                Switch Account
              </button>
            </div>

            {/* ═══ PROGRESS CARD ═══ */}
            {(() => {
              const scored = applications.filter(a => a.report);
              if (scored.length < 2) return null;

              // Sort oldest first for sparkline
              const sorted = [...scored].sort((a, b) => new Date(a.report!.created_at).getTime() - new Date(b.report!.created_at).getTime());
              const latest = sorted[sorted.length - 1].report!;
              const prev = sorted[sorted.length - 2].report!;

              const dims = [
                { key: 'FR', label: 'Financial Reasoning', color: '#2563EB',
                  now: latest.financial_reasoning?.score ?? 0, was: prev.financial_reasoning?.score ?? 0 },
                { key: 'IS', label: 'Structured Thinking', color: '#7C3AED',
                  now: latest.structured_thinking?.score ?? 0, was: prev.structured_thinking?.score ?? 0 },
                { key: 'SR', label: 'Risk Awareness', color: '#D97706',
                  now: latest.risk_identification?.score ?? 0, was: prev.risk_identification?.score ?? 0 },
                { key: 'SD', label: 'Decision Clarity', color: '#16A34A',
                  now: latest.decision_clarity?.score ?? 0, was: prev.decision_clarity?.score ?? 0 },
              ];

              const best = dims.reduce((a, b) => (b.now - b.was) > (a.now - a.was) ? b : a);
              const bestDelta = best.now - best.was;

              // Sparkline points
              const scores = sorted.map(a => a.report!.total_score);
              const maxS = Math.max(...scores, 100);
              const minS = Math.min(...scores, 0);
              const range = maxS - minS || 1;
              const svgW = 200;
              const svgH = 48;
              const pts = scores.map((s, i) => {
                const x = scores.length === 1 ? svgW / 2 : (i / (scores.length - 1)) * svgW;
                const y = svgH - ((s - minS) / range) * (svgH - 8) - 4;
                return `${x},${y}`;
              }).join(' ');

              return (
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: 28, marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>📈</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Your Progress</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 'auto' }}>
                      {scored.length} simulations completed
                    </span>
                  </div>

                  {/* Sparkline + total delta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
                    <svg width={svgW} height={svgH} style={{ flex: '0 0 200px' }}>
                      <polyline points={pts} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" />
                      {scores.map((s, i) => {
                        const x = scores.length === 1 ? svgW / 2 : (i / (scores.length - 1)) * svgW;
                        const y = svgH - ((s - minS) / range) * (svgH - 8) - 4;
                        return <circle key={i} cx={x} cy={y} r={3} fill={i === scores.length - 1 ? '#2563EB' : 'rgba(37,99,235,0.40)'} />;
                      })}
                    </svg>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                        {latest.total_score}
                        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.30)', fontWeight: 400 }}>/100</span>
                      </div>
                      {(() => {
                        const d = latest.total_score - prev.total_score;
                        if (d === 0) return <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>No change from previous</span>;
                        return (
                          <span style={{ fontSize: 13, fontWeight: 600, color: d > 0 ? '#16A34A' : '#EF4444' }}>
                            {d > 0 ? '↑' : '↓'} {Math.abs(d)} pts from previous
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Dimension deltas */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {dims.map(d => {
                      const delta = d.now - d.was;
                      return (
                        <div key={d.key} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                          <div style={{
                            width: 4, height: 28, borderRadius: 2, background: d.color, flexShrink: 0,
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginBottom: 2 }}>{d.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                              {d.was} → {d.now}
                              {delta !== 0 && (
                                <span style={{
                                  fontSize: 12, fontWeight: 600, marginLeft: 6,
                                  color: delta > 0 ? '#16A34A' : '#EF4444',
                                }}>
                                  ({delta > 0 ? '+' : ''}{delta})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Best improvement callout */}
                  {bestDelta > 0 && (
                    <div style={{
                      marginTop: 16, padding: '10px 16px', borderRadius: 10,
                      background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ fontSize: 14 }}>🏆</span>
                      <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 500 }}>
                        Strongest growth: {best.label} (+{bestDelta})
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ═══ START NEW DEAL ROOM CTA ═══ */}
            {(() => {
              const hasCompleted = applications.some(a => a.status === 'scored' || a.status === 'report_sent');
              const hasActive = applications.some(a => a.status === 'applied' || a.status === 'dealroom_sent' || a.status === 'submitted');
              if (!hasCompleted || hasActive) return null;

              return (
                <div style={{
                  background: showNewSim ? 'rgba(37,99,235,0.04)' : 'rgba(255,255,255,0.03)',
                  border: showNewSim ? '1px solid rgba(37,99,235,0.20)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: 28, marginBottom: 20,
                  transition: 'all 300ms ease',
                }}>
                  {!showNewSim ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(139,92,246,0.15))',
                          border: '1px solid rgba(37,99,235,0.20)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        }}>🏦</div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>
                            Ready for another challenge?
                          </p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', margin: 0 }}>
                            Try a different role or improve your score
                          </p>
                        </div>
                      </div>
                      <PillButton variant="primary" onClick={() => { setShowNewSim(true); setNewSimError(''); }}>
                        Start New Deal Room →
                      </PillButton>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <span style={{ fontSize: 16 }}>🎯</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Choose Your Target Role</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <button
                            key={value}
                            onClick={() => setNewSimRole(value)}
                            style={{
                              padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                              textAlign: 'left', transition: 'all 200ms ease',
                              background: newSimRole === value ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.03)',
                              border: newSimRole === value ? '1px solid rgba(37,99,235,0.40)' : '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            <p style={{
                              fontSize: 13, fontWeight: 600, margin: '0 0 2px',
                              color: newSimRole === value ? '#2563EB' : '#fff',
                            }}>{label}</p>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                              {value.replace(/_/g, ' ')}
                            </p>
                          </button>
                        ))}
                      </div>
                      {newSimError && (
                        <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{newSimError}</p>
                      )}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <PillButton variant="outline" onClick={() => setShowNewSim(false)}>Cancel</PillButton>
                        <PillButton variant="primary" onClick={handleStartNewSim} loading={newSimLoading}>
                          Enter Deal Room as {ROLE_LABELS[newSimRole]} →
                        </PillButton>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Application cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {applications.map((app) => {
                const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
                const hasReport = !!app.report;
                const hasSim = !!app.simulation;

                return (
                  <div
                    key={app.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 16, padding: 28,
                      transition: 'border-color 200ms ease',
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', margin: 0 }}>
                            {ROLE_LABELS[app.target_role] || app.target_role}
                          </h3>
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100,
                            background: statusCfg.bg, border: `1px solid ${statusCfg.border}`,
                            color: statusCfg.color,
                          }}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                          Registered {formatDate(app.created_at)}
                        </p>
                      </div>

                      {/* FISS Score badge */}
                      {hasReport && (
                        <div style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.20)',
                          borderRadius: 14, padding: '12px 18px', minWidth: 80,
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginBottom: 4 }}>
                            FISS
                          </span>
                          <span style={{ fontSize: 28, fontWeight: 700, color: '#16A34A' }}>
                            {app.report!.total_score}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Simulation info */}
                    {hasSim && (
                      <div style={{
                        display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap',
                        padding: '12px 16px', background: 'rgba(255,255,255,0.02)',
                        borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        {app.simulation!.case_code && (
                          <div>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block' }}>Case</span>
                            <span style={{ fontSize: 13, color: '#fff', fontWeight: 500, fontFamily: 'monospace' }}>{app.simulation!.case_code}</span>
                          </div>
                        )}
                        <div>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block' }}>Words</span>
                          <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{app.simulation!.word_count?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block' }}>Time</span>
                          <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{formatTime(app.simulation!.time_taken_seconds)}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block' }}>Submitted</span>
                          <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{formatDate(app.simulation!.submitted_at)}</span>
                        </div>
                      </div>
                    )}

                    {/* Action buttons — tokens are in localStorage or email, not API */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {/* Show Deal Room button if not yet submitted */}
                      {!hasSim && app.has_deal_room && (() => {
                        // Use token from API response first, then fall back to localStorage
                        const tokenFromApi = app.deal_room_token;
                        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('finapply_deal_token') : null;
                        const dealToken = tokenFromApi || savedToken;
                        if (dealToken) {
                          return (
                            <PillButton variant="primary" href={`/dealroom/${dealToken}`}>
                              Enter Deal Room →
                            </PillButton>
                          );
                        }
                        return (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 16px', borderRadius: 100,
                            background: 'rgba(37,99,235,0.08)',
                            border: '1px solid rgba(37,99,235,0.20)',
                          }}>
                            <span style={{ fontSize: 13, color: '#2563EB', fontWeight: 500 }}>
                              📧 Check your email for the Deal Room link
                            </span>
                          </div>
                        );
                      })()}

                      {/* Show Report button if scored */}
                      {hasReport && app.has_report && (() => {
                        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('finapply_report_token') : null;
                        if (savedToken) {
                          return (
                            <PillButton variant="primary" href={`/report/${savedToken}`}>
                              View FISS Report →
                            </PillButton>
                          );
                        }
                        return (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 16px', borderRadius: 100,
                            background: 'rgba(22,163,74,0.08)',
                            border: '1px solid rgba(22,163,74,0.20)',
                          }}>
                            <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 500 }}>
                              📧 Check your email for the Report link
                            </span>
                          </div>
                        );
                      })()}

                      {/* Show pending status if submitted but not scored */}
                      {hasSim && !hasReport && app.status !== 'rejected' && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 16px', borderRadius: 100,
                          background: app.status === 'eval_failed'
                            ? 'rgba(239,68,68,0.08)'
                            : 'rgba(217,119,6,0.08)',
                          border: app.status === 'eval_failed'
                            ? '1px solid rgba(239,68,68,0.20)'
                            : '1px solid rgba(217,119,6,0.20)',
                        }}>
                          <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                          <span style={{
                            fontSize: 13,
                            color: app.status === 'eval_failed' ? '#EF4444' : '#D97706',
                            fontWeight: 500,
                          }}>
                            {app.status === 'eval_failed'
                              ? 'Evaluation delayed — our team is retrying your report'
                              : 'Evaluation in progress — report coming soon'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer links */}
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <PillButton variant="outline" href="/">
                ← Back to FinApply.ai
              </PillButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
