'use client';
import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PillButton from '@/components/ui/PillButton';

const STEPS = [
  { label: 'Registered', icon: '✓', done: true },
  { label: 'Deal Room Ready', icon: '🏦', done: true },
  { label: 'Complete Simulation', icon: '📊', done: false, active: true },
  { label: 'FISS Report Delivered', icon: '🎯', done: false },
];

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Candidate';
  const role = searchParams.get('role') || 'Finance Professional';
  const email = searchParams.get('email') || '';
  const dealToken = searchParams.get('deal_token') || '';
  const reportToken = searchParams.get('report_token') || '';
  const [showCheck, setShowCheck] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const confettiRef = useRef<HTMLCanvasElement>(null);

  // Save email for dashboard auto-lookup on return visits
  useEffect(() => {
    if (email) {
      localStorage.setItem('finapply_dashboard_email', email);
    }
  }, [email]);

  useEffect(() => {
    const t1 = setTimeout(() => setShowCheck(true), 300);
    const t2 = setTimeout(() => setShowContent(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Confetti animation
  useEffect(() => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; rotation: number; rotSpeed: number;
      opacity: number;
    }> = [];

    const colors = ['#2563EB', '#16A34A', '#8B5CF6', '#D97706', '#fff'];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        opacity: 1,
      });
    }

    let frame = 0;
    const maxFrames = 180;
    function animate() {
      if (!ctx || !canvas) return;
      frame++;
      if (frame > maxFrames) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, 1 - frame / maxFrames);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      requestAnimationFrame(animate);
    }
    const t = setTimeout(() => animate(), 400);
    return () => clearTimeout(t);
  }, []);

  const firstName = name.split(' ')[0];

  const roleLabels: Record<string, string> = {
    ib_analyst: 'Investment Banking Analyst',
    pe_analyst: 'Private Equity Analyst',
    big4_advisory: 'Big 4 Advisory',
    equity_research: 'Equity Research',
    corporate_finance: 'Corporate Finance',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      {/* Confetti Canvas */}
      <canvas
        ref={confettiRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}
      />

      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 640, margin: '0 auto', padding: '80px 24px 120px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 10,
      }}>
        {/* Animated checkmark */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: showCheck ? 'rgba(22,163,74,0.12)' : 'rgba(255,255,255,0.04)',
          border: `2px solid ${showCheck ? 'rgba(22,163,74,0.40)' : 'rgba(255,255,255,0.08)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 600ms cubic-bezier(0.34,1.56,0.64,1)',
          transform: showCheck ? 'scale(1)' : 'scale(0.6)',
          opacity: showCheck ? 1 : 0,
          marginBottom: 32,
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{
              transition: 'all 400ms ease 300ms',
              opacity: showCheck ? 1 : 0,
              transform: showCheck ? 'scale(1)' : 'scale(0.5)',
            }}
          >
            <path d="M20 6L9 17l-5-5" style={{
              strokeDasharray: 30,
              strokeDashoffset: showCheck ? 0 : 30,
              transition: 'stroke-dashoffset 600ms ease 500ms',
            }} />
          </svg>
        </div>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 600ms ease',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.25)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 20,
          }}>
            <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>✓ REGISTRATION COMPLETE</span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1.3, margin: '0 0 12px' }}>
            Welcome, {firstName}! 🎉
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, margin: 0 }}>
            You&apos;re registered as <strong style={{ color: '#2563EB' }}>{roleLabels[role] || role}</strong>.
            Your Deal Room simulation is ready — jump in now!
          </p>
        </div>

        {/* Quick Access Cards */}
        <div style={{
          width: '100%', marginTop: 40,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 600ms ease 200ms',
        }}>
          {/* Deal Room Card */}
          <a
            href={dealToken ? `/dealroom/${dealToken}` : '/#apply'}
            style={{
              display: 'block', textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.03))',
              border: '1px solid rgba(37,99,235,0.20)',
              borderRadius: 16, padding: 24,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = '1px solid rgba(37,99,235,0.40)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = '1px solid rgba(37,99,235,0.20)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>🏦</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>Deal Room</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.4 }}>
              Start your 90-minute investment simulation
            </p>
            <div style={{
              marginTop: 16, fontSize: 13, fontWeight: 500, color: '#2563EB',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Enter Simulation →
            </div>
          </a>

          {/* Report Preview Card */}
          <a
            href="/report"
            style={{
              display: 'block', textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.03))',
              border: '1px solid rgba(139,92,246,0.20)',
              borderRadius: 16, padding: 24,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = '1px solid rgba(139,92,246,0.40)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = '1px solid rgba(139,92,246,0.20)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>📊</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>FISS Report</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.4 }}>
              Preview a sample FISS Score Report
            </p>
            <div style={{
              marginTop: 16, fontSize: 13, fontWeight: 500, color: '#8B5CF6',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              View Sample →
            </div>
          </a>
        </div>

        {/* Submission details card */}
        <div style={{
          width: '100%', marginTop: 24,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: 28,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 600ms ease 400ms',
        }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 20 }}>
            YOUR DETAILS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Name', value: name },
              { label: 'Target Role', value: roleLabels[role] || role },
              { label: 'Email', value: email || 'On file' },
              { label: 'Registered', value: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              { label: 'Access', value: 'Full Platform · Unlimited' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)' }}>{item.label}</span>
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress tracker */}
        <div style={{
          width: '100%', marginTop: 32,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 600ms ease 600ms',
        }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 20 }}>
            YOUR JOURNEY
          </p>
          <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
            {STEPS.map((step, i) => (
              <div key={step.label} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 16, left: '50%', right: '-50%',
                    height: 2,
                    background: step.done
                      ? 'linear-gradient(90deg, #16A34A, rgba(255,255,255,0.10))'
                      : 'rgba(255,255,255,0.06)',
                  }} />
                )}
                {/* Node */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', margin: '0 auto 8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, position: 'relative', zIndex: 2,
                  background: step.done
                    ? 'rgba(22,163,74,0.15)'
                    : step.active
                      ? 'rgba(37,99,235,0.15)'
                      : 'rgba(255,255,255,0.04)',
                  border: step.done
                    ? '2px solid rgba(22,163,74,0.40)'
                    : step.active
                      ? '2px solid rgba(37,99,235,0.40)'
                      : '2px solid rgba(255,255,255,0.08)',
                  animation: step.active ? 'activePulse 2s ease-in-out infinite' : undefined,
                }}>
                  {step.icon}
                </div>
                <p style={{
                  fontSize: 11, fontWeight: 500, margin: 0,
                  color: step.done ? '#16A34A' : step.active ? '#2563EB' : 'rgba(255,255,255,0.30)',
                }}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center',
          opacity: showContent ? 1 : 0, transition: 'opacity 600ms ease 800ms',
        }}>
          <PillButton variant="primary" href={dealToken ? `/dealroom/${dealToken}` : '/'}>
            Enter Deal Room →
          </PillButton>
          <PillButton variant="outline" href="/dashboard">
            Go to Dashboard
          </PillButton>
          <PillButton
            variant="outline"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://finapply.ai')}&title=${encodeURIComponent(`Just registered on FinApply — the finance simulation platform! 🚀`)}`}
          >
            Share on LinkedIn
          </PillButton>
        </div>

        {/* Referral */}
        <p style={{
          fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 40, textAlign: 'center',
          opacity: showContent ? 1 : 0, transition: 'opacity 600ms ease 1000ms',
        }}>
          Know someone who&apos;d benefit? Share <strong style={{ color: 'rgba(255,255,255,0.40)' }}>finapply.ai</strong> with them.
        </p>
      </div>

      <style jsx>{`
        @keyframes activePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.30); }
          50% { box-shadow: 0 0 0 8px rgba(37,99,235,0); }
        }
        @media (max-width: 640px) {
          h1 { font-size: 24px !important; }
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
