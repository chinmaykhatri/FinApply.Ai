'use client';
import React, { useState } from 'react';

interface CaseItem {
  case_code: string;
  title: string;
  track: string;
  difficulty: string;
  role: string;
  status: string;
  total_uses: number;
  last_updated: string | null;
  market_context_updated_at: string | null;
  updated_by: string | null;
  market_context_override: string | null;
  financial_data_override: Record<string, unknown> | null;
  has_metadata: boolean;
}

interface Props {
  caseItem: CaseItem | null;
  onClose: () => void;
  onSave: () => void;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: '#16A34A' },
  { value: 'review_needed', label: 'Review Needed', color: '#D97706' },
  { value: 'retiring_soon', label: 'Retiring Soon', color: '#F97316' },
  { value: 'retired', label: 'Retired', color: '#DC2626' },
];

export default function CaseEditDrawer({ caseItem, onClose, onSave }: Props) {
  const [status, setStatus] = useState(caseItem?.status || 'active');
  const [marketOverride, setMarketOverride] = useState(caseItem?.market_context_override || '');
  const [saving, setSaving] = useState(false);

  // Reset when drawer opens with new case
  React.useEffect(() => {
    if (caseItem) {
      setStatus(caseItem.status);
      setMarketOverride(caseItem.market_context_override || '');
    }
  }, [caseItem]);

  if (!caseItem) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/case-library?code=${encodeURIComponent(caseItem.case_code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          market_context_override: marketOverride || null,
        }),
      });
      if (res.ok) onSave();
      else alert('Save failed.');
    } catch { alert('Save error.'); }
    finally { setSaving(false); }
  };

  const handleRefreshContext = async () => {
    // Just mark context as updated (timestamp refresh)
    setSaving(true);
    try {
      await fetch(`/api/admin/case-library?code=${encodeURIComponent(caseItem.case_code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market_context_override: marketOverride || null,
        }),
      });
      onSave();
    } catch { alert('Refresh failed.'); }
    finally { setSaving(false); }
  };

  const daysSinceUpdate = caseItem.market_context_updated_at
    ? Math.round((Date.now() - new Date(caseItem.market_context_updated_at).getTime()) / 86400000)
    : null;

  const isStale = daysSinceUpdate !== null && daysSinceUpdate > 90;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.50)', zIndex: 90,
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 480,
        background: '#0A0A0F',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        zIndex: 100,
        overflowY: 'auto',
        padding: 32,
        animation: 'slideIn 250ms ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#2563EB', fontWeight: 600 }}>
              {caseItem.case_code}
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 4 }}>{caseItem.title}</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginTop: 2 }}>
              {caseItem.track} • {caseItem.difficulty} • {caseItem.role}
            </p>
          </div>
          <button onClick={onClose} style={{
            fontSize: 18, color: 'rgba(255,255,255,0.40)', background: 'none',
            border: 'none', cursor: 'pointer', padding: '4px 8px',
          }}>
            ✕
          </button>
        </div>

        {/* Metadata Info */}
        <div style={{
          padding: 16, borderRadius: 12,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 24,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase' }}>Total Uses</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 2 }}>{caseItem.total_uses}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase' }}>Last Updated</p>
              <p style={{ fontSize: 14, color: '#fff', marginTop: 2 }}>
                {caseItem.last_updated ? new Date(caseItem.last_updated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase' }}>Updated By</p>
              <p style={{ fontSize: 14, color: '#fff', marginTop: 2 }}>{caseItem.updated_by || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase' }}>Context Age</p>
              <p style={{ fontSize: 14, color: isStale ? '#D97706' : '#fff', fontWeight: isStale ? 600 : 400, marginTop: 2 }}>
                {daysSinceUpdate !== null ? `${daysSinceUpdate} days` : 'Unknown'}
                {isStale && ' ⚠ Stale'}
              </p>
            </div>
          </div>
        </div>

        {/* Staleness Warning */}
        {isStale && (
          <div style={{
            padding: '12px 16px', borderRadius: 12, marginBottom: 20,
            background: 'rgba(217,119,6,0.06)', borderLeft: '3px solid #D97706',
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#D97706', marginBottom: 4 }}>
              ⚠ MARKET CONTEXT STALE
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', lineHeight: 1.5 }}>
              This case&apos;s market context hasn&apos;t been updated in {daysSinceUpdate} days.
              Review the market_context field and update if sector conditions have changed.
            </p>
          </div>
        )}

        {/* Status */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.60)', display: 'block', marginBottom: 8 }}>
            Status
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                style={{
                  fontSize: 12, fontWeight: 500, padding: '8px 16px', borderRadius: 100,
                  border: status === opt.value
                    ? `2px solid ${opt.color}`
                    : '1px solid rgba(255,255,255,0.10)',
                  background: status === opt.value
                    ? `${opt.color}15`
                    : 'rgba(255,255,255,0.04)',
                  color: status === opt.value ? opt.color : 'rgba(255,255,255,0.50)',
                  cursor: 'pointer', transition: 'all 200ms ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Market Context Override */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.60)' }}>
              Market Context Override
            </label>
            <button
              onClick={handleRefreshContext}
              disabled={saving}
              style={{
                fontSize: 10, fontWeight: 500, padding: '4px 10px', borderRadius: 6,
                border: '1px solid rgba(22,163,74,0.25)', background: 'rgba(22,163,74,0.08)',
                color: '#16A34A', cursor: 'pointer',
              }}
            >
              🔄 Mark Refreshed
            </button>
          </div>
          <textarea
            value={marketOverride}
            onChange={e => setMarketOverride(e.target.value)}
            placeholder="Leave empty to use the default market_context from code. Enter updated text to override what candidates see."
            style={{
              width: '100%', minHeight: 160,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: 14, color: '#fff', fontSize: 13,
              lineHeight: 1.6, resize: 'vertical', outline: 'none',
              fontFamily: 'var(--font-family)',
            }}
          />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', marginTop: 4 }}>
            If set, this replaces the market_context field from the code library for this case.
          </p>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, fontSize: 13, fontWeight: 500, padding: '12px 24px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.12)', background: 'transparent',
              color: 'rgba(255,255,255,0.60)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, fontSize: 13, fontWeight: 600, padding: '12px 24px', borderRadius: 100,
              border: 'none', background: '#2563EB',
              color: '#fff', cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? '⏳ Saving…' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
