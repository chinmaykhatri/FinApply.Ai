'use client';

import React from 'react';

/**
 * Annotated preview of the Deal Room interface for employers.
 * Shows what candidates experience during the 45-minute simulation.
 */
export default function DealRoomPreview() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, overflow: 'hidden',
    }}>
      {/* Mock top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.50)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Fin<span style={{ color: '#2563EB' }}>Apply</span></span>
          <span style={{
            fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 100,
            background: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.20)',
            color: '#DC2626',
          }}>
            ● LIVE
          </span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: '#fff' }}>37:42</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>847 words</span>
      </div>

      {/* Split layout preview */}
      <div style={{ display: 'flex', minHeight: 320 }}>
        {/* Left — case brief */}
        <div style={{
          width: '45%', padding: 20, borderRight: '1px solid rgba(255,255,255,0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Annotation callout */}
          <div style={{
            position: 'absolute', top: 12, right: 12, zIndex: 2,
            background: '#2563EB', borderRadius: 8, padding: '6px 12px',
            fontSize: 10, fontWeight: 600, color: '#fff',
          }}>
            ← Case Brief
          </div>

          <h4 style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginBottom: 8 }}>SITUATION</h4>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6,
            maxHeight: 80, overflow: 'hidden',
            maskImage: 'linear-gradient(to bottom, black 50%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent)',
          }}>
            Your team at a mid-market advisory firm has been retained by TechNova Inc, a B2B SaaS company specializing in supply chain analytics...
          </div>

          <h4 style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginTop: 16, marginBottom: 8 }}>FINANCIALS</h4>
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: 12,
            fontSize: 10, color: 'rgba(255,255,255,0.30)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Revenue</span><span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.50)' }}>$142M</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>EBITDA</span><span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.50)' }}>$28.4M</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>YoY Growth</span><span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.50)' }}>23%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Net Margin</span><span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.50)' }}>18.2%</span>
            </div>
          </div>

          <h4 style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: 2, marginTop: 16, marginBottom: 8 }}>YOUR TASK</h4>
          <div style={{
            background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.12)',
            borderRadius: 8, padding: 10, fontSize: 11, color: 'rgba(255,255,255,0.40)', lineHeight: 1.5,
          }}>
            Prepare a preliminary investment memo covering valuation, risks, and recommendation...
          </div>
        </div>

        {/* Right — editor */}
        <div style={{ flex: 1, padding: 20, position: 'relative' }}>
          {/* Annotation */}
          <div style={{
            position: 'absolute', top: 12, right: 12, zIndex: 2,
            background: '#16A34A', borderRadius: 8, padding: '6px 12px',
            fontSize: 10, fontWeight: 600, color: '#fff',
          }}>
            Analysis Editor →
          </div>

          {/* Guide tabs mock */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {['Valuation', 'Risk', 'Recommendation', 'Growth'].map((t, i) => (
              <span key={t} style={{
                fontSize: 10, padding: '4px 10px', borderRadius: 100,
                background: i === 0 ? 'rgba(37,99,235,0.10)' : 'transparent',
                border: i === 0 ? '1px solid rgba(37,99,235,0.30)' : '1px solid rgba(255,255,255,0.10)',
                color: i === 0 ? '#2563EB' : 'rgba(255,255,255,0.30)',
              }}>
                {t}
              </span>
            ))}
          </div>

          {/* Hint mock */}
          <div style={{
            padding: '8px 12px', borderRadius: 8, marginBottom: 10,
            background: 'rgba(37,99,235,0.04)', borderLeft: '2px solid rgba(37,99,235,0.30)',
            fontSize: 10, color: 'rgba(255,255,255,0.35)',
          }}>
            💡 Build a DCF or comparable multiples analysis. State your WACC and key assumptions.
          </div>

          {/* Fake text editor */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: 16, flex: 1, minHeight: 140,
            fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.8,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.50)' }}>Based on my analysis of TechNova&apos;s financials, I recommend a</span>{' '}
            <span style={{ color: '#16A34A' }}>BUY</span>{' '}
            <span style={{ color: 'rgba(255,255,255,0.50)' }}>at the proposed valuation of 8.2x EV/EBITDA, contingent on two key conditions...</span>
            <br /><br />
            <span style={{ color: 'rgba(255,255,255,0.30)' }}>My DCF analysis yields an implied enterprise value of $248M, representing a 12% premium to the current offer...</span>
            <span className="cursor-blink" style={{
              display: 'inline-block', width: 2, height: 14, background: '#2563EB',
              marginLeft: 2, verticalAlign: 'middle',
              animation: 'blink 1s step-end infinite',
            }} />
          </div>
        </div>
      </div>

      {/* Bottom annotation bar */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 24, padding: '12px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.30)',
      }}>
        {[
          { icon: '⏱', label: '45-min timer' },
          { icon: '📝', label: 'Structured sections' },
          { icon: '📊', label: 'Real financial data' },
          { icon: '🔒', label: 'Proctored environment' },
        ].map(a => (
          <span key={a.label} style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)' }}>
            {a.icon} {a.label}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
