import { supabase } from './supabaseClient';

export async function listCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('total_spent', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

// `initialAmount` + `paid` let the Add Customer modal record a first
// order right at creation instead of forcing a separate step: if paid,
// the amount goes straight into total_spent (money actually received);
// if unpaid, it goes into outstanding_balance (money owed) instead —
// total_spent should only ever reflect money that's actually been paid.
// Either way, entering an amount counts as one order and sets
// last_purchase_at, since it represents a real transaction either way.
export async function createCustomer({ name, email, phone, initialAmount, paid = true }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('login_required');

  const amount = Number(initialAmount || 0);
  const hasInitialOrder = amount > 0;

  const { data, error } = await supabase
    .from('customers')
    .insert({
      user_id: user.id,
      name,
      email,
      phone,
      total_spent: hasInitialOrder && paid ? amount : 0,
      outstanding_balance: hasInitialOrder && !paid ? amount : 0,
      orders_count: hasInitialOrder ? 1 : 0,
      last_purchase_at: hasInitialOrder ? new Date().toISOString() : null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function recordCustomerPurchase(customerId, amount) {
  const { data: current, error: fetchErr } = await supabase
    .from('customers')
    .select('total_spent, orders_count')
    .eq('id', customerId)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);

  const { error } = await supabase
    .from('customers')
    .update({
      total_spent: Number(current.total_spent || 0) + Number(amount || 0),
      orders_count: (current.orders_count || 0) + 1,
      last_purchase_at: new Date().toISOString(),
    })
    .eq('id', customerId);
  if (error) throw new Error(error.message);
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Plain-JS segmentation used to build the `context` sent to the
// customer_intelligence AI feature, and to render the insight cards
// instantly without waiting on the model for the parts that are just
// arithmetic (inactive detection, revenue ranking).
export function segmentCustomers(customers) {
  const now = Date.now();
  const DAY = 1000 * 60 * 60 * 24;

  const inactive = customers.filter(
    (c) => c.last_purchase_at && now - new Date(c.last_purchase_at).getTime() > 30 * DAY
  );
  const repeat = customers.filter((c) => (c.orders_count || 0) >= 2);
  const topByRevenue = [...customers].sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0)).slice(0, 5);
  const likelyToPurchaseSoon = customers.filter((c) => {
    if (!c.last_purchase_at || (c.orders_count || 0) < 2) return false;
    const daysSince = (now - new Date(c.last_purchase_at).getTime()) / DAY;
    return daysSince >= 20 && daysSince <= 45; // roughly due for their next repeat purchase
  });

  // "At churn risk": a repeat customer (2+ orders — they had a habit)
  // who's gone quiet for 45+ days. This is a simple recency rule, not a
  // trained model — labelled as a heuristic everywhere it's shown in
  // the UI rather than presented as an ML "prediction".
  const atChurnRisk = customers.filter((c) => {
    if ((c.orders_count || 0) < 2 || !c.last_purchase_at) return false;
    const daysSince = (now - new Date(c.last_purchase_at).getTime()) / DAY;
    return daysSince > 45;
  });

  // Suggested win-back / loyalty discounts — a rule of thumb, not a
  // pricing engine: bigger discount the longer a repeat, higher-value
  // customer has been quiet. Meant as a starting point for the business
  // owner to review, not an automatic action.
  const medianSpend = (() => {
    const spends = [...customers].map((c) => Number(c.total_spent || 0)).sort((a, b) => a - b);
    if (spends.length === 0) return 0;
    const mid = Math.floor(spends.length / 2);
    return spends.length % 2 ? spends[mid] : (spends[mid - 1] + spends[mid]) / 2;
  })();

  const suggestedDiscounts = atChurnRisk
    .map((c) => {
      const daysSince = c.last_purchase_at ? (now - new Date(c.last_purchase_at).getTime()) / DAY : 0;
      const highValue = Number(c.total_spent || 0) >= medianSpend;
      const pct = highValue ? (daysSince > 90 ? 20 : 15) : 10;
      return { customer: c, pct, reason: highValue ? 'high-value repeat customer gone quiet' : 'repeat customer gone quiet' };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  return {
    total: customers.length,
    active: customers.length - inactive.length,
    inactive,
    repeat,
    topByRevenue,
    likelyToPurchaseSoon,
    atChurnRisk,
    suggestedDiscounts,
  };
}
