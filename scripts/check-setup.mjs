// Checks that the environment and the Supabase project are set up correctly.
// Never prints secret values — only whether each thing is OK and how to fix it.
//
// Usage:  npm run check
//
// Reads .env from the project root (via Node's --env-file flag).

import { createClient } from "@supabase/supabase-js";

const TABLES = [
  "users",
  "parking_submissions",
  "favorites",
  "reviews",
  "review_stats",
  "reports",
  "contact_messages",
  "newsletter_subscribers",
];
const PHOTO_BUCKET = "spot-photos";

let failures = 0;
let warnings = 0;

function ok(label, detail = "") {
  console.log(`  \x1b[32m✔\x1b[0m ${label}${detail ? ` — ${detail}` : ""}`);
}
function warn(label, fix) {
  warnings++;
  console.log(`  \x1b[33m!\x1b[0m ${label}\n      → ${fix}`);
}
function fail(label, fix) {
  failures++;
  console.log(`  \x1b[31m✘\x1b[0m ${label}\n      → ${fix}`);
}

/** Role claim of a legacy JWT-style Supabase key, or null for the newer sb_* keys. */
function jwtRole(key) {
  try {
    return JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8")).role ?? null;
  } catch {
    return null;
  }
}

function describeNetworkError(err) {
  const code = err?.cause?.code ?? err?.code;
  if (code === "ENOTFOUND") {
    return "the SUPABASE_URL host doesn't exist. Re-copy the Project URL from Supabase → Project Settings → API (a typo, or the project was deleted).";
  }
  if (code === "ETIMEDOUT" || code === "UND_ERR_CONNECT_TIMEOUT") {
    return "the connection timed out. Check your internet connection / firewall and try again.";
  }
  return `network error (${code ?? err?.message ?? "unknown"}).`;
}

console.log("\nEnvironment (.env)");

const sessionSecret = process.env.SESSION_SECRET ?? "";
if (!sessionSecret) {
  fail(
    "SESSION_SECRET is empty",
    `generate one:  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
  );
} else if (sessionSecret.length < 32) {
  warn("SESSION_SECRET is short", "use at least 32 random characters.");
} else {
  ok("SESSION_SECRET");
}

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
if (adminEmails.length === 0 || adminEmails.includes("you@example.com")) {
  fail("ADMIN_EMAILS is not set", "put the email you'll sign up with, e.g. ADMIN_EMAILS=me@gmail.com");
} else {
  ok("ADMIN_EMAILS", `${adminEmails.length} admin${adminEmails.length === 1 ? "" : "s"}`);
}

const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

let urlOk = false;
if (!url || url.includes("your-project-ref")) {
  fail("SUPABASE_URL is not set", "copy the Project URL from Supabase → Project Settings → API.");
} else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) {
  // Say what's wrong with the shape without echoing the value.
  let parsed = null;
  try {
    parsed = new URL(url);
  } catch {}
  const hints = [];
  if (!parsed) hints.push("it isn't a valid URL (missing https://, or has quotes/spaces)");
  else {
    if (parsed.protocol !== "https:") hints.push("it should start with https://");
    if (parsed.hostname === "supabase.com" || parsed.hostname === "app.supabase.com")
      hints.push("it's a dashboard link, not the Project URL");
    else if (!parsed.hostname.endsWith(".supabase.co")) hints.push("the host should end in .supabase.co");
    else if (parsed.hostname.split(".").length !== 3) hints.push("the host should be <project-ref>.supabase.co");
    if (parsed.pathname !== "/" || parsed.search) hints.push("remove everything after .supabase.co");
  }
  warn(
    "SUPABASE_URL doesn't look like https://<project-ref>.supabase.co",
    `${hints.join("; ") || "check for typos"}. Copy the Project URL from Supabase → Project Settings → API.`
  );
  urlOk = Boolean(parsed);
} else {
  ok("SUPABASE_URL");
  urlOk = true;
}

let keyOk = false;
if (!key) {
  fail(
    "SUPABASE_SERVICE_ROLE_KEY is empty",
    "copy the service_role (secret) key from Supabase → Project Settings → API keys."
  );
} else {
  const role = jwtRole(key);
  if (role === "anon" || key.startsWith("sb_publishable_")) {
    fail(
      "SUPABASE_SERVICE_ROLE_KEY is the public anon/publishable key",
      "use the service_role (secret) key instead — the anon key can't read or write any table."
    );
  } else {
    ok("SUPABASE_SERVICE_ROLE_KEY");
    keyOk = true;
  }
}

const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
if (hasSmtp) ok("Email", "SMTP (Gmail or other)");
else if (hasResend) ok("Email", "Resend");
else {
  warn(
    "Email is not configured (optional)",
    "password-reset links are only shown on screen in local dev. Set SMTP_USER/SMTP_PASS (Gmail) or RESEND_API_KEY before going live."
  );
}

console.log("\nSupabase project");

if (!urlOk || !keyOk) {
  fail("Skipped", "fix the Supabase variables above first.");
} else {
  const origin = new URL(url).origin;
  const supabase = createClient(origin, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // Raw reachability first, so a paused/deleted project gets a clear message
  // instead of eight identical table errors.
  let reachable = false;
  try {
    const res = await fetch(`${origin}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (res.status === 401 || res.status === 403) {
      fail("Supabase rejected the key", "SUPABASE_SERVICE_ROLE_KEY doesn't belong to this project — re-copy it.");
    } else if (res.status >= 500) {
      fail(
        `Supabase returned ${res.status}`,
        "the project is probably paused (free projects pause after ~1 week idle). Open the Supabase dashboard and click Restore project."
      );
    } else {
      ok("Reachable");
      reachable = true;
    }
  } catch (err) {
    fail("Can't reach Supabase", describeNetworkError(err));
  }

  if (reachable) {
    const missing = [];
    for (const table of TABLES) {
      const { error } = await supabase.from(table).select("*", { count: "exact", head: true });
      if (error) missing.push(table);
    }
    if (missing.length > 0) {
      fail(
        `Missing tables: ${missing.join(", ")}`,
        "run supabase/schema.sql in the Supabase SQL Editor (safe to re-run)."
      );
    } else {
      ok("Tables", `${TABLES.length} found`);
    }

    const { data: bucket, error: bucketError } = await supabase.storage.getBucket(PHOTO_BUCKET);
    if (bucketError || !bucket) {
      fail(`Storage bucket "${PHOTO_BUCKET}" is missing`, "run supabase/schema.sql in the Supabase SQL Editor.");
    } else if (!bucket.public) {
      fail(`Storage bucket "${PHOTO_BUCKET}" is private`, "re-run supabase/schema.sql — photos need public read.");
    } else {
      ok("Photo bucket");
    }

    if (!missing.includes("users") && adminEmails.length > 0) {
      const { data } = await supabase.from("users").select("email").in("email", adminEmails);
      const registered = new Set((data ?? []).map((u) => u.email));
      const unregistered = adminEmails.filter((e) => !registered.has(e));
      if (unregistered.length > 0) {
        warn(
          `No account yet for admin: ${unregistered.join(", ")}`,
          "sign up at /signup with that exact email — the account becomes an admin automatically."
        );
      } else {
        ok("Admin accounts", "all registered");
      }
    }
  }
}

console.log(
  failures > 0
    ? `\n\x1b[31m${failures} problem${failures === 1 ? "" : "s"} to fix.\x1b[0m\n`
    : warnings > 0
      ? `\n\x1b[32mReady.\x1b[0m ${warnings} optional item${warnings === 1 ? "" : "s"} above.\n`
      : "\n\x1b[32mAll good — everything is set up.\x1b[0m\n"
);
process.exit(failures > 0 ? 1 : 0);
