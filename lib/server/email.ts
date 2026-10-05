import nodemailer from "nodemailer";

/**
 * Transactional email. Two free providers are supported — set up either one:
 *
 * - SMTP (e.g. a Gmail account + app password): SMTP_USER and SMTP_PASS.
 *   Needs no domain, so it's the easy option on a *.vercel.app site.
 * - Resend's HTTP API: RESEND_API_KEY and EMAIL_FROM (a sender on a domain
 *   you've verified in Resend, e.g. "Paradahan <no-reply@yourdomain.com>").
 *
 * SMTP wins if both are configured.
 */

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function isEmailConfigured(): boolean {
  return isSmtpConfigured() || isResendConfigured();
}

interface EmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}

async function sendViaSmtp(input: EmailInput): Promise<void> {
  const port = Number(process.env.SMTP_PORT) || 465;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.EMAIL_FROM || `Paradahan <${process.env.SMTP_USER}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}

async function sendViaResend(input: EmailInput): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Resend returned ${res.status}: ${await res.text()}`);
}

export async function sendEmail(input: EmailInput): Promise<boolean> {
  if (!isEmailConfigured()) return false;

  try {
    if (isSmtpConfigured()) await sendViaSmtp(input);
    else await sendViaResend(input);
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

/**
 * Tells every admin (ADMIN_EMAILS) that something is waiting in /admin.
 * Best effort: never throws, and is a no-op when email isn't configured.
 */
export async function notifyAdmins(input: {
  subject: string;
  lines: string[];
  section: "submissions" | "reports" | "messages";
  origin: string;
}): Promise<void> {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (admins.length === 0 || !isEmailConfigured()) return;

  const base = process.env.APP_URL?.replace(/\/$/, "") || input.origin;
  const link = `${base}/admin?section=${input.section}`;
  await sendEmail({
    to: admins,
    subject: `[Paradahan] ${input.subject}`,
    text: `${input.lines.join("\n")}\n\nOpen the moderation panel: ${link}`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;color:#111827">
  ${input.lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
  <p><a href="${link}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Open moderation panel</a></p>
</div>`,
  });
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
