'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import FinApplyLogo from '@/components/ui/FinApplyLogo';

interface VerifyData {
  verified: boolean;
  candidate_name: string;
  target_role: string;
  total_score: number;
  percentile: string;
  simulation_date: string;
  verification_timestamp: string;
  platform: string;
}

export default function VerifyPage() {
  const params = useParams();
  const shareId = params.id as string;
  const [data, setData] = useState<VerifyData | null>(null);
  const [phase, setPhase] = useState<'loading' | 'verified' | 'not_found'>('loading');
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/verify/${shareId}`);
        const json = await res.json();
        if (res.ok && json.verified) {
          setData(json);
          setPhase('verified');
        } else {
          setPhase('not_found');
        }
      } catch {
        setPhase('not_found');
      }
    }
    if (shareId) verify();
  }, [shareId]);

  // Animate ring
  useEffect(() => {
    if (phase !== 'verified' || !ringRef.current || !data) return;
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (data.total_score / 100) * circumference;
    ringRef.current.style.strokeDasharray = `${circumference}`;
    ringRef.current.style.strokeDashoffset = `${circumference}`;
    setTimeout(() => {
      if (ringRef.current) {
        ringRef.current.style.transition = 'stroke-dashoffset 1.2s ease-out';
        ringRef.current.style.strokeDashoffset = `${offset}`;
      }
    }, 300);
  }, [phase, data]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      });
    } catch { return ''; }
  };

  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.40)', marginTop: 16, fontSize: 14 }}>Verifying score...</p>
        </div>
      </div>
    );
  }

  if (phase === 'not_found') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          {/* Red X badge */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
            background: 'rgba(220,38,38,0.10)', border: '2px solid rgba(220,38,38,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18" /><path d="M6 6l12 12" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>
            Verification Failed
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, margin: '0 0 32px' }}>
            This FISS Score could not be verified. The share link may be invalid, expired, or the score has not been published yet.
          </p>
          <Link href="/" style={{
            display: 'inline-block', background: '#2563EB', color: '#fff',
            borderRadius: 100, padding: '10px 24px', fontSize: 14, fontWeight: 500,
            textDecoration: 'none',
          }}>
            Go to FinApply.ai
          </Link>
        </div>
      </div>
    );
  }

  // ── Verified ──
  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', maxWidth: 600, margin: '0 auto',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <FinApplyLogo size="sm" />
        </Link>
        <span style={{
          fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 100,
          background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.20)',
          color: '#16A34A',
        }}>
          Employer Verification
        </span>
      </nav>

      <main style={{ maxWidth: 520, margin: '0 auto', padding: '60px 24px' }}>
        {/* Verification Badge */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {/* Green check */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: 'rgba(22,163,74,0.10)', border: '2px solid rgba(22,163,74,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'scaleIn 0.5s ease',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#16A34A', marginBottom: 4 }}>
            FISS Score Verified
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
            Verified at {formatDate(data!.verification_timestamp)} • {data!.platform}
          </p>
        </div>

        {/* Score Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '32px 28px', marginBottom: 24,
        }}>
          {/* Name */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
              {data!.candidate_name}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', margin: 0 }}>
              {data!.target_role}
            </p>
          </div>

          {/* Score Ring */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: 'block', margin: '0 auto' }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle
                ref={ringRef}
                cx="60" cy="60" r="52"
                fill="none" stroke="#16A34A" strokeWidth="6" strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="58" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="600" fontFamily="inherit">
                {data!.total_score}
              </text>
              <text x="60" y="76" textAnchor="middle" fill="rgba(255,255,255,0.30)" fontSize="12" fontFamily="inherit">
                /100
              </text>
            </svg>
          </div>

          {/* Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                Percentile
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#2563EB', margin: 0 }}>{data!.percentile}</p>
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                Simulation Date
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', margin: 0 }}>{formatDate(data!.simulation_date)}</p>
            </div>
          </div>
        </div>

        {/* View Full Report CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link href={`/score/${shareId}`} style={{
            display: 'inline-block', background: 'rgba(37,99,235,0.10)',
            border: '1px solid rgba(37,99,235,0.25)', borderRadius: 100,
            padding: '10px 24px', fontSize: 13, fontWeight: 500,
            color: '#2563EB', textDecoration: 'none',
          }}>
            View Full Score Breakdown →
          </Link>
        </div>

        {/* API endpoint info */}
        <div style={{
          marginTop: 40, padding: '16px 20px', borderRadius: 12,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            API VERIFICATION
          </p>
          <code style={{
            display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.50)', fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 6,
            wordBreak: 'break-all',
          }}>
            GET https://finapply.ai/api/verify/{shareId}
          </code>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', marginTop: 8 }}>
            Returns JSON verification data. No authentication required.
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 40, paddingBottom: 40 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            This verification was performed by FinApply.ai — the finance candidate capability assessment platform.
          </p>
        </div>
      </main>

      <style jsx>{`
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
