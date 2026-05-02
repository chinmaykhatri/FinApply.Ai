import React from 'react';

interface SectionHeadingProps {
  children: React.ReactNode;
  maxWidth?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 56,
};

export default function SectionHeading({
  children,
  maxWidth,
  size = 'lg',
}: SectionHeadingProps) {
  return (
    <h2
      className="section-heading"
      style={{
        fontSize: SIZES[size],
        maxWidth: maxWidth ? `${maxWidth}px` : undefined,
        margin: maxWidth ? '0 auto' : undefined,
      }}
    >
      {children}
    </h2>
  );
}
