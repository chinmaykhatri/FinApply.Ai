'use client';
import React, { useEffect, useRef, useState } from 'react';
import { GRADE_COLORS } from '@/lib/types';

interface DimensionCardProps {
  name: string;
  score: number;
  maxScore: number;
  grade: string;
  rationale: string;
  evidence: string;
  improvement: string;
  delay?: number;
}

export default function DimensionCard({
  name,
  score,
  maxScore,
  grade,
  rationale,
  evidence,
  improvement,
  delay = 0,
}: DimensionCardProps) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const percentage = (score / maxScore) * 100;
  const colors = GRADE_COLORS[grade] || GRADE_COLORS['Adequate'];

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="card-static" ref={ref} style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{name}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
          {score}/{maxScore}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-track progress-track-lg" style={{ marginTop: 8 }}>
        <div
          className="progress-fill"
          style={{
            width: animated ? `${percentage}%` : '0%',
            transition: `width 1s ease-out ${delay}ms`,
          }}
        />
      </div>

      {/* Grade badge */}
      <div style={{ marginTop: 8 }}>
        <span
          className="grade-badge"
          style={{
            background: colors.bg,
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          {grade}
        </span>
      </div>

      {/* Rationale */}
      <p
        style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.5,
          marginTop: 12,
        }}
      >
        {rationale}
      </p>

      {/* Evidence */}
      <div
        style={{
          marginTop: 8,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 8,
          padding: '10px 14px',
          borderLeft: '2px solid rgba(255,255,255,0.15)',
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.40)',
            fontStyle: 'italic',
          }}
        >
          {evidence}
        </p>
      </div>

      {/* Improvement tip */}
      <div
        style={{
          marginTop: 16,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 16,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.30)',
            letterSpacing: 2,
            marginBottom: 6,
          }}
        >
          TO IMPROVE
        </p>
        <p
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.60)',
            lineHeight: 1.5,
          }}
        >
          {improvement}
        </p>
      </div>
    </div>
  );
}
