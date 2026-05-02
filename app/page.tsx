'use client';
import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import FissPreview from '@/components/landing/FissPreview';
import ApplySection from '@/components/landing/ApplySection';
import Footer from '@/components/landing/Footer';
import EmployerSection from '@/components/landing/EmployerSection';
import LogoReveal from '@/components/effects/LogoReveal';

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

  const handleRevealComplete = useCallback(() => {
    setShowReveal(false);
  }, []);

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
    </main>
  );
}
