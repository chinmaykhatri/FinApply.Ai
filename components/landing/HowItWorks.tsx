'use client';
import React, { useEffect, useRef, useState } from 'react';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import StepCard from '@/components/ui/StepCard';
import anime from 'animejs';

const STEPS = [
  {
    step: 'Step 01',
    title: 'Complete the Deal Room',
    description:
      'Receive a real company case packet. Analyze the financials, build a valuation, identify risks, and write your investment recommendation. 90 minutes. No multiple choice. No shortcuts.',
  },
  {
    step: 'Step 02',
    title: 'Receive Your FISS Score',
    description:
      'Within 48 hours you receive a detailed FISS Score Report — your capability score across four dimensions with specific strengths, gaps, and improvement actions. Human-reviewed.',
  },
  {
    step: 'Step 03',
    title: 'Share With Employers',
    description:
      'Your FISS Score is yours. Share it on LinkedIn, send it directly to employers, or include it in applications. A verified signal that says more than your resume ever could.',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !revealed) {
          setRevealed(true);
          obs.disconnect();

          // Animate heading
          anime({
            targets: '.hiw-heading',
            scale: [0.92, 1],
            opacity: [0, 1],
            duration: 700,
            easing: 'cubicBezier(0.16, 1, 0.3, 1)',
          });

          // Animate cards with stagger
          anime({
            targets: '.hiw-card',
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 800,
            delay: anime.stagger(150, { start: 200 }),
            easing: 'cubicBezier(0.16, 1, 0.3, 1)',
          });

          // Animate connecting line
          if (lineRef.current) {
            const length = lineRef.current.getTotalLength();
            lineRef.current.style.strokeDasharray = `${length}`;
            lineRef.current.style.strokeDashoffset = `${length}`;
            anime({
              targets: lineRef.current,
              strokeDashoffset: [length, 0],
              duration: 1500,
              delay: 400,
              easing: 'easeOutCubic',
            });
          }
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [revealed]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      style={{
        background: '#000',
        padding: '120px 120px',
      }}
    >
      <SectionLabel>HOW IT WORKS</SectionLabel>

      <div className="hiw-heading" style={{ marginTop: 24, opacity: 0 }}>
        <SectionHeading maxWidth={480}>
          Three steps to a verified capability signal
        </SectionHeading>
      </div>

      {/* Cards with connecting line */}
      <div style={{ position: 'relative', marginTop: 80 }}>
        {/* SVG connecting line (desktop only) */}
        <svg
          className="desktop-only"
          style={{
            position: 'absolute',
            top: '50%',
            left: '5%',
            width: '90%',
            height: 2,
            overflow: 'visible',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <path
            ref={lineRef}
            d="M0,0 L1000,0"
            stroke="rgba(37,99,235,0.30)"
            strokeWidth="2"
            strokeDasharray="8 6"
            fill="none"
          />
        </svg>

        <div
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={s.step}
              className="hiw-card"
              style={{ opacity: 0, flex: '1 1 280px' }}
            >
              <StepCard {...s} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section {
            padding: 60px 24px !important;
          }
        }
        @media (max-width: 1024px) {
          section {
            padding: 80px 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
