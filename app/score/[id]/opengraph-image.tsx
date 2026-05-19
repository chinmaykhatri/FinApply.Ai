import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'FISS Score — FinApply.ai';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = params;

  // For edge runtime, we cannot use Supabase admin client directly.
  // Instead, fetch from our own API.
  let name = 'FinApply Candidate';
  let score = 0;
  let role = 'Finance';
  let fr = 0, st = 0, ri = 0, dc = 0;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fin-apply-ai.vercel.app';
    const res = await fetch(`${baseUrl}/api/score/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const data = json.data;
      name = data.full_name;
      role = data.target_role;
      const r = data.report;
      score = r.total_score;
      fr = r.financial_reasoning?.score || 0;
      st = r.structured_thinking?.score || 0;
      ri = r.risk_identification?.score || 0;
      dc = r.decision_clarity?.score || 0;
    }
  } catch {
    // Use defaults
  }

  const dims = [
    { label: 'Financial Reasoning', value: fr },
    { label: 'Structured Thinking', value: st },
    { label: 'Risk Identification', value: ri },
    { label: 'Decision Clarity', value: dc },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#000000',
          padding: '60px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Blue glow */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '-10%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.20) 0%, transparent 60%)',
          }}
        />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                background: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              F
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#fff', letterSpacing: -0.5 }}>
              FinApply.ai
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(22,163,74,0.12)',
              border: '1px solid rgba(22,163,74,0.25)',
              borderRadius: 100,
              padding: '6px 16px',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>
              ✓ Verified FISS Score
            </div>
          </div>
        </div>

        {/* Name + Role */}
        <div style={{ fontSize: 44, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
          {name}
        </div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>
          {role} · Founding Cohort 2026
        </div>

        {/* Score + Dimension bars */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 60, marginTop: 40, flex: 1 }}>
          {/* Score circle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160 }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                border: '6px solid rgba(37,99,235,0.80)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: '#fff' }}>{score}</div>
                <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.30)', marginLeft: 2 }}>/100</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#2563EB', fontWeight: 600, marginTop: 12 }}>
              FISS Score
            </div>
          </div>

          {/* Dimension bars */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 14, justifyContent: 'center' }}>
            {dims.map((d) => (
              <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', width: 160 }}>{d.label}</div>
                <div style={{
                  flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 100,
                  display: 'flex',
                }}>
                  <div style={{
                    width: `${(d.value / 25) * 100}%`,
                    height: '100%',
                    background: d.value >= 20 ? '#16A34A' : d.value >= 15 ? '#D97706' : d.value >= 10 ? '#F97316' : '#EF4444',
                    borderRadius: 100,
                  }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', width: 45, textAlign: 'right' }}>
                  {d.value}/25
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', marginTop: 20 }}>
          finapply.ai/score/{id}
        </div>
      </div>
    ),
    { ...size }
  );
}
