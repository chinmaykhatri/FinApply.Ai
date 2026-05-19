import { Inngest } from 'inngest';

/**
 * Shared Inngest client — used by both function definitions and event sends.
 * The `id` must match across all usages in this app.
 */
export const inngest = new Inngest({
  id: 'finapply-ai',
});
