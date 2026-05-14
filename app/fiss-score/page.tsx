import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import PillButton from '@/components/ui/PillButton';

export const metadata: Metadata = {
  title: 'The FISS Score — FinApply.ai',
  description: 'Financial Intelligence Screening Score. Four dimensions of analytical capability measured in a single 45-minute simulation.',
};

const G = {
  background: 'linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
} as React.CSSProperties;

const LBL: React.CSSProperties = { fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.30)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 32 };

const DIMS = [
  { code: 'FR', name: 'Financial Reasoning', color: '#2563EB',
    text: `Financial Reasoning measures whether you can read a set of financial statements accurately and use the numbers as decision inputs — not just report them.\n\nThe specific difference: most candidates can calculate an EBITDA multiple. Fewer can choose the right methodology for the company type, state it before their conclusion, keep their calculations internally consistent, and then use the result to actually drive a recommendation.\n\nA high FR score means your analysis is not decorative. The numbers work and they matter to what you conclude.` },
  { code: 'ST', name: 'Structured Thinking', color: '#7C3AED',
    text: `Structured Thinking measures the discipline of your analytical organisation — specifically whether you move from data to insight to conclusion in a logical sequence, or whether you reach a conclusion first and find evidence for it afterward.\n\nThe specific difference: a structured response separates what the case says (facts), what you believe it means (interpretations), and what you recommend (conclusions). Most candidates blur these together without realising it.\n\nA high ST score means a senior analyst could follow your logic and verify each step without needing to ask you what you meant.` },
  { code: 'RI', name: 'Risk Identification', color: '#D97706',
    text: `Risk Identification measures whether the risks you identify are specific to this company or generic to the industry — and whether you explain why each risk matters rather than just labelling it.\n\nThe specific difference: writing 'customer concentration is a risk' is a label. Writing 'if the top customer reduces orders by 20 percent, EBITDA falls below the debt covenant threshold and the company faces a forced refinancing in a rising rate environment' is a mechanism. Only the second one is useful.\n\nA high RI score means you read the case, not the template.` },
  { code: 'DC', name: 'Decision Clarity', color: '#16A34A',
    text: `Decision Clarity measures whether you can commit to a clear recommendation under deliberate uncertainty — and whether you defend it with specific reasoning rather than hedging it into ambiguity.\n\nThe specific difference: 'proceed with caution given the risks identified' is not a recommendation. 'I recommend passing on this acquisition because the refinancing risk at current leverage levels outweighs the revenue growth case at any entry multiple above 9x' is a recommendation.\n\nA high DC score means you can be trusted with a decision. That is what being a junior analyst actually requires.` },
];

const BANDS = [
  { label: 'Strong — 20 to 25', bg: 'rgba(22,163,74,0.10)', border: 'rgba(22,163,74,0.20)', color: '#16A34A' },
  { label: 'Adequate — 15 to 19', bg: 'rgba(234,179,8,0.10)', border: 'rgba(234,179,8,0.20)', color: '#EAB308' },
  { label: 'Developing — 10 to 14', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.20)', color: '#F97316' },
  { label: 'Critical Gap — 1 to 9', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.20)', color: '#EF4444' },
];

const PROCESS = [
  { num: '01', title: 'You submit your response', body: 'Your 45-minute analysis is submitted through the Deal Room interface. It is stored securely and evaluated immediately.' },
  { num: '02', title: 'Gemini evaluates your response', body: 'Our AI evaluation engine — built on Gemini 2.5 Pro — scores your response across all four FISS dimensions using a rubric built specifically for finance analyst work. It identifies your strongest evidence, your clearest gap, and the one-line characterisation of your analytical profile.' },
  { num: '03', title: 'Our team reviews before delivery', body: 'Every score is reviewed by our founding team before it reaches you. We can adjust any dimension with a documented reason. This human review step is why we call the FISS Score verified — not because an algorithm said so, but because a person checked it.' },
];

const USES = [
  { icon: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z', title: 'Send it directly to employers', body: 'Include your FISS Score PDF in job applications or send it alongside your CV. Show hiring managers how you think before they decide whether to interview you.' },
  { icon: 'M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z', title: 'Post it on LinkedIn', body: 'Your score, your dimension breakdown, and one line about what you learned. Finance employers follow LinkedIn more than most candidates realise. Your score is a signal in their feed.' },
  { icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z', title: 'Reference it in interviews', body: 'When asked about your analytical approach, reference your strongest FISS dimension specifically. It is a more credible answer than any generic framework claim.' },
  { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', title: 'Use the gaps to improve', body: 'Your FISS Report includes one specific improvement action per dimension. These are not generic tips — they reference what you actually wrote and what you should do differently next time.' },
];

const CONF = [
  { label: 'HIGH', color: '#16A34A', bg: 'rgba(22,163,74,0.10)', border: 'rgba(22,163,74,0.25)', sub: 'Complete response.\nClear evidence for all dimensions.' },
  { label: 'MEDIUM', color: '#EAB308', bg: 'rgba(234,179,8,0.10)', border: 'rgba(234,179,8,0.25)', sub: 'Some sections thin.\nScores are probable, not certain.' },
  { label: 'CAUTION', color: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)', sub: 'Short response or integrity flag.\nHuman review applied.' },
];

const SAMPLE_BARS = [
  { label: 'Financial Reasoning', score: 19, color: '#2563EB' },
  { label: 'Structured Thinking', score: 21, color: '#7C3AED' },
  { label: 'Risk Identification', score: 16, color: '#D97706' },
  { label: 'Decision Clarity', score: 18, color: '#16A34A' },
];

export default function FISSScorePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <Navbar />

      {/* ══ S1 HERO ══ */}
      <section className="fiss-section" style={{ padding: '120px 120px 100px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)', borderRadius: 100, padding: '6px 20px', fontSize: 12, fontWeight: 500, color: '#2563EB', letterSpacing: 2 }}>
          THE FISS SCORE
        </div>

        {/* Abbreviation lines */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          {[['F', 'Financial Reasoning'], ['I', 'Structured Thinking'], ['S', 'Risk Identification'], ['S', 'Decision Clarity']].map(([letter, word], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <span className="fiss-letter" style={{ fontSize: 48, fontWeight: 600, color: '#2563EB', fontFamily: 'monospace', width: 48, textAlign: 'right' }}>{letter}</span>
              <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.20)' }}>—</span>
              <span className="fiss-word" style={{ fontSize: 32, fontWeight: 500, color: '#fff', textAlign: 'left' }}>{word}</span>
            </div>
          ))}
        </div>

        <p className="fiss-sub" style={{ fontSize: 16, color: 'rgba(255,255,255,0.60)', maxWidth: 560, margin: '32px auto 0', lineHeight: 1.8 }}>
          FISS is your verified capability score across four analytical dimensions — produced from a 45-minute deal simulation and reviewed by our founding team before it reaches you.
        </p>

        {/* Sample score card */}
        <div style={{ maxWidth: 480, margin: '48px auto 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.30)', letterSpacing: 3, marginBottom: 24 }}>SAMPLE FISS REPORT</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontSize: 64, fontWeight: 600, color: '#fff' }}>74</span>
            <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.30)' }}>/100</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)', borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 500, color: '#2563EB', marginTop: 12 }}>
            Top 28th Percentile — IB Analyst Cohort
          </div>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SAMPLE_BARS.map((b, i) => (
              <div key={i} style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{b.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: b.color }}>{b.score}/25</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: b.color, width: `${(b.score / 25) * 100}%`, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ S2 DIMENSIONS ══ */}
      <section className="fiss-section" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '100px 120px', textAlign: 'center' }}>
        <p style={{ ...LBL, textAlign: 'center' }}>WHAT EACH DIMENSION MEASURES</p>
        <h2 className="fiss-h2" style={{ ...G, fontSize: 40, fontWeight: 500, maxWidth: 460, margin: '0 auto 64px', lineHeight: 1.2 }}>Not what you know. How you use it.</h2>

        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {DIMS.map((d, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '40px 44px', position: 'relative', textAlign: 'left', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: d.color, borderRadius: '3px 0 0 3px' }} />

              <div className="fiss-dim-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: d.color, letterSpacing: 3, fontFamily: 'monospace' }}>{d.code}</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#fff', marginTop: 8 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Scored out of 25</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {BANDS.map((b, j) => (
                    <div key={j} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 100, padding: '3px 12px', fontSize: 12, fontWeight: 500, color: b.color, whiteSpace: 'nowrap' }}>{b.label}</div>
                  ))}
                </div>
              </div>

              <div style={{ margin: '24px 0', height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.70)', marginBottom: 12 }}>What this actually measures</div>
              {d.text.split('\n\n').map((p, j) => (
                <p key={j} style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: '0 0 16px' }}>{p}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ══ S3 PROCESS ══ */}
      <section className="fiss-section" style={{ padding: '100px 120px', textAlign: 'center' }}>
        <p style={{ ...LBL, textAlign: 'center' }}>HOW YOUR SCORE IS PRODUCED</p>
        <h2 className="fiss-h2" style={{ ...G, fontSize: 40, fontWeight: 500, margin: '0 auto 56px', lineHeight: 1.2 }}>AI evaluation. Human review. Your score.</h2>

        <div className="fiss-process-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }}>
          {PROCESS.map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32, textAlign: 'left' }}>
              <div style={{ fontSize: 32, fontFamily: 'monospace', color: 'rgba(37,99,235,0.30)' }}>{s.num}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 16, marginBottom: 12, lineHeight: 1.3 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 560, margin: '32px auto 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', textAlign: 'left' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.60)', marginBottom: 12 }}>Why AI and not only humans?</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>
            Scale and consistency. A human evaluator gets tired, gets biased, and evaluates differently at 9am versus 6pm. Gemini applies the same rubric with the same standards to every response. Our team adds the domain judgment the AI cannot reliably replicate — catching cases where the candidate used finance terminology correctly but in the wrong context, or where they identified a non-obvious risk that the rubric underscored.
          </p>
        </div>
      </section>

      {/* ══ S4 USES ══ */}
      <section className="fiss-section" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '100px 120px', textAlign: 'center' }}>
        <p style={{ ...LBL, textAlign: 'center' }}>AFTER YOUR SCORE ARRIVES</p>
        <h2 className="fiss-h2" style={{ ...G, fontSize: 36, fontWeight: 500, lineHeight: 1.2, marginBottom: 48 }}>Your FISS Score is yours. Permanently.</h2>

        <div className="fiss-uses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 800, margin: '0 auto' }}>
          {USES.map((u, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(37,99,235,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563EB"><path d={u.icon} /></svg>
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginTop: 14 }}>{u.title}</h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.7, marginTop: 8 }}>{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ S5 CONFIDENCE ══ */}
      <section className="fiss-section" style={{ padding: '80px 120px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <p style={LBL}>THE CONFIDENCE INDEX</p>
          <h2 className="fiss-h2" style={{ ...G, fontSize: 32, fontWeight: 500, lineHeight: 1.2, marginBottom: 24 }}>Every FISS Score includes a reliability rating.</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 24 }}>
            Not all evaluations are equally certain. If a response is very short, leaves sections incomplete, or triggers our integrity detection system, the confidence in the resulting score is lower.
          </p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 32 }}>
            Every FISS Score includes a Confidence Index — High, Medium, or Caution. A High Confidence score means the evaluation was complete, consistent, and produced clear evidence for every dimension. A Caution score means the report should be read with that context in mind.
          </p>
          <div className="fiss-conf" style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {CONF.map((c, i) => (
              <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '16px 24px', textAlign: 'center', flex: '1 1 180px', maxWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: c.color, letterSpacing: 2 }}>{c.label}</span>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', marginTop: 8, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ S6 CTA ══ */}
      <section className="fiss-section" style={{ padding: '80px 120px', textAlign: 'center' }}>
        <h2 className="fiss-h2" style={{ ...G, fontSize: 40, fontWeight: 500, lineHeight: 1.2, marginBottom: 16 }}>Get your FISS Score.</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', marginBottom: 32 }}>45 minutes. Free for founding cohort.</p>
        <PillButton variant="secondary" href="/#apply">Apply for Beta Access</PillButton>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: 1, marginTop: 16 }}>FISS — Financial Intelligence Screening Score</p>
      </section>

      {/* ══ RESPONSIVE ══ */}
      <style>{`
        @media (max-width: 768px) {
          .fiss-section { padding-left: 40px !important; padding-right: 40px !important; }
          .fiss-h2 { font-size: 28px !important; }
          .fiss-letter { font-size: 32px !important; width: 36px !important; }
          .fiss-word { font-size: 22px !important; }
          .fiss-process-grid { grid-template-columns: 1fr !important; }
          .fiss-uses-grid { grid-template-columns: 1fr !important; }
          .fiss-dim-top { flex-direction: column !important; gap: 16px !important; }
          .fiss-conf { flex-direction: column !important; align-items: center !important; }
        }
        @media (max-width: 480px) {
          .fiss-section { padding-left: 24px !important; padding-right: 24px !important; }
          .fiss-letter { font-size: 28px !important; }
          .fiss-word { font-size: 18px !important; }
        }
      `}</style>
    </div>
  );
}
