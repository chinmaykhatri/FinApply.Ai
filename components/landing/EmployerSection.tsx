'use client';
import React, { useState } from 'react';
import PillButton from '@/components/ui/PillButton';

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
        padding: '100px 120px',
        background: '#000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.30), transparent)',
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '-5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 2 }}>
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

        <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 16px' }}>
          Recruit candidates with{' '}
          <span style={{ color: '#8B5CF6' }}>verified analytical skills</span>
        </h2>

        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.50)', lineHeight: 1.7, maxWidth: 600, margin: '0 0 40px' }}>
          Access a curated pool of finance candidates who've been evaluated through real investment
          simulations — not keyword-stuffed résumés. Every candidate comes with a FISS Score breakdown
          across 4 analytical dimensions.
        </p>

        {/* Value props */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            {
              icon: '📊',
              title: 'Verified Scores',
              desc: 'Every candidate evaluated on real case performance, not self-reported skills.',
            },
            {
              icon: '🏦',
              title: 'Role-Matched',
              desc: 'Candidates pre-sorted by IB, PE, Big 4, Corporate Finance, and Equity Research tracks.',
            },
            {
              icon: '⚡',
              title: 'Faster Hiring',
              desc: 'Skip initial screening rounds. See analytical ability before the interview.',
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
            borderRadius: 16, padding: 32, textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>You're on the list</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', margin: 0 }}>
              We'll reach out as soon as employer access opens for early partners.
            </p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 32,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>
              Join the employer waitlist
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', margin: '0 0 24px' }}>
              Be first to access scored candidate profiles when we launch employer partnerships.
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
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 10, padding: '12px 16px',
                  color: '#fff', fontSize: 14, outline: 'none',
                }}
              />
              <input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex: 1, minWidth: 200,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 10, padding: '12px 16px',
                  color: '#fff', fontSize: 14, outline: 'none',
                }}
              />
              <PillButton variant="primary" type="submit" loading={loading}>
                Join Waitlist →
              </PillButton>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section { padding: 60px 24px !important; }
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          form { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
}
