'use client';
import React, { useRef, useEffect, useState } from 'react';
import ScoreRing from '@/components/report/ScoreRing';
import DimensionCard from '@/components/ui/DimensionCard';
import PillButton from '@/components/ui/PillButton';
import { SAMPLE_REPORT } from '@/lib/types';

/* 
  Full FISS Report page — open access with rich colors and motion.
  Shows sample data for all visitors to preview.
  Real candidate reports live at /report/[token].
*/
export default function ReportPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const report = SAMPLE_REPORT;
  const [loaded, setLoaded] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [dimsVisible, setDimsVisible] = useState(false);
  const [insightsVisible, setInsightsVisible] = useState(false);
  const dimsRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);

  const candidateName = 'Sample Candidate';
  const candidateCollege = 'Demo Preview';

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 100);
    const t2 = setTimeout(() => setHeaderVisible(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Intersection observers for scroll-triggered animations
  useEffect(() => {
    const observeEl = (el: HTMLElement | null, setter: (v: boolean) => void) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { setter(true); obs.disconnect(); } },
        { threshold: 0.2 }
      );
      obs.observe(el);
      return obs;
    };

    const obs1 = observeEl(dimsRef.current, setDimsVisible);
    const obs2 = observeEl(insightsRef.current, setInsightsVisible);
    return () => { obs1?.disconnect(); obs2?.disconnect(); };
  }, []);

  const handleDownloadPdf = async () => {
    try {
      const { generateFissReportPdf } = await import('@/lib/generatePdf');
      generateFissReportPdf({
        candidateName,
        candidateCollege,
        report,
        filename: 'FISS_Report_Sample.pdf',
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('PDF generation failed. Please try again.');
    }
  };

  // Grade-to-color mapping for dynamic theming
  const gradeColor = (grade: string) => {
    switch (grade) {
      case 'Strong': return { main: '#16A34A', glow: 'rgba(22,163,74,0.20)' };
      case 'Adequate': return { main: '#2563EB', glow: 'rgba(37,99,235,0.20)' };
      case 'Developing': return { main: '#D97706', glow: 'rgba(215,119,6,0.20)' };
      case 'Critical Gap': return { main: '#DC2626', glow: 'rgba(220,38,38,0.20)' };
      default: return { main: '#2563EB', glow: 'rgba(37,99,235,0.20)' };
    }
  };

  // Determine overall grade color from score
  const overallColor = report.total_score >= 80 ? '#16A34A'
    : report.total_score >= 60 ? '#2563EB'
    : report.total_score >= 40 ? '#D97706'
    : '#DC2626';

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: `radial-gradient(circle, ${overallColor}08 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 2s ease',
      }} />

      {/* Animated gradient top bar */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${overallColor}, #8B5CF6, ${overallColor})`,
        backgroundSize: '200% 100%',
        animation: 'shimmerBar 3s linear infinite',
      }} />

      {/* Nav */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 60px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 10,
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 600ms ease',
        }}
      >
        <a href="/" style={{ fontSize: 16, fontWeight: 600, color: '#fff', textDecoration: 'none' }}>FinApply.ai</a>
        <div style={{ display: 'flex', gap: 12 }}>
          <PillButton variant="outline" onClick={handleDownloadPdf}>
            Download PDF
          </PillButton>
          <PillButton
            variant="primary"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://finapply.ai')}`}
          >
            Share on LinkedIn
          </PillButton>
        </div>
      </header>

      {/* Report Content */}
      <div ref={reportRef} style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 120px', position: 'relative', zIndex: 5 }}>
        {/* Header — cinematic entrance */}
        <div style={{
          textAlign: 'center', marginBottom: 60,
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: overallColor,
              letterSpacing: 3,
              marginBottom: 24,
              opacity: headerVisible ? 0.7 : 0,
              transition: 'opacity 600ms ease 200ms',
            }}
          >
            FINANCIAL INTELLIGENCE SIMULATION SCORE
          </p>

          {/* Score Ring with glow */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 24,
            filter: `drop-shadow(0 0 40px ${overallColor}30)`,
          }}>
            <ScoreRing score={report.total_score} />
          </div>

          {/* Percentile with animated badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${overallColor}15`,
            border: `1px solid ${overallColor}30`,
            borderRadius: 100, padding: '6px 16px', marginBottom: 16,
            opacity: headerVisible ? 1 : 0,
            transition: 'opacity 600ms ease 400ms',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: overallColor }}>
              {report.percentile}
            </span>
          </div>

          {/* Candidate */}
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#fff',
              marginTop: 16,
              opacity: headerVisible ? 1 : 0,
              transition: 'opacity 600ms ease 500ms',
            }}
          >
            {candidateName}
          </h1>
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.40)', marginTop: 4,
            opacity: headerVisible ? 1 : 0,
            transition: 'opacity 600ms ease 600ms',
          }}>
            {candidateCollege} · Open Access
          </p>
        </div>

        {/* Animated divider */}
        <div style={{
          height: 1, margin: '40px 0', position: 'relative', overflow: 'hidden',
          background: 'rgba(255,255,255,0.06)',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '-100%',
            width: '50%', height: '100%',
            background: `linear-gradient(90deg, transparent, ${overallColor}40, transparent)`,
            animation: 'sweepLine 3s ease-in-out infinite',
          }} />
        </div>

        {/* Evaluator Summary — with quote styling */}
        <div style={{
          marginBottom: 48,
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 600ms ease 700ms',
        }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.40)',
              letterSpacing: 3,
              marginBottom: 16,
            }}
          >
            EVALUATOR SUMMARY
          </p>
          <div style={{
            position: 'relative',
            padding: '24px 28px',
            background: 'rgba(255,255,255,0.03)',
            borderLeft: `3px solid ${overallColor}`,
            borderRadius: '0 16px 16px 0',
          }}>
            <span style={{
              position: 'absolute', top: 8, left: 20,
              fontSize: 48, color: `${overallColor}30`, fontFamily: 'Georgia, serif', lineHeight: 1,
            }}>&ldquo;</span>
            <p
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: '#fff',
                lineHeight: 1.5,
                fontStyle: 'italic',
                position: 'relative',
              }}
            >
              {report.evaluator_summary}
            </p>
          </div>
        </div>

        {/* Dimensions — scroll-triggered entrance */}
        <div ref={dimsRef}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.40)',
              letterSpacing: 3,
              marginBottom: 20,
              opacity: dimsVisible ? 1 : 0,
              transition: 'opacity 600ms ease',
            }}
          >
            DIMENSION BREAKDOWN
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
            }}
          >
            {[
              { key: 'financial_reasoning', name: 'Financial Reasoning', data: report.financial_reasoning },
              { key: 'structured_thinking', name: 'Structured Thinking', data: report.structured_thinking },
              { key: 'risk_identification', name: 'Risk Identification', data: report.risk_identification },
              { key: 'decision_clarity', name: 'Decision Clarity', data: report.decision_clarity },
            ].map((dim, i) => {
              const colors = gradeColor(dim.data.grade);
              return (
                <div
                  key={dim.key}
                  style={{
                    opacity: dimsVisible ? 1 : 0,
                    transform: dimsVisible ? 'translateY(0)' : 'translateY(25px)',
                    transition: `all 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 150}ms`,
                  }}
                >
                  <DimensionCard
                    name={dim.name}
                    score={dim.data.score}
                    maxScore={25}
                    grade={dim.data.grade}
                    rationale={dim.data.rationale}
                    evidence={dim.data.evidence}
                    improvement={dim.data.improvement}
                    delay={dimsVisible ? 200 + i * 200 : 99999}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights Section — Standout Strength + Critical Gap */}
        <div ref={insightsRef} style={{ marginTop: 48 }}>
          {/* Standout Strength */}
          <div
            style={{
              background: 'rgba(22,163,74,0.06)',
              borderLeft: '3px solid #16A34A',
              borderRadius: '0 16px 16px 0',
              padding: 24,
              position: 'relative',
              overflow: 'hidden',
              opacity: insightsVisible ? 1 : 0,
              transform: insightsVisible ? 'translateX(0)' : 'translateX(-20px)',
              transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Subtle gradient bg */}
            <div style={{
              position: 'absolute', right: 0, top: 0, width: '40%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(22,163,74,0.04))',
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: 'rgba(22,163,74,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
              }}>✦</div>
              <p style={{
                fontSize: 11, fontWeight: 600, color: '#16A34A',
                letterSpacing: 2, margin: 0,
              }}>STANDOUT STRENGTH</p>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6, position: 'relative' }}>
              {report.standout_strength}
            </p>
          </div>

          {/* Critical Gap */}
          <div
            style={{
              marginTop: 16,
              background: 'rgba(215,119,6,0.06)',
              borderLeft: '3px solid #D97706',
              borderRadius: '0 16px 16px 0',
              padding: 24,
              position: 'relative',
              overflow: 'hidden',
              opacity: insightsVisible ? 1 : 0,
              transform: insightsVisible ? 'translateX(0)' : 'translateX(-20px)',
              transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1) 150ms',
            }}
          >
            <div style={{
              position: 'absolute', right: 0, top: 0, width: '40%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(215,119,6,0.04))',
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: 'rgba(215,119,6,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
              }}>⚠</div>
              <p style={{
                fontSize: 11, fontWeight: 600, color: '#D97706',
                letterSpacing: 2, margin: 0,
              }}>CRITICAL GAP</p>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6, position: 'relative' }}>
              {report.critical_gap}
            </p>
          </div>
        </div>

        {/* CTA — Get Your Own Report */}
        <div style={{
          marginTop: 60,
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(139,92,246,0.08))',
          border: '1px solid rgba(37,99,235,0.15)',
          borderRadius: 20, padding: 40, textAlign: 'center',
          opacity: insightsVisible ? 1 : 0,
          transition: 'opacity 600ms ease 300ms',
        }}>
          <p style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            Ready to discover your FISS Score?
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', marginBottom: 24, lineHeight: 1.6 }}>
            Register for free and complete a 45-minute Deal Room simulation to receive your personalized report.
          </p>
          <PillButton variant="primary" href="/#apply">
            Get Started — Free
          </PillButton>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 60,
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 40,
          }}
        >
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>
            This report was generated by FinApply.ai · FISS Score v1.0
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.20)', marginTop: 4 }}>
            Evaluated by human + AI collaboration · Not a guarantee of employment outcomes
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmerBar {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes sweepLine {
          0% { left: -50%; }
          100% { left: 150%; }
        }
        @media (max-width: 768px) {
          header { padding: 16px 24px !important; }
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
