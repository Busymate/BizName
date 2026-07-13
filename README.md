# BizName — Free Business Tools

Free Business Tools — Everything small businesses need in one place. A React + Vite, client-only web app: no backend, no database, no paid services. Every tool runs in the browser and persists via `localStorage`.

## 1. Folder Structure

```
bizname/
├── index.html
├── package.json
├── vite.config.js
├── scripts/
│   └── generate-sitemap.js
├── public/
│   ├── favicon.svg
│   └── robots.txt
└── src/
    ├── main.jsx                  # ReactDOM root, Router + Helmet providers
    ├── App.jsx                   # All routes (lazy-loaded)
    ├── index.css                 # Design system / global styles
    ├── components/                # Reusable, cross-page components
    │   ├── Layout.jsx
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── Button.jsx
    │   ├── ToolCard.jsx
    │   ├── AdSlot.jsx             # Monetization placeholder
    │   ├── SEO.jsx                # react-helmet-async wrapper
    │   ├── ToolPageShell.jsx      # Shared chrome for every tool page
    │   ├── GenericCalculatorPage.jsx   # Engine for simple formula tools
    │   ├── GenericGeneratorPage.jsx    # Engine for text-generator tools
    │   ├── GenericQrPage.jsx           # Engine for QR/barcode tools
    │   └── DocumentGeneratorPage.jsx   # Engine for quote/estimate/delivery note
    ├── pages/                     # One .jsx per route (see list below)
    ├── styles/                    # One .css per page/component, same name
    ├── hooks/
    │   ├── useLocalStorage.js
    │   ├── useFavorites.js
    │   ├── useRecentTools.js
    │   ├── useSavedCalculations.js
    │   └── useDarkMode.js
    ├── utils/
    │   ├── storage.js             # Raw localStorage read/write helpers
    │   └── taxEngine.js           # Shared PAYE tax-band calculator
    └── data/
        ├── tools.js                # Registry of all 45 tools
        ├── blogPosts.js
        └── templates.js
```

### Why some tools share an "engine" component

Full bespoke implementations are provided for the ten highest-traffic
tools (Invoice, Receipt, Profit, VAT, Discount, Pricing, Break-even, Loan,
Salary, Tax). The remaining tools follow the same UX contract (title,
description, inputs, results, save/print/copy/share, recent, favorite)
but are simple enough to share one of four config-driven engines:

- **`GenericCalculatorPage`** — single-formula calculators (markup, ROI,
  shipping, sales tax, unit price, leave, overtime, attendance, gratuity,
  bonus, inventory, profit margin, fuel cost).
- **`GenericGeneratorPage`** — client-side template text generators
  (business names, slogans, hashtags, social posts, email templates, ad
  copy, product descriptions). No external AI API is called — generation
  is template + keyword based, entirely in the browser.
- **`GenericQrPage`** — QR code / barcode tools. Rendering uses the free,
  keyless public `api.qrserver.com` and `barcodeapi.org` image endpoints
  (no backend of our own, no paid service). Swap for the `qrcode` npm
  package + `<canvas>` if you want fully offline generation.
- **`DocumentGeneratorPage`** — quotation, estimate and delivery note,
  which are structurally identical to the invoice generator (business
  info + line items + printable preview).

Each thin page file still gets its own `.jsx` in `src/pages/` and its own
`.css` in `src/styles/` per the project convention, even when most of the
logic lives in the shared engine.

## 2. Package Installation

```bash
npm create vite@latest bizname -- --template react
cd bizname
npm install react-router-dom react-helmet-async bootstrap aos @fortawesome/fontawesome-free
```

Then copy every file from this project into the generated folder
(overwriting `src/App.jsx`, `src/main.jsx`, `index.html`, etc.), or clone
this repository directly if you received it as a git repo / zip.

```bash
npm install
npm run dev       # http://localhost:5173
```

## 3. App.jsx / Routing

All 56 routes (9 static pages + 2 dynamic + 45 tools) are registered in
`src/App.jsx` using `React.lazy` + `Suspense` for code splitting, wrapped
in a shared `<Layout>` (Navbar + Footer) and `<ScrollToTop>`. A catch-all
`*` route renders `NotFound` (404).

## 4. Components

See `src/components/`. Every component is presentational + hooks-based,
no class components, no external state library — `localStorage` via
custom hooks is the only persistence layer.

## 5. Pages

Full list in `src/pages/`, one file per route:

**Core:** Home, Tools, Templates, Blog, BlogPost, BusinessTips, About,
Contact, PrivacyPolicy, TermsOfService, NotFound.

**Tools:** InvoiceGenerator, ReceiptGenerator, QuotationGenerator,
EstimateGenerator, DeliveryNoteGenerator, ProfitCalculator, VatCalculator,
DiscountCalculator, PricingCalculator, BreakEvenCalculator,
LoanCalculator, SalaryCalculator, TaxCalculator, MarkupCalculator,
CurrencyCalculator, RoiCalculator, StartupCostCalculator,
BusinessNameGenerator, SloganGenerator, SwotAnalysis,
SocialMediaPostGenerator, HashtagGenerator, EmailTemplateGenerator,
AdCopyGenerator, ProductDescriptionGenerator, QrCodeGenerator,
WhatsappQrGenerator, VcardQrGenerator, UrlQrGenerator, BarcodeGenerator,
ShippingCalculator, ProfitMarginCalculator, SalesTaxCalculator,
InventoryCalculator, UnitPriceCalculator, LeaveCalculator,
OvertimeCalculator, AttendanceCalculator, GratuityCalculator,
BonusCalculator, UnitConverter, DateCalculator, TimeCalculator,
FuelCostCalculator, AgeCalculator.

## 6. CSS

One stylesheet per page/component in `src/styles/`, imported directly by
its matching `.jsx` file. Shared layout patterns (`Calculator.css`,
`InvoiceGenerator.css`) are `@import`-ed by the pages that reuse that
layout, so every page's CSS module still loads correctly even though
routes are code-split and lazy-loaded independently. Design tokens
(colors, spacing, radius) live as CSS custom properties in
`src/index.css`, with a `[data-theme='dark']` override block for dark
mode.

## 7. LocalStorage Helpers

`src/utils/storage.js` exposes `getItem`/`setItem`/`removeItem` with
try/catch safety. `src/hooks/` wraps these into typed, page-friendly
hooks:

- `useLocalStorage(key, initial)` — generic persisted state
- `useFavorites()` — favorite tool slugs
- `useRecentTools()` — last 8 tools visited
- `useSavedCalculations(toolSlug)` — per-tool saved results (used by
  every "Save Result" button)
- `useDarkMode()` — persisted theme + `data-theme` attribute toggle

## 8. Monetization Positions

`src/components/AdSlot.jsx` renders a placeholder block with `type`
(`banner` | `sidebar` | `in-content` | `sponsored`). Positions are
already placed on Home, Blog, and every tool page (`ToolPageShell`
renders one automatically under every tool's action row). Swap the
placeholder markup for a real `<ins class="adsbygoogle">` tag once you
have an AdSense account, or for an affiliate widget / sponsored-post
component — no other code changes needed. Template cards in
`src/data/templates.js` also have a `toolSlug: null` pattern reserved
for "premium template" upsells.

## 9. Deployment Instructions

### Build

```bash
npm run build      # outputs to dist/, then generates public/sitemap.xml
npm run preview     # sanity-check the production build locally
```

### Static hosting (Vercel / Netlify / Cloudflare Pages / GitHub Pages)

1. Push this repo to GitHub.
2. Connect the repo in your host of choice.
3. Build command: `npm run build` — Output directory: `dist`.
4. Because this is a client-side SPA using `react-router-dom`, configure
   a rewrite so all paths serve `index.html`:
   - **Vercel**: add a `vercel.json` with
     `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
   - **Netlify**: add `public/_redirects` with `/* /index.html 200`
   - **Cloudflare Pages**: enable "Single Page Application" mode in
     project settings.
5. Update `SITE_URL` in `scripts/generate-sitemap.js` and the canonical
   URLs in `index.html` / `src/components/SEO.jsx` to your real domain.
6. If enabling Google AdSense, add the AdSense script tag to
   `index.html` `<head>` and replace `AdSlot.jsx`'s placeholder markup
   with real `<ins class="adsbygoogle">` units.

No environment variables, API keys, or server config are required —
this is a fully static site.
