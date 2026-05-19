'use client';
import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import PillButton from '@/components/ui/PillButton';

/* ─── FISS Dimension Icons ─── */
const FissIcon = ({ type }: { type: 'fr' | 'st' | 'ri' | 'dc' }) => {
  const icons: Record<string, React.ReactNode> = {
    fr: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="20" width="5" height="10" rx="1" />
        <rect x="13" y="14" width="5" height="16" rx="1" />
        <rect x="21" y="8" width="5" height="22" rx="1" />
        <path d="M29 6L31 8L29 10" />
        <path d="M31 8H26" />
      </svg>
    ),
    st: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="6" width="24" height="6" rx="2" />
        <rect x="10" y="15" width="16" height="6" rx="2" />
        <rect x="14" y="24" width="8" height="6" rx="2" />
      </svg>
    ),
    ri: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 4L30 10V20C30 26 24.5 31 18 33C11.5 31 6 26 6 20V10L18 4Z" />
        <path d="M13 18L16.5 21.5L23 15" />
      </svg>
    ),
    dc: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="18" r="13" />
        <circle cx="18" cy="18" r="8" />
        <circle cx="18" cy="18" r="3" />
        <line x1="18" y1="2" x2="18" y2="5" />
        <line x1="18" y1="31" x2="18" y2="34" />
      </svg>
    ),
  };
  return <>{icons[type]}</>;
};

/* ─── Dimension Data ─── */
const DIMENSIONS = [
  {
    type: 'fr' as const,
    label: 'Financial Reasoning — /25',
    title: 'Do the numbers actually drive the recommendation?',
    body: 'Most candidates can calculate a valuation. Fewer can use it as an actual decision input — stating their methodology before their conclusion, choosing the right approach for the company type, and connecting the numbers directly to what they recommend.',
  },
  {
    type: 'st' as const,
    label: 'Structured Thinking — /25',
    title: 'Does the analysis move from data to insight to conclusion?',
    body: 'The difference between a strong analyst and a weak one is often not what they know — it is whether they organise their thinking before they start writing. Structured Thinking measures whether facts, interpretations, and conclusions are cleanly separated or blurred together.',
  },
  {
    type: 'ri' as const,
    label: 'Risk Identification — /25',
    title: 'Are the risks specific or just labels?',
    body: 'Any candidate can write "customer concentration is a risk." A strong analyst explains the mechanism — what happens to revenue if the top customer reduces orders by 20 percent, how that affects the debt covenant, and what specifically to do about it. Mechanism over label. Always.',
  },
  {
    type: 'dc' as const,
    label: 'Decision Clarity — /25',
    title: 'Can they commit to a recommendation under uncertainty?',
    body: 'The most common failure mode in finance interviews is candidates who identify the right risks, build sound analysis, and then hedge their recommendation into meaninglessness. Decision Clarity measures whether you can say proceed or pass — and defend it — even when the data does not give you a perfect answer.',
  },
];

/* ─── Belief Data ─── */
const BELIEFS = [
  {
    num: '01',
    title: 'Capability is not the same as credentials.',
    body: 'A college name tells you where someone studied. It says nothing about how they think when the answer is not obvious. These are different things and the finance industry has confused them for too long.',
  },
  {
    num: '02',
    title: 'The signal must belong to the candidate.',
    body: "Every employer assessment tool built today is proprietary — it exists inside one company's ATS and dies when the application is rejected. A candidate who proves their capability should carry that proof everywhere. Permanently.",
  },
  {
    num: '03',
    title: 'Honest feedback is more valuable than encouragement.',
    body: 'A FISS Score that inflates your performance helps nobody. A score that tells you specifically where you are strong and exactly what to fix — that is what actually changes outcomes.',
  },
];

export default function AboutPage() {
  return (
    <main>
      <Navbar />

      {/* ═══════════════════════════════════════
          SECTION 1 — ORIGIN STORY
          ═══════════════════════════════════════ */}
      <section className="about-section-1">
        {/* Label */}
        <p className="about-label">WHY WE BUILT THIS</p>

        {/* Heading */}
        <h1 className="about-heading-1">
          Finance hiring has a{'\n'}measurement problem.
        </h1>

        {/* Story */}
        <div className="about-story">
          <p>
            A close friend of ours spent four months preparing for an investment banking analyst role. Valuation models. Case frameworks. Mock interviews. He knew the material. He was ready.
          </p>
          <p>
            He walked into the final interview, received a live case, and blanked. Not because he did not know the answer — but because knowing something and performing it under real pressure are two completely different skills. He was rejected.
          </p>

          {/* Pull quote */}
          <blockquote className="about-pullquote">
            The employer never knew the difference. There was no instrument to show them. No score. No signal. No proof. Just a rejection and a friend who was better than his result suggested.
          </blockquote>

          <p>
            That is the problem FinApply exists to solve. Not just for our friend — for every candidate whose capability is invisible because no standardised instrument exists to measure it. And for every employer who makes a wrong hire because they had nothing better than a resume to go on.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — WHAT WE BELIEVE
          ═══════════════════════════════════════ */}
      <section className="about-section-2">
        <p className="about-label">WHAT WE BELIEVE</p>

        <div className="about-beliefs-grid">
          {BELIEFS.map((b) => (
            <div key={b.num} className="about-belief-card">
              <span className="about-belief-num">{b.num}</span>
              <h3 className="about-belief-title">{b.title}</h3>
              <p className="about-belief-body">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — FISS SCORE EXPLAINED
          ═══════════════════════════════════════ */}
      <section className="about-section-3">
        <p className="about-label">THE FISS SCORE EXPLAINED</p>
        <h2 className="about-heading-3">Four dimensions. One honest signal.</h2>

        <div className="about-dimensions">
          {DIMENSIONS.map((d, i) => (
            <div key={d.type} className={`about-dim-row ${i % 2 !== 0 ? 'about-dim-row-reverse' : ''}`}>
              {/* Icon */}
              <div className="about-dim-icon">
                <FissIcon type={d.type} />
              </div>
              {/* Text */}
              <div className="about-dim-text">
                <p className="about-dim-label">{d.label}</p>
                <h3 className="about-dim-title">{d.title}</h3>
                <p className="about-dim-body">{d.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4 — IMPACT VISION
          ═══════════════════════════════════════ */}
      <section className="about-section-4">
        <p className="about-label">THE BIGGER PICTURE</p>

        <h2 className="about-heading-4">
          Merit should beat pedigree.{'\n'}FinApply is how that happens.
        </h2>

        <div className="about-impact-body">
          <p>
            Finance careers — investment banking, private equity, asset management — generate some of the highest salaries available to young professionals in India. Access to these careers is almost entirely mediated by which college you attended.
          </p>
          <p>
            A brilliant analyst at a Tier-3 college in Jaipur competes against a mediocre analyst at an IIM and loses — not because of capability, but because no instrument exists to prove the difference.
          </p>
          <p className="about-impact-strong">
            FinApply builds that instrument. Every FISS Score earned is proof that capability exists independent of where you studied. Over time, as employers learn to trust the signal, the hiring decision shifts from where did you study to how do you think.
          </p>
        </div>

        <div style={{ marginTop: 32 }}>
          <PillButton variant="secondary" href="/#apply">
            Apply for Your FISS Score
          </PillButton>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 — CTA
          ═══════════════════════════════════════ */}
      <section className="about-section-cta">
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <p className="about-label">TAKE THE NEXT STEP</p>

          <h2 className="about-heading-cta">
            Ready to prove yourself?
          </h2>

          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8,
            margin: '24px auto 40px', maxWidth: 520,
          }}>
            One simulation. Four dimensions. A verified FISS Score that speaks for your analytical ability — to every employer, on every application.
          </p>

          {/* Stats row */}
          <div className="about-cta-stats">
            {[
              { value: '45', unit: 'min', label: 'Timed simulation' },
              { value: '4', unit: '', label: 'Analytical dimensions' },
              { value: '1', unit: '', label: 'Verified score' },
            ].map((s) => (
              <div key={s.label} className="about-cta-stat">
                <span className="about-cta-stat-value">{s.value}<span className="about-cta-stat-unit">{s.unit}</span></span>
                <span className="about-cta-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            <PillButton variant="primary" large href="/#apply">
              Get Your FISS Score — Free →
            </PillButton>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
            No cost. No waitlist. Results in hours.
          </p>
        </div>
      </section>

      <Footer />

      {/* ═══════════════════════════════════════
          STYLES
          ═══════════════════════════════════════ */}
      <style jsx>{`
        /* ─── Shared ─── */
        .about-label {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.30);
          letter-spacing: 3px;
          text-align: center;
          margin: 0 0 24px;
        }

        /* ─── Section 1: Origin Story ─── */
        .about-section-1 {
          background: #000;
          padding: 160px 120px 120px;
          text-align: center;
        }
        .about-heading-1 {
          font-size: 48px;
          font-weight: 500;
          line-height: 1.15;
          max-width: 580px;
          margin: 0 auto;
          white-space: pre-line;
          background: linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .about-story {
          max-width: 640px;
          margin: 40px auto 0;
          text-align: left;
        }
        .about-story p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.70);
          line-height: 1.9;
          margin: 0 0 24px;
        }
        .about-pullquote {
          background: rgba(255, 255, 255, 0.04);
          border-left: 3px solid #2563EB;
          border-radius: 0 12px 12px 0;
          padding: 24px 28px;
          margin: 8px 0 24px;
          font-size: 18px;
          color: rgba(255, 255, 255, 0.80);
          font-style: italic;
          line-height: 1.7;
        }

        /* ─── Section 2: What We Believe ─── */
        .about-section-2 {
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 80px 120px;
        }
        .about-beliefs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .about-belief-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 32px 28px;
          text-align: left;
          transition: border-color 300ms ease, transform 300ms ease;
        }
        .about-belief-card:hover {
          border-color: rgba(37, 99, 235, 0.25);
          transform: translateY(-2px);
        }
        .about-belief-num {
          font-size: 40px;
          font-weight: 600;
          color: rgba(37, 99, 235, 0.30);
          font-family: monospace;
          display: block;
        }
        .about-belief-title {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          line-height: 1.3;
          margin: 16px 0 0;
        }
        .about-belief-body {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.7;
          margin: 12px 0 0;
        }

        /* ─── Section 3: FISS Score ─── */
        .about-section-3 {
          background: #000;
          padding: 100px 120px;
        }
        .about-heading-3 {
          font-size: 40px;
          font-weight: 500;
          line-height: 1.2;
          max-width: 480px;
          margin: 0 auto 56px;
          text-align: center;
          background: linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .about-dimensions {
          max-width: 780px;
          margin: 0 auto;
        }
        .about-dim-row {
          display: flex;
          align-items: center;
          gap: 48px;
          margin-bottom: 56px;
        }
        .about-dim-row-reverse {
          flex-direction: row-reverse;
        }
        .about-dim-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: rgba(37, 99, 235, 0.10);
          border: 1px solid rgba(37, 99, 235, 0.20);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .about-dim-label {
          font-size: 12px;
          font-weight: 500;
          color: #2563EB;
          letter-spacing: 2px;
          margin: 0 0 8px;
        }
        .about-dim-title {
          font-size: 22px;
          font-weight: 600;
          color: #fff;
          line-height: 1.3;
          margin: 0;
        }
        .about-dim-body {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.7;
          margin: 12px 0 0;
        }

        /* ─── Section 4: Impact ─── */
        .about-section-4 {
          background: rgba(37, 99, 235, 0.04);
          border-top: 1px solid rgba(37, 99, 235, 0.12);
          border-bottom: 1px solid rgba(37, 99, 235, 0.12);
          padding: 80px 120px;
          text-align: center;
        }
        .about-heading-4 {
          font-size: 36px;
          font-weight: 500;
          line-height: 1.25;
          white-space: pre-line;
          max-width: 580px;
          margin: 0 auto;
          background: linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .about-impact-body {
          max-width: 680px;
          margin: 24px auto 0;
          text-align: center;
        }
        .about-impact-body p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.60);
          line-height: 1.8;
          margin: 0 0 20px;
        }
        .about-impact-strong {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.80) !important;
        }

        /* ─── Section 5: CTA ─── */
        .about-section-cta {
          background: #000;
          border-top: 1px solid rgba(37, 99, 235, 0.08);
          padding: 100px 120px;
          position: relative;
          overflow: hidden;
        }
        .about-heading-cta {
          font-size: 44px;
          font-weight: 600;
          line-height: 1.15;
          max-width: 480px;
          margin: 0 auto;
          background: linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .about-cta-stats {
          display: flex;
          justify-content: center;
          gap: 48px;
        }
        .about-cta-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .about-cta-stat-value {
          font-size: 40px;
          font-weight: 700;
          color: #fff;
          font-family: monospace;
          line-height: 1;
        }
        .about-cta-stat-unit {
          font-size: 18px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.40);
          margin-left: 2px;
        }
        .about-cta-stat-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.5px;
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .about-section-1 { padding: 140px 60px 80px; }
          .about-section-2 { padding: 60px 60px; }
          .about-section-3 { padding: 80px 60px; }
          .about-section-4 { padding: 60px 60px; }
          .about-section-cta { padding: 80px 60px; }
        }
        @media (max-width: 768px) {
          .about-section-1 { padding: 120px 40px 60px; }
          .about-heading-1 { font-size: 32px; }
          .about-section-2 { padding: 48px 40px; }
          .about-beliefs-grid {
            grid-template-columns: 1fr;
          }
          .about-section-3 { padding: 60px 40px; }
          .about-heading-3 { font-size: 28px; margin-bottom: 40px; }
          .about-dim-row,
          .about-dim-row-reverse {
            flex-direction: column;
            gap: 24px;
            text-align: center;
          }
          .about-dim-row { margin-bottom: 40px; }
          .about-section-4 { padding: 48px 40px; }
          .about-heading-4 { font-size: 26px; }
          .about-pullquote { font-size: 16px; padding: 20px 22px; }
          .about-section-cta { padding: 60px 40px; }
          .about-heading-cta { font-size: 32px; }
          .about-cta-stats { gap: 24px; }
          .about-cta-stat-value { font-size: 32px; }
        }
      `}</style>
    </main>
  );
}
