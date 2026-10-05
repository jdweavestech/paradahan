# Paradahan — Frontend + Auth Backend

Community-driven parking finder for the Philippines.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion (micro-interactions, scroll reveals)
- lucide-react (icons), Leaflet / react-leaflet (maps)
- **Supabase** — Postgres database + Storage (spot photos)
- **Vercel** — hosting
- Auth: Next.js Route Handlers + Node's built-in `crypto` (scrypt password
  hashing, HMAC-signed session cookies). Users live in Supabase.
- Email: Gmail SMTP (nodemailer) or Resend, optional in local dev

## Setup walkthrough

Everything here is on a free tier: Supabase (database + photo storage),
Vercel (hosting), Gmail or Resend (email), OpenStreetMap (maps, no key).

### 1. Supabase

1. Create a project at https://supabase.com (region: Singapore is closest to
   the Philippines).
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
   This creates the tables and the `spot-photos` bucket. Safe to re-run.
3. **Project Settings → API**: copy the **Project URL** and the
   **service_role** (secret) key.

Free projects pause after about a week with no traffic. If the site suddenly
can't load data, open the Supabase dashboard and click **Restore project**.

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable | What to put |
| --- | --- |
| `SESSION_SECRET` | Any long random string (command is in `.env.example`) |
| `ADMIN_EMAILS` | Email(s) allowed into `/admin`, comma-separated |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` — nothing after `.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | The service_role key (never the anon key) |
| `SMTP_USER` / `SMTP_PASS` | *Optional.* Gmail address + app password |
| `RESEND_API_KEY` / `EMAIL_FROM` | *Optional.* Alternative to Gmail |
| `APP_URL` | *Optional.* Production URL, used in emailed links |

### 3. Run it

```bash
npm install
npm run check   # verifies .env, the Supabase tables, the bucket and admins
npm run dev
```

`npm run check` tells you exactly what's missing and how to fix it; it never
prints secret values. Open http://localhost:3000.

*(Optional)* import accounts/reviews from the old JSON store in `data/`:
`node --env-file=.env scripts/migrate-json-to-supabase.mjs`

### 4. Deploy to Vercel

1. Push to GitHub, import the repo at https://vercel.com/new (preset:
   Next.js, no extra config).
2. **Settings → Environment Variables**: add the same keys as your `.env`,
   plus `APP_URL` set to your production URL.
3. Deploy. After changing any variable, redeploy for it to take effect.

## Managing admins

There is no separate admin login — an admin is a normal account whose email
is listed in `ADMIN_EMAILS`.

- **Become an admin:** put your email in `ADMIN_EMAILS`, restart the dev
  server (or redeploy on Vercel), then sign up at `/signup` with that exact
  email. If you were already logged in, just refresh.
- **Add another admin:** add their email, comma-separated
  (`ADMIN_EMAILS=me@gmail.com,friend@gmail.com`), and restart/redeploy. They
  sign up like anyone else.
- **Remove an admin:** delete their email from the list and restart/redeploy.
  Their account keeps working as a regular user.
- **Open the panel:** user menu (top right) → **Moderation**, or go to
  `/admin`. Non-admins see "Not authorized".

What the panel does:

| Tab | Use it to |
| --- | --- |
| **Submissions** | Approve, reject (with an optional note the submitter sees under Account → Contributions) or delete community spots. Only approved spots are public. |
| **Reports** | See listings users flagged, open the listing, mark resolved or reopen. |
| **Messages** | Read contact-form messages, reply by email, mark handled. |

With email configured, every admin gets a notice when a new submission,
report or contact message arrives.

Things done directly in Supabase (**Table Editor**), since there's no UI for
them: delete a user (`users` — their submissions, reviews and favorites go
with them), remove an abusive review (`reviews`), export newsletter
sign-ups (`newsletter_subscribers`). The curated seed spots and cities are
edited in `lib/mock-data.ts`.

**Security model:** every table has Row Level Security on with *no* policies,
so the public anon key can't touch anything. All reads/writes go through the
API routes with the server-only service-role key; auth and permission checks
live in those routes. Photos are uploaded by the browser straight to the
`spot-photos` bucket using one-time signed URLs from `POST /api/uploads`
(keeps images out of Vercel's ~4.5MB request limit); the bucket enforces a
5MB/image-type limit.

## Auth backend

`/signup` and `/login` are now real, working pages backed by API routes:

- `POST /api/auth/signup` — `{ fullName, email, password }` → creates the
  user, hashes the password (scrypt), sets an httpOnly session cookie.
- `POST /api/auth/login` — `{ email, password }` → verifies credentials,
  sets the session cookie.
- `POST /api/auth/logout` — clears the session cookie.
- `GET /api/auth/me` — returns `{ user }` for the current session, or
  `{ user: null }` if logged out. Use this from client components; use
  `getCurrentUser()` from `lib/server/session.ts` in Server Components.

**Storage:** users live in the Supabase `users` table (`lib/server/db.ts`).

**Sessions:** a signed, httpOnly, 7-day cookie (`paradahan_session`)
holding a lightweight HMAC-SHA256 token (see `lib/server/token.ts`) — same
idea as a JWT, no external library needed. Set `SESSION_SECRET` in `.env`
before deploying (see `.env.example`); without it a dev-only default is used
locally, and production refuses to issue or accept sessions.

**Logged-in state:** the Navbar (desktop + mobile) now checks the session
via `GET /api/auth/me` (see `hooks/useSession.ts`) and swaps the Log
In/Sign Up buttons for a user menu with a Log Out action once you're
signed in.

**Forgot / reset password:**

- `POST /api/auth/forgot-password` — `{ email }`. Always returns the same
  generic message whether or not the email is registered (so the endpoint
  can't be used to enumerate accounts), and emails the link. In local dev
  without an email provider, the link is also returned and shown
  in a "dev mode" box; in production it is never returned.
- `POST /api/auth/reset-password` — `{ token, password }`. Tokens are
  single-use, expire after 1 hour, and only their SHA-256 hash is ever
  stored (`lib/server/resetToken.ts`). On success the user is logged in
  immediately.

## Features

- **Search** (`/search`) — free-text search, `?q=`/`?city=`/`?vehicle=` URL
  params, filters (max rate, vehicle, parking type, 24h), sort (recommended,
  top rated, lowest price, nearest via browser geolocation), live map.
- **Cities** (`/cities`) — searchable; spot counts are live, and cities that
  only exist through community submissions show up automatically.
- **Parking details** — photo gallery, description, Google Maps directions,
  save, share, report, reviews.
- **Add Parking** (login required) — multi-step form with map pin, reverse
  geocoding, and photo uploads to Supabase Storage. Goes to moderation.
- **Account** (`/account`) — edit profile/password, saved spots,
  contributions with moderation status.
- **Moderation** (`/admin`, `ADMIN_EMAILS` only) — approve/reject/delete
  submissions, resolve listing reports, read and triage contact messages.
- **Contact form** and **newsletter signup** — stored in Supabase
  (`contact_messages`, `newsletter_subscribers`).
- **Privacy** and **Terms** pages (review these with a lawyer before launch).

Curated seed spots and cities still come from `lib/mock-data.ts` and are
merged with approved community spots at read time.
