import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import PillButton from '@/components/ui/PillButton';

export const metadata: Metadata = {
  title: 'The Deal Room — FinApply.ai',
  description:
    'A 45-minute timed simulation. A real company, real financials, a real analytical task. No multiple choice. No shortcuts. Just how you think.',
};

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
  marginBottom: 32,
};

const PROSE: React.CSSProperties = {
  fontSize: 16,
  color: 'rgba(255,255,255,0.65)',
  lineHeight: 1.85,
  marginBottom: 16,
};

const HEADING_SM: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 600,
  color: '#fff',
  marginBottom: 16,
};

/* ═══════ STEP DATA ═══════ */
const STEPS = [
  {
    title: 'You apply and receive your Deal Room link',
    body: 'After submitting your details, you receive a unique personal link to your Deal Room by email. The link is yours — it does not activate until you click Begin. Take it when you are ready.',
  },
  {
    title: 'You complete an optional 10-minute warm-up',
    body: 'Before your real simulation begins, you can complete a short practice case to get familiar with the interface and format. It is not scored and takes no data. It exists so your 45 minutes are spent analysing, not adjusting.',
  },
  {
    title: 'The 45-minute timer starts when you click Begin',
    body: 'Your case packet loads on the left side of the screen. Your response area is on the right. The timer counts down from 45:00 at the top of the page. You can see both the case and your response at the same time.',
  },
  {
    title: 'You read the case and plan your analysis',
    body: 'The case packet contains everything you need — company overview, financial statements, market context, and your specific task. Read it fully before writing anything. The strongest responses come from candidates who spend the first 10 minutes reading and structuring, not immediately writing.',
  },
  {
    title: 'You write your analysis directly in the response area',
    body: 'No external tools. No Excel. No template. Just your thinking, written directly into the response field. Your work is auto-saved every 30 seconds. If your connection drops, your progress is recovered when you return.',
  },
  {
    title: 'You submit when ready or when time expires',
    body: 'Once you submit, you cannot edit your response. A confirmation screen loads showing your submission details. Your response is evaluated immediately. Your FISS Score Report arrives the same day.',
  },
];

/* ═══════ TASK CARDS ═══════ */
const TASKS = [
  {
    num: '01',
    color: '#2563EB',
    title: 'A Quantitative Deliverable',
    body: 'A valuation, financial model, sizing estimate, or budget analysis specific to the case. You must show your working and state your assumptions explicitly.',
  },
  {
    num: '02',
    color: '#D97706',
    title: 'A Risk Assessment',
    body: 'The top risks specific to this company in this situation — not generic industry risks. For each risk, explain the mechanism and suggest one specific mitigation.',
  },
  {
    num: '03',
    color: '#16A34A',
    title: 'An Investment Recommendation',
    body: 'Proceed, pass, or proceed with specific conditions. Your recommendation must be explicit and defended — not buried in qualifications or hedged into ambiguity.',
  },
];

/* ═══════ EXCLUSIONS ═══════ */
const EXCLUSIONS = [
  {
    title: 'We do not test memorised frameworks',
    body: 'Reciting MECE, Porter\'s Five Forces, or any other named framework without applying it to this specific company does not score well. We are evaluating adaptation, not recall.',
  },
  {
    title: 'We do not test speed of typing',
    body: 'Word count is noted but not rewarded. A focused 400-word response with a clear thesis and specific evidence outscores an 800-word response that covers everything superficially.',
  },
  {
    title: 'We do not test perfect grammar',
    body: 'We are evaluating analytical capability, not writing ability. A sentence fragment that contains a sharp financial insight scores higher than a beautifully written paragraph that says nothing.',
  },
  {
    title: 'We do not test your college or your background',
    body: 'The evaluation engine receives your response text and the case context. It does not receive your name, your college, your GPA, or your years of experience. Your thinking is the only input.',
  },
];

/* ═══════ ROLE TRACKS ═══════ */
const ROLES = [
  { color: '#2563EB', name: 'Investment Banking Analyst', sub: 'Acquisitions · IPOs · Capital markets' },
  { color: '#7C3AED', name: 'Private Equity Analyst', sub: 'Buyouts · Portfolio · Exits' },
  { color: '#0891B2', name: 'Big 4 Advisory', sub: 'Due diligence · Restructuring · Valuation' },
  { color: '#059669', name: 'Corporate Finance', sub: 'Capital structure · Treasury · FP&A' },
  { color: '#D97706', name: 'Equity Research', sub: 'Coverage · Earnings · Investment thesis' },
];

/* ═══════ FISS DIMENSIONS ═══════ */
const FISS = [
  { abbr: 'FR', name: 'Financial Reasoning', weight: '/25', color: '#2563EB', desc: 'Do the numbers drive your recommendation — or just decorate it?' },
  { abbr: 'ST', name: 'Structured Thinking', weight: '/25', color: '#7C3AED', desc: 'Does your analysis move from data to insight to conclusion?' },
  { abbr: 'RI', name: 'Risk Identification', weight: '/25', color: '#0891B2', desc: 'Are your risks specific mechanisms — or just generic labels?' },
  { abbr: 'DC', name: 'Decision Clarity', weight: '/25', color: '#059669', desc: 'Can you commit to a recommendation under deliberate uncertainty?' },
];

/* ═══════ FAQ ═══════ */
const FAQS = [
  { q: 'Can I retake the Deal Room?', a: 'Not in the current cohort. One submission, one score. This is by design — real analyst work does not come with retakes.' },
  { q: 'What if my internet drops mid-simulation?', a: 'Your work is auto-saved every 30 seconds. When you reconnect, your progress is restored and your timer continues from where it paused.' },
  { q: 'Is the Deal Room free?', a: 'Yes, completely free for the founding cohort. No credit card, no hidden fees.' },
  { q: 'Do I need Excel or any external tools?', a: 'No. Everything happens inside the browser. Your analysis is written directly into the response area.' },
  { q: 'How is the FISS Score different from a mock interview?', a: 'Mock interviews test your ability to perform for an interviewer. The FISS Score tests your ability to analyse — quietly, independently, under real pressure. Different skills.' },
  { q: 'Who sees my score?', a: 'Only you, unless you choose to share it. Your FISS Report includes a shareable link you can add to your resume or LinkedIn.' },
];

export default function DealRoomExplainedPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <Navbar />

      {/* ════════ SECTION 1 — HERO ════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 120px',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 700 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'rgba(37,99,235,0.10)',
            border: '1px solid rgba(37,99,235,0.20)',
            borderRadius: 100, padding: '6px 20px',
            fontSize: 12, fontWeight: 500, color: '#2563EB',
            letterSpacing: 2, marginBottom: 20,
          }}>
            THE DEAL ROOM SIMULATION
          </div>

          {/* Heading */}
          <h1 className="dealroom-hero-heading" style={{
            ...GRADIENT_TEXT,
            fontSize: 52,
            fontWeight: 500,
            maxWidth: 640,
            margin: '0 auto 20px',
            lineHeight: 1.15,
          }}>
            45 minutes to show what months of preparation actually produced.
          </h1>

          {/* Subtitle */}
          <p className="dealroom-hero-sub" style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.60)',
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.8,
          }}>
            The Deal Room is a single timed simulation — a real company, real financials, a real analytical task. No multiple choice. No trick questions. No memory test. 45 minutes of genuine analytical work that shows employers exactly how you think under pressure.
          </p>

          {/* Stats */}
          <div className="dealroom-stats" style={{
            display: 'flex', justifyContent: 'center', gap: 60,
            marginTop: 48,
          }}>
            {[
              { value: '45', label: 'minutes' },
              { value: '1', label: 'submission' },
              { value: 'Same Day', label: 'FISS Report' },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: 'center',
                paddingLeft: i > 0 ? 60 : 0,
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none',
              }}>
                <div style={{ fontSize: 56, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginTop: 8, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ marginTop: 40 }}>
            <PillButton variant="secondary" href="/#apply">
              Start Your Simulation
            </PillButton>
          </div>
        </div>
      </section>

      {/* ════════ SECTION 2 — WHAT IS THE DEAL ROOM ════════ */}
      <section style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '100px 120px',
      }}>
        <div className="dealroom-prose" style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={SECTION_LABEL}>WHAT IS THE DEAL ROOM</p>

          <h2 style={HEADING_SM}>A simulation of real analyst work.</h2>
          <p style={PROSE}>
            The Deal Room is a timed case simulation that puts you inside a real analyst scenario. You receive a company case packet — a business situation, three years of financial statements, market context, and a specific task to complete.
          </p>
          <p style={PROSE}>
            Your job is the same job a first-year analyst would walk into on a Monday morning: read the company, understand the numbers, identify the risks, and tell your MD whether to proceed.
          </p>
          <p style={{ ...PROSE, color: 'rgba(255,255,255,0.80)', fontWeight: 500 }}>
            You have 45 minutes. One submission. No editing after you confirm.
          </p>

          <div style={{ margin: '40px 0', height: 1, background: 'rgba(255,255,255,0.06)' }} />

          <h2 style={HEADING_SM}>Why 45 minutes and not longer?</h2>
          <p style={PROSE}>
            Because the quality of your thinking does not improve after the first hour. What changes is the length of your response — and longer is not the same as better.
          </p>
          <p style={PROSE}>
            45 minutes is enough time to read the case thoroughly, structure your analysis, build a valuation, identify the real risks, and write a clear recommendation. Analysts who score strongly almost always use their time more efficiently — not more exhaustively.
          </p>

          <div style={{ margin: '40px 0', height: 1, background: 'rgba(255,255,255,0.06)' }} />

          <h2 style={HEADING_SM}>What does a case look like?</h2>
          <p style={PROSE}>
            Every case is a fictional but realistic Indian company in a specific situation — an acquisition target, a company preparing for an IPO, a business under financial stress, or an investment decision with incomplete information.
          </p>
          <p style={PROSE}>
            The case packet includes a company overview, three years of financial statements, market context specific to that industry, and your task. The task always includes a quantitative deliverable, a risk assessment, and an investment recommendation.
          </p>
          <p style={PROSE}>
            There are 35 unique cases in our library across five finance role tracks. The case you receive is matched to your target role — an IB analyst receives an acquisition scenario, a PE analyst receives a buyout evaluation, an equity research candidate receives a coverage initiation task.
          </p>
        </div>
      </section>

      {/* ════════ SECTION 3 — STEP BY STEP ════════ */}
      <section style={{ padding: '100px 120px', textAlign: 'center' }}>
        <p style={{ ...SECTION_LABEL, textAlign: 'center' }}>INSIDE THE DEAL ROOM</p>
        <h2 className="dealroom-section-heading" style={{
          ...GRADIENT_TEXT,
          fontSize: 40,
          fontWeight: 500,
          maxWidth: 500,
          margin: '0 auto 64px',
          lineHeight: 1.2,
        }}>
          Step by step — what you actually experience.
        </h2>

        {/* Timeline */}
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'left' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 24,
              marginBottom: i < STEPS.length - 1 ? 48 : 0,
              position: 'relative',
            }}>
              {/* Connecting line */}
              {i < STEPS.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: 19,
                  top: 44,
                  bottom: -48,
                  width: 1,
                  background: 'linear-gradient(rgba(37,99,235,0.40), rgba(37,99,235,0.10))',
                }} />
              )}

              {/* Step circle */}
              <div style={{
                width: 40, height: 40, minWidth: 40,
                borderRadius: '50%',
                background: 'rgba(37,99,235,0.12)',
                border: '1px solid rgba(37,99,235,0.30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 600, color: '#2563EB',
                flexShrink: 0,
              }}>
                {i + 1}
              </div>

              {/* Content */}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8, lineHeight: 1.4 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ SECTION 4 — WHAT THE TASK ASKS FOR ════════ */}
      <section style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '100px 120px',
        textAlign: 'center',
      }}>
        <p style={{ ...SECTION_LABEL, textAlign: 'center' }}>YOUR TASK</p>
        <h2 className="dealroom-section-heading" style={{
          ...GRADIENT_TEXT,
          fontSize: 40,
          fontWeight: 500,
          maxWidth: 480,
          margin: '0 auto 48px',
          lineHeight: 1.2,
        }}>
          Every case asks for the same three things.
        </h2>

        <div className="dealroom-task-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          maxWidth: 900,
          margin: '0 auto',
        }}>
          {TASKS.map((task, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 28,
              borderTop: `2px solid ${task.color}`,
              textAlign: 'left',
            }}>
              <div style={{
                fontSize: 32, fontWeight: 600,
                color: `${task.color}40`,
                fontFamily: 'monospace',
              }}>
                {task.num}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 12, marginBottom: 12, lineHeight: 1.3 }}>
                {task.title}
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>
                {task.body}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.40)',
          maxWidth: 560,
          margin: '32px auto 0',
          fontStyle: 'italic',
          lineHeight: 1.7,
        }}>
          There is no single correct answer in any Deal Room case. Cases are designed with deliberate ambiguity so that a reasonable analyst could argue either direction. What we evaluate is not which conclusion you reach — it is how you get there.
        </p>
      </section>

      {/* ════════ SECTION 5 — WHAT WE DO NOT TEST ════════ */}
      <section style={{ padding: '80px 120px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <p style={SECTION_LABEL}>WHAT THE DEAL ROOM DOES NOT TEST</p>
          <h2 className="dealroom-section-heading" style={{
            ...GRADIENT_TEXT,
            fontSize: 36,
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: 40,
          }}>
            Knowing it is not the same as doing it. We test doing it.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {EXCLUSIONS.map((exc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {/* X circle */}
                <div style={{
                  width: 32, height: 32, minWidth: 32,
                  borderRadius: '50%',
                  background: 'rgba(220,38,38,0.10)',
                  border: '1px solid rgba(220,38,38,0.20)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: '#EF4444', fontWeight: 700,
                  flexShrink: 0,
                }}>
                  ✕
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
                    {exc.title}
                  </h4>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, margin: 0 }}>
                    {exc.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ SECTION 6 — ROLE TRACKS ════════ */}
      <section style={{
        background: 'rgba(37,99,235,0.04)',
        borderTop: '1px solid rgba(37,99,235,0.10)',
        padding: '80px 120px',
        textAlign: 'center',
      }}>
        <p style={{ ...SECTION_LABEL, textAlign: 'center' }}>FIVE ROLE TRACKS</p>
        <h2 className="dealroom-section-heading" style={{
          ...GRADIENT_TEXT,
          fontSize: 36,
          fontWeight: 500,
          lineHeight: 1.2,
          margin: '0 auto 48px',
        }}>
          Your case matches your target role.
        </h2>

        <div className="dealroom-roles" style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12,
          maxWidth: 800, margin: '0 auto',
        }}>
          {ROLES.map((role, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 100,
              padding: '12px 24px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: role.color, flexShrink: 0,
              }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.3 }}>
                  {role.name}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
                  {role.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.40)',
          textAlign: 'center',
          marginTop: 24,
          lineHeight: 1.6,
        }}>
          7 unique cases per role track. Your case is randomly assigned from your track so every candidate receives a different scenario.
        </p>
      </section>

      {/* ════════ SECTION 7 — HOW YOU'RE SCORED ════════ */}
      <section style={{
        padding: '100px 120px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...SECTION_LABEL, textAlign: 'center' }}>YOUR FISS SCORE</p>
          <h2 className="dealroom-section-heading" style={{
            ...GRADIENT_TEXT,
            fontSize: 36,
            fontWeight: 500,
            lineHeight: 1.2,
            margin: '0 auto 20px',
          }}>
            Four dimensions. One honest signal.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>
            Every response is evaluated across four dimensions that mirror what senior analysts actually look for when reviewing junior work.
          </p>

          <div className="dealroom-fiss-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}>
            {FISS.map((d) => (
              <div key={d.abbr} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '28px 20px',
                textAlign: 'center',
                transition: 'border-color 300ms ease, transform 300ms ease',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${d.color}18`,
                  border: `1px solid ${d.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 16, fontWeight: 700, color: d.color,
                }}>{d.abbr}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: d.color, fontWeight: 500, marginBottom: 12 }}>{d.weight}</div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>{d.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <PillButton variant="outline" href="/fiss-score">
              Learn More About the FISS Score →
            </PillButton>
          </div>
        </div>
      </section>

      {/* ════════ SECTION 8 — FAQ ════════ */}
      <section style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '80px 120px',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ ...SECTION_LABEL, textAlign: 'center' }}>COMMON QUESTIONS</p>
          <h2 className="dealroom-section-heading" style={{
            ...GRADIENT_TEXT,
            fontSize: 36,
            fontWeight: 500,
            lineHeight: 1.2,
            margin: '0 auto 48px',
            textAlign: 'center',
          }}>
            Before you begin.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '24px 0',
              }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{faq.q}</h4>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ SECTION 9 — CTA ════════ */}
      <section style={{
        padding: '80px 120px',
        textAlign: 'center',
      }}>
        <h2 className="dealroom-section-heading" style={{
          ...GRADIENT_TEXT,
          fontSize: 40,
          fontWeight: 500,
          lineHeight: 1.2,
          margin: '0 auto 16px',
        }}>
          Ready to find out how you think?
        </h2>
        <p style={{
          fontSize: 16,
          color: 'rgba(255,255,255,0.55)',
          marginBottom: 32,
        }}>
          One simulation. One honest signal. Free for founding cohort candidates.
        </p>
        <PillButton variant="secondary" href="/#apply">
          Start Your Simulation
        </PillButton>
      </section>

      <Footer />

      {/* ════════ RESPONSIVE STYLES ════════ */}
      <style>{`
        @media (max-width: 768px) {
          .dealroom-hero-heading { font-size: 34px !important; }
          .dealroom-hero-sub { font-size: 15px !important; }
          .dealroom-stats { gap: 0 !important; flex-wrap: wrap !important; }
          .dealroom-stats > div { padding: 16px 24px !important; border-left: none !important; border-top: 1px solid rgba(255,255,255,0.08) !important; }
          .dealroom-stats > div:first-child { border-top: none !important; }
          .dealroom-section-heading { font-size: 28px !important; }
          .dealroom-task-grid { grid-template-columns: 1fr !important; }
          .dealroom-fiss-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .dealroom-prose { padding: 0 !important; }
          .dealroom-roles { flex-direction: column !important; align-items: stretch !important; }
          section { padding-left: 40px !important; padding-right: 40px !important; }
        }
        @media (max-width: 480px) {
          section { padding-left: 24px !important; padding-right: 24px !important; }
          .dealroom-hero-heading { font-size: 28px !important; }
          .dealroom-fiss-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
