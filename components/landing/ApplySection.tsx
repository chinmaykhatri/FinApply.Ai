'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SectionHeading from '@/components/ui/SectionHeading';
import PillButton from '@/components/ui/PillButton';
import anime from 'animejs';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ['full_name', 'email', 'college_or_firm', 'city', 'current_status', 'target_role'];
    if (required.some((k) => !formData[k as keyof typeof formData].trim())) return;
    setLoading(true);

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

        // Go straight to dashboard — full access, no approval needed
        router.push('/dashboard');
      }
    } catch {
      // Even on network error, try to send them to dashboard
      localStorage.setItem('finapply_registered', 'true');
      localStorage.setItem('finapply_email', formData.email);
      localStorage.setItem('finapply_dashboard_email', formData.email);
      setSubmitted(true);
      router.push('/dashboard');
    } finally {
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
            className="apply-success"
            style={{
              marginTop: 40,
              background: 'rgba(22,163,74,0.08)',
              border: '1px solid rgba(22,163,74,0.20)',
              borderRadius: 16,
              padding: 40,
              opacity: 0,
            }}
          >
            {/* SVG checkmark */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 16px' }}>
              <circle cx="24" cy="24" r="22" stroke="#16A34A" strokeWidth="2" opacity="0.30" />
              <path
                d="M15 24L21 30L33 18"
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
            <p style={{ fontSize: 24, fontWeight: 600, color: '#fff' }}>Registration complete!</p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.60)', marginTop: 12 }}>
              Your Deal Room and FISS Report are now ready. Redirecting you...
            </p>
          </div>
        ) : (
          <form
            id="apply-form"
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 40 }}
          >
            <input name="full_name" className="form-field apply-field" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required style={{ opacity: 0 }} />
            <input name="email" type="email" className="form-field apply-field" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{ opacity: 0 }} />
            <input name="linkedin_url" type="url" className="form-field apply-field" placeholder="LinkedIn Profile URL (e.g. linkedin.com/in/yourname)" value={formData.linkedin_url} onChange={handleChange} style={{ opacity: 0 }} />
            <input name="college_or_firm" className="form-field apply-field" placeholder="College or Current Firm" value={formData.college_or_firm} onChange={handleChange} required style={{ opacity: 0 }} />
            <input name="city" className="form-field apply-field" placeholder="City" value={formData.city} onChange={handleChange} required style={{ opacity: 0 }} />

            <select name="current_status" className="form-field form-select apply-field" value={formData.current_status} onChange={handleChange} required style={{ opacity: 0 }}>
              <option value="" disabled>I am currently a...</option>
              <option value="final_year_student">Final year student</option>
              <option value="mba_student">MBA student</option>
              <option value="working_0_2">Working professional (0-2 years)</option>
              <option value="working_2_plus">Working professional (2+ years)</option>
            </select>

            <select name="target_role" className="form-field form-select apply-field" value={formData.target_role} onChange={handleChange} required style={{ opacity: 0 }}>
              <option value="" disabled>Target Role</option>
              <option value="ib_analyst">Investment Banking Analyst</option>
              <option value="pe_analyst">Private Equity Analyst</option>
              <option value="big4_advisory">Big 4 Advisory</option>
              <option value="equity_research">Equity Research</option>
              <option value="corporate_finance">Corporate Finance</option>
            </select>

            <div
              ref={btnRef}
              className="apply-btn"
              style={{ opacity: 0, transition: 'transform 0.2s ease' }}
            >
              <PillButton type="submit" variant="primary" fullWidth large loading={loading}>
                Get Started — Free
              </PillButton>
            </div>

            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', marginTop: 4 }}>
              By registering, you agree to receive your FISS Report via email.
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
