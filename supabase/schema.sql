-- Paradahan database schema for Supabase.
--
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste →
-- Run. It's idempotent, so re-running it after pulling changes is safe.
--
-- Access model: every table has Row Level Security enabled with NO policies,
-- which means the public anon key can't read or write anything. All access
-- goes through the Next.js API routes using the service-role key
-- (SUPABASE_SERVICE_ROLE_KEY), which bypasses RLS. Auth, validation and
-- permissions stay in the app layer, exactly as they were with the JSON store.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Users (custom auth: scrypt hashes + HMAC session cookies, see lib/server)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique, -- stored lowercase
  password_hash text not null,
  created_at timestamptz not null default now(),
  reset_token_hash text,
  reset_token_expires_at timestamptz
);
create index if not exists users_reset_token_hash_idx on public.users (reset_token_hash);

-- ---------------------------------------------------------------------------
-- Community-submitted parking spots (moderated)
-- ---------------------------------------------------------------------------
create table if not exists public.parking_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references public.users (id) on delete cascade,
  submitted_by_name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  name text not null,
  address text not null,
  city text not null,
  lat double precision not null,
  lng double precision not null,
  description text not null default '',
  parking_type text not null default '',
  vehicle_types text[] not null default '{}',
  amenities text[] not null default '{}',
  opening_time text not null default '',
  closing_time text not null default '',
  is_open_24h boolean not null default false,
  rate numeric,
  rate_unit text not null default 'hour' check (rate_unit in ('hour', 'entry', 'day')),
  photos text[] not null default '{}',
  reviewed_at timestamptz,
  reviewed_by text,
  review_note text
);
create index if not exists parking_submissions_status_idx on public.parking_submissions (status);
create index if not exists parking_submissions_submitted_by_idx on public.parking_submissions (submitted_by);

-- ---------------------------------------------------------------------------
-- Favorites. spot_id is text because curated seed spots use string ids
-- ("spot-ayala-triangle") while community spots use uuids.
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id uuid not null references public.users (id) on delete cascade,
  spot_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

-- ---------------------------------------------------------------------------
-- Reviews (one per user per spot)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null,
  user_id uuid not null references public.users (id) on delete cascade,
  author text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  vehicle_type text not null,
  date text not null,
  created_at timestamptz not null default now(),
  unique (spot_id, user_id)
);
create index if not exists reviews_spot_id_idx on public.reviews (spot_id);

-- Per-spot aggregate used by the public listing so it doesn't need one
-- query per spot.
create or replace view public.review_stats as
  select spot_id, count(*)::int as review_count, sum(rating)::int as rating_total
  from public.reviews
  group by spot_id;

-- ---------------------------------------------------------------------------
-- Listing reports
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null,
  spot_name text not null,
  reported_by uuid references public.users (id) on delete set null,
  reported_by_name text not null,
  reason text not null,
  details text not null default '',
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by text
);
create index if not exists reports_status_idx on public.reports (status);

-- ---------------------------------------------------------------------------
-- Contact form messages
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  user_id uuid references public.users (id) on delete set null,
  status text not null default 'new' check (status in ('new', 'handled')),
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_status_idx on public.contact_messages (status);

-- ---------------------------------------------------------------------------
-- Newsletter subscribers
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  email text primary key, -- stored lowercase
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Lock everything down to the service role (see note at the top).
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.parking_submissions enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
revoke all on public.review_stats from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket for spot photos. Public read (so <img> tags work), writes
-- only via short-lived signed upload URLs issued by /api/uploads.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'spot-photos',
  'spot-photos',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
