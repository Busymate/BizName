import { supabaseAdmin } from '../utils/supabaseAdmin.js';

// BizName is currently free for everyone — no daily caps, no premium
// gating. usage_events is still recorded and counted here so the
// Dashboard's "Daily Usage" card can show real numbers (tools used,
// articles read, templates used today), it just no longer blocks
// anything or compares against a limit. If paid limits come back later,
// this is the one place to reintroduce them — the counting logic below
// (server-midnight reset) doesn't need to change either way.
const KINDS = ['tool_save', 'article_view', 'template_save', 'ai_request'];

// GET /api/quota — today's usage counts for the logged-in user. No
// limits, no "unlimited" flag needed since everything already is.
export async function getQuota(req, res, next) {
  try {
    const profile = req.user;

    const since = new Date();
    since.setHours(0, 0, 0, 0); // server-time midnight, resets daily

    const { data, error } = await supabaseAdmin
      .from('usage_events')
      .select('kind')
      .eq('user_id', profile.id)
      .gte('created_at', since.toISOString());
    if (error) throw error;

    const counts = { tool_save: 0, article_view: 0, template_save: 0, ai_request: 0 };
    for (const row of data) counts[row.kind] = (counts[row.kind] || 0) + 1;

    res.json({ used: counts, referralBonus: profile.referral_rewards || 0 });
  } catch (err) {
    next(err);
  }
}

// POST /api/quota/consume  { kind: 'tool_save' | 'article_view' | 'template_save' }
// Records the usage event for the Daily Usage counters. Always allowed —
// this used to 429 once a free-tier cap was hit; there is no cap now.
export async function consumeQuota(req, res, next) {
  try {
    const { kind } = req.body;
    if (!KINDS.includes(kind)) return res.status(400).json({ error: 'Unknown quota kind' });

    const profile = req.user;
    const { error: insertErr } = await supabaseAdmin
      .from('usage_events')
      .insert({ user_id: profile.id, kind });
    if (insertErr) throw insertErr;

    res.json({ allowed: true });
  } catch (err) {
    next(err);
  }
}
