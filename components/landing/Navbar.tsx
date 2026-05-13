'use client';
import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import PillButton from '@/components/ui/PillButton';
import FinApplyLogo from '@/components/ui/FinApplyLogo';


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const scrollToApply = () => {
    if (pathname !== '/') {
      window.location.href = '/#apply';
      return;
    }
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Check if user has registered before
    if (typeof window !== 'undefined') {
      const registered = localStorage.getItem('finapply_registered');
      setIsRegistered(registered === 'true');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLanding = pathname === '/';

  // Section links for the landing page
  const sectionLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Deal Room', href: '#deal-room' },
    { label: 'FISS Score', href: '#fiss-score' },
    { label: 'For Employers', href: '#for-employers' },
  ];

  // Page links (shown on all pages)
  const pageLinks = [
    { label: 'About', href: '/about' },
    { label: 'Founders', href: '/founders' },
  ];

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
          {/* Section links — only on landing page */}
          {isLanding && sectionLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
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
              {link.label}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}

          {/* Page links — always visible */}
          {pageLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <a
                key={link.label}
                href={link.href}
                className={isActive ? 'nav-link-active' : ''}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.70)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'opacity 200ms, color 200ms',
                  position: 'relative',
                  paddingBottom: isActive ? 2 : 0,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.70)'; }}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Right — CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isRegistered && (
          <PillButton variant="outline" href="/dashboard">
            Dashboard
          </PillButton>
        )}
        <PillButton variant="secondary" onClick={scrollToApply}>
          {isRegistered ? 'New Application' : 'Get Started'}
        </PillButton>
      </div>

      {/* Styles */}
      <style jsx>{`
        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #2563EB;
          border-radius: 1px;
        }
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
