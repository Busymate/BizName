-- Run this in Supabase SQL Editor AFTER 001_init.sql (or via `supabase db push`).
-- Adds: saved_items (replaces localStorage favorites/saved-calculations),
-- customers (AI Business Assistant / Customer Intelligence), referral_events
-- (real referral history, replacing the aggregate-only counters from 001),
-- and business_tips (AI-generated tips cache).

-- =========================================================
-- 1. saved_items — every "Save Result" action across all tool pages,
--    plus bookmarked templates. This is the ONLY place saved content
--    lives now — replaces the old localStorage favorites/bookmarks/
--    saved-calculations, which never left the browser and could not be
--    searched, sorted, or paginated server-side.
-- =========================================================
create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('invoice', 'receipt', 'calculation', 'template', 'document')),
  tool_slug text not null,
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_opened_at timestamptz not null default now()
);

alter table public.saved_items enable row level security;

create policy "saved_items_select_own" on public.saved_items
  for select using (auth.uid() = user_id);
create policy "saved_items_insert_own" on public.saved_items
  for insert with check (auth.uid() = user_id);
create policy "saved_items_update_own" on public.saved_items
  for update using (auth.uid() = user_id);
create policy "saved_items_delete_own" on public.saved_items
  for delete using (auth.uid() = user_id);

create index if not exists idx_saved_items_user_created
  on public.saved_items (user_id, created_at desc);
create index if not exists idx_saved_items_user_type
  on public.saved_items (user_id, type);

-- =========================================================
-- 2. customers — powers the AI Business Assistant / Customer
--    Intelligence page. Users add customers manually (Add Customer
--    quick action) or they get created from invoice/receipt clients.
-- =========================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  total_spent numeric not null default 0,
  orders_count int not null default 0,
  last_purchase_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;

create policy "customers_select_own" on public.customers
  for select using (auth.uid() = user_id);
create policy "customers_insert_own" on public.customers
  for insert with check (auth.uid() = user_id);
create policy "customers_update_own" on public.customers
  for update using (auth.uid() = user_id);
create policy "customers_delete_own" on public.customers
  for delete using (auth.uid() = user_id);

create index if not exists idx_customers_user_created
  on public.customers (user_id, created_at desc);

-- =========================================================
-- 3. referral_events — one row per successful referral signup.
--    001_init.sql only ever incremented profiles.total_referrals as a
--    bare counter with no history and no reward tracking. This gives
--    the referral dashboard something real to list, and
--    referral_rewards on profiles is now actually incremented (it was
--    declared in 001 but nothing ever wrote to it).
-- =========================================================
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid references public.profiles(id) on delete set null,
  referred_email text not null,
  reward_kind text not null default 'daily_bonus' check (reward_kind in ('daily_bonus')),
  created_at timestamptz not null default now()
);

alter table public.referral_events enable row level security;

create policy "referral_events_select_own" on public.referral_events
  for select using (auth.uid() = referrer_id);
-- Inserts happen only via the server's service-role key (authController,
-- on signup), so no insert policy is granted to users directly.

create index if not exists idx_referral_events_referrer
  on public.referral_events (referrer_id, created_at desc);

-- =========================================================
-- 4. business_tips — AI-generated tips cache (Groq via the
--    ai-assistant edge function). user_id is null for tips generated
--    with no specific user context (shown to everyone as a fallback);
--    otherwise it's a personalized tip generated from that user's own
--    saved invoices/customers data.
-- =========================================================
create table if not exists public.business_tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null default 'general',
  created_at timestamptz not null default now()
);

alter table public.business_tips enable row level security;

create policy "business_tips_select" on public.business_tips
  for select using (user_id is null or auth.uid() = user_id);
-- Inserts happen only via the ai-assistant edge function (service-role
-- key), so no insert policy is granted to users directly.

create index if not exists idx_business_tips_user_created
  on public.business_tips (user_id, created_at desc);
