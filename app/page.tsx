'use client';
import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import FissPreview from '@/components/landing/FissPreview';
import ApplySection from '@/components/landing/ApplySection';
import Footer from '@/components/landing/Footer';
import EmployerSection from '@/components/landing/EmployerSection';
import LogoReveal from '@/components/effects/LogoReveal';
import PillButton from '@/components/ui/PillButton';

// Dynamic imports for heavy effects — no SSR
const FloatingWireframe = dynamic(() => import('@/components/effects/FloatingWireframe'), {
  ssr: false,
  loading: () => <div style={{ height: 420, background: '#000' }} />,
});

const CustomCursor = dynamic(() => import('@/components/effects/CustomCursor'), {
  ssr: false,
});

export default function HomePage() {
  const [showReveal, setShowReveal] = useState(true);
  const [showStickyCta, setShowStickyCta] = useState(false);

  const handleRevealComplete = useCallback(() => {
    setShowReveal(false);
  }, []);

  // Show sticky CTA after scrolling past hero, hide near the apply form
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const applyEl = document.getElementById('apply');
      const applyTop = applyEl ? applyEl.offsetTop - window.innerHeight : Infinity;
      setShowStickyCta(scrollY > 600 && scrollY < applyTop);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToApply = () => {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main>
      {showReveal && <LogoReveal onComplete={handleRevealComplete} />}
      <CustomCursor />
      <Navbar />
      <Hero />
      <HowItWorks />
      <FloatingWireframe />
      <FissPreview />
      <ApplySection />
      <EmployerSection />
      <Footer />

      {/* Sticky CTA — visible mid-page on mobile + desktop */}
      {showStickyCta && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 90,
          animation: 'fadeUp 0.3s ease',
        }}>
          <PillButton variant="primary" onClick={scrollToApply}>
            Get Started Free →
          </PillButton>
        </div>
      )}
    </main>
  );
}

