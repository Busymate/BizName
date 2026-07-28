import { supabaseAdmin } from '../utils/supabaseAdmin.js';

const DIGITS = '0123456789';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomFrom(chars, len) {
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// e.g. "482KQD" — 3 digits + 3 letters, per your spec.
async function generateUniqueReferralCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomFrom(DIGITS, 3) + randomFrom(LETTERS, 3);
    const { data } = await supabaseAdmin.from('profiles').select('id').eq('referral_code', code).maybeSingle();
    if (!data) return code;
  }
  throw new Error('Could not generate a unique referral code, please retry');
}

// POST /api/auth/signup  { email, password, full_name, referred_by? }
// referred_by is OPTIONAL — a user can sign up with no referral code at all.
export async function signup(req, res, next) {
  try {
    const { email, password, full_name, referred_by } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    // Validate the referral code belongs to a real user, if one was given.
    let referrer = null;
    if (referred_by) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('id, total_referrals')
        .eq('referral_code', referred_by.toUpperCase())
        .maybeSingle();
      if (!data) return res.status(400).json({ error: 'Referral code not found' });
      referrer = data;
    }

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) return res.status(400).json({ error: createErr.message });

    const referral_code = await generateUniqueReferralCode();

    const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
      id: created.user.id,
      email,
      full_name: full_name || null,
      role: 'free_user',
      plan: 'free',
      referral_code,
      referred_by: referrer ? referred_by.toUpperCase() : null,
    });
    if (profileErr) return res.status(400).json({ error: profileErr.message });

    if (referrer) {
      const { data: referrerProfile } = await supabaseAdmin
        .from('profiles')
        .select('total_referrals, referral_rewards')
        .eq('id', referrer.id)
        .maybeSingle();

      await supabaseAdmin
        .from('profiles')
        .update({
          total_referrals: (referrerProfile?.total_referrals || 0) + 1,
          referral_rewards: (referrerProfile?.referral_rewards || 0) + 1,
        })
        .eq('id', referrer.id);

      // BUG FIX (business suite): 001_init.sql created referral_rewards as
      // a bare counter with no history behind it, so the referral
      // dashboard had nothing to list. This is real history now.
      await supabaseAdmin.from('referral_events').insert({
        referrer_id: referrer.id,
        referred_user_id: created.user.id,
        referred_email: email,
        reward_kind: 'daily_bonus',
      });
    }

    res.status(201).json({ user_id: created.user.id, referral_code });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (auth required) — returns the caller's own profile
export async function me(req, res) {
  res.json({ user: req.user });
}
