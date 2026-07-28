-- =========================================================
-- 008_ai_request_usage — adds 'ai_request' as a trackable usage_events
-- kind, so every call through askAI() (Dashboard "Ask BizName AI",
-- the floating widget, and the full AI Assistant page) is logged the
-- same way tool saves and article views already are. This is what
-- powers the "AI Requests" KPI card and the Analytics Overview chart
-- on the new dashboard — it reuses the exact same usage_events table
-- and RLS policies from 001_init.sql, just widening the allowed kinds.
-- =========================================================

alter table public.usage_events
  drop constraint if exists usage_events_kind_check;

alter table public.usage_events
  add constraint usage_events_kind_check
  check (kind in ('tool_save', 'article_view', 'template_save', 'ai_request'));
