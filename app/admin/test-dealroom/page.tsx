'use client';
import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PillButton from '@/components/ui/PillButton';
import Modal from '@/components/ui/Modal';
import { assignCase } from '@/lib/cases';
import type { DealCase } from '@/lib/cases';

const TOTAL_TIME = 90 * 60;

const GUIDE_TABS = [
  {
    id: 'valuation',
    label: 'Valuation',
    hint: 'Build a DCF or comparable multiples analysis. State your WACC, terminal growth rate, and key assumptions.',
  },
  {
    id: 'risk',
    label: 'Risk Analysis',
    hint: 'Identify the top 3 risks from the case data. For each, explain the probability, potential impact on valuation, and a mitigation strategy.',
  },
  {
    id: 'recommendation',
    label: 'Recommendation',
    hint: 'State your investment decision clearly in the first sentence. Then defend it with 2-3 conditions, each with a measurable threshold.',
  },
  {
    id: 'growth',
    label: 'Growth Assessment',
    hint: 'Evaluate revenue quality — organic vs inorganic growth, customer concentration, pricing power, and sustainability.',
  },
];

export default function AdminTestDealRoomPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    }>
      <AdminTestDealRoom />
    </Suspense>
  );
}

function AdminTestDealRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Investment Banking Analyst';

  const [phase, setPhase] = useState<'loading' | 'unauthorized' | 'instructions' | 'active'>('loading');
  const [activeCase, setActiveCase] = useState<DealCase | null>(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [content, setContent] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);
  const [showChangeCaseModal, setShowChangeCaseModal] = useState(false);
  const [caseChangeUsed, setCaseChangeUsed] = useState(false);
  const [activeTab, setActiveTab] = useState('valuation');
  const startedAt = useRef<string>('');
  const targetRoleRef = useRef<string>(role);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Validate admin access
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch(`/api/admin/test-dealroom?role=${encodeURIComponent(role)}`);
        const json = await res.json();
        if (res.ok && json.data) {
          targetRoleRef.current = json.data.target_role;
          const assigned = assignCase(json.data.target_role);
          setActiveCase(assigned);
          setPhase('instructions');
        } else {
          setPhase('unauthorized');
        }
      } catch {
        setPhase('unauthorized');
      }
    }
    checkAdmin();
  }, [role]);

  // Timer
  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const getTimerColor = () => {
    if (timeLeft <= 300) return '#DC2626';
    if (timeLeft <= 900) return '#D97706';
    return '#fff';
  };

  const handleStart = () => {
    startedAt.current = new Date().toISOString();
    setPhase('active');
    setTimeout(() => textAreaRef.current?.focus(), 100);
  };

  const handleChangeCase = () => {
    const newCase = assignCase(targetRoleRef.current);
    setActiveCase(newCase);
    setContent('');
    setCaseChangeUsed(true);
    setShowChangeCaseModal(false);
  };

  const handleExit = () => {
    setShowExitModal(false);
    router.push('/admin');
  };

  const activeGuide = GUIDE_TABS.find((t) => t.id === activeTab);

  // Loading
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.40)', marginTop: 16, fontSize: 14 }}>
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  // Not found (don't reveal admin pages exist)
  if (phase === 'unauthorized') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🔍</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>Page Not Found</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', marginTop: 16, lineHeight: 1.6 }}>
            The page you are looking for does not exist or has been moved.
          </p>
          <div style={{ marginTop: 32 }}>
            <PillButton variant="primary" href="/">
              Go to Homepage
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  // Instructions
  if (phase === 'instructions') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          {/* Admin badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(217,119,6,0.10)',
              border: '1px solid rgba(217,119,6,0.25)',
              borderRadius: 100,
              padding: '6px 16px',
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 14 }}>🛡️</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#D97706' }}>ADMIN TEST MODE</span>
          </div>

          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 24 }}>
            DEAL ROOM — TEST SIMULATION
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
            Testing: {role}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, marginTop: 16 }}>
            You are previewing the Deal Room as a candidate would see it. A random case from the{' '}
            <strong style={{ color: '#fff' }}>{activeCase?.code?.split('-')[0]}</strong> track has been assigned.
          </p>

          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
              Assigned Case: {activeCase?.code}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)' }}>
              {activeCase?.title} — {activeCase?.difficulty}
            </p>
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <PillButton variant="secondary" href="/admin">
              ← Back to Dashboard
            </PillButton>
            <PillButton variant="primary" large onClick={handleStart}>
              Begin Test Simulation →
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  // Active Deal Room (same layout as real one)
  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky',
          top: 0,
          background: '#000',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>FinApply.ai — Deal Room</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '3px 10px',
              borderRadius: 100,
              background: 'rgba(217,119,6,0.12)',
              border: '1px solid rgba(217,119,6,0.25)',
              color: '#D97706',
            }}
          >
            ADMIN TEST
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '3px 10px',
              borderRadius: 100,
              background: 'rgba(37,99,235,0.12)',
              border: '1px solid rgba(37,99,235,0.25)',
              color: '#2563EB',
            }}
          >
            {activeCase?.code}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            className={timeLeft <= 900 ? 'timer-pulse' : ''}
            style={{
              fontFamily: 'monospace',
              fontSize: 20,
              fontWeight: 600,
              color: getTimerColor(),
              transition: 'color 300ms',
            }}
          >
            {formatTime(timeLeft)}
          </span>
          <button
            onClick={() => setShowExitModal(true)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: 100,
              border: '1px solid rgba(220,38,38,0.30)',
              background: 'rgba(220,38,38,0.08)',
              color: '#DC2626',
              cursor: 'pointer',
            }}
          >
            Exit Test
          </button>
        </div>
      </header>

      {/* Main content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 3fr',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Left — Case Packet */}
        <div
          style={{
            borderRight: '1px solid rgba(255,255,255,0.08)',
            padding: 32,
            overflowY: 'auto',
            height: 'calc(100vh - 57px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3 }}>
              CASE PACKET — {activeCase?.code}
            </p>
            {!caseChangeUsed && (
              <button
                onClick={() => setShowChangeCaseModal(true)}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '4px 12px',
                  borderRadius: 100,
                  border: '1px solid rgba(217,119,6,0.30)',
                  background: 'rgba(217,119,6,0.08)',
                  color: '#D97706',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                🔄 Change Case (1 free)
              </button>
            )}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>{activeCase?.title}</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginTop: 4 }}>{activeCase?.role} • {activeCase?.difficulty}</p>

          {/* Situation */}
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Situation</h3>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {activeCase?.situation}
            </div>
          </div>

          {/* Company Overview */}
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Company Overview</h3>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {activeCase?.company_overview}
            </div>
          </div>

          {/* Financial Data Table */}
          {activeCase?.financials && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Financial Data</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      {activeCase.financials.headers.map((h, i) => (
                        <th
                          key={i}
                          style={{
                            textAlign: i === 0 ? 'left' : 'right',
                            padding: '8px 10px',
                            borderBottom: '1px solid rgba(255,255,255,0.12)',
                            color: 'rgba(255,255,255,0.50)',
                            fontWeight: 500,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeCase.financials.rows.map((row, ri) => (
                      <tr key={ri}>
                        <td style={{ padding: '6px 10px', color: 'rgba(255,255,255,0.70)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 500 }}>
                          {row.label}
                        </td>
                        {row.values.map((v, vi) => (
                          <td key={vi} style={{ textAlign: 'right', padding: '6px 10px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace' }}>
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Market Context */}
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Market Context</h3>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {activeCase?.market_context}
            </div>
          </div>

          {/* Task */}
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Your Task</h3>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {activeCase?.task}
            </div>
          </div>

          {/* Admin-Only Rubric (visible only in test mode) */}
          {activeCase?.admin_only && (
            <div style={{ marginTop: 28, padding: 20, background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#D97706', marginBottom: 12 }}>🛡️ Admin-Only — Evaluation Rubric</h3>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6 }}>
                <p><strong style={{ color: '#16A34A' }}>Strong Response:</strong> {activeCase.admin_only.strong_response}</p>
                <p style={{ marginTop: 8 }}><strong style={{ color: '#DC2626' }}>Critical Gap:</strong> {activeCase.admin_only.critical_gap}</p>
                <p style={{ marginTop: 8 }}><strong style={{ color: '#2563EB' }}>Non-Obvious Signal:</strong> {activeCase.admin_only.non_obvious_signal}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right — Editor */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 32,
            height: 'calc(100vh - 57px)',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 16 }}>
            YOUR ANALYSIS
          </p>

          {/* Section Guide Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {GUIDE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: 100,
                  border: activeTab === tab.id
                    ? '1px solid rgba(37,99,235,0.40)'
                    : '1px solid rgba(255,255,255,0.10)',
                  background: activeTab === tab.id
                    ? 'rgba(37,99,235,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab.id ? '#2563EB' : 'rgba(255,255,255,0.50)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contextual hint */}
          {activeGuide && (
            <div
              style={{
                background: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.12)',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 12,
              }}
            >
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 1.5 }}>
                <span style={{ color: '#2563EB', fontWeight: 600 }}>Tip:</span>{' '}
                {activeGuide.hint}
              </p>
            </div>
          )}

          <textarea
            ref={textAreaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Begin your investment analysis here..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 24,
              fontSize: 14,
              fontFamily: 'var(--font-family)',
              color: '#fff',
              lineHeight: 1.7,
              resize: 'none',
              outline: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 12,
              fontSize: 12,
              color: 'rgba(255,255,255,0.40)',
            }}
          >
            <span>
              {wordCount} words{' '}
              {wordCount < 800 && wordCount > 0 && <span style={{ color: '#D97706' }}>— aim for 800+</span>}
              {wordCount >= 800 && wordCount <= 1500 && <span style={{ color: '#16A34A' }}>— excellent range</span>}
              {wordCount > 1500 && <span style={{ color: '#D97706' }}>— consider being more concise</span>}
            </span>
            <span>Admin Test — No auto-save</span>
          </div>
        </div>
      </div>

      {/* Exit confirmation modal */}
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)}>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
          Exit Test Simulation?
        </h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', lineHeight: 1.5, marginBottom: 24 }}>
          This is a test — nothing will be saved. Return to the admin dashboard.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <PillButton variant="outline" onClick={() => setShowExitModal(false)}>
            Continue Testing
          </PillButton>
          <button
            onClick={handleExit}
            style={{
              fontSize: 14,
              fontWeight: 500,
              padding: '10px 24px',
              borderRadius: 100,
              border: '1px solid rgba(220,38,38,0.40)',
              background: 'rgba(220,38,38,0.15)',
              color: '#DC2626',
              cursor: 'pointer',
            }}
          >
            Exit to Dashboard
          </button>
        </div>
      </Modal>

      {/* Change case modal */}
      <Modal isOpen={showChangeCaseModal} onClose={() => setShowChangeCaseModal(false)}>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
          Change Your Case?
        </h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', lineHeight: 1.5, marginBottom: 8 }}>
          You will receive a new random case from your role track.
          This is your <strong style={{ color: '#D97706' }}>only free change</strong>.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: 24 }}>
          Current: <strong style={{ color: '#fff' }}>{activeCase?.code} — {activeCase?.title}</strong>
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <PillButton variant="outline" onClick={() => setShowChangeCaseModal(false)}>
            Keep Current
          </PillButton>
          <PillButton variant="primary" onClick={handleChangeCase}>
            Get New Case
          </PillButton>
        </div>
      </Modal>

      <style jsx>{`
        .timer-pulse {
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
