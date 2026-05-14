'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import PillButton from '@/components/ui/PillButton';
import FinApplyLogo from '@/components/ui/FinApplyLogo';


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const scrollToApply = () => {
    setMobileOpen(false);
    if (pathname !== '/') {
      window.location.href = '/#apply';
      return;
    }
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLinkClick = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isLanding = pathname === '/';

  const sectionLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'For Employers', href: '#for-employers' },
  ];

  const pageLinks = [
    { label: 'Deal Room', href: '/dealroom-explained' },
    { label: 'FISS Score', href: '/fiss-score' },
    { label: 'About', href: '/about' },
    { label: 'Founders', href: '/founders' },
  ];

  return (
    <>
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

        {/* Right — CTA + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isRegistered && (
            <PillButton variant="outline" href="/dashboard">
              Dashboard
            </PillButton>
          )}
          <div className="desktop-only">
            <PillButton variant="secondary" onClick={scrollToApply}>
              {isRegistered ? 'New Application' : 'Get Started'}
            </PillButton>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="mobile-only hamburger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 10,
              cursor: 'pointer',
              position: 'relative',
              zIndex: 110,
            }}
          >
            <div className={`hamburger-lines ${mobileOpen ? 'hamburger-open' : ''}`}>
              <span />
              <span />
              <span />
            </div>
          </button>
        </div>
      </nav>

      {/* ═══ Mobile Drawer ═══ */}
      {mobileOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="mobile-menu-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nav links */}
            <div className="mobile-menu-links">
              {isLanding && sectionLinks.map((link) => (
                <a key={link.label} href={link.href} className="mobile-menu-link" onClick={handleLinkClick}>
                  {link.label}
                </a>
              ))}

              {pageLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`mobile-menu-link ${isActive ? 'mobile-menu-link-active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    {link.label}
                    {isActive && <span className="mobile-active-dot" />}
                  </a>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <PillButton variant="primary" onClick={scrollToApply} fullWidth>
                {isRegistered ? 'New Application' : 'Get Started Free'}
              </PillButton>
              {isRegistered && (
                <div style={{ marginTop: 12 }}>
                  <PillButton variant="outline" href="/dashboard" fullWidth>
                    Dashboard
                  </PillButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

        /* ─── Hamburger Icon ─── */
        .hamburger-lines {
          width: 20px;
          height: 14px;
          position: relative;
        }
        .hamburger-lines span {
          display: block;
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hamburger-lines span:nth-child(1) { top: 0; }
        .hamburger-lines span:nth-child(2) { top: 6px; }
        .hamburger-lines span:nth-child(3) { top: 12px; }

        .hamburger-open span:nth-child(1) {
          top: 6px;
          transform: rotate(45deg);
        }
        .hamburger-open span:nth-child(2) {
          opacity: 0;
          transform: translateX(-8px);
        }
        .hamburger-open span:nth-child(3) {
          top: 6px;
          transform: rotate(-45deg);
        }

        /* ─── Mobile Drawer ─── */
        .mobile-menu-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99;
          background: rgba(0,0,0,0.60);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease;
        }
        .mobile-menu-drawer {
          position: absolute;
          top: 0;
          right: 0;
          width: min(320px, 85vw);
          height: 100%;
          background: #0A0A0A;
          border-left: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
        }
        .mobile-menu-links {
          display: flex;
          flex-direction: column;
          padding: 80px 32px 24px;
          gap: 4px;
        }
        .mobile-menu-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 500;
          color: rgba(255,255,255,0.70);
          text-decoration: none;
          transition: all 200ms ease;
        }
        .mobile-menu-link:hover,
        .mobile-menu-link-active {
          background: rgba(37,99,235,0.08);
          color: #fff;
        }
        .mobile-active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2563EB;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
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
    </>
  );
}
