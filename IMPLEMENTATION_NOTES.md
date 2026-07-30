# BizName — Business Suite Update: Implementation Notes

## Fixed since the previous ZIP

**"Error in index.ts" — this was your editor, not a real bug.** There
was no `deno.json` and no VS Code Deno-extension scoping anywhere in
the project, so your editor's normal Node/TypeScript language server
was trying to check `supabase/functions/ai-assistant/index.ts` and
flagging `Deno.serve`, `Deno.env`, and the `https://esm.sh/...` remote
import as errors — none of which Node's TS server knows about, because
this file runs on Deno, not Node. Added:
- `supabase/functions/deno.json` — marks that folder as a Deno project
- `.vscode/settings.json` — scopes the Deno extension to
  `supabase/functions` only, so the rest of the project (the actual
  Vite/React/Node app) keeps using its normal ESLint/TS setup
  unaffected

If you use VS Code, install the **Deno** extension (`denoland.vscode-deno`)
and reload — the red squiggles under `Deno.serve` / `Deno.env` should
clear immediately. If you don't use VS Code, they were always harmless.

Also carried over from the previous fix: `serve` was imported from a
Deno std module that's been removed in current Deno — that's now
`Deno.serve` (built-in, no import).

## Testing with your own keys, without ever writing them into a file that gets committed or zipped

I'm still not putting real key values into any file I hand you — same
reasoning as before, and it hasn't changed. But here's the actual
fastest path to test locally with your own Groq + Supabase keys, using
a file that's gitignored and was never part of any ZIP I've sent:

```bash
cp supabase/functions/.env.example supabase/functions/.env
# open supabase/functions/.env and paste your real keys in — this file
# is in .gitignore, it will never be committed or zipped
supabase functions serve ai-assistant --env-file supabase/functions/.env
```

That's the same 10 seconds of effort as if I'd hardcoded it, except the
keys live in a file only on your machine instead of in a file that
travels with the project (git history, zip downloads, etc.). Once
you're happy and ready to actually deploy it (not just test locally),
switch to:

```bash
supabase secrets set GROQ_API_KEY=your_key_here
supabase functions deploy ai-assistant
```

## Also found and fixed: a real admin password was sitting in `server/.env.example`

Not something I added — it was already in the project you uploaded —
but `.env.example` isn't gitignored (it's meant to be committed as a
template), and it had a working admin email + password in it, used by
`seedAdmin.js`. I replaced both with placeholders and removed the same
real email from `SETUP.md`. If this repo has ever been pushed to git,
that password is in your history — please rotate it in Supabase
regardless of anything else in this file.

This documents what changed in this pass, what you need to do to turn it
on, and what's honestly still missing so nothing here is oversold.

## ⚠️ Rotate your Groq key first

A Groq API key was pasted in plaintext in chat during this build. Treat
it as compromised — generate a new one at https://console.groq.com/keys
and use *that* one below. It was never written into any file in this
repo; the edge function only ever reads `GROQ_API_KEY` from Supabase
Secrets.

## Setup steps (in order)

1. **Run the new migration.** In the Supabase SQL editor, run
   `server/migrations/002_business_suite.sql` (after `001_init.sql`, if
   you haven't already). It adds `saved_items`, `customers`,
   `referral_events`, and `business_tips`, all with RLS.
2. **Deploy the edge function:**
   ```
   supabase functions deploy ai-assistant
   supabase secrets set GROQ_API_KEY=your_new_key_here
   ```
   The function also needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` — Supabase sets the first and third of
   those automatically for every edge function; if `SUPABASE_ANON_KEY`
   isn't already available in your project's function environment, add
   it with `supabase secrets set SUPABASE_ANON_KEY=...`.
3. **Restore your real `.env` and `server/.env`.** Both were stripped
   from this ZIP on purpose (see Security below) — copy your existing
   values back in, or start from `.env.example` / `server/.env.example`.
4. `npm install` in both the project root and `server/` (no new
   dependencies were added — `@supabase/supabase-js` was already a
   dependency in both).

## What actually changed

**Favorites → Saved Items.** Removed everywhere (Navbar, ToolCard,
ToolPageShell, Tools.jsx sidebar filter, Privacy Policy copy). Every
"Save Result" button, template bookmark, invoice, and receipt now
writes to one real Supabase table (`saved_items`) instead of
`localStorage`. `/saved-items` is a real searchable, sortable,
paginated table (open / duplicate / download / delete all work against
Supabase).

**Customers → AI Business Assistant.** New `/customers` page: real
`customers` table, segmentation (active/inactive/repeat/top-revenue)
computed in plain JS, plus a "Generate AI Insights" button that calls
the Groq-backed edge function with your actual customer data as
context.

**AI features.** One reusable edge function
(`supabase/functions/ai-assistant`) with a system prompt per feature —
Invoice/Receipt Assistant, Profit/Pricing/Inventory Advisor, Customer
Intelligence, Business Advisor (dashboard chat), Financial Summary,
Forecasting, Recommendations, Business Tips. All grounded to only use
figures you pass in `context` — the prompts explicitly tell the model
not to invent numbers.

**Business Tips.** `/business-tips` now has an AI-generated section
(cached in `business_tips`, "Generate New Tip" calls the model live)
above the existing static article grid, which is unchanged.

**Referrals.** New `/referrals` page. `referral_events` gives you real
history (was previously just a bare counter — 001_init.sql declared
`referral_rewards` on `profiles` but nothing ever wrote to it).
Referrals now actually grant +1/day bonus quota per referral, read live
by the Dashboard's usage bars and `/referrals`.

**Usage limits.** `GET /api/quota` was already reading from Supabase
(`usage_events`) — that part wasn't fake before. What was missing was
the referral bonus actually affecting the limit; that's fixed in
`quotaController.js`.

**Dashboard.** Rebuilt: stat cards (invoices/receipts/saved items this
month, total customers) from real queries, wired Quick Actions, a real
Recent Invoices table (search + sort + pagination against
`saved_items` where `type = 'invoice'`), live referral summary, and the
AI Business Advisor chat card.

**EmailJS.** Removed from the signup flow (previously sent a
best-effort "welcome email" after signup — deleted, not just made
silent). Confirmed it was never used for login, password reset, or any
other auth flow. Still used for Contact (support) and the Footer
newsletter form only.

**SEO/analytics.** Untouched — Helmet, GA4, AdSense slot, sitemap
generator script, and robots.txt are all exactly as they were.

## Security

- `.env` and `server/.env` (your real secrets) were deleted from this
  ZIP before packaging — you had real Supabase, EmailJS, and
  Flutterwave keys in there, and a downloadable ZIP isn't a safe place
  for those to live. Copy your existing values into fresh `.env` /
  `server/.env` files from the `.example` versions.
- `GROQ_API_KEY` is never read anywhere in frontend code — grep for it
  yourself: it only appears in `supabase/functions/ai-assistant/index.ts`
  as `Deno.env.get('GROQ_API_KEY')`, and in the comments explaining
  where to set it.

## Honestly still missing / next steps

- **No automated tests were run.** `npm install` requires network
  access this environment doesn't have, so this wasn't built or
  `npm run build`-verified. All new JSX/JS was manually reviewed and
  bracket-balance-checked, and all touched server files passed
  `node --check`, but please run `npm run build` yourself before
  deploying.
- **No invoice ↔ customer linking yet.** Saving an invoice doesn't
  automatically create/update a row in `customers` — Customers is a
  separate manually-managed list for now. Wiring "client name on an
  invoice" to "customer record" (fuzzy name matching, or a dropdown to
  pick an existing customer) is a reasonable next step but wasn't in
  scope for this pass.
- **No conversation history persistence for the AI chat** — the
  Business Advisor and Customer Intelligence chats are stateless per
  page load (history is kept in React state only, not saved to a
  table). Fine for now; add an `ai_conversations` table if you want
  chat history to survive a refresh.
- **Business Tips personalization** exists in the edge function
  (`context.personalized`) but isn't wired to a UI toggle yet — the
  "Generate New Tip" button on `/business-tips` always generates a
  general tip, not one based on your own saved invoices/customers.
- **Inventory Advisor and Pricing Assistant** system prompts exist in
  the edge function but aren't called from any page yet — there's no
  dedicated UI for them. `askAI({ feature: 'inventory_advisor', ... })`
  / `'pricing_assistant'` are ready to wire into
  `InventoryCalculator.jsx` / `PricingCalculator.jsx` whenever you want.
