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
- Email: Resend (password-reset emails), optional in local dev

## Getting started (local)

1. **Create a Supabase project** at https://supabase.com.
2. **Create the tables and photo bucket:** Supabase dashboard → SQL Editor →
   New query → paste all of `supabase/schema.sql` → Run. (Safe to re-run.)
3. **Configure env vars:**
   ```bash
   cp .env.example .env
   ```
   Fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project Settings →
   API), a random `SESSION_SECRET`, and your email in `ADMIN_EMAILS`.
4. **Run it:**
   ```bash
   npm install
   npm run dev
   ```
5. *(Optional)* Import accounts/reviews from the old JSON store in `data/`:
   ```bash
   node --env-file=.env scripts/migrate-json-to-supabase.mjs
   ```

## Deploying to Vercel

1. Push the repo to GitHub and import it at https://vercel.com/new
   (framework preset: Next.js — no extra config needed).
2. Under **Settings → Environment Variables**, add everything from
   `.env.example`: `SESSION_SECRET` (required — the app refuses to sign
   sessions without it in production), `ADMIN_EMAILS`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, and `APP_URL`
   (your production URL).
3. Deploy. Nothing is written to the local filesystem, so it runs fine on
   Vercel's read-only serverless functions.

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
  can't be used to enumerate accounts), and emails the link via Resend. In
  local dev without `RESEND_API_KEY`, the link is also returned and shown
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
