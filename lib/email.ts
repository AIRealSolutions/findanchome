// Plain transactional email through Resend. Callers check RESEND_API_KEY first so the app works without email.

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Resend's shared test address: it only delivers to the Resend account owner's own inbox. */
const TEST_SENDER = 'FindaNChome.com <onboarding@resend.dev>';

export const emailConfigured = () => !!process.env.RESEND_API_KEY;
export const emailSender = () => process.env.CONSULTATION_FROM_EMAIL || TEST_SENDER;
/** True while emails go out from Resend's test address, which can't reach clients. */
export const usingTestSender = () => /@resend\.dev>?\s*$/i.test(emailSender());

/** Sends a text email (links become clickable in the HTML part) and reports what Resend said. */
export async function deliverEmail(to: string[], subject: string, text: string, replyTo?: string): Promise<{ ok: boolean; error?: string }> {
  if (!emailConfigured()) return { ok: false, error: 'RESEND_API_KEY is not set.' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: emailSender(),
        to,
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        text,
        html: `<div style="font-family:sans-serif;line-height:1.5">${esc(text).replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}</div>`,
      }),
    });
    if (res.ok) return { ok: true };
    const body = await res.json().catch(() => null);
    return { ok: false, error: body?.message ? `${body.message} (${res.status})` : `Resend responded ${res.status}` };
  } catch {
    return { ok: false, error: 'Could not reach the email service.' };
  }
}

/** Same as deliverEmail, for callers that carry on either way. Logs failures. */
export async function sendEmail(to: string[], subject: string, text: string, replyTo?: string) {
  const r = await deliverEmail(to, subject, text, replyTo);
  if (!r.ok) console.error('Email failed:', r.error, subject);
}
