import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  color?: string;
}

export default function SectionLabel({ children, color }: SectionLabelProps) {
  return (
    <p
      className="section-label"
      style={color ? { color } : undefined}
    >
      {children}
    </p>
  );
}
