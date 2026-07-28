import { supabase } from './supabaseClient';

// Reads directly from Supabase (RLS restricts rows to
// referrer_id = auth.uid(), see 002_business_suite.sql) — no Express
// route needed for a plain "list my own rows" query.
export async function listReferralHistory() {
  const { data, error } = await supabase
    .from('referral_events')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

// Cross-user leaderboard — goes through a SECURITY DEFINER function
// (see server/migrations/004_referral_leaderboard.sql) since RLS on
// profiles only allows reading your own row. The function itself only
// ever returns a display name + count, never email/id/role/plan.
export async function getReferralLeaderboard(limit = 10) {
  const { data, error } = await supabase.rpc('referral_leaderboard', { result_limit: limit });
  if (error) throw new Error(error.message);
  return data || [];
}

// Groups a user's own referral_events by calendar month for the
// "Monthly rewards" breakdown — plain client-side aggregation over data
// already fetched by listReferralHistory(), no extra round-trip.
export function groupReferralsByMonth(history) {
  const buckets = new Map();
  for (const row of history) {
    const d = new Date(row.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return [...buckets.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 6)
    .map(([key, count]) => {
      const [year, month] = key.split('-');
      const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      return { key, label, count };
    });
}
