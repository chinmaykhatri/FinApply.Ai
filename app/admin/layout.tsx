// Force all /admin routes to be dynamic (never prerendered at build time).
// This prevents the Supabase env var error during `next build` on Vercel,
// since these pages require runtime auth and data fetching anyway.
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
