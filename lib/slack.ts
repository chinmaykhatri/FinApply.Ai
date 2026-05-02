/* ═══════════════════════════════════════════════
   Slack Webhook — FinApply.ai
   Non-blocking notifications to Slack channel
   ═══════════════════════════════════════════════ */

/**
 * Send a message to the configured Slack webhook.
 * Silently skips if SLACK_WEBHOOK_URL is not set.
 */
export async function notifySlack(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return; // Silently skip if not configured

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        unfurl_links: false,
      }),
    });
  } catch (err) {
    console.error('Slack notification failed:', err);
  }
}
