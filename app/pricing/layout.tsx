import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employer Pricing — FinApply.ai',
  description:
    'Simple pricing with measurable ROI. Every plan starts with a free 90-day research pilot. No credit card required.',
  openGraph: {
    title: 'Employer Pricing — FinApply.ai',
    description:
      'Simple pricing with measurable ROI. Access pre-scored finance candidates through verified FISS Score assessments.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
