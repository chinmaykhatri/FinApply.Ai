'use client';
import React, { useEffect, useRef, useState } from 'react';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import PillButton from '@/components/ui/PillButton';
import anime from 'animejs';

export default function FissPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const scoreRef = useRef<HTMLSpanElement>(null);

  const dimensions = [
    { name: 'Financial Reasoning', score: 19, total: 25, width: 76, grade: 'Adequate', gradeColor: '#D97706', gradeBg: 'rgba(215,119,6,0.15)', gradeBorder: 'rgba(215,119,6,0.30)' },
    { name: 'Structured Thinking', score: 21, total: 25, width: 84, grade: 'Strong', gradeColor: '#16A34A', gradeBg: 'rgba(22,163,74,0.15)', gradeBorder: 'rgba(22,163,74,0.30)' },
    { name: 'Risk Identification', score: 16, total: 25, width: 64, grade: 'Adequate', gradeColor: '#D97706', gradeBg: 'rgba(215,119,6,0.15)', gradeBorder: 'rgba(215,119,6,0.30)' },
    { name: 'Decision Clarity', score: 18, total: 25, width: 72, grade: 'Adequate', gradeColor: '#D97706', gradeBg: 'rgba(215,119,6,0.15)', gradeBorder: 'rgba(215,119,6,0.30)' },
  ];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !revealed) {
          setRevealed(true);
          obs.disconnect();

          // Count up the score
          const scoreObj = { v: 0 };
          anime({
            targets: scoreObj,
            v: 74,
            round: 1,
            duration: 2000,
            easing: 'easeOutExpo',
            update: () => {
              if (scoreRef.current) scoreRef.current.textContent = `${scoreObj.v}`;
            },
          });

          // Animate progress bars
          anime({
            targets: '.fiss-bar',
            width: (el: HTMLElement) => el.getAttribute('data-width') || '0%',
            duration: 1000,
            delay: anime.stagger(120, { start: 400 }),
            easing: 'easeOutCubic',
          });

          // Animate grade badges
          anime({
            targets: '.fiss-grade',
            scale: [0, 1],
            opacity: [0, 1],
            duration: 400,
            delay: anime.stagger(120, { start: 800 }),
            easing: 'easeOutBack',
          });

          // Animate standout block
          anime({
            targets: '.fiss-standout',
            translateX: [-30, 0],
            opacity: [0, 1],
            duration: 700,
            delay: 1200,
            easing: 'cubicBezier(0.16, 1, 0.3, 1)',
          });

          // Card entrance
          anime({
            targets: '.fiss-card',
            translateY: [40, 0],
            opacity: [0, 1],
            duration: 800,
            easing: 'cubicBezier(0.16, 1, 0.3, 1)',
          });
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [revealed]);

  return (
    <section id="fiss-score" ref={sectionRef} style={{ background: '#000', padding: '120px 120px' }}>
      <SectionLabel>THE FISS SCORE</SectionLabel>
      <div style={{ marginTop: 24 }}>
        <SectionHeading maxWidth={480}>Four dimensions. One honest signal.</SectionHeading>
      </div>

      {/* Mock FISS Report Card */}
      <div
        className="fiss-card"
        style={{
          maxWidth: 600,
          margin: '60px auto 0',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 20,
          padding: 40,
          opacity: 0,
          backdropFilter: 'blur(8px)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(37,99,235,0.30)';
          e.currentTarget.style.boxShadow = '0 0 40px rgba(37,99,235,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3 }}>
            FISS SCORE
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>
            Founding Cohort — Batch 1
          </span>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'center', margin: '28px 0' }}>
          <span ref={scoreRef} style={{ fontSize: 72, fontWeight: 600, color: '#fff' }}>0</span>
          <span style={{ fontSize: 32, color: 'rgba(255,255,255,0.40)' }}>/100</span>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', marginTop: 4 }}>
            Top 28th Percentile — IB Analyst Cohort
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '24px 0' }} />

        {/* Dimension rows */}
        {dimensions.map((d, i) => (
          <div key={i} style={{ marginBottom: i < 3 ? 20 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{d.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>
                  {d.score}/{d.total}
                </span>
                <span
                  className="fiss-grade"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: d.gradeColor,
                    background: d.gradeBg,
                    border: `1px solid ${d.gradeBorder}`,
                    borderRadius: 100,
                    padding: '2px 8px',
                    opacity: 0,
                    transform: 'scale(0)',
                  }}
                >
                  {d.grade}
                </span>
              </div>
            </div>
            <div className="progress-track">
              <div
                className="fiss-bar progress-fill"
                data-width={`${d.width}%`}
                style={{ width: '0%', transition: 'none' }}
              />
            </div>
          </div>
        ))}

        {/* Standout strength */}
        <div
          className="fiss-standout"
          style={{
            background: 'rgba(22,163,74,0.08)',
            borderLeft: '3px solid #16A34A',
            borderRadius: '0 8px 8px 0',
            padding: 16,
            marginTop: 24,
            opacity: 0,
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 500, color: '#16A34A', letterSpacing: 2, marginBottom: 6 }}>
            STANDOUT STRENGTH
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', lineHeight: 1.5 }}>
            You identified non-obvious customer concentration risk that surface readers miss — the rarest analyst signal.
          </p>
        </div>

        {/* Download button */}
        <div style={{ marginTop: 24 }}>
          <PillButton variant="primary" fullWidth href="/sample-report">
            Download Sample Report
          </PillButton>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section { padding: 60px 24px !important; }
        }
        @media (max-width: 1024px) {
          section { padding: 80px 40px !important; }
        }
      `}</style>
    </section>
  );
}
