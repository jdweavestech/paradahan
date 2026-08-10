/**
 * Admin access is granted by email allowlist via the ADMIN_EMAILS env var
 * (comma-separated, case-insensitive) rather than a stored role field —
 * there's no admin-invite flow yet, so this keeps "who can moderate" a
 * deploy-time config decision instead of something editable in-app.
 *
 * To make yourself an admin locally: add your account's email to
 * ADMIN_EMAILS in .env (see .env.example), then log out and back in.
 */
export function isAdminEmail(email: string): boolean {
  const list = process.env.ADMIN_EMAILS ?? "";
  const allowlist = list
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.trim().toLowerCase());
}
