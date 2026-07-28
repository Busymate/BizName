import { supabaseAdmin } from '../utils/supabaseAdmin.js';

// Verifies the Supabase access token sent by the frontend (Authorization:
// Bearer <token>) and loads that user's row from `profiles` (role, plan,
// referral info) onto req.user. Public tool endpoints don't need this at
// all — only routes that read/write user-owned data do.
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Authorization bearer token' });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      // BUG FIX: this used to always say the generic "Invalid or expired
      // session" no matter what actually went wrong, which made this
      // undiagnosable from the frontend. Now it logs and returns the real
      // Supabase error (e.g. wrong project, key mismatch, actually expired).
      console.error('[requireAuth] supabase.auth.getUser failed:', userErr?.message || 'no user returned');
      return res.status(401).json({ error: userErr?.message || 'Invalid or expired session' });
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();
    if (profileErr || !profile) {
      console.error('[requireAuth] profile lookup failed:', profileErr?.message);
      return res.status(401).json({ error: profileErr?.message || 'No profile found for this account' });
    }

    req.user = { ...userData.user, ...profile };
    next();
  } catch (err) {
    next(err);
  }
}

// Usage: requireRole('admin', 'super_admin')
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
