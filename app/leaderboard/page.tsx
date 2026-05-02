'use client';
import React, { useState, useEffect } from 'react';
import PillButton from '@/components/ui/PillButton';

interface LeaderboardEntry {
  rank: number;
  name: string;
  college: string;
  role: string;
  score: number;
  date: string;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        const json = await res.json();
        if (json.success) setEntries(json.data);
      } catch {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16A34A';
    if (score >= 60) return '#2563EB';
    if (score >= 40) return '#D97706';
    return '#DC2626';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* Header */}
      <header
        style={{
          padding: '20px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            FISS Leaderboard
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginTop: 4 }}>
            Founding Cohort · Batch 1
          </p>
        </div>
        <PillButton variant="outline" onClick={() => window.location.href = '/'}>
          Back to Home
        </PillButton>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {/* Stats bar */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginBottom: 40,
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Candidates Scored', value: entries.length },
            { label: 'Average Score', value: entries.length > 0 ? Math.round(entries.reduce((a, b) => a + b.score, 0) / entries.length) : '--' },
            { label: 'Highest Score', value: entries.length > 0 ? entries[0]?.score : '--' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                minWidth: 140,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '20px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 2fr 2fr 1.5fr 120px',
              padding: '14px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.40)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            <span>Rank</span>
            <span>Name</span>
            <span>Institution</span>
            <span>Track</span>
            <span style={{ textAlign: 'right' }}>FISS Score</span>
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14 }}>Loading leaderboard...</p>
            </div>
          ) : entries.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14 }}>
                No scores yet. Be the first to complete the FISS assessment!
              </p>
              <div style={{ marginTop: 16 }}>
                <PillButton variant="primary" onClick={() => window.location.href = '/'}>
                  Apply Now
                </PillButton>
              </div>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={`${entry.rank}-${entry.name}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 2fr 2fr 1.5fr 120px',
                  padding: '16px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  alignItems: 'center',
                  fontSize: 13,
                  transition: 'background 200ms',
                  background: entry.rank <= 3 ? 'rgba(37,99,235,0.03)' : 'transparent',
                }}
              >
                <span style={{ fontSize: entry.rank <= 3 ? 20 : 13, color: entry.rank <= 3 ? '#fff' : 'rgba(255,255,255,0.30)' }}>
                  {getRankBadge(entry.rank)}
                </span>
                <span style={{ fontWeight: 500, color: '#fff' }}>{entry.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.50)' }}>{entry.college}</span>
                <span style={{ color: 'rgba(255,255,255,0.40)', fontSize: 12 }}>{entry.role}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: getScoreColor(entry.score),
                  }}>
                    {entry.score}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.20)', marginLeft: 2 }}>/100</span>
                  {/* Score bar */}
                  <div style={{
                    marginTop: 4,
                    height: 3,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${entry.score}%`,
                      height: '100%',
                      background: getScoreColor(entry.score),
                      borderRadius: 2,
                      transition: 'width 600ms ease',
                    }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Disclaimer */}
        <p style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,0.20)',
          marginTop: 32,
        }}>
          Names are partially anonymized for privacy. Scores are AI-evaluated and reflect performance in the Deal Room simulation only.
        </p>
      </div>
    </div>
  );
}
