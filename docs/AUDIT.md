# 🔍 Final Codebase Audit

> Snapshot of the project at the docs-consolidation commit (`main` HEAD, 2026-05-26). Inventory + obsolete-file flags + outstanding tech debt. Compare to the v22 QA report at [`_archive/QA-REPORT-v22.md`](_archive/QA-REPORT-v22.md) for the previous milestone.
>
> **Update 2026-05-29:** the non-deployed root directories `source of truth/` and `_archive/` (inventoried under "Keep as-is" below) were removed from the working tree to slim the repo (~37 MB). They remain in git history (last present in commit `af9cebf`) — recover with `git checkout af9cebf -- 'source of truth' _archive`. The inventory below is preserved as the 2026-05-26 snapshot.

---

## 📊 Headline metrics

| Dimension | Value | Note |
|---|---|---|
| **Total git commits** | 97 | Linear history on `main`, no merge commits |
| **Local branches** | 1 (`main`) | Consolidated from 3 branches + 2 stashes on 2026-05-26 |
| **Remote branches** | 1 (`origin/main`) | Pitch-deck remotes deleted, preserved as `archive/*` tags |
| **HTML pages** | 8 | 1 homepage + 1 voyages catalog + 5 trip pages + 1 404 |
| **CSS** | 1 file, **9,918 lines**, ~56 KB gzip | Single canonical token block + 5 regional themes |
| **JS modules** | 10 vanilla files, ~50 KB gzip total | No framework, no build step |
| **Site total** | **27 MB** unzipped, 156 files | Most weight is imagery |
| **External CDN deps** | Google Fonts + unpkg (MapLibre, cobe) | All async, all defer-loaded |
| **Service Worker** | `alliance-v22-2026-05-22` cache | Network-first HTML, SWR assets |
| **Languages** | 3 (FR · EN · AR) | Runtime client-side switcher; FR canonical for SEO |
| **`data-i18n` attributes** | **178** | Wired across all 7 indexable pages |
| **Inline `style=""` count** | 98 total | 43 on homepage, mostly region-accent overrides + collage FOUC placeholders |
| **`!important` declarations** | 231 | ~124 load-bearing (MapLibre + reduced-motion + photo overlays) per `_archive/CSS-IMPORTANT-RATIONALE.md` |

---

## 🗂 Site directory inventory

```
site/                                  27 MB total
├── _headers                           Cache-Control + security headers (CF Pages / Netlify)
├── _redirects                         Trailing-slash + alias redirects
├── robots.txt                         Crawler config + sitemap pointer
├── sitemap.xml                        7 canonical URLs with hreflang + image:image
├── site.webmanifest                   PWA manifest (5 icons incl. maskable)
├── sw.js                              Service worker — cache name alliance-v22-2026-05-22
├── 404.html                           Branded error page (165 lines)
├── index.html                         Homepage (1115 lines)
├── voyages/index.html                 Catalog page (231 lines)
├── cairo-sharm/index.html             Trip page (1215 lines)
├── azerbaidjan/index.html             Trip page (780 lines)
├── istanbul/index.html                Trip page (810 lines)
├── kuala-lumpur/index.html            Trip page (750 lines)
├── sharm-constantine/index.html       Trip page (767 lines)
└── assets/
    ├── css/styles.css                 9918 lines · 56 KB gzip
    ├── js/                            10 vanilla modules
    │   ├── enhance.js                 reveal observer + drawer + smooth scroll + tripcard share
    │   ├── enhance-pro.js             single rAF scroll coordinator + magnetic buttons + sticky bar
    │   ├── i18n.js                    runtime FR/EN/AR engine + RTL toggle + lazy Arabic fonts
    │   ├── booking-form.js            WhatsApp deep-link builder + preview pane
    │   ├── calculator.js              live pricing engine (no PII, no server)
    │   ├── globe.js                   cobe 3D globe (homepage only, gated >1024px)
    │   ├── scroll-hero.js             scroll-pinned hero parallax (trip pages)
    │   ├── algeria-map.js             MapLibre branch network map (homepage)
    │   ├── trip-map.js                MapLibre day-by-day route (trip pages)
    │   └── hero-collage-lazy.js       deferred collage tiles 2-5 injection
    └── images/
        ├── heroes/                    3.6 MB · 30 files (AVIF + WebP + JPG × 5 dests × desktop+mobile)
        ├── hotels/                    2.0 MB · ~50 files (one per hotel + variants)
        ├── og/                        712 KB · 8 OG cards (1200×630)
        ├── favicon/                   125 KB · standard + apple-touch + maskable
        └── logo.svg + logo-navy.svg
```

---

## 🚩 Obsolete / leftover file flags

### 🔴 Should be removed before deploy

| Path | Why | Action |
|---|---|---|
| `.obsidian/` | Editor metadata for the maintainer's note-taking app. Should never have entered the repo. | Add to `.gitignore`, then `git rm -r --cached .obsidian/` |
| `build/` | Empty directory, never used. The actual output is `site/`. | `rmdir build` |

### 🟡 Investigate before deploy

| Path | Why | Action |
|---|---|---|
| `scripts/verify-i18n.cjs` | Untracked utility script. If useful for CI, track it. If a one-off, archive it. | Track if CI candidate, else move to `docs/_archive/scripts/` |
| `site/assets/images/hotels/*` | 50 files at 2 MB. Some hotels may have been removed or renamed during the cleanup cycles. Spot-check for orphans not referenced by any HTML/CSS. | Run an orphan-image audit |
| `site/assets/images/sites/` (missing) | Earlier docs mention 20 touristic-site thumbs; the directory no longer exists. Either intentionally dropped or lost. | Confirm intentional via git log — if intentional, remove the doc reference |

### 🟢 Keep as-is (preserved knowledge, not bloat)

| Path | Note |
|---|---|
| `_archive/` (repo root) | CSS-scratch v2-v11 + handoff-snapshot-v5.2. Preserved historical artifacts referenced by `docs/STORY.md`. ~few hundred KB, harmless. |
| `source of truth/` | Original PDF/DOCX briefs from the agency (Egypt itinerary, Azerbaijan program, etc). Reference material for any future copy edits. |
| `docs/_archive/` | All the historical docs you just consolidated. ~15 files. Linked from `docs/STORY.md` and `docs/_archive/README.md`. |
| `wrangler.toml` | Cloudflare Pages deploy config. Required if you ever use `wrangler` CLI instead of GitHub integration. |

---

## ⚙️ Outstanding technical debt

Listed in priority order. Each item has a documented next-step in [`LESSONS.md`](LESSONS.md) or in the noted reference doc.

| # | Issue | Severity | Where documented |
|---|---|---|---|
| 1 | `!important` count = 231 (was 218 at v22 QA, drifted up with i18n/drawer work) | 🟡 Medium | [`reference/CSS-IMPORTANT-RATIONALE.md`](reference/CSS-IMPORTANT-RATIONALE.md) — ~124 load-bearing, ~107 audit-and-reduce candidates |
| 2 | Hardcoded color migration: 60 tokenizable literals out of 464 catalogued | 🟢 Low | [`reference/CSS-COLOR-AUDIT.csv`](reference/CSS-COLOR-AUDIT.csv) — audit landed, bulk migration script ready in `_archive/scripts/_audit_colors.py` |
| 3 | Inline `style=""` count = 98 (target was <50) | 🟢 Low | The 47 surviving on homepage are mostly load-bearing (region accent overrides + FOUC placeholders). Realistic floor ~85. |
| 4 | 10 selectors with 3+ duplicate definitions | 🟢 Low | [`reference/CSS-DUPLICATES.md`](reference/CSS-DUPLICATES.md) — consolidation map landed, actual collapse deferred to avoid mid-cycle visual drift |
| 5 | Lighthouse mobile audit not run on live deploy | 🟡 Pre-launch | Required step in [`DEPLOY.md`](DEPLOY.md) post-deploy checklist |
| 6 | `.phone-card__btn` measures ~32px tall (below WCAG 44×44) | 🟡 a11y | One-line fix at `styles.css:125` — remove the `.phone-card__btn` exception from the `pointer:coarse` enforcement list |
| 7 | Horizontal scroll risk: 5 negative `right:-Npx` offsets + 1 `min-width: 320px` outside any media query | 🟢 Low | `_archive/QA-REPORT-v22.md` §"Horizontal-scroll static analysis" |
| 8 | i18n: only nav/hero/footer/section-heading text is wired with `data-i18n`. Trip-page content (hotel cards, itineraries, FAQs, calc labels) still FR-only at runtime | 🟢 By design | Documented as "incremental coverage" policy in [`reference/I18N-SEO.md`](reference/I18N-SEO.md) |

---

## 🌐 External dependencies

External services this site loads in production. All async/deferred — no critical-path third party.

| Origin | Used for | Critical? |
|---|---|---|
| `fonts.googleapis.com` + `fonts.gstatic.com` | DM Sans (always) + Cairo + Tajawal (lazy on first AR pick) | Soft (FOUT fallback to system stack) |
| `unpkg.com/maplibre-gl@4.7.1` | MapLibre GL for branch + trip maps | Soft (script tag deferred; maps fail gracefully) |
| `esm.sh/cobe@0.6.1` | 3D globe widget on homepage (gated >1024px) | Soft (globe is optional decoration) |
| `wa.me/…` | WhatsApp deep-link endpoints for CTAs | N/A (link targets only — not loaded) |
| `schema.org` | JSON-LD `@context` references | N/A (resolved by crawlers, not browsers) |
| Social: `instagram.com`, `facebook.com`, `tiktok.com` | Footer profile links | N/A (link targets) |

**No tracking, no analytics, no third-party JS execution on the critical path.** GDPR/CNIL stance: nothing to disclose unless you later add Google Analytics or similar.

---

## 🔐 Security + privacy posture

- ✅ No backend, no API endpoints, no auth, no user accounts.
- ✅ All form data flows through WhatsApp deep-links — **zero PII ever hits a server we control**.
- ✅ HTTPS-only origins for all external resources.
- ✅ Security headers configured in `site/_headers`: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- ✅ Content Security Policy: currently lax (allows inline styles + unpkg + Google Fonts). Tightening it is deferred until inline styles drop below 50 — see issue #3 above.

---

## 🌍 i18n state

| Surface | FR | EN | AR | Notes |
|---|---|---|---|---|
| `<html lang>` | ✅ (default) | ✅ runtime swap | ✅ runtime swap + `dir="rtl"` | Crawlers see FR; runtime localStorage persists choice |
| Navigation links | ✅ | ✅ | ✅ | All 3 dictionaries cover `nav.*` namespace |
| Hero (eyebrow + title + lede + CTAs) | ✅ | ✅ | ✅ | Homepage + trip pages |
| Section headings | ✅ | ✅ | ✅ | Stats, voyages, agency, contact, map |
| Footer | ✅ | ✅ | ✅ | Address, contact, copyright |
| Hotel cards (titles, amenities) | ✅ | ⏳ | ⏳ | Dictionary keys exist; HTML not yet annotated with `data-i18n` |
| FAQ accordions | ✅ | ⏳ | ⏳ | Same as above |
| Calculator labels | ✅ | ⏳ | ⏳ | Same as above |
| Itinerary day-by-day | ✅ | ⏳ | ⏳ | Same as above |

⏳ = engine works, dictionary ready in many cases, but `data-i18n` markup on the page is pending. Add page-by-page when needed.

**Total `data-i18n` attributes wired: 178** (the v25 wiring pass — see commit `4b2e5d5`).

---

## 🚀 Deploy readiness

| Check | Status |
|---|---|
| All HTML pages render without console errors | ✅ verified in local preview |
| Mobile drawer works at ≤900px | ✅ verified at 375px |
| Language switcher visible + functional | ✅ FR/EN/AR all reachable |
| Service Worker cache version bumped | ✅ `alliance-v22-2026-05-22` |
| Sitemap.xml lists all 7 indexable URLs | ✅ |
| robots.txt allows crawl + points to sitemap | ✅ |
| OG images present for all 7 pages | ✅ |
| `_headers` + `_redirects` in place | ✅ |
| `wrangler.toml` at repo root | ✅ |
| GitHub Actions deploy workflow | ✅ (`.github/workflows/deploy.yml`) |
| Cloudflare Pages project | ⏳ Pending (manual step) |
| `alliance-travel.dz` domain wiring | ⏳ Pending |
| Lighthouse mobile audit | ⏳ Pending (post-deploy step) |

See [`DEPLOY.md`](DEPLOY.md) for the 30-minute path to production.

---

## 🧪 How to re-run this audit

If the codebase changes substantially, re-generate the metrics above with:

```bash
# Branch + commit count
git branch -a -vv ; git log --oneline | wc -l

# File counts
find site -type f -name '*.html' | wc -l                                   # HTML pages
wc -l site/assets/css/styles.css                                            # CSS lines
ls site/assets/js/*.js | wc -l                                              # JS modules
du -sh site/                                                                # total size
du -sh site/assets/images/{heroes,hotels,og,favicon}/                       # asset breakdown

# Quality flags
grep -c '!important' site/assets/css/styles.css                             # !important count
for f in site/*.html site/*/*.html ; do grep -oE 'style="[^"]*"' "$f" | wc -l ; done | paste -sd+ | bc
grep -oE 'data-i18n' site/*.html site/*/*.html | wc -l                       # i18n coverage

# Untracked cruft
git ls-files --others --exclude-standard
find . -maxdepth 2 -type d -empty
```

---

*Audit performed at HEAD `main` on 2026-05-26. Next audit recommended after the next 10-commit batch OR before the production deploy, whichever comes first.*
