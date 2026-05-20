import type { Metadata } from 'next';

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fin-apply-ai.vercel.app';
  const ogImage = `${appUrl}/api/og?name=Candidate&score=--`;

  return {
    title: 'FISS Score Report — FinApply.ai',
    description: 'View my Financial Intelligence Simulation Score — a rigorous AI-evaluated assessment of financial reasoning, structured thinking, and decision clarity.',
    openGraph: {
      title: 'My FISS Score Report — FinApply.ai',
      description: 'I completed the FinApply Deal Room simulation. Check out my Financial Intelligence Simulation Score!',
      images: [ogImage],
      type: 'website',
      siteName: 'FinApply.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'My FISS Score — FinApply.ai',
      description: 'Financial Intelligence Simulation Score — AI-evaluated assessment',
      images: [ogImage],
    },
  };
}

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
