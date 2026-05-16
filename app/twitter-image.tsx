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
      </div>
    ),
    { ...size }
  );
}
