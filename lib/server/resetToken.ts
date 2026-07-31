import { randomBytes, createHash } from "crypto";

/**
 * Password-reset tokens: we generate a random raw token to put in the
 * reset link, but only ever store its SHA-256 hash — same pattern as
 * Django/Laravel, so a leaked database dump doesn't hand out usable
 * tokens.
 */

export function generateResetToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashResetToken(raw) };
}

export function hashResetToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
