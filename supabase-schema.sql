-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run

create extension if not exists "pgcrypto";

create table if not exists packets (
  id uuid primary key default gen_random_uuid(),
  file_no text unique not null,
  status text not null default 'pending', -- pending | changes_requested | approved | delivered
  review_notes text default '',
  submitted_at timestamptz default now(),
  updated_at timestamptz default now(),
  data jsonb not null
);

-- Row-level security: locked down by default. The app only ever talks to
-- this table through the server-side service role key (never exposed to
-- the browser), so RLS stays enabled with no public policies.
alter table packets enable row level security;
