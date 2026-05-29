# Alliance Travel — guided-tour static site

Marketing site for **Alliance Travel**, a French-language travel agency physically located in **Bordj Bou Arreridj (BBA), Algeria** with three branches: BBA La Graf (Siège), BBA Cité Zehour, and M'Sila. Six pages: a homepage hub and five guided-tour landing pages — Le Caire + Sharm El Sheikh, Sharm El Sheikh (departure from Constantine), Istanbul, Azerbaïdjan (Bakou + Gabala), and Kuala Lumpur (Malaisie).

Conversion path: pre-filled WhatsApp message via `wa.me/213…` deep-links — with email + clipboard fallbacks for users without WhatsApp. **No backend.** No accounts. No payment processing. The calculator on each trip page computes a price in DZD and pre-fills WhatsApp; everything else happens in the agency.

---

## Quick start

```bash
# Option 1 — Python (no Node needed)
python -m http.server 5500 --directory site

# Option 2 — npx (faster live-reload)
npx serve site -p 5501 --no-clipboard
```

Open <http://localhost:5500/>.

### Tests

The site ships as static files, but the client-side business logic (pricing
calculator, booking-form rules) is unit-tested with [Vitest](https://vitest.dev/):

```bash
npm install        # one-time: installs Vitest
npm test           # run the unit suite
npm run test:watch  # watch mode while developing
npm run verify:i18n  # check every data-i18n key resolves in FR/EN/AR
npm run verify:links # check sitemap, _redirects, and all internal links resolve
```

All three (`npm test`, `npm run verify:i18n`, `npm run verify:links`) run in CI
(`.github/workflows/deploy.yml`) and **gate the Cloudflare deploy** — a red
suite blocks the release. The pure,
testable logic lives at the top of `site/assets/js/calculator.js` and
`site/assets/js/booking-form.js`, exported via a `module.exports` guard that is
a no-op in the browser.

> **First-time? Read [`docs/HANDOFF.md`](docs/HANDOFF.md) — the master context document.** It covers every decision, every failed approach, every architectural choice, and the full v21 cleanup cycle. Other docs are referenced from there.

---

## Critical docs (in reading order)

1. **[`docs/HANDOFF.md`](docs/HANDOFF.md)** — Master context. Read first.
2. **[`docs/ROADMAP.md`](docs/ROADMAP.md)** — Phase-by-phase commit log with metrics.
3. **[`docs/DEPLOY.md`](docs/DEPLOY.md)** — 30-minute Cloudflare Pages go-live walkthrough.
4. **[`docs/MOTION-CLEANUP-MASTER.md`](docs/MOTION-CLEANUP-MASTER.md)** — Design contract: tokens, motion vocab, performance contract, cinematic doctrine.
5. **[`docs/CLEANUP-SURVEY.md`](docs/CLEANUP-SURVEY.md)** — The 19 locked design decisions.

---

## Project layout

```
alliance-travel/
├── site/                          ← the deploy target (this folder ships)
│   ├── index.html                 ← homepage
│   ├── 404.html                   ← branded error page
│   ├── _headers                   ← Cloudflare Pages cache + security headers
│   ├── _redirects                 ← trailing-slash + typo aliases
│   ├── robots.txt                 ← crawler config
│   ├── sitemap.xml                ← 6 URLs with lastmod + image:image
│   ├── site.webmanifest           ← PWA manifest
│   ├── sw.js                      ← service worker (cache: alliance-v21-2026-05-13)
│   ├── {cairo-sharm,sharm-constantine,istanbul,azerbaidjan,kuala-lumpur}/index.html
│   └── assets/
│       ├── css/styles.css         ← single CSS file (~9,115 lines after v21 cleanup + tokens, 50 KB gzip)
│       ├── js/                    ← 8 vanilla modules (3,913 lines total)
│       │   ├── enhance.js              reveals, counters, share, toasts          (382)
│       │   ├── enhance-pro.js          polish layer + single scroll coordinator  (663)
│       │   ├── scroll-hero.js          scroll-pinned cinematic hero              (304)
│       │   ├── globe.js                cobe-powered 3D globe on homepage          (340)
│       │   ├── algeria-map.js          MapLibre map: 3 real agency locations      (528)
│       │   ├── trip-map.js             per-trip itinerary MapLibre map           (561)
│       │   ├── calculator.js           price calc per trip page                  (432)
│       │   └── booking-form.js         WhatsApp/email/copy dossier                (703)
│       └── images/
│           ├── heroes/             5 destinations × {desktop, mobile} × {jpg, webp}
│           ├── heroes-v2/          trip-page hero bg + fg layers
│           ├── trips/              homepage trip-card thumbs
│           ├── hotels/             hotel card photos
│           ├── og/                 6 page-specific OG share images (1200×630)
│           ├── favicon/            16/32/96/180/192/512 + .ico
│           └── icons/              inline-SVG icons stored locally
├── docs/                          ← living documentation (see "Critical docs" above)
├── source of truth/               ← client PDFs / DOCX briefs (immutable)
├── _archive/                      ← historical artifacts (frozen)
│   ├── migrations/                ← 38 stale _vNN_*.py / _vNN_*.css migration scripts
│   ├── handoff-snapshot-v5.2/
│   ├── heroes-original/           ← uncompressed source photos
│   └── ...
├── .github/workflows/deploy.yml   ← optional CI auto-deploy via Cloudflare API
├── wrangler.toml                  ← CF Pages config (project: "alliance-travel", output: "site")
├── .gitignore
└── README.md                      ← you are here
```

---

## Tech stack

- **HTML5** — hand-written, semantic, 6 pages
- **CSS** — single file (`site/assets/css/styles.css`), one canonical `:root` token block + one `[data-theme="light"]` override, no preprocessor, no PostCSS
- **JS** — vanilla, IIFE-wrapped modules, no framework, no bundler, no transpiler
- **Fonts** — DM Sans via Google Fonts (subset: 300/400/500/600/700 + italic 400)
- **3D globe** — [cobe](https://github.com/shuding/cobe) via esm.sh CDN (with graceful fallback)
- **2D maps** — [MapLibre GL JS](https://maplibre.org) via unpkg CDN + free CARTO basemap tiles (no API key)
- **Service worker** — vanilla, no Workbox
- **Hosting target** — Cloudflare Pages free tier (zero recurring cost)

**No build step.** Edit files, refresh browser, commit, push, deploy.

---

## Architecture highlights

- **Single source of truth for tokens.** One canonical `:root` block at the top of `styles.css` (lines ~80-180) defines all design tokens. One `:root[data-theme="light"]` block immediately below redefines the deltas. Pre-v21 there were 5 scattered `:root` blocks — consolidated in Phase A.1 of the v21 cleanup.
- **One motion vocabulary.** 4 canonical durations (`--t-fast`, `--t-base`, `--t-slow`, `--t-cinema`) × 4 canonical easings (`--ease-out`, `--ease-spring`, `--ease-snap`, `--ease-bounce` — the last reserved for delight moments only). Every transition routes through tokens. Zero raw `cubic-bezier()` usages outside the canonical block.
- **`<body data-region="…">`** is the **single switch** for per-region theming, atmospheric SVG body patterns, and accent colors on trip pages. Regions: `egypt`, `sharm`, `istanbul`, `azerbaijan`, `malaysia`.
- **Theme toggle** persists to `localStorage` (`at-theme` key), respects system `prefers-color-scheme` until user explicitly chooses.
- **Performance Contract** (10 non-negotiable rules) — GPU props only for animation, IntersectionObserver-gated decorative loops, single rAF scroll coordinator, prefers-reduced-motion respected. See `docs/MOTION-CLEANUP-MASTER.md` §0a.
- **Cinematic Doctrine** — "one element commands the eye at a time; rest hold breath." The site is cinematic + clean (not cinematic OR clean).
- **Real 3-agency network.** BBA La Graf (Siège) + BBA Cité Zehour + M'Sila. Map shows actual MapLibre pins with anti-clutter engine merging same-city pins into a "+1" cluster.
- **Per-region hero photos** via `<picture>` with WebP-first sources + mobile-cropped variants at `(max-width: 768px)`.
- **LCP preload** on every page — `<link rel="preload" as="image" fetchpriority="high">` for the LCP hero with responsive srcset.
- **Sticky inquiry bar** on trip pages slides in from top after hero scroll; pushes nav down via `body.has-sticky-bar` class (no `:has()` dependency).
- **WhatsApp FAB** bottom-right, GPU-pulse via `::before` pseudo-element (not animated box-shadow — Performance Contract compliant).
- **Service worker:** network-first for HTML, stale-while-revalidate for CSS/JS/fonts, cache-first for images. Cache name bumps on every release.
- **Lightbox** is keyboard-accessible (tabindex, Enter/Space activate, Esc/←/→ to navigate, focus restored to trigger on close).
- **Calculator → booking-form** communicate via the `calcStateUpdated` custom event. Booking form composes a WhatsApp / email / clipboard payload from the live calc state.

---

## SEO foundation (production-ready)

- 17 JSON-LD blocks across 6 pages, all validated:
  - Homepage: `TravelAgency` + `WebSite` with `SearchAction`
  - Each trip page: `TouristTrip` + `Offer` + `WebPage` + `BreadcrumbList` + `FAQPage`
- Per-page `<link rel="canonical">` pointing at the canonical URL on `alliance-travel.dz`
- Per-page Open Graph + Twitter Card meta with dedicated 1200×630 OG images
- Single `<h1>` per page (the scroll-hero pinned title is `<div aria-hidden>` to avoid duplicates)
- 100% `alt`-text coverage on all `<img>` elements
- Valid `sitemap.xml` with 6 URLs + image:image extension + lastmod
- `robots.txt` with `Sitemap:` directive
- Branded `404.html` with `noindex` meta

---

## Deployment

**Recommended host: Cloudflare Pages free tier** — annual cost €0 + your `.dz` domain renewal (~€15/year).

See **[`docs/DEPLOY.md`](docs/DEPLOY.md)** for the full 30-minute walkthrough including:

- Cloudflare Pages connection via GitHub integration (zero CLI, zero secrets)
- Custom domain (`alliance-travel.dz`) + DNS via nameserver delegation
- Build config: command empty, output directory `site`
- Post-deploy QA checklist (Lighthouse, schema validator, OG debuggers, real-device mobile testing)
- Alternative hosts comparison (Netlify, Vercel, GitHub Pages, AWS S3)

---

## What's done · what's next

Current branch `feat/v12-hierarchy-pass` contains **25 commits** ahead of `main` covering the full v21 cleanup cycle + prod-prep pass. Detailed table in [`docs/ROADMAP.md`](docs/ROADMAP.md).

### Recent shipping summary

| Status | Item |
|---|---|
| ✅ | **v21 Phase A**: Token consolidation — 5 `:root` blocks → 1 canonical, WCAG `--txt-3` fix restored |
| ✅ | **v21 Phase B**: Motion library — 10 cubic-beziers → 4 canonical, all durations tokenized |
| ✅ | **v21 Phase C**: Ambient animation cull + IntersectionObserver pause-off-screen |
| ✅ | **v21 Phase D.1**: `.btn--primary` consolidated from 3 declarations to 1 |
| ✅ | **v21 Phase D.2**: 12 cards share canonical surface declaration |
| ✅ | **v21 Phase E**: Hero overhaul — home + trip pages cleaned, watermark removed, redundant chrome stripped |
| ✅ | **v21 Phase F.1**: Single scroll coordinator (4 listeners → 1) |
| ✅ | **v21 Phase H**: Surgical dead-code sweep |
| ✅ | **v21 Phase I**: SEO foundation (sitemap, robots, BreadcrumbList, WebSite SearchAction) |
| ✅ | **v21 Phase J.2**: ~370 lines of dead CSS deleted (packages, plane, badges, departures, hero remnants) |
| ✅ | **v21 Phase J.5**: `--bronze` legacy shim eliminated (39 references migrated to `--mint`) |
| ✅ | **Prod-prep**: `_headers` + `_redirects` + `404.html` + `wrangler.toml` + GitHub Actions workflow + LCP preloads + FAB rewrite |
| ✅ | **Pre-v21**: 3-agency network restructure, staff phone grid, trip-card v20 hover frame integrity, neo-brutalist hotel cards, WebP heroes, service worker, anti-clutter map engine, 8 industry-pattern polish layers |
| ⏳ | **Deferred** — see `docs/HANDOFF.md` §12 for the full deferral list with reasoning |

### Bottom-line metrics

- `styles.css`: 9,582 → ~9,115 lines after v21 (-4.9% with much more architectural clarity; minor token additions post-v21)
- Unique `cubic-bezier()` curves: 10 → 4 (all in canonical block as definitions only)
- Scroll listeners in `enhance-pro.js`: 4 → 1
- `:root` token blocks: 5 → 2 (1 dark + 1 light)
- `.btn--primary` definitions: 3 → 1
- `--bronze*` references: 39 → 0
- `@keyframes` count: 26 → 20
- Per-page first-byte budget: ~85 KB gzip
- 100% alt-text coverage, 1 h1/page, valid JSON-LD on all pages
- Total annual hosting cost (Cloudflare Pages free tier): €0 + domain renewal

### Major deferrals (intentional, documented)

- **Phase A.2** Spacing/radii geometric migration — needs visual-review session per component
- **Phase D.3** `.pill` baseline — pills have too much variance for safe consolidation
- **Phase J.3** File split into `tokens/base/components/utilities` via `@import` — requires concat build step first
- **Build step** (esbuild / Vite / Lightning CSS) — project owner chose simplicity over toolchain
- **AggregateRating JSON-LD** — needs real testimonials with signed customer consent
- **Backend lead capture** — currently zero backend by design (WhatsApp deep-links)
- **Arabic / RTL translation** — French sufficient for current audience

All deferrals documented in `docs/HANDOFF.md` §12 with rationale.

---

## Git workflow

```bash
# See current state
git status
git log --oneline -10

# Make a change, commit, push
git add -A
git commit -m "phase(scope-vN.N): one-line summary"
git push origin feat/v12-hierarchy-pass

# Cloudflare Pages auto-deploys on push to the configured production branch
```

When committing, follow the existing convention: `phase(scope-vN.N): summary` with a detailed body explaining what + why. Update `docs/ROADMAP.md` to add a row to the commit table.

When you ship a major release, bump `CACHE_NAME` in `site/sw.js` to the new date so users get fresh assets on their next visit.
