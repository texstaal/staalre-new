-- STAAL Real Estate — Supabase schema for the contact + newsletter forms.
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- The site uses the public "anon" key from the browser, so Row Level Security
-- is enabled and the anon role may ONLY insert — never read — submissions.

-- ---------- contact requirements (from /contact) ----------
create table if not exists public.contact_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  company     text,
  email       text not null,
  phone       text,
  interest    text,
  message     text not null,
  source      text
);

alter table public.contact_requests enable row level security;

-- allow anonymous visitors to submit (insert) only
drop policy if exists "anon can submit contact requests" on public.contact_requests;
create policy "anon can submit contact requests"
  on public.contact_requests for insert
  to anon, authenticated
  with check (true);

-- ---------- newsletter signups (footer, every page) ----------
create table if not exists public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null unique,
  source      text
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "anon can subscribe" on public.newsletter_subscribers;
create policy "anon can subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

-- Note: no SELECT/UPDATE/DELETE policies are created, so the anon key cannot
-- read or modify rows. View submissions in the Supabase Table Editor, or with
-- the service_role key from a trusted server only.
