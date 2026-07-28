import { supabase } from './supabaseClient';

// Everything a logged-in user has saved — invoices, receipts,
// calculator results, bookmarked templates, generated documents — now
// lives in one Supabase table (`saved_items`, see
// server/migrations/002_business_suite.sql) instead of scattered
// localStorage keys. This is what makes Saved Items searchable,
// sortable, and paginated instead of a flat list capped at 20 entries.

export async function listSavedItems({
  search = '',
  sortBy = 'created_at',
  sortDir = 'desc',
  type = 'all',
  page = 1,
  pageSize = 10,
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('saved_items')
    .select('*', { count: 'exact' })
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(from, to);

  if (type !== 'all') query = query.eq('type', type);
  if (search.trim()) query = query.ilike('name', `%${search.trim()}%`);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { items: data || [], total: count || 0 };
}

export async function createSavedItem({ type, toolSlug, name, payload }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('login_required');

  const { data, error } = await supabase
    .from('saved_items')
    .insert({ user_id: user.id, type, tool_slug: toolSlug, name, payload })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function touchSavedItem(id) {
  const { error } = await supabase
    .from('saved_items')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function duplicateSavedItem(item) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('login_required');

  const { data, error } = await supabase
    .from('saved_items')
    .insert({
      user_id: user.id,
      type: item.type,
      tool_slug: item.tool_slug,
      name: `${item.name} (copy)`,
      payload: item.payload,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSavedItem(id) {
  const { error } = await supabase.from('saved_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function renameSavedItem(id, name) {
  const trimmed = (name || '').trim();
  if (!trimmed) throw new Error('Name cannot be empty.');
  const { data, error } = await supabase.from('saved_items').update({ name: trimmed }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// One count per type plus a grand total, for the tab strip above the
// Saved Items table (e.g. "All (24)", "Invoices (10)"). Supabase's JS
// client doesn't expose a simple "group by" for counts, so this runs
// one head-only count query per type in parallel — cheap since it's
// COUNT(*) with an index on (user_id, type), not a row fetch.
export async function getSavedItemCounts() {
  const types = ['invoice', 'receipt', 'template', 'document', 'calculation'];
  const results = await Promise.all(
    types.map((type) =>
      supabase.from('saved_items').select('id', { count: 'exact', head: true }).eq('type', type)
    )
  );
  const counts = {};
  types.forEach((type, i) => { counts[type] = results[i].count || 0; });
  counts.all = Object.values(counts).reduce((sum, n) => sum + n, 0);
  return counts;
}

// Downloads a saved item's payload as a plain JSON file — works for any
// tool_slug without needing a per-tool export format.
export function downloadSavedItem(item) {
  const blob = new Blob([JSON.stringify(item.payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${item.name.replace(/[^a-z0-9-_]+/gi, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Fetch one saved item by id — used by the Invoice Details page. RLS
// (saved_items_select_own) means this naturally 404s (empty result) for
// any id that isn't the caller's own, no extra ownership check needed.
export async function getSavedItemById(id) {
  const { data, error } = await supabase.from('saved_items').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

// Saved items for a single tool, newest first — used by tool pages
// (InvoiceGenerator, ReceiptGenerator, etc.) for their "Recent" list,
// and by the Dashboard for the Recent Invoices table.
export async function listSavedItemsForTool(toolSlug, { limit = 20 } = {}) {
  const { data, error } = await supabase
    .from('saved_items')
    .select('*')
    .eq('tool_slug', toolSlug)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function countSavedItemsSince(sinceIso, { type = 'all' } = {}) {
  let query = supabase
    .from('saved_items')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sinceIso);
  if (type !== 'all') query = query.eq('type', type);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count || 0;
}

// Full rows (not just a count) for a date range — used by the Dashboard
// to sum invoice/receipt payload totals for the "Profit" KPI and for
// month-over-month percentage-change comparisons, neither of which a
// plain count() can give us.
export async function listSavedItemsBetween({ type = 'all', fromIso, toIso } = {}) {
  let query = supabase.from('saved_items').select('*').gte('created_at', fromIso);
  if (toIso) query = query.lt('created_at', toIso);
  if (type !== 'all') query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}
