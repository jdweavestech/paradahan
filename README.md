# Paradahan — Frontend + Auth Backend

Community-driven parking finder for the Philippines.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion (micro-interactions, scroll reveals)
- lucide-react (icons)
- Auth backend: Next.js Route Handlers + Node's built-in `crypto`
  (scrypt password hashing, HMAC-signed session cookies) — no external
  auth/DB packages required to run today. See "Auth backend" below.

## Getting started

```bash
npm install
cp .env.example .env   # then set SESSION_SECRET
npm run dev
```

Then open http://localhost:3000.

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

**Storage:** users are currently stored in `data/users.json` (gitignored,
created automatically on first signup). This is a drop-in stand-in so the
backend works with zero extra installs — swap `lib/server/db.ts` for a
Prisma/Postgres-backed version later and the API routes won't need to
change. Not suitable for multi-instance production deployments as-is.

**Sessions:** a signed, httpOnly, 7-day cookie (`paradahan_session`)
holding a lightweight HMAC-SHA256 token (see `lib/server/token.ts`) — same
idea as a JWT, no external library needed. Set `SESSION_SECRET` in `.env`
before deploying (see `.env.example`); without it, a dev-only default is
used and a warning is logged in production.

**Logged-in state:** the Navbar (desktop + mobile) now checks the session
via `GET /api/auth/me` (see `hooks/useSession.ts`) and swaps the Log
In/Sign Up buttons for a user menu with a Log Out action once you're
signed in.

**Forgot / reset password:**

- `POST /api/auth/forgot-password` — `{ email }`. Always returns the same
  generic message whether or not the email is registered (so the endpoint
  can't be used to enumerate accounts). Since there's no email provider
  wired up yet, the response also includes `resetUrl` directly and logs
  it to the server console — the `/forgot-password` page displays it in a
  clearly-labeled "dev mode" box. **Remove `resetUrl` from the response
  once a real email provider (Resend, SES, etc.) is sending the link
  instead** — leaving it in production would let anyone reset anyone
  else's password.
- `POST /api/auth/reset-password` — `{ token, password }`. Tokens are
  single-use, expire after 1 hour, and only their SHA-256 hash is ever
  stored (`lib/server/resetToken.ts`). On success the user is logged in
  immediately.

**Not yet wired up:** no protected routes yet (e.g. `/add-parking` is
public even when logged out) and no account/profile page. Natural next
steps once you're ready for them.

## What's included

- `app/page.tsx` — Landing page (Hero, Features, How It Works, Recently
  Added carousel, Community Contribution banner)
- `app/search/page.tsx` — Search Parking (filters, map placeholder, grid/list
  toggle, sort)
- `app/cities/page.tsx` — Cities (search, featured cities, popular cities)
- `app/parking/[id]/page.tsx` — Parking Details (gallery, info, rates,
  amenities, reviews, nearby suggestions)
- `app/add-parking/page.tsx` — Add Parking (multi-step form with progress
  indicator)
- `app/about/page.tsx` — About (mission, vision, why Paradahan, community)
- `app/contact/page.tsx` — Contact (form, FAQ accordion, social links)
- `app/not-found.tsx` — Custom 404
- `components/layout/` — Navbar, Footer
- `components/home/` — Landing page sections
- `components/shared/` — Reusable primitives (ParkingCard, Reveal,
  SectionHeading, Badge, StarRating, Container)
- `lib/mock-data.ts` — Placeholder parking/city/review data so every page
  renders with realistic content until the API is connected

## Notes for the next part (backend)

- All data currently comes from `lib/mock-data.ts` — swap these for API
  calls when the backend is ready; component props already expect the
  shapes defined in `lib/types.ts`.
- Map placeholders (Search, Parking Details, Add Parking) are marked
  clearly and ready for a real map library (e.g. Google Maps or Mapbox).
- Forms (Add Parking, Contact) are UI-only; no submission logic yet.
- Login/Sign Up (`/login`, `/signup`) are now functional — see "Auth
  backend" above.
