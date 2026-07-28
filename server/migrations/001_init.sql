-- Run this in Supabase SQL Editor (or via `supabase db push` if you use the CLI).
-- Safe to run once on a fresh project. Review before running on an existing DB.

-- =========================================================
-- 1. profiles — one row per auth.users row, holds role/plan/referral data
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'free_user' check (role in ('free_user', 'premium_user', 'admin', 'super_admin')),
  plan text not null default 'free' check (plan in ('free', 'premium')),
  premium_expires_at timestamptz,
  referral_code text unique not null,
  referred_by text references public.profiles(referral_code),
  total_referrals int not null default 0,
  referral_rewards int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read/update only their own profile.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
-- No insert/delete policy for regular users — profile rows are created
-- exclusively by the server (service-role key) during signup.

-- =========================================================
-- 2. transactions — every Flutterwave payment attempt
-- =========================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tx_ref text unique not null,
  flw_transaction_id text,
  amount numeric not null,
  currency text not null default 'NGN',
  status text not null default 'pending' check (status in ('pending', 'successful', 'failed', 'refunded')),
  raw_response jsonb,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
-- Inserts/updates happen only via the server's service-role key
-- (paymentController), so no insert/update policy is granted to users.

-- =========================================================
-- 3. usage_events — one row per free-tier action, used for daily quotas
-- =========================================================
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('tool_save', 'article_view', 'template_save')),
  created_at timestamptz not null default now()
);

alter table public.usage_events enable row level security;

create policy "usage_events_select_own" on public.usage_events
  for select using (auth.uid() = user_id);
-- Inserts happen only via the server (quotaController), no user insert policy.

create index if not exists idx_usage_events_user_kind_created
  on public.usage_events (user_id, kind, created_at);
