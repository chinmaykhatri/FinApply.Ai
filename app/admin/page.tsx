'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import PillButton from '@/components/ui/PillButton';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import type { ApplicationStatus, DimensionScore } from '@/lib/types';
import FinApplyLogo from '@/components/ui/FinApplyLogo';
import CaseAnalytics from '@/components/admin/CaseAnalytics';
import CaseLibraryTab from '@/components/admin/CaseLibraryTab';

interface FissReportData {
  id: string;
  total_score: number;
  percentile: string;
  financial_reasoning: DimensionScore;
  structured_thinking: DimensionScore;
  risk_identification: DimensionScore;
  decision_clarity: DimensionScore;
  standout_strength: string;
  critical_gap: string;
  evaluator_summary: string;
  pdf_url?: string;
  loom_url?: string;
}

interface CandidateData {
  id: string;
  full_name: string;
  email: string;
  college_or_firm: string;
  target_role: string;
  status: ApplicationStatus;
  created_at: string;
  deal_room_token: string;
  report_token: string;
  linkedin_url?: string;
  simulations?: Array<{
    id: string;
    word_count: number;
    time_taken_seconds: number;
    content: string;
    case_code: string;
    tab_violations?: number;
    paste_count?: number;
    large_paste_count?: number;
    typing_bursts?: number;
    integrity_score?: number;
  }>;
  fiss_reports?: FissReportData[];
}

const GRADES = ['Strong', 'Adequate', 'Developing', 'Critical Gap'];

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CandidateData | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [evaluating, setEvaluating] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [sendingReport, setSendingReport] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batchEvaluating, setBatchEvaluating] = useState(false);
  const [adminTab, setAdminTab] = useState<'candidates' | 'cases' | 'library'>('candidates');

  // Override form state
  const [overrideData, setOverrideData] = useState({
    fr: { score: 0, grade: 'Adequate', rationale: '', evidence: '', improvement: '' },
    st: { score: 0, grade: 'Adequate', rationale: '', evidence: '', improvement: '' },
    ri: { score: 0, grade: 'Adequate', rationale: '', evidence: '', improvement: '' },
    dc: { score: 0, grade: 'Adequate', rationale: '', evidence: '', improvement: '' },
    standout_strength: '',
    critical_gap: '',
    evaluator_summary: '',
    loom_url: '',
  });

  const supabase = createClient();

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/candidates');
      const json = await res.json();
      if (json.data) setCandidates(json.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleStatusUpdate = async (id: string, status: ApplicationStatus) => {
    await fetch('/api/admin/candidates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });

    // Fire Make.com webhook for accept/reject emails
    if (status === 'dealroom_sent' || status === 'rejected') {
      const candidate = candidates.find((c) => c.id === id);
      if (candidate) {
        try {
          await fetch('/api/admin/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: status === 'dealroom_sent' ? 'accept' : 'reject',
              application_id: id,
            }),
          });
        } catch {
          // Email send is best-effort; don't block status update
        }
      }
    }

    fetchCandidates();
  };

  /* ── AI Evaluate ── */
  const handleAIEvaluate = async (candidate: CandidateData) => {
    const sim = candidate.simulations?.[0];
    if (!sim) return alert('No simulation found for this candidate.');

    setEvaluating(candidate.id);
    try {
      const res = await fetch('/api/admin/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: candidate.id,
          simulation_id: sim.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(`Evaluation failed: ${json.error}`);
      } else {
        if (json.ai_flags?.ai_generated) {
          alert(`⚠️ AI-generated flag detected!\n${json.ai_flags.ai_flag_reason}`);
        }
      }
      fetchCandidates();
    } catch {
      alert('Evaluation request failed. Check your API key.');
    } finally {
      setEvaluating(null);
    }
  };

  /* ── Open Override Modal ── */
  const openOverrideModal = (candidate: CandidateData) => {
    setSelected(candidate);
    const r = candidate.fiss_reports?.[0];
    if (r) {
      setOverrideData({
        fr: { ...r.financial_reasoning },
        st: { ...r.structured_thinking },
        ri: { ...r.risk_identification },
        dc: { ...r.decision_clarity },
        standout_strength: r.standout_strength,
        critical_gap: r.critical_gap,
        evaluator_summary: r.evaluator_summary,
        loom_url: r.loom_url || '',
      });
    }
    setShowOverrideModal(true);
  };

  /* ── Save Override ── */
  const handleSaveOverride = async () => {
    if (!selected?.fiss_reports?.[0]) return;
    const reportId = selected.fiss_reports[0].id;
    const originalScore = selected.fiss_reports[0].total_score;
    const totalScore = overrideData.fr.score + overrideData.st.score + overrideData.ri.score + overrideData.dc.score;

    await fetch('/api/admin/score', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_id: reportId,
        total_score: totalScore,
        financial_reasoning: overrideData.fr,
        structured_thinking: overrideData.st,
        risk_identification: overrideData.ri,
        decision_clarity: overrideData.dc,
        standout_strength: overrideData.standout_strength,
        critical_gap: overrideData.critical_gap,
        evaluator_summary: overrideData.evaluator_summary,
        loom_url: overrideData.loom_url || null,
      }),
    });

    // Log the calibration override for audit
    if (totalScore !== originalScore) {
      try {
        await fetch('/api/admin/calibration-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            application_id: selected.id,
            admin_email: 'admin@finapply.ai',
            original_score: originalScore,
            override_score: totalScore,
            dimension: 'total_score',
            reason: `Manual override: FR=${overrideData.fr.score}, ST=${overrideData.st.score}, RI=${overrideData.ri.score}, DC=${overrideData.dc.score}`,
          }),
        });
      } catch { /* calibration log is best-effort */ }
    }

    setShowOverrideModal(false);
    fetchCandidates();
  };

  /* ── Generate PDF ── */
  const handleGeneratePdf = async (candidate: CandidateData) => {
    setGeneratingPdf(candidate.id);
    try {
      const res = await fetch('/api/admin/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: candidate.id }),
      });
      const json = await res.json();
      if (res.ok) {
        if (json.pdf_url) {
          // Open PDF in new tab
          window.open(json.pdf_url, '_blank');
        } else if (json.pdf_base64) {
          // Download from base64
          const byteCharacters = atob(json.pdf_base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = json.filename || 'FISS_Report.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        if (json.message) alert(json.message);
      } else {
        alert(`PDF failed: ${json.error}`);
      }
      fetchCandidates();
    } catch {
      alert('PDF generation request failed.');
    } finally {
      setGeneratingPdf(null);
    }
  };

  /* ── Send Report ── */
  const handleSendReport = async (candidate: CandidateData) => {
    if (!confirm(`Send FISS report to ${candidate.full_name} (${candidate.email})?`)) return;
    setSendingReport(candidate.id);
    try {
      const res = await fetch('/api/admin/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: candidate.id }),
      });
      const json = await res.json();
      if (res.ok) {
        alert(`Report sent to ${candidate.email}!`);
      } else {
        alert(`Send failed: ${json.error}`);
      }
      fetchCandidates();
    } catch {
      alert('Send request failed.');
    } finally {
      setSendingReport(null);
    }
  };

  /* ── Send Follow-up ── */
  const handleSendFollowUp = async (candidate: CandidateData, day: number) => {
    if (!confirm(`Send Day ${day} follow-up to ${candidate.full_name}?`)) return;
    try {
      const res = await fetch('/api/admin/send-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: candidate.id,
          milestone_day: day,
        }),
      });
      if (res.ok) {
        alert(`Day ${day} follow-up sent to ${candidate.email}!`);
      } else {
        alert('Follow-up send failed.');
      }
    } catch {
      alert('Follow-up request failed.');
    }
  };

  const stats = {
    total: candidates.length,
    applied: candidates.filter((c) => c.status === 'applied').length,
    submitted: candidates.filter((c) => c.status === 'submitted').length,
    scored: candidates.filter((c) => c.status === 'scored' || c.status === 'report_sent').length,
  };

  // Search & filter
  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.college_or_firm?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Batch evaluate all pending
  const handleBatchEvaluate = async () => {
    const pending = candidates.filter(
      (c) => c.status === 'submitted' && c.simulations && c.simulations.length > 0 && !c.fiss_reports?.length
    );
    if (pending.length === 0) return alert('No pending submissions to evaluate.');
    if (!confirm(`Evaluate ${pending.length} candidates? This will call the AI for each.`)) return;

    setBatchEvaluating(true);
    let success = 0;
    let fail = 0;

    for (const c of pending) {
      try {
        const res = await fetch('/api/admin/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ application_id: c.id, simulation_id: c.simulations![0].id }),
        });
        if (res.ok) success++;
        else fail++;
      } catch {
        fail++;
      }
    }

    setBatchEvaluating(false);
    alert(`Batch complete: ${success} scored, ${fail} failed.`);
    fetchCandidates();
  };

  /* ── Dimension editor helper ── */
  const DimensionEditor = ({ label, dim, onChange }: {
    label: string;
    dim: { score: number; grade: string; rationale: string; evidence: string; improvement: string };
    onChange: (d: typeof dim) => void;
  }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{label}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number" min="1" max="25"
            value={dim.score}
            onChange={(e) => onChange({ ...dim, score: Number(e.target.value) })}
            style={{ width: 50, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 13, textAlign: 'center' }}
          />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>/25</span>
          <select
            value={dim.grade}
            onChange={(e) => onChange({ ...dim, grade: e.target.value })}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 12 }}
          >
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <textarea
        placeholder="Rationale..."
        value={dim.rationale}
        onChange={(e) => onChange({ ...dim, rationale: e.target.value })}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 8, color: '#fff', fontSize: 12, minHeight: 40, resize: 'vertical', marginBottom: 6 }}
      />
      <input
        placeholder="Evidence quote..."
        value={dim.evidence}
        onChange={(e) => onChange({ ...dim, evidence: e.target.value })}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 8, color: '#fff', fontSize: 12, marginBottom: 6 }}
      />
      <input
        placeholder="Improvement tip..."
        value={dim.improvement}
        onChange={(e) => onChange({ ...dim, improvement: e.target.value })}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 8, color: '#fff', fontSize: 12 }}
      />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* Admin Nav */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 60px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div>
          <FinApplyLogo size="sm" />
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.40)',
              marginLeft: 12,
              background: 'rgba(255,255,255,0.06)',
              padding: '4px 10px',
              borderRadius: 100,
            }}
          >
            Admin
          </span>
        </div>
        <PillButton variant="outline" onClick={handleLogout}>
          Sign Out
        </PillButton>
      </header>

      {/* Content */}
      <div style={{ padding: '40px 60px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 24 }}>
          Admin Dashboard
        </h1>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 0 }}>
          {[
            { key: 'candidates' as const, label: 'Candidates', icon: '👤' },
            { key: 'cases' as const, label: 'Case Analytics', icon: '📊' },
            { key: 'library' as const, label: 'Case Library', icon: '📚' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setAdminTab(tab.key)}
              style={{
                fontSize: 13, fontWeight: 500, padding: '10px 20px',
                background: adminTab === tab.key ? 'rgba(37,99,235,0.10)' : 'transparent',
                border: 'none',
                borderBottom: adminTab === tab.key ? '2px solid #2563EB' : '2px solid transparent',
                color: adminTab === tab.key ? '#2563EB' : 'rgba(255,255,255,0.40)',
                cursor: 'pointer', transition: 'all 200ms ease',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Cases Tab */}
        {adminTab === 'cases' && <CaseAnalytics />}

        {/* Library Tab */}
        {adminTab === 'library' && <CaseLibraryTab />}

        {/* Candidates Tab */}
        {adminTab === 'candidates' && (<>

        {/* Metrics */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard label="Total Applications" value={stats.total} />
          <StatCard label="Pending Review" value={stats.applied} />
          <StatCard label="Submitted" value={stats.submitted} />
          <StatCard label="Scored" value={stats.scored} />
        </div>

        {/* Test Deal Room */}
        <div
          style={{
            marginBottom: 40,
            padding: 24,
            background: 'rgba(217,119,6,0.04)',
            border: '1px solid rgba(217,119,6,0.12)',
            borderRadius: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#D97706' }}>Test Deal Room Simulation</h3>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', marginBottom: 16 }}>
            Preview the full Deal Room experience as a candidate. Select a role track to test:
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Investment Banking', role: 'Investment Banking Analyst' },
              { label: 'Private Equity', role: 'Private Equity Associate' },
              { label: 'Big 4 Advisory', role: 'Big 4 Advisory Analyst' },
              { label: 'Corporate Finance', role: 'Corporate Finance Analyst' },
              { label: 'Equity Research', role: 'Equity Research Analyst' },
            ].map((track) => (
              <a
                key={track.role}
                href={`/admin/test-dealroom?role=${encodeURIComponent(track.role)}`}
                style={{
                  fontSize: 12, fontWeight: 500, padding: '8px 16px', borderRadius: 100,
                  border: '1px solid rgba(37,99,235,0.25)', background: 'rgba(37,99,235,0.08)',
                  color: '#2563EB', cursor: 'pointer', textDecoration: 'none', transition: 'all 200ms ease',
                }}
              >
                {track.label} →
              </a>
            ))}
          </div>
        </div>

        {/* Search + Filter + Batch */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            id="admin-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, college..."
            style={{
              flex: 1, minWidth: 200, padding: '10px 16px', fontSize: 13,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 10, color: '#fff', outline: 'none', fontFamily: 'var(--font-family)',
            }}
          />
          <select
            id="admin-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 16px', fontSize: 13, background: '#111',
              border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10,
              color: '#fff', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="dealroom_sent">Deal Room Sent</option>
            <option value="submitted">Submitted</option>
            <option value="scored">Scored</option>
            <option value="report_sent">Report Sent</option>
            <option value="rejected">Rejected</option>
          </select>
          <PillButton
            variant="primary"
            onClick={handleBatchEvaluate}
            loading={batchEvaluating}
          >
            ⚡ Evaluate All ({candidates.filter(c => c.status === 'submitted' && !c.fiss_reports?.length).length})
          </PillButton>
        </div>

        {/* Table */}
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.5fr 1fr 0.7fr 0.8fr 2fr',
              padding: '14px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)',
              letterSpacing: 1, textTransform: 'uppercase',
            }}
          >
            <span>Name</span>
            <span>Email</span>
            <span>Institution</span>
            <span>Status</span>
            <span>Score</span>
            <span>Integrity</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
              <p style={{ color: 'rgba(255,255,255,0.40)', marginTop: 16, fontSize: 14 }}>Loading candidates...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14 }}>
                {candidates.length === 0 ? 'No applications yet. Share the landing page to start receiving candidates.' : 'No candidates match your search.'}
              </p>
            </div>
          ) : (
            filteredCandidates.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1.5fr 1fr 0.7fr 0.8fr 2fr',
                  padding: '14px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  alignItems: 'center', fontSize: 13, transition: 'background 200ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 500, color: '#fff' }}>{c.full_name}</span>
                  {c.linkedin_url && (
                    <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: '#2563EB', textDecoration: 'none' }} title="LinkedIn">
                      🔗
                    </a>
                  )}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.50)' }}>{c.email}</span>
                <span style={{ color: 'rgba(255,255,255,0.50)' }}>{c.college_or_firm}</span>
                <span><StatusBadge status={c.status} /></span>
                <span style={{ color: '#fff', fontWeight: 500 }}>
                  {c.fiss_reports?.[0]?.total_score || '—'}
                </span>

                {/* Integrity Score */}
                <span>
                  {(() => {
                    const sim = c.simulations?.[0];
                    if (!sim || sim.integrity_score === undefined) return <span style={{ color: 'rgba(255,255,255,0.20)' }}>—</span>;
                    const s = sim.integrity_score;
                    const color = s >= 80 ? '#16A34A' : s >= 50 ? '#D97706' : '#DC2626';
                    const bg = s >= 80 ? 'rgba(22,163,74,0.10)' : s >= 50 ? 'rgba(217,119,6,0.10)' : 'rgba(220,38,38,0.10)';
                    const border = s >= 80 ? 'rgba(22,163,74,0.20)' : s >= 50 ? 'rgba(217,119,6,0.20)' : 'rgba(220,38,38,0.20)';
                    const label = s >= 80 ? '✓ Clean' : s >= 50 ? '⚠ Flagged' : '🚨 Suspicious';
                    return (
                      <span
                        title={`Score: ${s}/100 | Tabs: ${sim.tab_violations||0} | Pastes: ${sim.paste_count||0} (${sim.large_paste_count||0} large) | Bursts: ${sim.typing_bursts||0}`}
                        style={{
                          fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 100,
                          background: bg, border: `1px solid ${border}`, color, cursor: 'help',
                        }}
                      >
                        {label}
                      </span>
                    );
                  })()}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {/* Applied → Send DR */}
                  {c.status === 'applied' && (
                    <button
                      onClick={async () => {
                        await handleStatusUpdate(c.id, 'dealroom_sent');
                        const link = `${window.location.origin}/dealroom/${c.deal_room_token}`;
                        await navigator.clipboard.writeText(link);
                        alert(`Deal Room link copied!\n\nSend to ${c.full_name}:\n${link}`);
                      }}
                      style={{ fontSize: 11, color: '#2563EB', background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
                    >
                      Send DR
                    </button>
                  )}

                  {/* DR sent / submitted → copy link */}
                  {(c.status === 'dealroom_sent' || c.status === 'submitted') && (
                    <button
                      onClick={async () => {
                        const link = `${window.location.origin}/dealroom/${c.deal_room_token}`;
                        await navigator.clipboard.writeText(link);
                        alert(`Deal Room link copied!\n${link}`);
                      }}
                      style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
                    >
                      🔗 DR
                    </button>
                  )}

                  {/* Submitted → AI Evaluate */}
                  {c.status === 'submitted' && (
                    <button
                      onClick={() => handleAIEvaluate(c)}
                      disabled={evaluating === c.id}
                      style={{
                        fontSize: 11, color: '#8B5CF6', background: 'rgba(139,92,246,0.10)',
                        border: '1px solid rgba(139,92,246,0.20)', borderRadius: 6, padding: '4px 8px',
                        cursor: evaluating === c.id ? 'wait' : 'pointer', opacity: evaluating === c.id ? 0.6 : 1,
                      }}
                    >
                      {evaluating === c.id ? '⏳ Evaluating...' : '🤖 AI Evaluate'}
                    </button>
                  )}

                  {/* Scored → Override / Generate PDF / Send Report */}
                  {(c.status === 'scored' || c.status === 'report_sent') && (
                    <>
                      <button
                        onClick={() => openOverrideModal(c)}
                        style={{ fontSize: 11, color: '#D97706', background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.20)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
                      >
                        ✏️ Override
                      </button>
                      <button
                        onClick={() => handleGeneratePdf(c)}
                        disabled={generatingPdf === c.id}
                        style={{ fontSize: 11, color: '#16A34A', background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.20)', borderRadius: 6, padding: '4px 8px', cursor: generatingPdf === c.id ? 'wait' : 'pointer' }}
                      >
                        {generatingPdf === c.id ? '⏳ ...' : '📄 PDF'}
                      </button>
                      <button
                        onClick={async () => {
                          const link = `${window.location.origin}/report/${c.report_token}`;
                          await navigator.clipboard.writeText(link);
                          alert(`Report link copied!\nSend to ${c.full_name}:\n${link}`);
                          if (c.status === 'scored') handleStatusUpdate(c.id, 'report_sent');
                        }}
                        style={{ fontSize: 11, color: '#8B5CF6', background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.20)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
                      >
                        📋 Report
                      </button>
                      <button
                        onClick={() => handleSendReport(c)}
                        disabled={sendingReport === c.id}
                        style={{ fontSize: 11, color: '#2563EB', background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.20)', borderRadius: 6, padding: '4px 8px', cursor: sendingReport === c.id ? 'wait' : 'pointer' }}
                      >
                        {sendingReport === c.id ? '⏳ ...' : '📧 Send'}
                      </button>
                      {/* Follow-up buttons */}
                      {c.status === 'report_sent' && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                          {[30, 60, 90].map((day) => (
                            <button
                              key={day}
                              onClick={() => handleSendFollowUp(c, day)}
                              style={{
                                fontSize: 10, color: '#D97706',
                                background: 'rgba(217,119,6,0.08)',
                                border: '1px solid rgba(217,119,6,0.15)',
                                borderRadius: 4, padding: '2px 6px', cursor: 'pointer',
                              }}
                            >
                              D{day}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        </>)}
      </div>

      {/* Override Modal */}
      <Modal isOpen={showOverrideModal} onClose={() => setShowOverrideModal(false)} maxWidth={700}>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
          Override Scores: {selected?.full_name}
        </h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginBottom: 20 }}>
          Total: {overrideData.fr.score + overrideData.st.score + overrideData.ri.score + overrideData.dc.score}/100
        </p>

        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
          <DimensionEditor label="Financial Reasoning" dim={overrideData.fr} onChange={(d) => setOverrideData({ ...overrideData, fr: d })} />
          <DimensionEditor label="Structured Thinking" dim={overrideData.st} onChange={(d) => setOverrideData({ ...overrideData, st: d })} />
          <DimensionEditor label="Risk Identification" dim={overrideData.ri} onChange={(d) => setOverrideData({ ...overrideData, ri: d })} />
          <DimensionEditor label="Decision Clarity" dim={overrideData.dc} onChange={(d) => setOverrideData({ ...overrideData, dc: d })} />

          <textarea
            placeholder="Standout Strength..."
            value={overrideData.standout_strength}
            onChange={(e) => setOverrideData({ ...overrideData, standout_strength: e.target.value })}
            style={{ width: '100%', background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: 8, padding: 10, color: '#fff', fontSize: 12, minHeight: 50, resize: 'vertical', marginBottom: 8 }}
          />
          <textarea
            placeholder="Critical Gap..."
            value={overrideData.critical_gap}
            onChange={(e) => setOverrideData({ ...overrideData, critical_gap: e.target.value })}
            style={{ width: '100%', background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: 8, padding: 10, color: '#fff', fontSize: 12, minHeight: 50, resize: 'vertical', marginBottom: 8 }}
          />
          <textarea
            placeholder="Evaluator Summary (one-liner)..."
            value={overrideData.evaluator_summary}
            onChange={(e) => setOverrideData({ ...overrideData, evaluator_summary: e.target.value })}
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10, color: '#fff', fontSize: 12, minHeight: 40, resize: 'vertical', marginBottom: 8 }}
          />
          <input
            placeholder="Loom walkthrough URL (optional) — e.g. https://www.loom.com/share/abc123"
            value={overrideData.loom_url}
            onChange={(e) => setOverrideData({ ...overrideData, loom_url: e.target.value })}
            style={{ width: '100%', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 8, padding: 10, color: '#fff', fontSize: 12 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <PillButton variant="outline" onClick={() => setShowOverrideModal(false)}>Cancel</PillButton>
          <PillButton variant="primary" onClick={handleSaveOverride}>Save Override</PillButton>
        </div>
      </Modal>

      <style jsx>{`
        @media (max-width: 1024px) {
          header, div[style*="padding: '40px 60px'"] {
            padding: 20px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
