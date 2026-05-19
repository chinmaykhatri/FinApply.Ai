'use client';
import React from 'react';

interface PillButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'disabled';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  large?: boolean;
  type?: 'button' | 'submit';
  icon?: React.ReactNode;
  href?: string;
  className?: string;
}

export default function PillButton({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  large = false,
  type = 'button',
  icon,
  href,
  className = '',
}: PillButtonProps) {
  const isDisabled = disabled || loading;
  const variantClass = isDisabled ? 'pill-btn-disabled' : `pill-btn-${variant}`;
  const fullClass = fullWidth ? 'pill-btn-full' : '';
  const lgClass = large ? 'pill-btn-lg' : '';

  const inner = (
    <span className={`pill-btn-inner`}>
      {loading && <span className="btn-spinner" />}
      {icon && !loading && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      {loading ? 'Submitting...' : children}
    </span>
  );

  if (href && !isDisabled) {
    return (
      <a
        href={href}
        className={`pill-btn ${variantClass} ${fullClass} ${lgClass} ${className}`}
        onClick={onClick}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={`pill-btn ${variantClass} ${fullClass} ${lgClass} ${className}`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {inner}
    </button>
  );
}
