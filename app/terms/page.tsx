import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service — FinApply.ai',
  description: 'Terms and conditions for using the FinApply.ai platform and FISS Score assessment.',
};

const GRADIENT_TEXT = {
  background: 'linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as React.CSSProperties;

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.40)', marginBottom: 48 }}>
          Last updated: May 19, 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <TermsSection title="1. Acceptance of Terms">
            <p>By registering for or using FinApply.ai (&quot;the Platform&quot;), you agree to these Terms of Service. If you do not agree, do not use the Platform.</p>
          </TermsSection>

          <TermsSection title="2. The Service">
            <p>FinApply provides a timed case simulation (&quot;Deal Room&quot;) and an AI-powered capability assessment (&quot;FISS Score Report&quot;) for finance career candidates. The Platform evaluates your analytical response to a simulated business case and generates a score across four dimensions.</p>
          </TermsSection>

          <TermsSection title="3. Eligibility">
            <p>You must be at least 18 years old to use the Platform. By registering, you represent that you are of legal age and have the capacity to enter into a binding agreement.</p>
          </TermsSection>

          <TermsSection title="4. Account and Submissions">
            <ul>
              <li>You are responsible for providing accurate registration information.</li>
              <li>Each candidate receives <strong style={{ color: '#fff' }}>one Deal Room simulation</strong> per registration. Submissions are final and cannot be edited after confirmation.</li>
              <li>You may not share your Deal Room link with others or allow someone else to complete the simulation on your behalf.</li>
              <li>We reserve the right to flag or invalidate submissions that show signs of AI-generated content, plagiarism, or integrity violations.</li>
            </ul>
          </TermsSection>

          <TermsSection title="5. Intellectual Property">
            <ul>
              <li><strong style={{ color: '#fff' }}>Your submission</strong> remains your intellectual property. By submitting, you grant FinApply a non-exclusive licence to evaluate, store, and analyse your response for scoring and platform improvement purposes.</li>
              <li><strong style={{ color: '#fff' }}>Case content</strong> (company scenarios, financial data, and task descriptions) is proprietary to FinApply.ai. You may not reproduce, distribute, or share case materials outside the Platform.</li>
              <li><strong style={{ color: '#fff' }}>FISS Score Reports</strong> are generated for your personal use. You may share your report link and scores with employers and on professional networks.</li>
            </ul>
          </TermsSection>

          <TermsSection title="6. AI Evaluation Disclaimer">
            <p>FISS Scores are generated using AI-powered evaluation (Google Gemini). While we calibrate for consistency, scores are <strong style={{ color: '#fff' }}>indicative assessments</strong>, not guarantees of job performance or career outcomes. FinApply does not guarantee employment, interview invitations, or any specific career result based on your score.</p>
          </TermsSection>

          <TermsSection title="7. Behavioural Monitoring">
            <p>During the Deal Room simulation, the Platform monitors behavioural metadata including tab switches, paste events, and typing patterns. This data is used solely for integrity verification and is not shared externally. Excessive integrity violations (e.g., repeated tab switches) may result in automatic submission or score annotation.</p>
          </TermsSection>

          <TermsSection title="8. Data Sharing with Employers">
            <p>Your FISS Score and aggregate performance data may be shared with employer partners <strong style={{ color: '#fff' }}>only with your explicit consent</strong>. Raw submissions are never shared with employers without your written permission.</p>
          </TermsSection>

          <TermsSection title="9. Limitation of Liability">
            <p>FinApply.ai is provided &quot;as is&quot; without warranties of any kind. We are not liable for:</p>
            <ul>
              <li>Technical interruptions during your simulation (though we provide auto-save and session recovery)</li>
              <li>Scoring variations inherent to AI evaluation</li>
              <li>Career outcomes or employment decisions made by third parties</li>
              <li>Loss of data beyond our reasonable control</li>
            </ul>
          </TermsSection>

          <TermsSection title="10. Termination">
            <p>We reserve the right to suspend or terminate your access if you violate these terms, submit fraudulent content, or misuse the Platform. You may request account deletion at any time by emailing <a href="mailto:chinmay.finapply.ai@gmail.com" style={{ color: '#2563EB' }}>chinmay.finapply.ai@gmail.com</a>.</p>
          </TermsSection>

          <TermsSection title="11. Changes to Terms">
            <p>We may update these terms from time to time. Continued use of the Platform after changes constitutes acceptance of the updated terms. Material changes will be communicated via email to registered users.</p>
          </TermsSection>

          <TermsSection title="12. Governing Law">
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Jaipur, Rajasthan.</p>
          </TermsSection>

          <TermsSection title="13. Contact">
            <p>For questions about these terms:</p>
            <p style={{ marginTop: 8 }}>
              Chinmay Khatri<br />
              Founder, FinApply.ai<br />
              <a href="mailto:chinmay.finapply.ai@gmail.com" style={{ color: '#2563EB' }}>chinmay.finapply.ai@gmail.com</a>
            </p>
          </TermsSection>
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

function TermsSection({ title, children }: { title: string; children: React.ReactNode }) {
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
