'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent, EVENTS } from '@/lib/analytics';

/**
 * Tracks page views automatically on route changes.
 * Mount once in the root layout.
 */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent(EVENTS.PAGE_VIEW, { page: pathname });
  }, [pathname]);

  return null;
}
