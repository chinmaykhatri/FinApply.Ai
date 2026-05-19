'use client';
import React, { useState } from 'react';
import PillButton from '@/components/ui/PillButton';
import { trackEvent, EVENTS } from '@/lib/analytics';

export default function EmployerSection() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !company) return;
    setLoading(true);
    try {
      await fetch('/api/employer-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company }),
      });
      trackEvent(EVENTS.EMPLOYER_WAITLIST, { company });
      setSubmitted(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="employers"
      style={{
        padding: '120px 120px',
        background: '#000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background accents */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.30), transparent)',
      }} />
      <div style={{
        position: 'absolute', top: '20%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '-5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Label */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 24,
        }}>
          <span style={{ fontSize: 12, color: '#8B5CF6', fontWeight: 600, letterSpacing: 1 }}>
            FOR EMPLOYERS
          </span>
        </div>

        <h2 style={{ fontSize: 40, fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 16px' }}>
          Stop guessing.{' '}
          <span style={{ color: '#8B5CF6' }}>Start seeing.</span>
        </h2>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 640, margin: '0 0 56px' }}>
          Every candidate in the FinApply pool has been evaluated through a real investment
          simulation — timed, proctored, and scored across four analytical dimensions.
          You see how they think, not what they claim.
        </p>

        {/* Comparison Table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 48,
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ padding: '16px 24px' }} />
            <div style={{
              padding: '16px 24px', textAlign: 'center',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>
                TRADITIONAL
              </span>
            </div>
            <div style={{ padding: '16px 24px', textAlign: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6', letterSpacing: 1 }}>
                FINAPPLY
              </span>
            </div>
          </div>

          {/* Comparison rows */}
          {[
            { label: 'Screening method', old: 'Resume keywords', new: 'Live case simulation' },
            { label: 'Signal quality', old: 'Self-reported skills', new: 'Verified FISS Score' },
            { label: 'Assessment time', old: '2-3 interview rounds', new: '45 minutes, one session' },
            { label: 'Analytical proof', old: 'None until case round', new: 'Score breakdown + evidence' },
            { label: 'Candidate pool', old: 'Keyword-filtered', new: 'Pre-scored by role track' },
            { label: 'Integrity checks', old: 'None', new: 'Behavioural monitoring' },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'background 200ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.03)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ padding: '14px 24px' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.70)' }}>{row.label}</span>
              </div>
              <div style={{
                padding: '14px 24px', textAlign: 'center',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{row.old}</span>
              </div>
              <div style={{ padding: '14px 24px', textAlign: 'center' }}>
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{row.new}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Value props */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            {
              icon: '📊',
              title: 'Verified Scores',
              desc: 'Every candidate evaluated on real case performance — not self-reported skills or keyword-stuffed resumes.',
            },
            {
              icon: '🏦',
              title: 'Role-Track Sorted',
              desc: 'Candidates scored on IB, PE, Big 4, Corporate Finance, and Equity Research tracks. See who fits your role.',
            },
            {
              icon: '⚡',
              title: 'Skip the Guesswork',
              desc: 'See analytical ability before the first interview. Reduce screening rounds by 50% or more.',
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: 24,
                transition: 'all 300ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)';
                e.currentTarget.style.background = 'rgba(139,92,246,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
            >
              <span style={{ fontSize: 24, display: 'block', marginBottom: 12 }}>{item.icon}</span>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>{item.title}</h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Waitlist form */}
        {submitted ? (
          <div style={{
            background: 'rgba(22,163,74,0.08)',
            border: '1px solid rgba(22,163,74,0.20)',
            borderRadius: 16, padding: 40, textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>
              You&apos;re on the list
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', margin: 0 }}>
              We&apos;ll reach out as soon as employer access opens for early partners.
            </p>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(37,99,235,0.04) 100%)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 20, padding: 40,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#8B5CF6', boxShadow: '0 0 8px rgba(139,92,246,0.50)',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6', letterSpacing: 1 }}>
                EARLY ACCESS
              </span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>
              Join the employer waitlist
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 24px', maxWidth: 480 }}>
              Be first to access scored candidate profiles and skip the resume pile. Free during the founding period.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                style={{
                  flex: 1, minWidth: 160,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, padding: '12px 16px',
                  color: '#fff', fontSize: 14, outline: 'none',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.40)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
              <input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex: 1, minWidth: 200,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, padding: '12px 16px',
                  color: '#fff', fontSize: 14, outline: 'none',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.40)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
              <PillButton variant="primary" type="submit" loading={loading}>
                Get Early Access →
              </PillButton>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section { padding: 60px 24px !important; }
          h2 { font-size: 28px !important; }
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 1fr 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          form { flex-direction: column !important; }
        }
        @media (max-width: 1024px) {
          section { padding: 80px 40px !important; }
        }
      `}</style>
    </section>
  );
}
