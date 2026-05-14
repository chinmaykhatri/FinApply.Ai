import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sample FISS Report — FinApply.ai',
  description:
    'See a real FISS Score Report with dimension breakdowns, evidence-based feedback, and actionable improvement guidance.',
  openGraph: {
    title: 'Sample FISS Report — FinApply.ai',
    description: 'See a real FISS Score Report with dimension breakdowns and actionable feedback.',
  },
};

export default function SampleReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
