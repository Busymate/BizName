# BizName — Full-Stack Setup (new additions)

This adds a real backend beside your existing frontend. **Nothing in your
existing pages, routes, components, Analytics, AdSense, Search Console
tags, or SEO was removed or rewritten** — this is new code living
alongside it.

## What's new
- `server/` — Express API (auth, Flutterwave payments, daily quotas)
- `src/context/AuthContext.jsx`, `src/lib/` — frontend auth/session/API wiring
- `src/pages/Login.jsx`, `Signup.jsx`, `Dashboard.jsx`, `PaymentCallback.jsx` — new routes only, added to `App.jsx` without touching existing routes
- `src/components/PaymentButton.jsx`, `PrivateRoute.jsx`
- `src/utils/emailClient.js` — real EmailJS wiring for Contact form + Newsletter
- `server/migrations/001_init.sql` — Supabase tables + Row Level Security
- `.env.example` (frontend) and `server/.env.example` (backend)

## 1. Supabase project
1. Create a project at https://supabase.com.
2. Project Settings → API: copy the **Project URL**, **anon public key**, and **service_role key**.
3. SQL Editor → paste and run `server/migrations/001_init.sql`.

## 2. Backend setup (`server/`)
```bash
cd server
npm install
cp .env.example .env
# fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET,
# FLUTTERWAVE_SECRET_KEY, FLUTTERWAVE_ENCRYPTION_KEY, FLUTTERWAVE_WEBHOOK_SECRET
npm run seed:admin   # creates the admin account from server/.env (ADMIN_EMAIL) as super_admin, unlimited, no ads
npm run dev          # http://localhost:5000
```
Test it's alive: open http://localhost:5000/health → `{"ok":true}`.

## 3. Frontend setup (project root)
```bash
npm install
cp .env.example .env
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_EMAILJS_*,
# VITE_FLUTTERWAVE_PUBLIC_KEY, VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
```

## 4. Where every key goes (never mix these up)
| Key | Goes in | Never put it in |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | `.env` (frontend) | — safe for browser |
| `SUPABASE_SERVICE_ROLE_KEY` | `server/.env` | Frontend, git |
| `FLUTTERWAVE_SECRET_KEY` / `FLUTTERWAVE_ENCRYPTION_KEY` / `FLUTTERWAVE_WEBHOOK_SECRET` | `server/.env` | Frontend, git |
| `VITE_FLUTTERWAVE_PUBLIC_KEY` | `.env` (frontend) | — public key is meant to be public |
| `VITE_EMAILJS_*` | `.env` (frontend) | — EmailJS public key is meant to be public |
| `JWT_SECRET` | `server/.env` | Frontend, git |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `server/.env`, only until you run `npm run seed:admin` once | Frontend, git, after seeding |

Get Flutterwave test keys from your Flutterwave dashboard → Settings →
API Keys (use the **Test** keys first, switch to Live once verified).

## 5. Testing in VS Code
- Run backend: `cd server && npm run dev` (terminal 1)
- Run frontend: `npm run dev` (terminal 2, project root)
- Sign up a test user at `/signup` (referral code optional)
- Check Supabase Table Editor → `profiles` — new row with a `referral_code` like `482KQD`
- Log in at `/login`, visit `/dashboard` — see role/plan/referral info
- Click "Upgrade to Premium" → redirects to Flutterwave test checkout → completes → redirects to `/payment/callback` → verified server-side → `profiles.plan` becomes `premium`
- Check Supabase → `transactions` table for the row
- Test the webhook locally with the Flutterwave CLI or `ngrok http 5000`, pointing your Flutterwave dashboard's webhook URL at `https://<ngrok>/api/payments/webhook`

## 6. Free-tier limits
Enforced server-side in `server/controllers/quotaController.js` against the
`usage_events` table (server clock, resets at each day's midnight) — not
localStorage, so it can't be bypassed by clearing browser storage. Call
`api.consumeQuota('tool_save' | 'article_view' | 'template_save')` right
before the corresponding save action; it returns HTTP 429 once the daily
cap (6 / 3 / 1) is hit. **This hook-up into each tool page's existing save
button is not done yet** — the endpoint exists and works, but wiring 53
individual tool pages to call it is a separate incremental step so I don't
touch working save logic in each page in one uncontrolled sweep.

## Known gaps / next steps (not yet done — by design, see below)
- Individual tool pages don't yet call `api.consumeQuota` before saving —
  needs to be added tool-by-tool so each change is verifiable.
- No admin dashboard UI yet (backend RBAC + `refund` endpoint exist; a
  `/admin` page to use them doesn't).
- Blog/article premium-view gating (3/day) isn't wired into `Blog.jsx`/`BlogPost.jsx` yet.
- Templates premium-save gating (1/day) isn't wired into `Templates.jsx` yet.
- EmailJS/Flutterwave/Supabase all require you to create real accounts and
  paste in real keys — nothing will send emails or process payments until
  you do.
