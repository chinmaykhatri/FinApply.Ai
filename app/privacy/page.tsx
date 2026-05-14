import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — FinApply.ai',
  description: 'How FinApply.ai collects, uses, and protects your personal data.',
};

const GRADIENT_TEXT = {
  background: 'linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as React.CSSProperties;

export default function PrivacyPage() {
  return (
    <main>
      <Navbar />

      <section style={{
        background: '#000',
        padding: '160px 120px 80px',
        maxWidth: 800,
        margin: '0 auto',
      }}>
        <h1 style={{ ...GRADIENT_TEXT, fontSize: 40, fontWeight: 500, marginBottom: 16 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.40)', marginBottom: 48 }}>
          Last updated: May 15, 2026
        </p>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <PolicySection title="1. Information We Collect">
            <p>When you register for FinApply, we collect:</p>
            <ul>
              <li>Full name and email address</li>
              <li>College or current firm name</li>
              <li>City of residence</li>
              <li>Current professional status</li>
              <li>Target finance role</li>
              <li>LinkedIn profile URL (optional)</li>
            </ul>
            <p>During the Deal Room simulation, we collect:</p>
            <ul>
              <li>Your written submission (analysis and recommendations)</li>
              <li>Behavioral metadata (time spent, tab-switch count, paste events) for integrity monitoring</li>
            </ul>
          </PolicySection>

          <PolicySection title="2. How We Use Your Data">
            <ul>
              <li>To generate your personalised FISS Score Report via AI evaluation</li>
              <li>To deliver your report via email</li>
              <li>To improve simulation quality and evaluation accuracy</li>
              <li>To communicate platform updates (you may opt out at any time)</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Data Sharing">
            <p>We do <strong style={{ color: '#fff' }}>not</strong> sell your personal data. Your information may be shared with:</p>
            <ul>
              <li><strong style={{ color: '#fff' }}>Employer partners</strong> — only with your explicit consent, and only your FISS Score and aggregate performance data (not raw submissions)</li>
              <li><strong style={{ color: '#fff' }}>Service providers</strong> — Supabase (database hosting), Resend (email delivery), Google Gemini (AI evaluation) — bound by their own privacy policies</li>
            </ul>
          </PolicySection>

          <PolicySection title="4. Data Retention">
            <p>Your registration data and FISS reports are retained for 24 months from account creation. You may request deletion at any time by emailing <a href="mailto:chinmay@finapply.ai" style={{ color: '#2563EB' }}>chinmay@finapply.ai</a>.</p>
          </PolicySection>

          <PolicySection title="5. Security">
            <p>We protect your data with:</p>
            <ul>
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Row-level security on all database tables</li>
              <li>Token-based access for reports and Deal Room sessions</li>
              <li>Environment-isolated secrets management</li>
            </ul>
          </PolicySection>

          <PolicySection title="6. Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li>Access a copy of your stored personal data</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for employer data sharing</li>
            </ul>
            <p>To exercise these rights, email <a href="mailto:chinmay@finapply.ai" style={{ color: '#2563EB' }}>chinmay@finapply.ai</a>.</p>
          </PolicySection>

          <PolicySection title="7. Contact">
            <p>For privacy-related inquiries:</p>
            <p style={{ marginTop: 8 }}>
              Chinmay Khatri<br />
              Founder, FinApply.ai<br />
              <a href="mailto:chinmay@finapply.ai" style={{ color: '#2563EB' }}>chinmay@finapply.ai</a>
            </p>
          </PolicySection>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          section { padding: 120px 24px 60px !important; }
          h1 { font-size: 28px !important; }
        }
      `}</style>
    </main>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>{title}</h2>
      <div style={{
        fontSize: 15,
        color: 'rgba(255,255,255,0.65)',
        lineHeight: 1.8,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {children}
      </div>
      <style>{`
        div ul { padding-left: 20px; }
        div li { margin-bottom: 6px; }
      `}</style>
    </div>
  );
}
