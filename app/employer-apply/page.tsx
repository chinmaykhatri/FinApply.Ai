'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import PillButton from '@/components/ui/PillButton';
import { trackEvent } from '@/lib/analytics';

const planLabels: Record<string, string> = {
  starter: 'Starter — 90-Day Free Pilot',
  growth: 'Growth — 90-Day Free Pilot',
  enterprise: 'Enterprise — Custom',
  pilot: 'Free 90-Day Research Pilot',
};

const roleOptions = ['Managing Partner / GP', 'Director / VP', 'Head of Talent', 'CFO / Finance Head', 'Other'];
const firmOptions = ['Private Equity Fund', 'Investment Bank (boutique)', 'Investment Bank (bulge bracket)', 'Big 4 Advisory', 'Family Office', 'Corporate (Internal Finance)', 'Other'];
const hiresOptions = ['1-3 per year', '4-10 per year', '10-25 per year', '25+ per year'];
const screeningOptions = ['Resume + multiple interview rounds', 'Resume + internal case study', 'Resume + third-party assessment (SHL etc)', 'Referrals primarily', 'Other'];
const timelineOptions = ['Actively hiring now', 'Within 3 months', '3-6 months', 'Exploring for future cycles'];

function EmployerApplyInner() {
  const params = useSearchParams();
  const plan = params.get('plan') || '';

  const [form, setForm] = useState({
    full_name: '', email: '', firm_name: '', role: '', firm_type: '',
    annual_hires: '', screening: '', pain: '', timeline: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const required = ['full_name', 'email', 'firm_name', 'role', 'firm_type', 'annual_hires', 'screening', 'pain', 'timeline'];

  const validate = (name: string, val: string) => {
    if (!val.trim()) return 'Required';
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email';
    return '';
  };

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setError('');
    if (touched[name]) setFieldErrors(p => ({ ...p, [name]: validate(name, value) }));
  };

  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setFieldErrors(p => ({ ...p, [name]: validate(name, value) }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    let bad = false;
    for (const k of required) {
      const err = validate(k, form[k as keyof typeof form]);
      if (err) { errs[k] = err; bad = true; }
    }
    setFieldErrors(errs);
    setTouched(required.reduce((a, k) => ({ ...a, [k]: true }), {}));
    if (bad) { setError('Please fix the highlighted fields.'); return; }

    setLoading(true); setError('');
    try {
      const res = await fetch('/api/employer-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan }),
      });
      if (!res.ok) throw new Error('Failed');
      trackEvent('employer_applied', { firm_type: form.firm_type, annual_hires: form.annual_hires, timeline: form.timeline, plan });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const fc = (name: string) => `form-field${fieldErrors[name] && touched[name] ? ' field-error' : ''}`;

  if (submitted) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '180px 24px 120px', textAlign: 'center' }}>
          <div className="form-success-card">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
              <circle cx="28" cy="28" r="26" stroke="#16A34A" strokeWidth="2" opacity="0.30" />
              <path d="M18 28L24 34L38 20" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawLine 0.6s ease 0.3s forwards' }} />
            </svg>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>Application received.</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: '0 0 24px', lineHeight: 1.6 }}>
              Chinmay will contact you at <strong style={{ color: '#fff' }}>{form.email}</strong> within 24 hours to schedule a 15-minute call.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '0 0 16px' }}>To save time, you can also book directly:</p>
            <a href="https://cal.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#2563EB', fontWeight: 500, textDecoration: 'none' }}>
              Book 15 minutes →
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '140px 24px 100px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 500, margin: '0 0 8px', background: 'linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Apply for Employer Access
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: '0 0 24px', lineHeight: 1.6 }}>
          Currently accepting 5 founding employer partners for free 90-day research pilot.
        </p>

        {plan && planLabels[plan] && (
          <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
            Plan: {planLabels[plan]}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
          <div>
            <input name="full_name" className={fc('full_name')} placeholder="Full Name" value={form.full_name} onChange={change} onBlur={blur} />
            {fieldErrors.full_name && touched.full_name && <p className="field-error-text">{fieldErrors.full_name}</p>}
          </div>
          <div>
            <input name="email" type="email" className={fc('email')} placeholder="Work Email" value={form.email} onChange={change} onBlur={blur} />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '4px 0 0 2px' }}>Use your firm email — personal email accepted if needed</p>
            {fieldErrors.email && touched.email && <p className="field-error-text">{fieldErrors.email}</p>}
          </div>
          <div>
            <input name="firm_name" className={fc('firm_name')} placeholder="Firm Name" value={form.firm_name} onChange={change} onBlur={blur} />
            {fieldErrors.firm_name && touched.firm_name && <p className="field-error-text">{fieldErrors.firm_name}</p>}
          </div>

          {/* Dropdowns */}
          {[
            { name: 'role', placeholder: 'Your Role', opts: roleOptions },
            { name: 'firm_type', placeholder: 'Firm Type', opts: firmOptions },
            { name: 'annual_hires', placeholder: 'Annual Analyst Hires', opts: hiresOptions },
            { name: 'screening', placeholder: 'Current Screening Process', opts: screeningOptions },
            { name: 'timeline', placeholder: 'When are you next hiring?', opts: timelineOptions },
          ].map(({ name, placeholder, opts }) => (
            <div key={name}>
              <select name={name} className={`form-select ${fc(name)}`} value={form[name as keyof typeof form]} onChange={change} onBlur={blur}>
                <option value="" disabled>{placeholder}</option>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {fieldErrors[name] && touched[name] && <p className="field-error-text">{fieldErrors[name]}</p>}
            </div>
          ))}

          <div>
            <textarea name="pain" className={fc('pain')} placeholder="Describe the most frustrating part of your current analyst hiring process..." value={form.pain} onChange={change} onBlur={blur} style={{ minHeight: 100, resize: 'vertical' }} />
            {fieldErrors.pain && touched.pain && <p className="field-error-text">{fieldErrors.pain}</p>}
          </div>

          <PillButton type="submit" variant="primary" fullWidth large loading={loading}>Submit Application</PillButton>

          {error && <p className="form-error-banner">{error}</p>}
        </form>
      </div>
      <Footer />
    </>
  );
}

export default function EmployerApplyPage() {
  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }} />}>
        <EmployerApplyInner />
      </Suspense>
    </main>
  );
}
