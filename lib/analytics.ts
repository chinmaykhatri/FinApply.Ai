/* ══════════════════════════════════════════════
   PLAUSIBLE ANALYTICS — Lightweight, GDPR-compliant
   No cookies, no consent banner needed
   ══════════════════════════════════════════════ */

/**
 * Track a custom analytics event via Plausible.
 * Safe to call before Plausible loads — calls are silently dropped.
 *
 * Usage:
 *   trackEvent('register', { role: 'Investment Banking' })
 *   trackEvent('dealroom_start')
 *   trackEvent('submission_complete', { word_count: 1200 })
 */
export function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined') return;

  // Plausible attaches itself to window.plausible
  const w = window as unknown as Record<string, unknown>;
  const plausible = w.plausible as
    | ((eventName: string, opts?: { props?: Record<string, string | number | boolean> }) => void)
    | undefined;

  if (plausible) {
    plausible(event, props ? { props } : undefined);
  }
}

/* ── Predefined funnel events ──────────────── */

export const EVENTS = {
  // Acquisition
  PAGE_VIEW: 'pageview', // automatic via Plausible script
  CTA_CLICK: 'cta_click',

  // Registration funnel
  REGISTER_START: 'register_start',
  REGISTER_COMPLETE: 'register_complete',

  // Deal Room funnel
  DEALROOM_EXPLAINED: 'dealroom_explained',
  DEALROOM_START: 'dealroom_start',
  DEALROOM_SUBMIT: 'dealroom_submit',

  // Report funnel
  REPORT_VIEW: 'report_view',
  REPORT_DOWNLOAD: 'report_download',

  // Employer funnel
  EMPLOYER_WAITLIST: 'employer_waitlist',

  // Engagement
  SAMPLE_REPORT_VIEW: 'sample_report_view',
  FISS_LEARN_MORE: 'fiss_learn_more',
  DASHBOARD_VIEW: 'dashboard_view',
} as const;
