'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SectionHeading from '@/components/ui/SectionHeading';
import PillButton from '@/components/ui/PillButton';
import anime from 'animejs';
import { trackEvent, EVENTS } from '@/lib/analytics';

export default function ApplySection() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    college_or_firm: '',
    city: '',
    current_status: '',
    target_role: '',
    linkedin_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);

  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string => {
    if (['full_name', 'college_or_firm', 'city'].includes(name) && !value.trim()) {
      return 'This field is required';
    }
    if (name === 'email') {
      if (!value.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
    }
    if (name === 'current_status' && !value) return 'Please select your current status';
    if (name === 'target_role' && !value) return 'Please select your target role';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    // Clear field error on edit
    if (touched[name]) {
      const err = validateField(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const required = ['full_name', 'email', 'college_or_firm', 'city', 'current_status', 'target_role'];
    const errors: Record<string, string> = {};
    let hasError = false;
    for (const key of required) {
      const err = validateField(key, formData[key as keyof typeof formData]);
      if (err) {
        errors[key] = err;
        hasError = true;
      }
    }
    setFieldErrors(errors);
    setTouched(required.reduce((acc, k) => ({ ...acc, [k]: true }), {}));

    if (hasError) {
      setFormError('Please fix the highlighted fields below.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // Store user data for dashboard auto-load
        localStorage.setItem('finapply_registered', 'true');
        localStorage.setItem('finapply_name', formData.full_name);
        localStorage.setItem('finapply_email', formData.email);
        localStorage.setItem('finapply_dashboard_email', formData.email);
        if (result.data?.deal_room_token) {
          localStorage.setItem('finapply_deal_token', result.data.deal_room_token);
        }
        if (result.data?.report_token) {
          localStorage.setItem('finapply_report_token', result.data.report_token);
        }
        setSubmitted(true);
        trackEvent(EVENTS.REGISTER_COMPLETE, { role: formData.target_role });

        // Route based on user state:
        // - Completed report → go to report page
        // - Active/new application → go to dashboard
        if (result.has_report && result.data?.report_token) {
          setTimeout(() => router.push(`/report/${result.data.report_token}`), 2000);
        } else {
          setTimeout(() => router.push('/dashboard'), 2000);
        }
      } else {
        setFormError(result.error || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch {
      setFormError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  // Scroll reveal with stagger
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !revealed) {
          setRevealed(true);
          obs.disconnect();

          anime({
            targets: '.apply-field',
            translateY: [25, 0],
            opacity: [0, 1],
            duration: 600,
            delay: anime.stagger(80, { start: 200 }),
            easing: 'cubicBezier(0.16, 1, 0.3, 1)',
          });

          anime({
            targets: '.apply-btn',
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 600,
            delay: 800,
            easing: 'cubicBezier(0.16, 1, 0.3, 1)',
          });
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [revealed]);

  // Magnetic button effect
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        const pull = (100 - dist) / 100;
        btn.style.transform = `translate(${dx * pull * 0.3}px, ${dy * pull * 0.3}px)`;
      } else {
        btn.style.transform = 'translate(0, 0)';
      }
    };

    const handleMouseLeave = () => {
      btn.style.transform = 'translate(0, 0)';
    };

    window.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [submitted]);

  // Success animation
  useEffect(() => {
    if (!submitted) return;
    anime({
      targets: '.apply-success',
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 800,
      easing: 'cubicBezier(0.16, 1, 0.3, 1)',
    });
  }, [submitted]);

  const fieldClass = (name: string) =>
    `form-field apply-field${fieldErrors[name] && touched[name] ? ' field-error' : ''}`;

  return (
    <section id="apply" ref={sectionRef} style={{ background: '#000', padding: '120px 120px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(139,92,246,0.15))',
            border: '1px solid rgba(37,99,235,0.30)',
            borderRadius: 20,
            padding: '8px 16px',
            marginBottom: 24,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#16A34A',
              boxShadow: '0 0 8px rgba(22,163,74,0.60)',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>FREE ACCESS · OPEN FOR ALL</span>
        </div>

        <SectionHeading>Get Started with FinApply</SectionHeading>

        <p
          style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.60)',
            maxWidth: 440,
            margin: '16px auto 0',
            lineHeight: 1.6,
          }}
        >
          Register to unlock the Deal Room simulation and receive your personalized FISS Score Report.
          No cost. No waitlist. Just fill in your details below.
        </p>

        {/* Form or Success */}
        {submitted ? (
          <div
            className="apply-success form-success-card"
            style={{ marginTop: 40, opacity: 0 }}
          >
            {/* SVG checkmark */}
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
              <circle cx="28" cy="28" r="26" stroke="#16A34A" strokeWidth="2" opacity="0.30">
                <animate attributeName="r" from="0" to="26" dur="0.4s" fill="freeze" />
              </circle>
              <path
                d="M18 28L24 34L38 20"
                stroke="#16A34A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 40,
                  strokeDashoffset: 40,
                  animation: 'drawLine 0.6s ease 0.3s forwards',
                }}
              />
            </svg>
            <p style={{ fontSize: 24, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>You&apos;re in!</p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.60)', margin: '0 0 12px' }}>
              Your Deal Room and FISS Report are now ready.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', margin: 0 }}>
              Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <form
            id="apply-form"
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 40 }}
            noValidate
          >
            {/* Full Name */}
            <div>
              <input name="full_name" className={fieldClass('full_name')} placeholder="Full Name" value={formData.full_name} onChange={handleChange} onBlur={handleBlur} required style={{ opacity: 0 }} />
              {fieldErrors.full_name && touched.full_name && <p className="field-error-text">{fieldErrors.full_name}</p>}
            </div>

            {/* Email */}
            <div>
              <input name="email" type="email" className={fieldClass('email')} placeholder="Email Address" value={formData.email} onChange={handleChange} onBlur={handleBlur} required style={{ opacity: 0 }} />
              {fieldErrors.email && touched.email && <p className="field-error-text">{fieldErrors.email}</p>}
            </div>

            {/* LinkedIn (optional) */}
            <input name="linkedin_url" type="url" className="form-field apply-field" placeholder="LinkedIn Profile URL (e.g. linkedin.com/in/yourname)" value={formData.linkedin_url} onChange={handleChange} style={{ opacity: 0 }} />

            {/* College */}
            <div>
              <input name="college_or_firm" className={fieldClass('college_or_firm')} placeholder="College or Current Firm" value={formData.college_or_firm} onChange={handleChange} onBlur={handleBlur} required style={{ opacity: 0 }} />
              {fieldErrors.college_or_firm && touched.college_or_firm && <p className="field-error-text">{fieldErrors.college_or_firm}</p>}
            </div>

            {/* City */}
            <div>
              <input name="city" className={fieldClass('city')} placeholder="City" value={formData.city} onChange={handleChange} onBlur={handleBlur} required style={{ opacity: 0 }} />
              {fieldErrors.city && touched.city && <p className="field-error-text">{fieldErrors.city}</p>}
            </div>

            {/* Current Status */}
            <div>
              <select name="current_status" className={`form-select ${fieldClass('current_status')}`} value={formData.current_status} onChange={handleChange} onBlur={handleBlur} required style={{ opacity: 0 }}>
                <option value="" disabled>I am currently a...</option>
                <option value="final_year_student">Final year student</option>
                <option value="mba_student">MBA student</option>
                <option value="working_0_2">Working professional (0-2 years)</option>
                <option value="working_2_plus">Working professional (2+ years)</option>
              </select>
              {fieldErrors.current_status && touched.current_status && <p className="field-error-text">{fieldErrors.current_status}</p>}
            </div>

            {/* Target Role */}
            <div>
              <select name="target_role" className={`form-select ${fieldClass('target_role')}`} value={formData.target_role} onChange={handleChange} onBlur={handleBlur} required style={{ opacity: 0 }}>
                <option value="" disabled>Target Role</option>
                <option value="ib_analyst">Investment Banking Analyst</option>
                <option value="pe_analyst">Private Equity Analyst</option>
                <option value="big4_advisory">Big 4 Advisory</option>
                <option value="equity_research">Equity Research</option>
                <option value="corporate_finance">Corporate Finance</option>
              </select>
              {fieldErrors.target_role && touched.target_role && <p className="field-error-text">{fieldErrors.target_role}</p>}
            </div>

            <div
              ref={btnRef}
              className="apply-btn"
              style={{ opacity: 0, transition: 'transform 0.2s ease' }}
            >
              <PillButton type="submit" variant="primary" fullWidth large loading={loading}>
                Get Started — Free
              </PillButton>
            </div>

            {formError && (
              <p className="form-error-banner">
                {formError}
              </p>
            )}

            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', marginTop: 4 }}>
              By registering, you agree to our{' '}
              <a href="/terms" style={{ color: 'rgba(255,255,255,0.50)', textDecoration: 'underline' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" style={{ color: 'rgba(255,255,255,0.50)', textDecoration: 'underline' }}>Privacy Policy</a>.
            </p>
          </form>
        )}
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
