import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why We Built FinApply — The Finance Hiring Problem',
  description:
    'The finance industry measures pedigree, not capability. FinApply replaces that with a standardised simulation-based assessment — the FISS Score.',
  openGraph: {
    title: 'Why We Built FinApply — The Finance Hiring Problem',
    description:
      'The finance industry measures pedigree, not capability. FinApply replaces that with a standardised simulation-based assessment.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
