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
  deal_room_token: string;
  report_token: string;
  created_at: string;
  updated_at: string;
  report: { id: string; total_score: number; created_at: string } | null;
  simulation: { id: string; case_code: string; word_count: number; time_taken_seconds: number; submitted_at: string } | null;
}

export default function DashboardPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<AppData[] | null>(null);
  const [error, setError] = useState('');
  const [remembered, setRemembered] = useState(false);

  // Check localStorage for remembered email
  useEffect(() => {
    const saved = localStorage.getItem('finapply_dashboard_email');
    if (saved) {
      setEmail(saved);
      setRemembered(true);
    }
  }, []);

  // Auto-lookup if we have a remembered email
  useEffect(() => {
    if (remembered && email) {
      handleLookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remembered]);

  const handleLookup = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setApplications(null);

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
      } else {
        setError(json.error || 'No applications found');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        {!applications ? (
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

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {/* Show Deal Room button if not yet submitted */}
                      {!hasSim && app.deal_room_token && (
                        <PillButton variant="primary" href={`/dealroom/${app.deal_room_token}`}>
                          Enter Deal Room →
                        </PillButton>
                      )}

                      {/* Show Report button if scored */}
                      {hasReport && app.report_token && (
                        <PillButton variant="primary" href={`/report/${app.report_token}`}>
                          View FISS Report →
                        </PillButton>
                      )}

                      {/* Show pending status if submitted but not scored */}
                      {hasSim && !hasReport && app.status !== 'rejected' && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 16px', borderRadius: 100,
                          background: 'rgba(217,119,6,0.08)',
                          border: '1px solid rgba(217,119,6,0.20)',
                        }}>
                          <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                          <span style={{ fontSize: 13, color: '#D97706', fontWeight: 500 }}>
                            Evaluation in progress — report coming soon
                          </span>
                        </div>
                      )}

                      {/* Already submitted — show re-entry link */}
                      {hasSim && app.deal_room_token && (
                        <PillButton variant="outline" href={`/dealroom/${app.deal_room_token}`}>
                          Review Submission
                        </PillButton>
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
