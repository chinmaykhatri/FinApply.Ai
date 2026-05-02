import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeColor?: string;
}

export default function StatCard({ label, value, change, changeColor = '#16A34A' }: StatCardProps) {
  return (
    <div className="card-static" style={{ padding: '24px 28px', flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.30)',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 40, fontWeight: 600, color: '#fff', marginTop: 8 }}>
        {value}
      </p>
      {change && (
        <p style={{ fontSize: 13, color: changeColor, marginTop: 4 }}>
          {change}
        </p>
      )}
    </div>
  );
}
