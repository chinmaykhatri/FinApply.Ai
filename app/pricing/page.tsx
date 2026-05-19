'use client';
import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import PillButton from '@/components/ui/PillButton';

export default function EmployersPage() {
  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>
      <Navbar />

      <section className="employers-hero">
        {/* Badge */}
        <div className="employers-badge">FOUNDING EMPLOYER COHORT</div>

        {/* Heading */}
        <h1 className="employers-heading">
          Founding Employer Cohort —<br />
          <span className="employers-heading-accent">5 spots available.</span>
        </h1>

        {/* Body */}
        <div className="employers-body">
          <p className="employers-intro">
            We are building FinApply&apos;s employer research programme with 5 founding
            firms who will shape how the product works.
          </p>

          {/* Two columns */}
          <div className="employers-columns">
            {/* What you get */}
            <div className="employers-card">
              <h2 className="employers-card-title">What you get</h2>
              <ul className="employers-list">
                <li>
                  <span className="employers-dash">—</span>
                  Full access to founding cohort FISS Score profiles
                </li>
                <li>
                  <span className="employers-dash">—</span>
                  20 candidates assessed specifically for your open roles
                </li>
                <li>
                  <span className="employers-dash">—</span>
                  Direct input into which dimensions and role tracks we prioritize
                </li>
                <li>
                  <span className="employers-dash">—</span>
                  First-mover access before public launch
                </li>
              </ul>
            </div>

            {/* What we get */}
            <div className="employers-card">
              <h2 className="employers-card-title">What we get</h2>
              <ul className="employers-list">
                <li>
                  <span className="employers-dash">—</span>
                  Your hiring outcome data after 3 and 6 months
                </li>
                <li>
                  <span className="employers-dash">—</span>
                  Permission to publish anonymised results as our first case study
                </li>
              </ul>
            </div>
          </div>

          {/* Terms */}
          <div className="employers-terms">
            <div className="employers-term">
              <span className="employers-term-label">Cost</span>
              <span className="employers-term-value">Free.</span>
            </div>
            <div className="employers-term-divider" />
            <div className="employers-term">
              <span className="employers-term-label">Duration</span>
              <span className="employers-term-value">90 days.</span>
            </div>
            <div className="employers-term-divider" />
            <div className="employers-term">
              <span className="employers-term-label">Commitment</span>
              <span className="employers-term-value">One 15-minute call to get started.</span>
            </div>
          </div>

          {/* CTA */}
          <div className="employers-cta">
            <PillButton variant="primary" href="/employer-apply" large>
              Apply for Employer Access
            </PillButton>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .employers-hero {
          max-width: 720px;
          margin: 0 auto;
          padding: 160px 24px 120px;
        }

        .employers-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2.5px;
          color: #2563EB;
          background: rgba(37, 99, 235, 0.10);
          border: 1px solid rgba(37, 99, 235, 0.20);
          border-radius: 100px;
          padding: 6px 18px;
          margin-bottom: 28px;
        }

        .employers-heading {
          font-size: 44px;
          font-weight: 500;
          line-height: 1.18;
          margin: 0 0 36px;
          background: linear-gradient(144.5deg, #FFFFFF 28%, rgba(0, 0, 0, 0) 115%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .employers-heading-accent {
          background: linear-gradient(90deg, #2563EB, #60A5FA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .employers-body {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .employers-intro {
          font-size: 17px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.75;
          margin: 0;
          max-width: 560px;
        }

        .employers-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .employers-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 32px 28px;
        }

        .employers-card-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          letter-spacing: 0.5px;
          margin: 0 0 20px;
        }

        .employers-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .employers-list li {
          display: flex;
          gap: 12px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.50);
          line-height: 1.65;
        }
        .employers-dash {
          color: rgba(37, 99, 235, 0.60);
          flex-shrink: 0;
          font-weight: 500;
        }

        .employers-terms {
          display: flex;
          align-items: center;
          gap: 28px;
          padding: 28px 32px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
        }
        .employers-term {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .employers-term-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.30);
          text-transform: uppercase;
        }
        .employers-term-value {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
        }
        .employers-term-divider {
          width: 1px;
          height: 36px;
          background: rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .employers-cta {
          padding-top: 8px;
        }

        @media (max-width: 640px) {
          .employers-hero {
            padding: 140px 20px 80px;
          }
          .employers-heading {
            font-size: 30px;
          }
          .employers-columns {
            grid-template-columns: 1fr;
          }
          .employers-terms {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            padding: 24px;
          }
          .employers-term-divider {
            width: 100%;
            height: 1px;
          }
        }
      `}</style>
    </main>
  );
}
