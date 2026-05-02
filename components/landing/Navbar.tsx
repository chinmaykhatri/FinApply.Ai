'use client';
import React, { useEffect, useState, useRef } from 'react';
import PillButton from '@/components/ui/PillButton';
import FinApplyLogo from '@/components/ui/FinApplyLogo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const scrollToApply = () => {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={scrolled ? 'glass' : ''}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scrolled ? '14px 120px' : '20px 120px',
        background: scrolled ? undefined : 'transparent',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Left — Logo + Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <FinApplyLogo size="sm" />
        </a>

        <div className="desktop-only" style={{ gap: 30, alignItems: 'center' }}>
          {['How It Works', 'Deal Room', 'FISS Score', 'For Employers'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, '-')}`}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'opacity 200ms',
                position: 'relative',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {link}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}
        </div>
      </div>

      {/* Right — CTA */}
      <PillButton variant="secondary" onClick={scrollToApply}>
        Get Started
      </PillButton>

      {/* Mobile nav styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          nav {
            padding: 16px 24px !important;
          }
        }
        @media (max-width: 1024px) {
          nav {
            padding: 20px 40px !important;
          }
        }
      `}</style>
    </nav>
  );
}
