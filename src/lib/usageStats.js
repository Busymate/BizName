import { supabase } from './supabaseClient';

// Everything the new dashboard's top section needs, all derived from
// data that already exists and is already kept in sync elsewhere in the
// app: `usage_events` (one row per tool save / template save / article
// view / AI request — see server/migrations/001_init.sql +
// 008_ai_request_usage.sql) and `saved_items` (one row per saved
// invoice, receipt, quotation, calculation, etc. — see
// server/migrations/002_business_suite.sql).
//
// This is deliberately the ONE place that turns those raw rows into
// "Tools Used / Documents Saved / AI Requests / Time Saved" so the This
// Week Overview panel, the 4 KPI cards, and the Analytics Overview
// chart can never drift out of sync with each other — they all call
// this same function and read the same numbers.

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Monday-start week, matching the Mon–Sun axis in the mockup's
// Analytics Overview chart.
function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function pctChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Rough, clearly-labelled estimate of hours saved by using BizName
// instead of doing these by hand — not a real time-tracking feature
// (nothing in this app measures how long a task actually took).
// Weights are minutes saved per action, picked to be conservative:
// a saved document (invoice/receipt/quotation) replaces manually
// formatting one in Word/Excel (~12 min), a plain tool/template use
// replaces a manual calculation (~7 min), and an AI request replaces
// looking something up or drafting it yourself (~5 min).
const MINUTES_PER_DOCUMENT = 12;
const MINUTES_PER_TOOL_USE = 7;
const MINUTES_PER_AI_REQUEST = 5;

function estimateHoursSaved({ documents, tools, aiRequests }) {
  const minutes = documents * MINUTES_PER_DOCUMENT + tools * MINUTES_PER_TOOL_USE + aiRequests * MINUTES_PER_AI_REQUEST;
  return Math.round((minutes / 60) * 10) / 10;
}

async function fetchUsageEventsSince(userId, sinceIso) {
  const { data, error } = await supabase
    .from('usage_events')
    .select('kind, created_at')
    .eq('user_id', userId)
    .gte('created_at', sinceIso);
  if (error) throw new Error(error.message);
  return data || [];
}

async function fetchSavedItemsSince(userId, sinceIso) {
  const { data, error } = await supabase
    .from('saved_items')
    .select('id, tool_slug, created_at')
    .eq('user_id', userId)
    .gte('created_at', sinceIso);
  if (error) throw new Error(error.message);
  return data || [];
}

function summarize(events, items) {
  const tools = events.filter((e) => e.kind === 'tool_save' || e.kind === 'template_save').length;
  const aiRequests = events.filter((e) => e.kind === 'ai_request').length;
  const documents = items.length;
  return { tools, aiRequests, documents, hours: estimateHoursSaved({ documents, tools, aiRequests }) };
}

// Human-friendly "most used tool" from this week's saved items — falls
// back to null (rendered as "—") rather than guessing when nobody has
// saved anything yet.
function mostUsedToolSlug(items) {
  const counts = {};
  items.forEach((i) => { if (i.tool_slug) counts[i.tool_slug] = (counts[i.tool_slug] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] || null;
}

export async function getUsageOverview(userId) {
  if (!userId) return null;

  const now = new Date();
  const thisWeekStart = startOfWeek(now);
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * DAY);
  const sevenDaysAgo = new Date(startOfDay(now).getTime() - 6 * DAY);

  const [thisWeekEvents, lastWeekEvents, thisWeekItems, lastWeekItems, last7DaysEvents, last7DaysItems] = await Promise.all([
    fetchUsageEventsSince(userId, thisWeekStart.toISOString()),
    fetchUsageEventsSince(userId, lastWeekStart.toISOString()).then((rows) => rows.filter((r) => new Date(r.created_at) < thisWeekStart)),
    fetchSavedItemsSince(userId, thisWeekStart.toISOString()),
    fetchSavedItemsSince(userId, lastWeekStart.toISOString()).then((rows) => rows.filter((r) => new Date(r.created_at) < thisWeekStart)),
    fetchUsageEventsSince(userId, sevenDaysAgo.toISOString()),
    fetchSavedItemsSince(userId, sevenDaysAgo.toISOString()),
  ]);

  const thisWeek = summarize(thisWeekEvents, thisWeekItems);
  const lastWeek = summarize(lastWeekEvents, lastWeekItems);

  // Daily breakdown (last 7 days, oldest first) for the Analytics
  // Overview chart — one "activity" count per day combining every
  // tracked action, so the line reflects total usage, not just saves.
  const days = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(sevenDaysAgo.getTime() + i * DAY);
    const dayEnd = new Date(dayStart.getTime() + DAY);
    const count =
      last7DaysEvents.filter((e) => {
        const t = new Date(e.created_at);
        return t >= dayStart && t < dayEnd;
      }).length +
      last7DaysItems.filter((r) => {
        const t = new Date(r.created_at);
        return t >= dayStart && t < dayEnd;
      }).length;
    return { label: dayStart.toLocaleDateString(undefined, { weekday: 'short' }), count };
  });

  const totalUsage = days.reduce((s, d) => s + d.count, 0);

  return {
    tools: { count: thisWeek.tools, change: pctChange(thisWeek.tools, lastWeek.tools) },
    documents: { count: thisWeek.documents, change: pctChange(thisWeek.documents, lastWeek.documents) },
    aiRequests: { count: thisWeek.aiRequests, change: pctChange(thisWeek.aiRequests, lastWeek.aiRequests) },
    hoursSaved: { value: thisWeek.hours, change: pctChange(thisWeek.hours, lastWeek.hours) },
    days,
    totalUsage,
    mostUsedToolSlug: mostUsedToolSlug(thisWeekItems.length ? thisWeekItems : last7DaysItems),
  };
}
