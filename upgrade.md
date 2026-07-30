# BizName → Business OS Migration Plan

**Stack decisions:** Supabase (Postgres + Auth + Storage + Edge Functions) · Flutterwave (billing) · existing React 18 + Vite + React Router frontend, preserved and extended.

This plan is based on a direct audit of your uploaded codebase (`buzy.zip`), not assumptions. Findings referenced below are real, current facts about your repo.

---

## 0. Audit Summary (current state, verified)

| Area | Status |
|---|---|
| Framework | React 18.3 + Vite 5 + React Router 6, clean `lazy()`-loaded routes |
| Tool pages | **51 tools already built** (financial, HR, documents, QR/barcode, marketing copy) — far more than initially described |
| Styling | Bootstrap 5 + AOS + Font Awesome, all installed and wired |
| GSAP | **Not installed, not used anywhere** in the codebase — needs a decision |
| Google Analytics | **Not present** — no `gtag.js`, no measurement ID anywhere in the repo |
| AdSense | Loader script live in `index.html` with real publisher ID (`ca-pub-9529159848617968`); all 4 ad slot IDs in `AdSlot.jsx` are `null` placeholders — not actually serving ads yet |
| Search Console | Real verification meta tag present in `index.html` — do not touch |
| Domain | Hardcoded as `bizname.example.com` in `index.html`, `SEO.jsx`, and `scripts/generate-sitemap.js` — needs correcting to `bizname.com.ng` |
| SEO | `react-helmet-async` + per-page `<SEO>` component + JSON-LD Organization schema + sitemap generator script (`postbuild` hook) — solid foundation |
| Data/state | 100% `localStorage`, via `useLocalStorage`, `useFavorites`, `useRecentTools`, `useSavedCalculations`, `useDarkMode` — no backend, no accounts, nothing syncs across devices |
| Hosting | `netlify.toml` + `public/_redirects`, SPA fallback configured — need to confirm this is still where `.com.ng` points |
| Blog | 384-line data file, real content structure already in place |
| Legal | Privacy Policy, Terms of Service, Cookie Consent component already present |

**Bottom line:** the free-tools product is more complete than expected. The actual gap is entirely the SaaS layer — there is currently zero backend, zero accounts, zero billing. That's Phases 3–5 below.

---

## 1. Non-Negotiables (apply to every phase)

1. **Every existing URL keeps working**, character-for-character. No route path changes without a 301 in `_redirects`.
2. **No page currently reachable without login stays behind login.** All 51 tools + blog + templates remain free and public — the dashboard is *additive*, not a replacement.
3. `index.html`'s AdSense loader, GSC verification meta tag, and JSON-LD stay intact through every phase — only the domain string gets corrected.
4. Every commit/PR in Phase 1 (the reorg) must be behavior-identical — verified by diffing rendered output, not just "it builds."
5. Supabase and Flutterwave keys are environment variables from day one — never hardcoded, never committed.

---

## 2. Target Architecture

```
bizname/
├── public/
├── src/
│   ├── app/                      # NEW: authenticated dashboard (Business OS)
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── routes/               # /app/* — invoices, customers, reports...
│   │   ├── modules/
│   │   │   ├── invoicing/
│   │   │   ├── inventory/
│   │   │   ├── customers/
│   │   │   ├── expenses/
│   │   │   ├── team/
│   │   │   └── reports/
│   │   └── state/                # dashboard-scoped context/stores
│   ├── marketing/                # RENAMED from current src/pages (public site)
│   │   ├── pages/                # Home, Tools, Blog, About, legal...
│   │   └── tools/                # the 51 existing free calculators/generators
│   ├── shared/                   # cross-cutting: Navbar, Footer, SEO, Button, ToolCard...
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.js
│   │   │   └── queries/          # one file per table/domain
│   │   └── flutterwave/
│   ├── hooks/                    # existing hooks, extended with Supabase-aware variants
│   ├── data/                     # tools.js, blogPosts.js, templates.js — unchanged
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── migrations/                # SQL schema, versioned
│   └── functions/                 # Edge Functions (Flutterwave webhook, etc.)
└── scripts/
    └── generate-sitemap.js
```

Key idea: **the public tools site and the logged-in Business OS are two route trees in the same app** (`/` vs `/app/*`), sharing the same design system, but the dashboard is code-split so a free-tool visitor's bundle never grows.

---

## 3. Phase Plan

### Phase 0 — Fix What's Actually Broken (1–2 days, no architecture change)
- Replace `bizname.example.com` → `https://bizname.com.ng` in `index.html`, `SEO.jsx`, `scripts/generate-sitemap.js`, and the JSON-LD block
- Decide and implement GA4: add `gtag.js` + measurement ID (you'll need to create/locate the GA4 property)
- Decide on GSAP: install only if you have a specific animation need beyond what AOS already covers — otherwise skip to avoid unnecessary bundle weight
- Get real AdSense ad-unit slot IDs from your AdSense dashboard and populate `ADSENSE_SLOTS` in `AdSlot.jsx`
- Confirm `.com.ng` DNS still points at Netlify; reconfirm `netlify.toml` build command matches

**Ship this alone first** — it's low-risk, fixes real gaps, and doesn't touch structure.

### Phase 1 — Reorganize (3–5 days, zero behavior change)
- Move `src/pages/*` tool pages → `src/marketing/tools/`, static pages → `src/marketing/pages/`
- Move `Navbar`, `Footer`, `SEO`, `Button`, `ToolCard`, `AdSlot`, `CookieConsent` → `src/shared/`
- Update all imports; update `App.jsx` route definitions to point at new file locations — **route *paths* in `<Route path="...">` do not change, only the import source**
- Add a `src/app/` skeleton (empty layout + a placeholder `/app` route behind a feature flag, not linked from nav yet)
- Regression check: every one of the 51 tool routes + static pages loads identically pre/post move

### Phase 2 — Supabase Foundation (3–4 days)
- Create Supabase project; add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as env vars (Netlify env settings, not committed)
- `src/lib/supabase/client.js` — single client instance
- Auth: email/password + Google OAuth via Supabase Auth UI or custom form matching your design system
- Initial schema (see §4 below) with Row-Level Security (RLS) from the first migration — never add RLS as an afterthought
- `/app/login`, `/app/signup`, `/app/dashboard` (empty shell) routes, gated by an `AuthGuard` wrapper

### Phase 3 — Migrate Local Data → Synced Data (4–6 days)
- Extend `useFavorites`, `useRecentTools`, `useSavedCalculations` with a Supabase-backed variant that:
  - Falls back to `localStorage` for **anonymous** visitors (preserve the current no-signup-required experience for the free tools — this is core to your SEO/AdSense traffic)
  - Syncs to Supabase automatically once a visitor logs in, merging their local data into their account (one-time import on first login)
- This is the bridge that turns "free tools" into "free tools that get better with an account" without breaking the current experience for anonymous users

### Phase 4 — Flutterwave Billing (4–5 days)
- `businesses` table gets a `plan` + `subscription_status` column
- Supabase Edge Function as the Flutterwave webhook receiver (verifies signature, updates subscription status) — never trust the client for payment confirmation
- Pricing page + checkout flow using Flutterwave's hosted payment page (fastest to ship, PCI scope stays off you)
- Plan gating: which `/app/*` modules require Pro vs. Free tier

### Phase 5 — Business OS Modules (ongoing, ship incrementally)
Priority order (each is its own mini-project once Phase 4 lands):
1. **Customers/CRM** — turns Invoice/Receipt/Quotation generators from one-off documents into a real customer ledger
2. **Inventory** — connects to the existing Inventory Calculator concept, but persistent
3. **Expenses** — simple ledger, feeds the existing Profit/Break-even calculators with real data instead of manual entry
4. **Team/roles** — invite staff, permission levels (owner/admin/staff)
5. **Reports dashboard** — aggregates the above into the kind of "run my business" view that justifies a paid plan

### Phase 6 — Enterprise Polish (parallel/ongoing)
- Shared design tokens (see `frontend-design` conventions) so `/app` and the marketing site feel like one product, not two
- Error monitoring (Sentry or similar)
- Basic CI: lint + build on every PR
- Staging environment before every production deploy

---

## 4. Initial Database Schema (Supabase/Postgres)

```sql
-- Core tenancy
businesses (id, name, owner_id, plan, subscription_status, created_at)
memberships (id, business_id, user_id, role)  -- owner | admin | staff

-- Existing tools, now optionally persisted
saved_calculations (id, business_id, user_id, tool_slug, input_json, result_json, created_at)
favorites (id, user_id, tool_slug)
recent_tools (id, user_id, tool_slug, last_used_at)

-- Business OS modules (Phase 5)
customers (id, business_id, name, email, phone, created_at)
invoices (id, business_id, customer_id, items_json, status, total, currency, created_at)
expenses (id, business_id, category, amount, currency, note, created_at)
inventory_items (id, business_id, name, sku, quantity, unit_cost, created_at)

-- Billing
subscriptions (id, business_id, flutterwave_customer_id, plan, status, current_period_end)
```

All tables get RLS policies scoped to `business_id` via `memberships`, so one business can never see another's data.

---

## 5. Risk Register

| Risk | Mitigation |
|---|---|
| Reorg (Phase 1) silently breaks a route or SEO tag | Do it as its own PR with a route-by-route checklist before merging; no feature work in the same PR |
| Domain fix breaks canonical URLs mid-migration | Ship Phase 0 alone, verify in Search Console, *then* start Phase 1 |
| Anonymous users lose their local data on login | Explicit one-time merge step in Phase 3, tested before rollout |
| AdSense revenue dips if `/app` accidentally gets ad-blocked pages indexed | Add `noindex` to all `/app/*` routes via `SEO.jsx` from day one |
| Flutterwave webhook spoofing | Signature verification in the Edge Function, never trust client-reported payment status |

---

## 6. What I Need From You Before Phase 0 Starts

- Confirmation: is `.com.ng` currently pointed at Netlify (same host as this repo), or elsewhere?
- A GA4 measurement ID (or confirmation you want me to note where to create one)
- Real AdSense ad-unit slot IDs (or confirmation to leave placeholders until you have them)
- Supabase project created (or should I walk you through creating one first?)
- Flutterwave account status: test/sandbox keys available yet?

---

**Suggested next step:** approve Phase 0, and I'll make those fixes directly in your codebase — smallest possible diff, fully reversible, no structural changes.
