import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/* GET /api/og?name=John&score=85 — Dynamic OG image for FISS reports */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Sanitize: truncate, strip HTML/special chars
  const rawName = (searchParams.get('name') || 'Candidate').slice(0, 60).replace(/[<>"'&]/g, '');
  const name = rawName || 'Candidate';
  const rawScore = parseInt(searchParams.get('score') || '0') || 0;
  const scoreNum = Math.max(0, Math.min(100, rawScore));
  const score = String(scoreNum) || '--';

  const scoreColor = scoreNum >= 80 ? '#16A34A' : scoreNum >= 60 ? '#2563EB' : scoreNum >= 40 ? '#D97706' : '#DC2626';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #000000 0%, #0a0a2e 50%, #000000 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Brand */}
        <div style={{ fontSize: 16, color: '#2563EB', letterSpacing: 6, marginBottom: 40, fontWeight: 600 }}>
          FINAPPLY.AI
        </div>

        {/* Score circle */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            border: `5px solid ${scoreColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 64, fontWeight: 700, color: '#ffffff' }}>{score}</span>
          <span style={{ fontSize: 14, color: '#666666', marginTop: -4 }}>/ 100</span>
        </div>

        {/* Label */}
        <div style={{ fontSize: 13, color: '#666666', letterSpacing: 3, marginBottom: 16 }}>
          FINANCIAL INTELLIGENCE SIMULATION SCORE
        </div>

        {/* Name */}
        <div style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
          {name}
        </div>

        {/* Cohort */}
        <div style={{ fontSize: 16, color: '#444444' }}>
          Founding Cohort · Batch 1
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
