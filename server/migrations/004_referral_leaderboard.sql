-- =========================================================
-- 004_referral_leaderboard.sql
-- Adds: a SECURITY DEFINER function that powers the "Referral
-- Leaderboard" on the Referrals dashboard.
--
-- Why SECURITY DEFINER is needed here: profiles_select_own (see
-- 001_init.sql) restricts every user to reading only their own profile
-- row, which is correct for everything else in the app — but a
-- leaderboard is inherently cross-user. Rather than loosening that RLS
-- policy (which would let any logged-in user read everyone's full
-- profile, including email/role/plan), this function runs with elevated
-- privilege internally but returns ONLY a display name and a referral
-- count — no email, no id, no role, no plan. That's the whole point of
-- wrapping it in a function instead of a view or a relaxed policy.
-- =========================================================

create or replace function public.referral_leaderboard(result_limit int default 10)
returns table (display_name text, total_referrals int)
language sql
security definer
set search_path = public
as $$
  select
    case
      when full_name is not null and position(' ' in trim(full_name)) > 0
        then split_part(trim(full_name), ' ', 1) || ' ' || left(split_part(trim(full_name), ' ', 2), 1) || '.'
      when full_name is not null and length(trim(full_name)) > 0
        then trim(full_name)
      else split_part(email, '@', 1)
    end as display_name,
    total_referrals
  from public.profiles
  where total_referrals > 0
  order by total_referrals desc, created_at asc
  limit greatest(1, least(result_limit, 50));
$$;

-- Only logged-in users can call it, and only ever get the two safe
-- columns defined above — never direct table access.
revoke all on function public.referral_leaderboard(int) from public;
grant execute on function public.referral_leaderboard(int) to authenticated;
