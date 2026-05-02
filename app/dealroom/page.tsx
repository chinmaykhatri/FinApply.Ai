'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PillButton from '@/components/ui/PillButton';

export default function DealRoomLanding() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user has registered and has a token
    const registered = localStorage.getItem('finapply_registered');
    const dealToken = localStorage.getItem('finapply_deal_token');

    if (registered && dealToken) {
      router.replace(`/dealroom/${dealToken}`);
      return;
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 500, textAlign: 'center' }}>
        {/* Animated gradient icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 20, margin: '0 auto 24px',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(139,92,246,0.15))',
          border: '1px solid rgba(37,99,235,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
        }}>
          🏦
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>Deal Room Simulation</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', marginTop: 16, lineHeight: 1.6 }}>
          The Deal Room is a 90-minute immersive simulation where you analyze a real investment case.
          Register to get your personalized access link.
        </p>

        <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <PillButton variant="primary" href="/#apply">
            Register Now — Free
          </PillButton>
          <PillButton variant="secondary" href="/">
            Learn More
          </PillButton>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 24 }}>
          Already registered? Check your email for your personalized Deal Room link.
        </p>
      </div>
    </div>
  );
}
