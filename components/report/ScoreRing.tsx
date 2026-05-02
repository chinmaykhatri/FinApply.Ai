'use client';
import React, { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({
  score,
  maxScore = 100,
  size = 200,
  strokeWidth = 8,
}: ScoreRingProps) {
  const [animated, setAnimated] = useState(false);
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const progress = score / maxScore;
  const offset = circumference * (1 - progress);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Color based on score
  const getColor = () => {
    if (score >= 80) return '#16A34A';
    if (score >= 60) return '#2563EB';
    if (score >= 40) return '#D97706';
    return '#DC2626';
  };

  const color = getColor();

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : circumference}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 12px ${color}40)`,
          }}
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: size * 0.28,
            fontWeight: 600,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: size * 0.08,
            color: 'rgba(255,255,255,0.40)',
            marginTop: 4,
          }}
        >
          / {maxScore}
        </span>
      </div>
    </div>
  );
}
