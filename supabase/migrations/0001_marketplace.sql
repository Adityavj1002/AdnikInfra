-- Adnik Infra marketplace: owner listings with admin review, admin accounts, subscribers.
-- Run once in Supabase → SQL editor. The website talks to these tables only from the server,
-- with the service-role key; row-level security is on with no policies, so the public
-- (anon) key can read or write nothing.

create extension if not exists pgcrypto;

-- ── Admins ──────────────────────────────────────────────────────────────────────
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  name text not null check (char_length(name) between 2 and 100),
  -- scrypt$N$r$p$salt$hash (see src/security/password.ts). Never a plain password.
  password_hash text not null,
  created_at timestamptz not null default now(),
  created_by uuid references admins (id) on delete set null,
  last_login_at timestamptz
);

-- Sessions hold a SHA-256 of the cookie token, so a database leak cannot be replayed.
create table if not exists admin_sessions (
  token_hash text primary key,
  admin_id uuid not null references admins (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists admin_sessions_admin_idx on admin_sessions (admin_id);

-- ── Listings ────────────────────────────────────────────────────────────────────
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  slug text not null unique,
  -- unconfirmed: waiting for the seller to confirm their email
  -- pending: in the review queue · approved: public · rejected: hidden, with a reason
  status text not null default 'unconfirmed' check (status in ('unconfirmed', 'pending', 'approved', 'rejected')),
  kind text not null check (kind in ('plot', 'house', 'villa', 'apartment', 'commercial', 'agricultural', 'building')),
  purpose text not null default 'sale' check (purpose in ('sale', 'rent')),
  title text not null check (char_length(title) between 10 and 120),
  description text not null check (char_length(description) between 30 and 4000),
  price_inr bigint not null check (price_inr > 0),
  area_value numeric(12, 2) not null check (area_value > 0),
  area_unit text not null check (area_unit in ('sqft', 'sqyd', 'sqm', 'acre', 'bigha', 'hectare')),
  bedrooms smallint check (bedrooms between 0 and 20),
  city text not null,
  locality text not null,
  state text not null default 'Rajasthan',
  -- [{ "id": "adnik/marketplace/…", "width": 1600, "height": 1200 }]
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  seller_name text not null,
  seller_phone text not null,
  seller_email text not null check (seller_email = lower(seller_email)),
  seller_role text not null default 'owner' check (seller_role in ('owner', 'agent', 'builder')),
  confirm_token_hash text,
  confirm_expires_at timestamptz,
  confirmed_at timestamptz,
  reviewed_by uuid references admins (id) on delete set null,
  reviewed_at timestamptz,
  reject_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists listings_status_idx on listings (status, created_at desc);
create index if not exists listings_confirm_idx on listings (confirm_token_hash) where confirm_token_hash is not null;

-- Who did what to a listing, and when.
create table if not exists listing_events (
  id bigint generated always as identity primary key,
  listing_id uuid not null references listings (id) on delete cascade,
  action text not null check (action in ('submitted', 'confirmed', 'approved', 'rejected', 'unpublished', 'edited')),
  admin_id uuid references admins (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists listing_events_listing_idx on listing_events (listing_id, created_at);

-- ── Subscribers and campaigns ───────────────────────────────────────────────────
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  -- pending until the confirmation link is used (double opt-in)
  status text not null default 'pending' check (status in ('pending', 'active', 'unsubscribed')),
  confirm_token_hash text,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);
create index if not exists subscribers_status_idx on subscribers (status);
create index if not exists subscribers_confirm_idx on subscribers (confirm_token_hash) where confirm_token_hash is not null;

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (char_length(subject) between 3 and 150),
  body text not null check (char_length(body) between 10 and 20000),
  include_listings boolean not null default false,
  status text not null default 'sending' check (status in ('sending', 'sent', 'failed')),
  recipients integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  created_by uuid references admins (id) on delete set null,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- ── Row-level security: on, with no policies ────────────────────────────────────
alter table admins enable row level security;
alter table admin_sessions enable row level security;
alter table listings enable row level security;
alter table listing_events enable row level security;
alter table subscribers enable row level security;
alter table campaigns enable row level security;

-- Keep updated_at honest.
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
drop trigger if exists listings_touch on listings;
create trigger listings_touch before update on listings for each row execute function touch_updated_at();
