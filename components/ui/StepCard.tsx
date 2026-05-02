import React from 'react';

interface StepCardProps {
  step: string;
  title: string;
  description: string;
}

export default function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="card" style={{ padding: 32, flex: 1, minWidth: 0 }}>
      {/* Step pill */}
      <span
        style={{
          display: 'inline-block',
          background: 'rgba(37,99,235,0.15)',
          border: '1px solid rgba(37,99,235,0.30)',
          borderRadius: 100,
          padding: '4px 12px',
          fontSize: 12,
          fontWeight: 500,
          color: '#2563EB',
        }}
      >
        {step}
      </span>

      {/* Title */}
      <h3
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#fff',
          lineHeight: 1.3,
          marginTop: 16,
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.60)',
          lineHeight: 1.6,
          marginTop: 12,
        }}
      >
        {description}
      </p>
    </div>
  );
}
