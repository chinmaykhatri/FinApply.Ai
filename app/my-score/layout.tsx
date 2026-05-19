import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My FISS Score — FinApply.ai',
  description: 'View your Financial Intelligence Simulation Score, download your report, and share your verified score with employers.',
  robots: { index: false, follow: false },
};

export default function MyScoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
