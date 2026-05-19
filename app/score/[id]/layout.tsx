import { createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  let title = 'FISS Score — FinApply.ai';
  let description = 'Verified capability score from a finance deal simulation. See how this candidate thinks.';

  try {
    const supabase = createAdminClient();
    const { data: app } = await supabase
      .from('applications')
      .select('full_name, target_role, fiss_reports(total_score, percentile)')
      .eq('share_id', id)
      .single();

    if (app) {
      const reports = app.fiss_reports as Record<string, unknown>[];
      if (reports && reports.length > 0) {
        const r = reports[0];
        title = `${app.full_name} — FISS Score: ${r.total_score}/100 — FinApply.ai`;
        description = `${app.full_name} scored ${r.total_score}/100 (${r.percentile}). Verified capability score from FinApply.ai deal simulation.`;
      }
    }
  } catch {
    // Use defaults
  }

  const baseUrl = 'https://fin-apply-ai.vercel.app';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/score/${id}`,
      siteName: 'FinApply.ai',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function ScoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
