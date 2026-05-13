'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PillButton from '@/components/ui/PillButton';
import anime from 'animejs';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4';

export default function Hero() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
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

  // Count-up for stats
  useEffect(() => {
    if (!statsVisible) return;

    const counts = [
      { target: '.stat-num-0', value: 90, suffix: ' min' },
      { target: '.stat-num-1', value: 4, suffix: '' },
      { target: '.stat-num-2', value: 48, suffix: 'h' },
    ];

    counts.forEach(({ target, value, suffix }, i) => {
      const el = document.querySelector(target);
      if (!el) return;
      const obj = { v: 0 };
      anime({
        targets: obj,
        v: value,
        round: 1,
        duration: 1800,
        delay: i * 200,
        easing: 'easeOutExpo',
        update: () => {
          (el as HTMLElement).textContent = `${obj.v}${suffix}`;
        },
      });
    });
  }, [statsVisible]);

  // Observe stats for count-up trigger
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
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
          simulations — not resumes. One 90-minute simulation. One honest signal. Employers
          actually trust it.
        </p>

        {/* CTA */}
        <div className="hero-cta" style={{ opacity: 0 }}>
          <PillButton variant="primary" onClick={handleCTA}>
            {isRegistered ? 'Go to Dashboard' : 'Get Started Free'}
          </PillButton>
        </div>

        {/* Stats Bar — count-up */}
        <div
          ref={statsRef}
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: 680,
            marginTop: 56,
            opacity: statsVisible ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          {[
            { label: 'Deal Room simulation', className: 'stat-num-0', initial: '0 min' },
            { label: 'Capability dimensions scored', className: 'stat-num-1', initial: '0' },
            { label: 'FISS Report delivered', className: 'stat-num-2', initial: '0h' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: 'center',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                padding: '0 16px',
              }}
            >
              <p className={stat.className} style={{ fontSize: 32, fontWeight: 600, color: '#fff' }}>
                {stat.initial}
              </p>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.60)', marginTop: 4 }}>
                {stat.label}
              </p>
            </div>
          ))}
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
