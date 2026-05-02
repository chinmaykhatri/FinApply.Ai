import React from 'react';
import { ApplicationStatus, STATUS_COLORS, STATUS_LABELS } from '@/lib/types';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className="status-badge"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
