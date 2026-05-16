import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinApply.ai — Prove How You Think',
  description:
    'FinApply gives finance candidates a verified capability score based on real deal simulations — not resumes. One 45-minute simulation. One honest signal.',
  keywords: ['finance', 'assessment', 'FISS Score', 'investment banking', 'deal simulation', 'capability', 'finance hiring', 'analyst assessment'],
  metadataBase: new URL('https://fin-apply-ai.vercel.app'),
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'FinApply.ai — Prove How You Think',
    description:
      'A verified capability score based on real deal simulations. One 45-minute simulation. One honest signal.',
    siteName: 'FinApply.ai',
    type: 'website',
    url: 'https://fin-apply-ai.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinApply.ai — Prove How You Think',
    description:
      'A verified capability score based on real deal simulations. One 45-minute simulation. One honest signal.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
