/**
 * Transactional email via Resend's HTTP API (no SDK needed). Configure with
 * RESEND_API_KEY and EMAIL_FROM (a sender on a domain you've verified in
 * Resend, e.g. "Paradahan <no-reply@yourdomain.com>").
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  if (!isEmailConfigured()) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[email] Resend returned ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

export function passwordResetEmail(name: string, resetUrl: string) {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  return {
    subject: "Reset your Paradahan password",
    text: `Hi ${firstName},\n\nSomeone (hopefully you) asked to reset your Paradahan password. Open this link within 1 hour to choose a new one:\n\n${resetUrl}\n\nIf you didn't ask for this, you can ignore this email.\n\n— Paradahan`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;color:#111827">
  <p>Hi ${escapeHtml(firstName)},</p>
  <p>Someone (hopefully you) asked to reset your Paradahan password. The link below works for 1 hour.</p>
  <p><a href="${resetUrl}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Reset password</a></p>
  <p style="color:#6B7280;font-size:13px">If you didn't ask for this, you can ignore this email.</p>
</div>`,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
