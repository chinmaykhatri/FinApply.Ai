'use client';
import React from 'react';
import FinApplyLogo from '@/components/ui/FinApplyLogo';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#000',
        padding: '40px 120px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        position: 'relative',
      }}
    >
      {/* Gradient glow divider */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.40), transparent)',
        }}
      />

      <FinApplyLogo size="sm" />
      <a
        href="mailto:chinmay.finapply.ai@gmail.com"
        style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)' }}
      >
        chinmay.finapply.ai@gmail.com
      </a>
      <a
        href="/privacy"
        style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)' }}
      >
        Privacy Policy
      </a>

      <style jsx>{`
        @media (max-width: 768px) {
          footer {
            padding: 24px !important;
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
