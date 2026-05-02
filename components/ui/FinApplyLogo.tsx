'use client';
import React from 'react';

type LogoSize = 'sm' | 'md' | 'lg';

const SIZES: Record<LogoSize, { mark: number; text: number; gap: number }> = {
  sm: { mark: 24, text: 16, gap: 8 },
  md: { mark: 32, text: 20, gap: 10 },
  lg: { mark: 48, text: 28, gap: 12 },
};

export default function FinApplyLogo({ size = 'md' }: { size?: LogoSize }) {
  const s = SIZES[size];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap }}>
      {/* Stylized "F" mark — two slanted bars + vertical stem */}
      <svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 48 48"
        fill="none"
        style={{ animation: 'glowPulse 3s ease-in-out infinite', flexShrink: 0 }}
      >
        {/* Outer rounded square */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill="none" stroke="url(#fGrad)" strokeWidth="2" />
        {/* Vertical stem */}
        <rect x="14" y="12" width="3.5" height="24" rx="1.75" fill="url(#fGrad)" />
        {/* Top horizontal bar */}
        <rect x="14" y="12" width="20" height="3.5" rx="1.75" fill="url(#fGrad)" />
        {/* Middle horizontal bar */}
        <rect x="14" y="22" width="14" height="3.5" rx="1.75" fill="url(#fGrad)" />
        <defs>
          <linearGradient id="fGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#C9A96E" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontSize: s.text,
          fontWeight: 600,
          letterSpacing: '-0.5px',
          color: '#fff',
          lineHeight: 1,
        }}
      >
        FinApply
        <span style={{ color: '#C9A96E' }}>.ai</span>
      </span>
    </div>
  );
}
