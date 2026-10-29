// Plain transactional email through Resend. Callers check RESEND_API_KEY first so the app works without email.

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export const emailConfigured = () => !!process.env.RESEND_API_KEY;

/** Sends a text email (links become clickable in the HTML part). Logs and swallows failures. */
export async function sendEmail(to: string[], subject: string, text: string, replyTo?: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONSULTATION_FROM_EMAIL || 'FindaNChome.com <onboarding@resend.dev>',
      to,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text,
      html: `<div style="font-family:sans-serif;line-height:1.5">${esc(text).replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}</div>`,
    }),
  }).catch(() => null);
  if (!res?.ok) console.error('Email failed:', res?.status ?? 'network error', subject);
}
