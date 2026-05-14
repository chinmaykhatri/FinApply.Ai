'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PillButton from '@/components/ui/PillButton';
import anime from 'animejs';


const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4';

export default function Hero() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsRegistered(localStorage.getItem('finapply_registered') === 'true');
    }
  }, []);

  const handleCTA = () => {
    if (isRegistered) {
      router.push('/dashboard');
    } else {
      document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cinematic entrance timeline
  useEffect(() => {
    const tl = anime.timeline({
      easing: 'cubicBezier(0.16, 1, 0.3, 1)',
    });

    tl.add({
      targets: '.hero-badge',
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 700,
    })
      .add({
        targets: '.hero-word',
        translateY: [60, 0],
        opacity: [0, 1],
        duration: 800,
        delay: anime.stagger(80),
      }, '-=400')
      .add({
        targets: '.hero-subtitle',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 700,
      }, '-=500')
      .add({
        targets: '.hero-cta',
        scale: [0.85, 1],
        opacity: [0, 1],
        duration: 600,
      }, '-=400');
  }, []);



  // Split headline into word spans
  const headline = 'Prove How You Think. Not Just What You Know.';
  const words = headline.split(' ');

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Cinematic vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.70) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: 280,
          paddingBottom: 102,
          gap: 24,
          maxWidth: 720,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Badge pill */}
        <div
          className="hero-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.20)',
            borderRadius: 20,
            padding: '8px 16px',
            opacity: 0,
            animation: 'floatY 4s ease-in-out infinite',
            animationDelay: '2s',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#16A34A',
              flexShrink: 0,
              boxShadow: '0 0 8px rgba(22,163,74,0.60)',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.60)' }}>
            Now Open —
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>
            Free for Everyone
          </span>
        </div>

        {/* Heading — word-by-word stagger */}
        <h1
          style={{
            fontSize: 56,
            fontWeight: 500,
            lineHeight: 1.28,
            maxWidth: 613,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0 10px',
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              className="hero-word"
              style={{
                opacity: 0,
                display: 'inline-block',
                background: 'linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          className="hero-subtitle"
          style={{
            fontSize: 15,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.70)',
            maxWidth: 680,
            lineHeight: 1.6,
            opacity: 0,
          }}
        >
          FinApply gives finance candidates a verified capability score based on real deal
          simulations — not resumes. One 45-minute simulation. One honest signal. Built for
          employers to trust it.
        </p>

        {/* CTA */}
        <div className="hero-cta" style={{ opacity: 0 }}>
          <PillButton variant="primary" onClick={handleCTA}>
            {isRegistered ? 'Go to Dashboard' : 'Get Started Free'}
          </PillButton>
        </div>

        {/* Stats Bar — static values */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: 680,
            marginTop: 56,
          }}
        >
          <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.15)', padding: '0 16px' }}>
            <p style={{ fontSize: 32, fontWeight: 600, color: '#fff' }}>45</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.60)', marginTop: 4 }}>min Deal Room simulation</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.15)', padding: '0 16px' }}>
            <p style={{ fontSize: 32, fontWeight: 600, color: '#fff' }}>4</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.60)', marginTop: 4 }}>Capability dimensions scored</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '0 16px' }}>
            <p style={{ fontSize: 24, fontWeight: 600, color: '#fff' }}>in minutes</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.60)', marginTop: 4 }}>Get your FISS Report</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section > div:nth-child(3) {
            padding-top: 200px !important;
          }
          h1 {
            font-size: 36px !important;
          }
        }
      `}</style>
    </section>
  );
}
