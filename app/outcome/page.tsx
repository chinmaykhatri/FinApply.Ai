'use client';
import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PillButton from '@/components/ui/PillButton';

const OUTCOME_OPTIONS = [
  { value: 'secured_target', label: 'Secured target role', emoji: '🎯' },
  { value: 'secured_other', label: 'Secured a different role', emoji: '💼' },
  { value: 'interview_stage', label: 'In interview rounds', emoji: '📋' },
  { value: 'still_applying', label: 'Still actively applying', emoji: '🔍' },
  { value: 'pivot', label: 'Changed career direction', emoji: '🔄' },
  { value: 'higher_studies', label: 'Pursuing higher studies', emoji: '📚' },
  { value: 'other', label: 'Other', emoji: '💬' },
];

export default function OutcomePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    }>
      <OutcomeForm />
    </Suspense>
  );
}

function OutcomeForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [feedback, setFeedback] = useState('');
  const [finapplyHelpful, setFinapplyHelpful] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome) return;
    setLoading(true);

    try {
      await fetch('/api/outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          outcome,
          company: company || undefined,
          role: role || undefined,
          feedback: feedback || undefined,
          finapply_helpful: finapplyHelpful || undefined,
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🙏</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Thank you for sharing!</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6 }}>
            Your outcome data helps us calibrate FinApply's scoring engine and improve the experience
            for future candidates. We're rooting for you!
          </p>
          <div style={{ marginTop: 32 }}>
            <PillButton variant="secondary" href="/">
              Return to FinApply.ai
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 24 }}>
          FINAPPLY.AI — OUTCOME TRACKING
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: 8 }}>
          How's your journey going?
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, marginBottom: 32 }}>
          This takes 2 minutes. Your response is confidential and helps us improve FinApply for everyone.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Outcome selection */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.60)', marginBottom: 12, display: 'block' }}>
              What best describes your current status?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {OUTCOME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOutcome(opt.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: `1px solid ${outcome === opt.value ? 'rgba(37,99,235,0.50)' : 'rgba(255,255,255,0.08)'}`,
                    background: outcome === opt.value ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.03)',
                    color: outcome === opt.value ? '#fff' : 'rgba(255,255,255,0.60)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 200ms',
                  }}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional: if secured role */}
          {(outcome === 'secured_target' || outcome === 'secured_other') && (
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="form-field"
                style={{ flex: 1 }}
              />
              <input
                placeholder="Role / Title"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-field"
                style={{ flex: 1 }}
              />
            </div>
          )}

          {/* How helpful was FinApply */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.60)', marginBottom: 12, display: 'block' }}>
              How helpful was FinApply in your preparation? (1-5)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFinapplyHelpful(n)}
                  style={{
                    width: 48, height: 48, borderRadius: 12,
                    border: `1px solid ${finapplyHelpful >= n ? 'rgba(37,99,235,0.50)' : 'rgba(255,255,255,0.08)'}`,
                    background: finapplyHelpful >= n ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.03)',
                    color: finapplyHelpful >= n ? '#2563EB' : 'rgba(255,255,255,0.40)',
                    fontSize: 16, fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Open feedback */}
          <textarea
            placeholder="Any additional thoughts or feedback? (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="form-field"
            style={{ minHeight: 80, resize: 'none' }}
          />

          <PillButton type="submit" variant="primary" fullWidth large loading={loading} disabled={!outcome}>
            Submit Update
          </PillButton>
        </form>
      </div>
    </div>
  );
}
