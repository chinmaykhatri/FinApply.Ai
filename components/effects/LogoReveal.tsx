'use client';
import React, { useState, useEffect } from 'react';
import FinApplyLogo from '@/components/ui/FinApplyLogo';

export default function LogoReveal({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'mark' | 'text' | 'fadeout'>('mark');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 400);
    const t2 = setTimeout(() => setPhase('fadeout'), 1200);
    const t3 = setTimeout(() => onComplete(), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Click to skip
  const handleSkip = () => onComplete();

  return (
    <div
      onClick={handleSkip}
      style={{
        cursor: 'pointer',
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 20,
        animation: phase === 'fadeout' ? 'logoRevealFade 0.8s ease forwards' : undefined,
      }}
    >
      {/* Radial glow background */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
          opacity: phase === 'mark' ? 0 : 1,
          transition: 'opacity 0.8s ease',
        }}
      />

      {/* Logo mark — spins in */}
      <div
        style={{
          animation: 'logoRevealMark 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          position: 'relative',
        }}
      >
        <svg
          width={80}
          height={80}
          viewBox="0 0 48 48"
          fill="none"
          style={{ filter: 'drop-shadow(0 0 24px rgba(201, 169, 110, 0.40))' }}
        >
          <rect x="2" y="2" width="44" height="44" rx="12" fill="none" stroke="url(#rGrad)" strokeWidth="2" />
          <rect x="14" y="12" width="3.5" height="24" rx="1.75" fill="url(#rGrad)" />
          <rect x="14" y="12" width="20" height="3.5" rx="1.75" fill="url(#rGrad)" />
          <rect x="14" y="22" width="14" height="3.5" rx="1.75" fill="url(#rGrad)" />
          <defs>
            <linearGradient id="rGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#C9A96E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text — slides + letter spacing collapses */}
      <div
        style={{
          opacity: phase === 'mark' ? 0 : 1,
          animation: phase !== 'mark' ? 'logoRevealText 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' : undefined,
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          FinApply
          <span style={{ color: '#C9A96E' }}>.ai</span>
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.40)',
          letterSpacing: 4,
          textTransform: 'uppercase',
          opacity: phase === 'mark' ? 0 : 1,
          transition: 'opacity 0.6s ease 0.3s',
        }}
      >
        Prove How You Think
      </p>
    </div>
  );
}
