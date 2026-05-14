import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import PillButton from '@/components/ui/PillButton';

export const metadata: Metadata = {
  title: 'Founder — Chinmay Khatri | FinApply.ai',
  description:
    'Chinmay Khatri is the founder of FinApply.ai — building the first standardised capability measurement instrument for finance hiring in India.',
};

/* ─── Shared Style Constants ─── */
const GRADIENT_TEXT = {
  background: 'linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as React.CSSProperties;

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: 'rgba(255,255,255,0.30)',
  letterSpacing: 3,
  textTransform: 'uppercase' as const,
  marginBottom: 24,
  textAlign: 'center',
};

/* ─── Tech Stack Data ─── */
const TECH_STACK = [
  { label: 'Frontend', value: 'Next.js · TypeScript · React' },
  { label: 'AI Engine', value: 'Gemini 2.5 Pro · Custom prompts' },
  { label: 'Auth & DB', value: 'Supabase (Auth + PostgreSQL)' },
  { label: 'Deployment', value: 'Vercel Edge · CI/CD' },
  { label: 'Monitoring', value: 'Behavioral integrity detection' },
  { label: 'Comms', value: 'Resend transactional email' },
];

/* ─── Conviction Data ─── */
const CONVICTIONS = [
  {
    num: '01',
    title: 'Pedigree is a proxy. FinApply replaces proxies with proof.',
    body: 'Every year, thousands of capable analysts are filtered out because they attended the wrong college. The FISS Score gives them a way to prove what a resume never could — how they actually think under pressure.',
  },
  {
    num: '02',
    title: 'I built this because I understand the problem from the inside.',
    body: 'I grew up in Jaipur, surrounded by students who were brilliant but invisible to the finance industry. The system never gave them a chance to demonstrate capability. FinApply is the instrument I wished existed.',
  },
  {
    num: '03',
    title: 'A 19-year-old building a hiring platform is the point, not the exception.',
    body: 'If FinApply\'s thesis is that capability matters more than credentials, then the founder\'s age is irrelevant. What matters is whether the product works. It does.',
  },
];

/* ─── LinkedIn Icon ─── */
const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

/* ─── Mail Icon ─── */
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

/* ─── Arrow Icon ─── */
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

export default function FoundersPage() {
  return (
    <main>
      <Navbar />

      {/* ═══════════════════════════════════════
          SECTION 1 — HERO
          ═══════════════════════════════════════ */}
      <section className="founders-hero">
        {/* Background glow */}
        <div className="founders-hero-glow" />

        <div className="founders-hero-inner">
          <p style={SECTION_LABEL}>THE FOUNDER</p>

          <h1 className="founders-hero-heading" style={GRADIENT_TEXT}>
            Built by someone who{'\n'}understood the problem firsthand.
          </h1>

          <p className="founders-hero-sub">
            FinApply was not built inside a corporate innovation lab. It was built by a 19-year-old in Jaipur who watched the finance industry reject capable people for the wrong reasons — and decided to build the measurement instrument it was missing.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — FOUNDER CARD
          ═══════════════════════════════════════ */}
      <section className="founders-card-section">
        <div className="founders-card">
          {/* Avatar placeholder with initials */}
          <div className="founders-avatar">
            <span className="founders-avatar-initials">CK</span>
          </div>

          {/* Info */}
          <div className="founders-card-info">
            <h2 className="founders-name">Chinmay Khatri</h2>
            <p className="founders-role">Founder — FinApply.ai</p>
            <p className="founders-details">
              Jaipur, India &nbsp;·&nbsp; B.Tech Artificial Intelligence &amp; Data Science
            </p>

            {/* Social pills */}
            <div className="founders-pills">
              <a
                href="https://www.linkedin.com/in/chinmay-khatri-04ba0a307"
                target="_blank"
                rel="noopener noreferrer"
                className="founders-pill"
              >
                <LinkedInIcon />
                <span>LinkedIn</span>
                <ArrowIcon />
              </a>
              <a
                href="mailto:chinmaykhatri495@gmail.com"
                className="founders-pill"
              >
                <MailIcon />
                <span>chinmaykhatri495@gmail.com</span>
                <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — THE STORY
          ═══════════════════════════════════════ */}
      <section className="founders-story-section">
        <p style={SECTION_LABEL}>THE ORIGIN</p>
        <h2 className="founders-story-heading" style={GRADIENT_TEXT}>
          Why I built FinApply.
        </h2>

        <div className="founders-story-body">
          <p>
            I am a 19-year-old engineering student in Jaipur, pursuing B.Tech in Artificial Intelligence and Data Science. I am not from IIM. I am not from ISB. I did not intern at Goldman Sachs. And that is exactly the point.
          </p>
          <p>
            Growing up in Jaipur, I watched friends who were genuinely brilliant at financial analysis get filtered out of every opportunity — not because they lacked capability, but because they lacked the right college name on their resume.
          </p>

          <blockquote className="founders-pullquote">
            The finance industry in India does not have a measurement problem because it lacks talent. It has a measurement problem because it refuses to measure talent directly. It measures pedigree instead — and calls it a shortcut.
          </blockquote>

          <p>
            I built FinApply because I believe that if you give someone a real case, a real clock, and a real analytical task — their response tells you more about their capability than four years of college credentials ever could.
          </p>
          <p>
            The FISS Score is that instrument. One 45-minute simulation. Four dimensions of evaluation. One honest, portable, verifiable signal that belongs to the candidate — not the employer.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4 — WHAT I BUILT
          ═══════════════════════════════════════ */}
      <section className="founders-tech-section">
        <p style={SECTION_LABEL}>WHAT I BUILT</p>
        <h2 className="founders-tech-heading" style={GRADIENT_TEXT}>
          Solo-built. Full stack.{'\n'}Production-grade.
        </h2>

        <p className="founders-tech-sub">
          FinApply is not a prototype. It is a production system — designed, engineered, and deployed by a single founder. Every component was built with the same standard expected from a funded engineering team.
        </p>

        <div className="founders-tech-grid">
          {TECH_STACK.map((item, i) => (
            <div key={i} className="founders-tech-card">
              <span className="founders-tech-label">{item.label}</span>
              <span className="founders-tech-value">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 — CONVICTIONS
          ═══════════════════════════════════════ */}
      <section className="founders-convictions-section">
        <p style={SECTION_LABEL}>CONVICTIONS</p>

        <div className="founders-convictions-grid">
          {CONVICTIONS.map((c) => (
            <div key={c.num} className="founders-conviction-card">
              <span className="founders-conviction-num">{c.num}</span>
              <h3 className="founders-conviction-title">{c.title}</h3>
              <p className="founders-conviction-body">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 6 — CTA
          ═══════════════════════════════════════ */}
      <section className="founders-cta-section">
        <h2 className="founders-cta-heading" style={GRADIENT_TEXT}>
          The product speaks for itself.{'\n'}Try it.
        </h2>
        <p className="founders-cta-sub">
          Free for founding cohort candidates. One simulation. One honest signal.
        </p>
        <PillButton variant="secondary" href="/#apply">
          Apply for Your FISS Score
        </PillButton>
      </section>

      <Footer />

      {/* ═══════════════════════════════════════
          STYLES
          ═══════════════════════════════════════ */}
      <style>{`
        /* ─── Hero ─── */
        .founders-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 120px;
          text-align: center;
          position: relative;
          background: #000;
        }
        .founders-hero-glow {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .founders-hero-inner {
          position: relative;
          z-index: 10;
          max-width: 700px;
        }
        .founders-hero-heading {
          font-size: 52px;
          font-weight: 500;
          max-width: 640px;
          margin: 0 auto 20px;
          line-height: 1.15;
          white-space: pre-line;
        }
        .founders-hero-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.60);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.8;
        }

        /* ─── Founder Card ─── */
        .founders-card-section {
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 80px 120px;
          display: flex;
          justify-content: center;
        }
        .founders-card {
          display: flex;
          align-items: center;
          gap: 40px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 40px 48px;
          max-width: 740px;
          width: 100%;
          transition: border-color 300ms ease;
        }
        .founders-card:hover {
          border-color: rgba(37,99,235,0.25);
        }
        .founders-avatar {
          width: 100px;
          height: 100px;
          min-width: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(37,99,235,0.20), rgba(37,99,235,0.08));
          border: 2px solid rgba(37,99,235,0.30);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .founders-avatar-initials {
          font-size: 32px;
          font-weight: 600;
          color: #2563EB;
          letter-spacing: 2px;
        }
        .founders-card-info {
          flex: 1;
          min-width: 0;
        }
        .founders-name {
          font-size: 28px;
          font-weight: 600;
          color: #fff;
          margin: 0;
          line-height: 1.2;
        }
        .founders-role {
          font-size: 15px;
          color: #2563EB;
          font-weight: 500;
          margin: 6px 0 0;
        }
        .founders-details {
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          margin: 8px 0 0;
        }
        .founders-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }
        .founders-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(37,99,235,0.10);
          border: 1px solid rgba(37,99,235,0.20);
          border-radius: 100px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 500;
          color: #2563EB;
          text-decoration: none;
          transition: background 200ms ease, border-color 200ms ease;
        }
        .founders-pill:hover {
          background: rgba(37,99,235,0.18);
          border-color: rgba(37,99,235,0.35);
        }

        /* ─── Story ─── */
        .founders-story-section {
          background: #000;
          padding: 100px 120px;
          text-align: center;
        }
        .founders-story-heading {
          font-size: 40px;
          font-weight: 500;
          line-height: 1.2;
          max-width: 480px;
          margin: 0 auto 48px;
        }
        .founders-story-body {
          max-width: 640px;
          margin: 0 auto;
          text-align: left;
        }
        .founders-story-body p {
          font-size: 16px;
          color: rgba(255,255,255,0.70);
          line-height: 1.9;
          margin: 0 0 24px;
        }
        .founders-pullquote {
          background: rgba(255,255,255,0.04);
          border-left: 3px solid #2563EB;
          border-radius: 0 12px 12px 0;
          padding: 24px 28px;
          margin: 8px 0 24px;
          font-size: 18px;
          color: rgba(255,255,255,0.80);
          font-style: italic;
          line-height: 1.7;
        }

        /* ─── Tech Stack ─── */
        .founders-tech-section {
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 80px 120px;
          text-align: center;
        }
        .founders-tech-heading {
          font-size: 40px;
          font-weight: 500;
          line-height: 1.2;
          max-width: 480px;
          margin: 0 auto 16px;
          white-space: pre-line;
        }
        .founders-tech-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.55);
          max-width: 600px;
          margin: 0 auto 48px;
          line-height: 1.8;
        }
        .founders-tech-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          max-width: 800px;
          margin: 0 auto;
        }
        .founders-tech-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 20px 24px;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color 300ms ease, transform 300ms ease;
        }
        .founders-tech-card:hover {
          border-color: rgba(37,99,235,0.25);
          transform: translateY(-2px);
        }
        .founders-tech-label {
          font-size: 11px;
          font-weight: 600;
          color: #2563EB;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .founders-tech-value {
          font-size: 14px;
          color: rgba(255,255,255,0.70);
          line-height: 1.5;
        }

        /* ─── Convictions ─── */
        .founders-convictions-section {
          background: #000;
          padding: 80px 120px;
          text-align: center;
        }
        .founders-convictions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .founders-conviction-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 32px 28px;
          text-align: left;
          transition: border-color 300ms ease, transform 300ms ease;
        }
        .founders-conviction-card:hover {
          border-color: rgba(37,99,235,0.25);
          transform: translateY(-2px);
        }
        .founders-conviction-num {
          font-size: 40px;
          font-weight: 600;
          color: rgba(37,99,235,0.30);
          font-family: monospace;
          display: block;
        }
        .founders-conviction-title {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          line-height: 1.3;
          margin: 16px 0 0;
        }
        .founders-conviction-body {
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          margin: 12px 0 0;
        }

        /* ─── CTA ─── */
        .founders-cta-section {
          background: rgba(37,99,235,0.04);
          border-top: 1px solid rgba(37,99,235,0.12);
          padding: 80px 120px;
          text-align: center;
        }
        .founders-cta-heading {
          font-size: 40px;
          font-weight: 500;
          line-height: 1.25;
          white-space: pre-line;
          max-width: 580px;
          margin: 0 auto 16px;
        }
        .founders-cta-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.55);
          margin: 0 0 32px;
        }

        /* ═══════ RESPONSIVE ═══════ */
        @media (max-width: 1024px) {
          .founders-hero { padding: 140px 60px 80px; }
          .founders-card-section { padding: 60px; }
          .founders-story-section { padding: 80px 60px; }
          .founders-tech-section { padding: 60px; }
          .founders-convictions-section { padding: 60px; }
          .founders-cta-section { padding: 60px; }
        }

        @media (max-width: 768px) {
          .founders-hero { padding: 120px 40px 60px; }
          .founders-hero-heading { font-size: 32px !important; }
          .founders-hero-sub { font-size: 15px !important; }

          .founders-card-section { padding: 48px 24px; }
          .founders-card {
            flex-direction: column;
            text-align: center;
            padding: 32px 24px;
            gap: 24px;
          }
          .founders-pills { justify-content: center; }
          .founders-name { font-size: 24px; }

          .founders-story-section { padding: 60px 40px; }
          .founders-story-heading { font-size: 28px !important; margin-bottom: 32px; }
          .founders-pullquote { font-size: 16px; padding: 20px 22px; }

          .founders-tech-section { padding: 48px 24px; }
          .founders-tech-heading { font-size: 28px !important; }
          .founders-tech-grid { grid-template-columns: 1fr 1fr; }

          .founders-convictions-section { padding: 48px 24px; }
          .founders-convictions-grid { grid-template-columns: 1fr; }

          .founders-cta-section { padding: 48px 40px; }
          .founders-cta-heading { font-size: 28px !important; }
        }

        @media (max-width: 480px) {
          .founders-hero { padding: 100px 24px 48px; }
          .founders-hero-heading { font-size: 28px !important; }
          .founders-tech-grid { grid-template-columns: 1fr; }
          .founders-pill span:last-of-type { display: none; }
          .founders-cta-section { padding: 40px 24px; }
        }
      `}</style>
    </main>
  );
}
