import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'FinApply.ai — Prove How You Think';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
          background: '#000000',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Blue glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(37,99,235,0.08) 40%, transparent 70%)',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            F
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: -1,
            }}
          >
            FinApply.ai
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: 0.5,
          }}
        >
          Prove How You Think. Not Just What You Know.
        </div>

        {/* Bottom stats bar */}
        <div
          style={{
            display: 'flex',
            gap: 60,
            marginTop: 48,
            alignItems: 'center',
          }}
        >
          {[
            { val: '45 min', label: 'Deal Room Simulation' },
            { val: '4', label: 'FISS Dimensions' },
            { val: '48h', label: 'Score Report' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingLeft: i > 0 ? 60 : 0,
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 600, color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
