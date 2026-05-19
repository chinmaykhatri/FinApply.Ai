/* ══════════════════════════════════════════════
   ANALYTICS — Dual-mode: Plausible + Supabase
   GDPR-compliant, no cookies
   ══════════════════════════════════════════════ */

/**
 * Get or create a session ID for the current browser session.
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('fa_sid');
  if (!sid) {
    sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem('fa_sid', sid);
  }
  return sid;
}

/**
 * Track a custom analytics event.
 * - Sends to Plausible if loaded
 * - Stores in localStorage for admin funnel dashboard
 * - Logs to console in dev
 */
export function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined') return;

  // 1. Plausible (if loaded)
  const w = window as unknown as Record<string, unknown>;
  // eslint-disable-next-line no-unused-vars
  const plausible = w.plausible as
    | ((event: string, opts?: { props?: Record<string, string | number | boolean> }) => void)
    | undefined;
  if (plausible) {
    plausible(event, props ? { props } : undefined);
  }

  // 2. Local event store (for admin funnel)
  try {
    const key = 'fa_events';
    const events: FunnelEvent[] = JSON.parse(localStorage.getItem(key) || '[]');
    // Cap at 500 events to prevent unbounded growth
    if (events.length > 500) events.splice(0, events.length - 400);
    events.push({
      event,
      properties: props || {},
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
      page: window.location.pathname,
    });
    localStorage.setItem(key, JSON.stringify(events));
  } catch {
    // localStorage full or unavailable — fail silently
  }

  // 3. Dev logging
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 FA Event:', event, props || '');
  }
}

/* ── Event type for localStorage store ── */
export interface FunnelEvent {
  event: string;
  properties: Record<string, string | number | boolean>;
  timestamp: string;
  session_id: string;
  page: string;
}

/* ── Predefined funnel events ──────────────── */
export const EVENTS = {
  // Acquisition
  PAGE_VIEW: 'page_view',
  CTA_CLICK: 'cta_click',

  // Registration funnel
  REGISTER_START: 'register_start',
  REGISTER_COMPLETE: 'register_complete',

  // Deal Room funnel
  DEALROOM_EXPLAINED: 'dealroom_explained',
  DEALROOM_START: 'dealroom_start',
  WARMUP_DECISION: 'warmup_decision',
  SIMULATION_STARTED: 'simulation_started',
  SIMULATION_IN_PROGRESS: 'simulation_in_progress',
  DEALROOM_SUBMIT: 'dealroom_submit',

  // Report funnel
  REPORT_VIEW: 'report_view',
  REPORT_DOWNLOAD: 'report_download',
  SCORE_PAGE_VIEW: 'score_page_viewed',

  // Sharing
  SHARE_ATTEMPTED: 'share_attempted',

  // Employer funnel
  EMPLOYER_SECTION_VIEW: 'employer_section_viewed',
  EMPLOYER_WAITLIST: 'employer_waitlist',
  EMPLOYER_APPLIED: 'employer_applied',

  // Pricing
  PRICING_VIEW: 'pricing_viewed',
  PRICING_PLAN_CLICK: 'pricing_plan_click',

  // Engagement
  SAMPLE_REPORT_VIEW: 'sample_report_view',
  FISS_LEARN_MORE: 'fiss_learn_more',
  DASHBOARD_VIEW: 'dashboard_view',
} as const;

/* ── Funnel step definitions for admin dashboard ── */
export const FUNNEL_STEPS = [
  { key: 'page_view', label: 'Landing Page Views' },
  { key: 'register_start', label: 'Registration Form Views' },
  { key: 'register_complete', label: 'Registrations' },
  { key: 'dealroom_start', label: 'Deal Room Opened' },
  { key: 'dealroom_submit', label: 'Simulations Submitted' },
  { key: 'report_view', label: 'Reports Delivered' },
  { key: 'share_attempted', label: 'Score Shared' },
] as const;

/**
 * Read all stored funnel events from localStorage.
 */
export function getFunnelEvents(): FunnelEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('fa_events') || '[]');
  } catch {
    return [];
  }
}

/**
 * Compute funnel metrics from stored events.
 */
export function computeFunnel(events: FunnelEvent[]) {
  const counts: Record<string, number> = {};
  for (const step of FUNNEL_STEPS) {
    counts[step.key] = events.filter(e => e.event === step.key).length;
  }

  const steps = FUNNEL_STEPS.map((step, i) => {
    const count = counts[step.key] || 0;
    const prev = i > 0 ? (counts[FUNNEL_STEPS[i - 1].key] || 0) : count;
    const conversionRate = prev > 0 ? (count / prev) * 100 : 0;
    const dropoff = prev > 0 ? ((prev - count) / prev) * 100 : 0;
    return { ...step, count, conversionRate, dropoff };
  });

  // Overall
  const totalRegistrations = counts['register_complete'] || 0;
  const totalSubmissions = counts['dealroom_submit'] || 0;
  const totalShares = counts['share_attempted'] || 0;
  const totalReports = counts['report_view'] || 0;
  const shareRate = totalReports > 0 ? (totalShares / totalReports) * 100 : 0;

  // 7-day count
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const recentRegistrations = events.filter(e => e.event === 'register_complete' && e.timestamp > sevenDaysAgo).length;
  const employerApps = events.filter(e => e.event === 'employer_applied').length;

  return { steps, totalRegistrations, totalSubmissions, totalShares, shareRate, recentRegistrations, employerApps };
}
