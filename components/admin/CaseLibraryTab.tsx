'use client';
import React, { useEffect, useState, useCallback } from 'react';
import CaseEditDrawer from './CaseEditDrawer';

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

const TRACKS = ['All', 'IB', 'PE', 'B4', 'ER', 'CF'];
const STATUSES = ['All', 'active', 'review_needed', 'retiring_soon', 'retired'];

export default function CaseLibraryTab() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackFilter, setTrackFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [syncing, setSyncing] = useState(false);
  const [editCase, setEditCase] = useState<CaseItem | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (trackFilter !== 'All') params.set('track', trackFilter);
      if (statusFilter !== 'All') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/case-library?${params}`);
      const json = await res.json();
      if (json.data) setCases(json.data);
    } catch { /* handle */ }
    finally { setLoading(false); }
  }, [trackFilter, statusFilter]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/case-library', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        alert(`Synced ${json.seeded} cases to metadata table.`);
        fetchCases();
      }
    } catch { alert('Sync failed.'); }
    finally { setSyncing(false); }
  };

  const handleStatusChange = async (code: string, status: string) => {
    try {
      await fetch(`/api/admin/case-library?code=${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchCases();
    } catch { /* handle */ }
  };

  const pillStyle = (active: boolean) => ({
    fontSize: 12,
    fontWeight: 500 as const,
    padding: '6px 14px',
    borderRadius: 100,
    border: active ? '1px solid rgba(37,99,235,0.40)' : '1px solid rgba(255,255,255,0.10)',
    background: active ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.04)',
    color: active ? '#2563EB' : 'rgba(255,255,255,0.50)',
    cursor: 'pointer' as const,
    transition: 'all 200ms ease',
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
      active: { bg: 'rgba(22,163,74,0.10)', border: 'rgba(22,163,74,0.25)', color: '#16A34A', label: 'Active' },
      review_needed: { bg: 'rgba(217,119,6,0.10)', border: 'rgba(217,119,6,0.25)', color: '#D97706', label: 'Review' },
      retiring_soon: { bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.25)', color: '#F97316', label: 'Retiring' },
      retired: { bg: 'rgba(220,38,38,0.10)', border: 'rgba(220,38,38,0.25)', color: '#DC2626', label: 'Retired' },
    };
    const s = map[status] || map.active;
    return (
      <span style={{
        fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
        background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  const difficultyColor = (d: string) => {
    if (d === 'Expert') return '#DC2626';
    if (d === 'Advanced') return '#D97706';
    return '#16A34A';
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  // Staleness check: market context older than 90 days
  const isStale = (d: string | null) => {
    if (!d) return false;
    return Date.now() - new Date(d).getTime() > 90 * 86400000;
  };

  // Stats
  const trackCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  const difficultyCounts: Record<string, number> = {};
  for (const c of cases) {
    trackCounts[c.track] = (trackCounts[c.track] || 0) + 1;
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    difficultyCounts[c.difficulty] = (difficultyCounts[c.difficulty] || 0) + 1;
  }
  const staleCount = cases.filter(c => isStale(c.market_context_updated_at)).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Case Library</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginTop: 4 }}>
            {cases.length} cases across {Object.keys(trackCounts).length} tracks
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            fontSize: 12, fontWeight: 500, padding: '8px 20px', borderRadius: 100,
            border: '1px solid rgba(37,99,235,0.30)', background: 'rgba(37,99,235,0.10)',
            color: '#2563EB', cursor: syncing ? 'wait' : 'pointer',
          }}
        >
          {syncing ? '⏳ Syncing…' : '🔄 Sync from Code'}
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {Object.entries(trackCounts).map(([track, count]) => (
          <div key={track} style={{
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, textAlign: 'center',
          }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#2563EB' }}>{count}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginTop: 2 }}>{track} Track</p>
          </div>
        ))}
        <div style={{
          padding: '14px 16px',
          background: staleCount > 0 ? 'rgba(217,119,6,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${staleCount > 0 ? 'rgba(217,119,6,0.15)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 12, textAlign: 'center',
        }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: staleCount > 0 ? '#D97706' : '#16A34A' }}>{staleCount}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginTop: 2 }}>Stale (&gt;90d)</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TRACKS.map(t => (
            <button key={t} onClick={() => setTrackFilter(t)} style={pillStyle(trackFilter === t)}>{t}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.10)' }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={pillStyle(statusFilter === s)}>
              {s === 'All' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '70px 1.5fr 0.6fr 0.7fr 0.8fr 0.8fr 90px 90px',
          padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
          fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.40)',
          letterSpacing: 1, textTransform: 'uppercase',
        }}>
          <span>Code</span>
          <span>Title</span>
          <span>Track</span>
          <span>Difficulty</span>
          <span>Last Updated</span>
          <span>Context Age</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ color: 'rgba(255,255,255,0.40)', marginTop: 16, fontSize: 14 }}>Loading library...</p>
          </div>
        ) : cases.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14 }}>
              No cases found. Click &quot;Sync from Code&quot; to populate the metadata table.
            </p>
          </div>
        ) : (
          cases.map(c => {
            const stale = isStale(c.market_context_updated_at);
            return (
              <div
                key={c.case_code}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1.5fr 0.6fr 0.7fr 0.8fr 0.8fr 90px 90px',
                  padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  alignItems: 'center', fontSize: 13,
                  background: stale ? 'rgba(217,119,6,0.03)' : 'transparent',
                  transition: 'background 200ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = stale ? 'rgba(217,119,6,0.03)' : 'transparent'; }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#2563EB', fontWeight: 600 }}>
                  {c.case_code}
                </span>
                <span style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.title.length > 30 ? c.title.slice(0, 30) + '…' : c.title}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.60)' }}>{c.track}</span>
                <span style={{ color: difficultyColor(c.difficulty), fontWeight: 500, fontSize: 11 }}>
                  {c.difficulty}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: 11 }}>
                  {formatDate(c.last_updated)}
                </span>
                <span style={{
                  fontSize: 11,
                  color: stale ? '#D97706' : 'rgba(255,255,255,0.50)',
                  fontWeight: stale ? 600 : 400,
                }}>
                  {formatDate(c.market_context_updated_at)}
                  {stale && ' ⚠'}
                </span>
                <span>{statusBadge(c.status)}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => setEditCase(c)}
                    style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 6,
                      border: '1px solid rgba(37,99,235,0.20)', background: 'rgba(37,99,235,0.08)',
                      color: '#2563EB', cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  {c.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(c.case_code, 'retiring_soon')}
                      style={{
                        fontSize: 10, padding: '3px 8px', borderRadius: 6,
                        border: '1px solid rgba(220,38,38,0.20)', background: 'rgba(220,38,38,0.06)',
                        color: '#DC2626', cursor: 'pointer',
                      }}
                    >
                      Retire
                    </button>
                  )}
                  {c.status === 'retired' && (
                    <button
                      onClick={() => handleStatusChange(c.case_code, 'active')}
                      style={{
                        fontSize: 10, padding: '3px 8px', borderRadius: 6,
                        border: '1px solid rgba(22,163,74,0.20)', background: 'rgba(22,163,74,0.06)',
                        color: '#16A34A', cursor: 'pointer',
                      }}
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Drawer */}
      <CaseEditDrawer
        caseItem={editCase}
        onClose={() => setEditCase(null)}
        onSave={() => { setEditCase(null); fetchCases(); }}
      />
    </div>
  );
}
