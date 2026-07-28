-- =========================================================
-- 006_realtime.sql
--
-- Supabase Realtime only streams changes for tables explicitly added to
-- the `supabase_realtime` publication — it's off by default for every
-- new table, including all the ones created in earlier migrations here.
-- This is what makes "Dashboard updates, Saved Items updates, Customers
-- update... without a page refresh" actually possible on the client
-- side (see src/hooks/useRealtimeTable.js).
--
-- Realtime respects RLS: a subscribed client only receives change
-- events for rows it could SELECT anyway, using the same policies from
-- 001_init.sql / 002_business_suite.sql / 003_ai_assistant.sql — so
-- enabling this does not widen access, it just pushes the same data the
-- client could already poll for.
--
-- profiles is deliberately included: it's how a Flutterwave payment
-- upgrading someone to Premium (done server-side via supabaseAdmin,
-- see paymentController.js) shows up in the UI immediately, without the
-- user needing to refresh to see their new plan/limits.
-- =========================================================

do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'saved_items', 'customers', 'referral_events', 'ai_conversations']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
