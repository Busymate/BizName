-- =========================================================
-- 005_security_hardening.sql
--
-- RLS REVIEW FINDING (fix included below):
--
-- profiles_update_own (001_init.sql) only checks row ownership:
--   for update using (auth.uid() = id)
-- It does not restrict which COLUMNS can change. Row-level security in
-- Postgres is row-level, not column-level — so as written, any logged-in
-- user could call the Supabase client directly (e.g. from browser
-- devtools, bypassing the UI entirely) with something like:
--
--   supabase.from('profiles').update({ role: 'admin', plan: 'premium',
--     total_referrals: 999 }).eq('id', <their own id>)
--
-- ...and it would succeed, because auth.uid() = id is still true. That's
-- a real privilege-escalation path: a free user could grant themselves
-- admin/premium without paying or being promoted, simply by knowing the
-- table and column names (which are visible in this very repo). This
-- was already possible before Settings.jsx existed — Settings.jsx just
-- exercises the same "update your own profile" policy legitimately for
-- full_name, which is what surfaced the review.
--
-- FIX: a BEFORE UPDATE trigger that pins every privileged column back to
-- its previous value whenever the request comes from the `authenticated`
-- role (i.e. RLS-governed client requests) rather than `service_role`
-- (the Express server / edge functions, which legitimately need to
-- change role/plan/referral counters). This doesn't touch the update
-- policy itself — ownership checking stays as-is — it closes the column
-- gap underneath it.
-- =========================================================

create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.role() reflects the JWT role Supabase attaches to the request:
  -- 'authenticated' for normal logged-in client calls (anon key + user
  -- JWT, exactly what Settings.jsx / any browser devtools call uses),
  -- 'service_role' for the Express server and edge functions, which
  -- carry the service-role key and are the only things allowed to
  -- change these columns (signup, payment verification, referral
  -- crediting, admin promotion).
  if auth.role() = 'authenticated' then
    new.role := old.role;
    new.plan := old.plan;
    new.premium_expires_at := old.premium_expires_at;
    new.referral_code := old.referral_code;
    new.referred_by := old.referred_by;
    new.total_referrals := old.total_referrals;
    new.referral_rewards := old.referral_rewards;
    new.email := old.email;
    new.id := old.id;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_privileged_columns on public.profiles;
create trigger trg_protect_profile_privileged_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

-- Everything below this line is the rest of the review — no schema
-- changes needed, documenting what was checked and why it's fine as-is:
--
-- * saved_items_update_own / ai_conversations_update_own / customers_
--   update_own all use `for update using (auth.uid() = user_id)` with no
--   explicit WITH CHECK. Postgres reuses the USING expression as the
--   WITH CHECK when one isn't given, so the new row must ALSO satisfy
--   auth.uid() = user_id — meaning a user cannot reassign one of their
--   rows to a different user_id even without a trigger. name/payload/
--   messages/title/pinned/total_spent/orders_count being user-writable
--   is intentional (rename, edit, purchase tracking) and only ever
--   affects data already scoped to that same user, so there's no
--   cross-user exposure the way profiles.role was.
-- * transactions, usage_events, referral_events, business_tips: only
--   SELECT policies exist for the `authenticated` role; every INSERT/
--   UPDATE on those tables happens via service-role (Express server or
--   the ai-assistant edge function), so users cannot fabricate
--   transactions, quota usage, referral credits, or tips.
-- * ai-assistant edge function (supabase/functions/ai-assistant):
--   verifies the caller's JWT via supabaseUser.auth.getUser(token)
--   before doing anything, returns 401 if that fails, and the Groq API
--   key is read only from Deno.env (Supabase Secrets) — never sent to
--   or accepted from the client. No change needed there.
