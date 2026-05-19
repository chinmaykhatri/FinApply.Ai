'use client';
import React, { useState, useMemo } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import PillButton from '@/components/ui/PillButton';

/* ─── Check Icon ─── */
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="rgba(22,163,74,0.15)" />
    <path d="M5 8L7 10L11 6" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Dash = () => (
  <span style={{ width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.20)' }}>—</span>
);

/* ─── Tier Data ─── */
const tiers = [
  {
    name: 'STARTER',
    monthly: 499, annual: 399,
    desc: 'Best for boutique firms with 1–10 annual analyst hires',
    features: [
      'Access to all founding cohort FISS profiles',
      'Filter by role track and score band',
      '30 employer-commissioned assessments per year',
      'Identity reveal with candidate consent',
      'Email support',
      'Quarterly cohort updates',
    ],
    cta: 'Start Free Pilot',
    href: '/employer-apply?plan=starter',
    variant: 'outline' as const,
  },
  {
    name: 'GROWTH',
    monthly: 1249, annual: 999,
    desc: 'Best for mid-market firms with 10–25 annual analyst hires',
    popular: true,
    features: [
      'Everything in Starter',
      '100 commissioned assessments/year',
      'Role-specific case tracks',
      'Analytics dashboard — track score distributions over time',
      'Priority Slack support',
      'Candidate performance follow-up at 90 days',
      'FinApply employer case study',
    ],
    cta: 'Start Free Pilot',
    href: '/employer-apply?plan=growth',
    variant: 'primary' as const,
  },
  {
    name: 'ENTERPRISE',
    monthly: 0, annual: 0, custom: true,
    desc: 'For large firms with 25+ annual analyst hires',
    features: [
      'Everything in Growth',
      'Unlimited commissioned assessments',
      'ATS integration (Phase 3)',
      'Custom role tracks and case content',
      'Dedicated account manager',
      'Quarterly calibration reports',
      'API access to FISS data',
      'SLA guarantee: 24-hour delivery',
    ],
    cta: 'Contact Us',
    href: 'mailto:chinmay.finapply.ai@gmail.com?subject=Enterprise%20Inquiry',
    variant: 'outline' as const,
  },
];

/* ─── Comparison rows ─── */
const compRows = [
  { label: 'Founding cohort access', s: true, g: true, e: true },
  { label: 'Role track filtering', s: true, g: true, e: true },
  { label: 'Commissioned assessments', s: '30/yr', g: '100/yr', e: 'Unlimited' },
  { label: 'Identity reveal', s: true, g: true, e: true },
  { label: 'Analytics dashboard', s: false, g: true, e: true },
  { label: 'Custom case tracks', s: false, g: false, e: true },
  { label: 'ATS integration', s: false, g: false, e: true },
  { label: 'Dedicated account manager', s: false, g: false, e: true },
  { label: 'SLA guarantee', s: false, g: false, e: true },
  { label: 'API access', s: false, g: false, e: true },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  /* ROI calc */
  const [hires, setHires] = useState(12);
  const [wrongCost, setWrongCost] = useState(35);
  const [wrongRate, setWrongRate] = useState(20);

  const roi = useMemo(() => {
    const annualLoss = hires * (wrongRate / 100) * wrongCost;
    const planCost = 9.99;
    const ratio = annualLoss / planCost;
    return { annualLoss: annualLoss.toFixed(1), ratio: ratio.toFixed(1), planCost };
  }, [hires, wrongCost, wrongRate]);

  const faqs = [
    { q: 'How is FISS different from existing assessments like SHL?', a: 'SHL measures aptitude through multiple choice. FISS measures execution through a 45-minute deal simulation — the same work your analysts do on day one. A candidate can score 90th percentile on SHL and still be unable to structure a financial argument.' },
    { q: 'What if we already use HireVue?', a: 'HireVue evaluates how candidates present themselves. FinApply evaluates how they think analytically. They measure different things. Most employers who use both find they complement rather than compete.' },
    { q: 'Is the FISS Score legally compliant?', a: 'Every score includes a human review step — no automated decision is made without human oversight. We are preparing AI audit documentation ahead of DPDP Act requirements in India and EU AI Act compliance for international operations.' },
    { q: 'How quickly can we start?', a: 'The free 90-day pilot requires one call and a signed pilot agreement. You can be accessing scored candidates within 48 hours of agreement.' },
  ];

  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>
      <Navbar />

      {/* ═══ HEADER ═══ */}
      <section style={{ padding: '140px 120px 60px', textAlign: 'center' }}>
        <div className="pricing-badge">EMPLOYER PRICING</div>
        <h1 className="pricing-heading">Simple pricing.<br />Measurable ROI.</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '20px auto 0', lineHeight: 1.7 }}>
          Every plan starts with a free 90-day research pilot. No credit card required to start.
        </p>
      </section>

      {/* ═══ TOGGLE ═══ */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: 4 }}>
          <button onClick={() => setAnnual(false)} className={`pricing-toggle ${!annual ? 'active' : ''}`}>Monthly</button>
          <button onClick={() => setAnnual(true)} className={`pricing-toggle ${annual ? 'active' : ''}`}>Annual (save 20%)</button>
        </div>
      </div>

      {/* ═══ CARDS ═══ */}
      <div className="pricing-grid">
        {tiers.map((t) => (
          <div key={t.name} className={`pricing-card ${t.popular ? 'pricing-card-popular' : ''}`}>
            {t.popular && <div className="pricing-popular-badge">Most Popular</div>}
            <span className="pricing-tier-label" style={t.popular ? { color: '#2563EB' } : undefined}>{t.name}</span>

            {t.custom ? (
              <p style={{ fontSize: 32, fontWeight: 600, color: '#fff', margin: '16px 0 4px' }}>Custom</p>
            ) : (
              <>
                <p style={{ fontSize: 40, fontWeight: 600, color: '#fff', margin: '16px 0 4px', lineHeight: 1 }}>
                  ${annual ? t.annual : t.monthly}<span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.40)' }}>/month</span>
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>Billed {annual ? 'annually' : 'monthly'}</p>
              </>
            )}

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', fontStyle: 'italic', marginBottom: 20, lineHeight: 1.5 }}>{t.desc}</p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {t.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ marginTop: 2 }}><Check /></span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{f}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 'auto' }}>
              <PillButton variant={t.variant} href={t.href} fullWidth>{t.cta}</PillButton>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ FREE PILOT BANNER ═══ */}
      <div className="pricing-pilot-banner">
        <div style={{ flex: 1 }}>
          <div className="pricing-badge" style={{ background: 'rgba(22,163,74,0.15)', borderColor: 'rgba(22,163,74,0.30)', color: '#16A34A' }}>FREE 90-DAY PILOT</div>
          <h3 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: '12px 0 8px' }}>Not ready to commit? Start with a free pilot.</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>5 founding employer spots available. Full platform access. Zero cost. We need the outcome data — you get the capability signal.</p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <PillButton variant="outline" href="/employer-apply?plan=pilot">Apply for Free Pilot</PillButton>
        </div>
      </div>

      {/* ═══ ROI CALCULATOR ═══ */}
      <section style={{ padding: '80px 120px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="pricing-badge">ROI CALCULATOR</div>
          <h2 className="pricing-heading" style={{ fontSize: 32, marginTop: 12 }}>Does FinApply pay for itself?</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Slider: hires */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)' }}>Annual analyst hires</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{hires}</span>
            </div>
            <input type="range" min={5} max={50} value={hires} onChange={(e) => setHires(+e.target.value)} className="pricing-slider" />
          </div>
          {/* Slider: cost */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)' }}>Average cost of a wrong hire</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>₹{wrongCost}L</span>
            </div>
            <input type="range" min={10} max={80} value={wrongCost} onChange={(e) => setWrongCost(+e.target.value)} className="pricing-slider" />
          </div>
          {/* Slider: rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)' }}>Wrong hire rate (current)</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{wrongRate}%</span>
            </div>
            <input type="range" min={5} max={40} value={wrongRate} onChange={(e) => setWrongRate(+e.target.value)} className="pricing-slider" />
          </div>
        </div>

        {/* Result */}
        <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.20)', borderRadius: 16, padding: 28, marginTop: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.35)', fontWeight: 600, margin: '0 0 8px' }}>ANNUAL COST OF WRONG HIRES</p>
          <p style={{ fontSize: 40, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>₹{roi.annualLoss}L</p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.60)', margin: '0 0 4px' }}>FinApply Growth plan: ₹9.99L/year</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: parseFloat(roi.ratio) > 1 ? '#16A34A' : '#F59E0B', margin: '0 0 12px' }}>
            Potential ROI: {roi.ratio}x
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', margin: 0 }}>
            ({hires} × {wrongRate}% × ₹{wrongCost}L) ÷ ₹9.99L = {roi.ratio}x return
          </p>
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section style={{ padding: '0 120px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="pricing-badge">FULL FEATURE COMPARISON</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="pricing-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Feature</th>
                <th>Starter</th>
                <th style={{ color: '#2563EB' }}>Growth</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {compRows.map((r) => (
                <tr key={r.label}>
                  <td style={{ textAlign: 'left', color: 'rgba(255,255,255,0.70)' }}>{r.label}</td>
                  {(['s', 'g', 'e'] as const).map((k) => {
                    const v = r[k];
                    return (
                      <td key={k}>
                        {v === true ? <Check /> : v === false ? <Dash /> : <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{v}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ padding: '40px 120px 100px', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: '#fff', textAlign: 'center', marginBottom: 40 }}>Common Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((f, i) => (
            <div key={i} className="pricing-faq" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '16px 20px' }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{f.q}</span>
                <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.40)', transition: 'transform 200ms', transform: faqOpen === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </div>
              {faqOpen === i && (
                <div style={{ padding: '0 20px 16px', fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, animation: 'fadeIn 0.2s ease' }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .pricing-badge {
          display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 2px;
          color: #2563EB; background: rgba(37,99,235,0.12); border: 1px solid rgba(37,99,235,0.25);
          border-radius: 100px; padding: 6px 16px; margin-bottom: 16px;
        }
        .pricing-heading {
          font-size: 48px; font-weight: 500; line-height: 1.15; margin: 0;
          background: linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .pricing-toggle {
          padding: 8px 20px; border: none; border-radius: 100px; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 200ms; background: transparent; color: rgba(255,255,255,0.50);
        }
        .pricing-toggle.active { background: #fff; color: #000; }

        .pricing-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
          max-width: 960px; margin: 0 auto; padding: 0 120px;
        }
        .pricing-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 36px 32px; display: flex; flex-direction: column;
          position: relative; overflow: hidden; transition: border-color 300ms;
        }
        .pricing-card:hover { border-color: rgba(255,255,255,0.15); }
        .pricing-card-popular {
          border-color: rgba(37,99,235,0.40) !important;
          background: rgba(37,99,235,0.06);
        }
        .pricing-popular-badge {
          position: absolute; top: 0; right: 0; background: #2563EB;
          border-radius: 0 20px 0 12px; padding: 6px 14px;
          font-size: 11px; font-weight: 500; color: #fff;
        }
        .pricing-tier-label {
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.30);
          letter-spacing: 3px;
        }

        .pricing-pilot-banner {
          display: flex; align-items: center; gap: 32px; max-width: 960px;
          margin: 40px auto 0; padding: 32px 40px;
          background: rgba(22,163,74,0.06); border: 1px solid rgba(22,163,74,0.15);
          border-radius: 16px; margin-left: auto; margin-right: auto;
        }

        .pricing-slider {
          width: 100%; height: 4px; -webkit-appearance: none; appearance: none;
          background: rgba(255,255,255,0.10); border-radius: 4px; outline: none;
        }
        .pricing-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
          background: #2563EB; cursor: pointer; border: 2px solid #000;
        }

        .pricing-table {
          width: 100%; border-collapse: collapse; font-size: 13px;
        }
        .pricing-table th {
          padding: 12px 16px; font-size: 12px; font-weight: 600; letter-spacing: 1px;
          color: rgba(255,255,255,0.40); text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .pricing-table td {
          padding: 12px 16px; text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .pricing-table tr:hover td { background: rgba(37,99,235,0.03); }

        .pricing-faq {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; transition: border-color 200ms; cursor: pointer;
        }
        .pricing-faq:hover { border-color: rgba(255,255,255,0.12); }

        @media (max-width: 1024px) {
          section { padding-left: 40px !important; padding-right: 40px !important; }
          .pricing-grid { grid-template-columns: 1fr; padding: 0 40px; max-width: 480px; }
          .pricing-pilot-banner { flex-direction: column; margin: 40px 40px 0; }
        }
        @media (max-width: 768px) {
          section { padding-left: 24px !important; padding-right: 24px !important; }
          .pricing-heading { font-size: 32px !important; }
          .pricing-grid { padding: 0 24px; }
          .pricing-pilot-banner { margin: 40px 24px 0; padding: 24px; }
        }
      `}</style>
    </main>
  );
}
