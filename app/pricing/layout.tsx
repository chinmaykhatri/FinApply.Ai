import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Employers — FinApply.ai',
  description:
    'Join FinApply as a founding employer partner. 5 spots available. Free 90-day research pilot with full access to FISS Score profiles.',
  openGraph: {
    title: 'For Employers — FinApply.ai',
    description:
      'Founding Employer Cohort — 5 spots available. Free 90-day pilot with assessed candidates for your open roles.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
