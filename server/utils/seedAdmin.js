// One-time script: creates (or upgrades) your admin account in Supabase.
// Run from server/: npm run seed:admin
// Reads ADMIN_EMAIL / ADMIN_PASSWORD from server/.env — after running
// once successfully, you can delete those two lines from .env.
import dotenv from 'dotenv';
dotenv.config();
import { supabaseAdmin } from './supabaseAdmin.js';

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.');
    process.exit(1);
  }

  // Reuse the existing auth user if it's already there (idempotent).
  const { data: existingList } = await supabaseAdmin.auth.admin.listUsers();
  let user = existingList?.users?.find((u) => u.email === email);

  if (!user) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = created.user;
    console.log('Created auth user:', user.id);
  } else {
    console.log('Auth user already exists:', user.id);
  }

  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  const referral_code = existingProfile ? undefined : (Math.floor(100 + Math.random() * 900) + 'ADM');

  const upsertData = {
    id: user.id,
    email,
    role: 'super_admin',
    plan: 'premium', // admin gets every tool/premium feature free, no ads
    premium_expires_at: null, // null + role check = unlimited forever, see quotaController
    ...(referral_code ? { referral_code } : {}),
  };

  const { error: upsertErr } = await supabaseAdmin.from('profiles').upsert(upsertData);
  if (upsertErr) throw upsertErr;

  console.log(`✅ Admin ready: ${email} (role: super_admin, plan: premium, unlimited, no ads)`);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
