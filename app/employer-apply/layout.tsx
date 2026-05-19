import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply for Employer Access — FinApply.ai',
  description:
    'Join FinApply as a founding employer partner. Access pre-scored finance candidates through our free 90-day research pilot.',
};

export default function EmployerApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
