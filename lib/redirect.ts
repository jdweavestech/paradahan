/**
 * Where to send the user after logging in / signing up: the `?next=` param
 * if it's a same-site path, otherwise home. Rejects "//evil.com" and absolute
 * URLs so the param can't be used as an open redirect.
 */
export function getSafeNextPath(fallback = "/"): string {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
