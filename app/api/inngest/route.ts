import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { evaluateSubmission } from '@/lib/inngest/functions';

/* ══════════════════════════════════════════════
   INNGEST SERVE ENDPOINT
   
   Handles incoming events from Inngest Cloud.
   Register all Inngest functions here.
   
   Inngest dashboard: https://app.inngest.com
   ══════════════════════════════════════════════ */

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [evaluateSubmission],
});
