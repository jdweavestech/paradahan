import { createHmac, timingSafeEqual } from "crypto";

/**
 * Minimal signed-token implementation (HMAC-SHA256), so we don't need an
 * external JWT library. Format: base64url(payload).base64url(signature)
 *
 * NOT a full JWT — just enough to issue tamper-proof, expiring session
 * tokens for httpOnly cookies. Swap for a real JWT lib / NextAuth later
 * if needed; the verify/sign call sites won't need to change shape.
 */

const SECRET = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    "[auth] SESSION_SECRET is not set. Using an insecure default — set it in your environment before deploying."
  );
}

export interface SessionPayload {
  userId: string;
  email: string;
  iat: number; // issued at (ms epoch)
  exp: number; // expires at (ms epoch)
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + padding, "base64");
}

function sign(data: string): string {
  return base64url(createHmac("sha256", SECRET).update(data).digest());
}

export function createSessionToken(
  userId: string,
  email: string,
  ttlMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days
): string {
  const now = Date.now();
  const payload: SessionPayload = { userId, email, iat: now, exp: now + ttlMs };
  const payloadPart = base64url(JSON.stringify(payload));
  const signaturePart = sign(payloadPart);
  return `${payloadPart}.${signaturePart}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;

  const expectedSignature = sign(payloadPart);
  const a = Buffer.from(signaturePart);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(base64urlDecode(payloadPart).toString("utf8")) as SessionPayload;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
