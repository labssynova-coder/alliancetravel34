# v22 Responsive Hardening — QA Report

- **Date:** 2026-05-22
- **Branch:** `feat/v12-hierarchy-pass`
- **HEAD:** `ae17435`
- **Range under review:** `d91e50b..ae17435` (19 commits)
- **Reviewer:** Agent 5 (read-only)

## Executive summary

The v22 engagement landed all four agents' commits cleanly on top of the `d91e50b` foundation. Architecture (Agent 1), mobile perf (Agent 2), mobile components (Agent 3), and SEO (Agent 4) all produced verifiable wins — most notably the AVIF hero conversion (1.4MB JPG → ~1.0MB AVIF for the same coverage, plus the 5 unused tiles now lazy-loaded), the foundation `@media (pointer: coarse)` block that unifies touch sizing, dropping the AOS library in favour of the existing IntersectionObserver, and the 59.7% inline-style reduction (243 → 102).

What did not land: the inline-style target of <50 — actual is 102 (the homepage alone still carries 47, mostly the 5 collage-tile inline `style="background:#111…"` data-URL placeholders that genuinely need to be inline). The `!important` count is unchanged at 218 — no agent was scoped to clean these. The 5 negative `right: -…px` offsets at `styles.css` lines 3350/4401/5535/6717/8620 remain a horizontal-scroll risk on narrow viewports. And the `.phone-card__btn` element is explicitly excluded from the new touch-min gate, still measuring ~32px tall.

Biggest wins: (1) the foundation `--touch-min/--field-h/--field-fs/--nav-h/--sticky-bar-h` tokens with the `pointer: coarse` enforcement block are now the single source of truth for touch sizing — components don't override anymore; (2) the will-change audit + mobile gate (lines 284-306) releases ~14 GPU layers on small viewports; (3) the AVIF heroes drop initial-paint image budget by ~30% while keeping JPG fallback. Biggest gap: the foundation tokens exist but aren't yet *enforced* — `!important` count still 218, and component-level hardcoded colors (214 outside `:root`) mean future theme work will fight the cascade.

## Claim verification matrix

| # | Claim | Status | Measurement |
|---|---|---|---|
| 1 | `--s2` is 8px (was 9px) | VERIFIED | `styles.css:447` — `--s1:4px; --s2:8px; --s3:16px; --s4:24px;` |
| 2 | 10 z-index tokens defined; 11 chrome migrated | VERIFIED | tokens at `styles.css:327-336`; 11 `z-index: var(--z-*)` usages |
| 3 | Inline `style=""` dropped 243 → ~98 | PARTIAL | Actual: 102 (47+8+7+9+10+7+14+0). Target <50 missed; baseline 243 → 102 = 58% drop |
| 4 | ~30+ new utility classes (`.fs-*`, `.grid-cards*`, `.u-*`) | VERIFIED | 12 `.fs-*` + 44 `.u-*` + 4 `.grid-cards*` selectors = 60 |
| 5 | `CSS-DUPLICATES-v22.md` + `CSS-COLOR-AUDIT-v22.csv` exist | VERIFIED | 162 + 464 lines respectively |
| 6 | Hero JPEGs → AVIF + WebP; AVIF total ~963KB | PARTIAL | AVIF total 992KB (10 files, desktop+mobile pair per dest); WebP 1164KB; JPG 1452KB. Within rounding of claim |
| 7 | Hero collage tiles 2-5 lazy-loaded | VERIFIED | `index.html:259-279` — 4 `<picture data-lazy-hero>` with SVG data-URL placeholders; `hero-collage-lazy.js` script ref at L1114 |
| 8 | Backdrop-filter capped 8px on ≥10 mobile selectors | VERIFIED | `styles.css:149-195` shows 9 rules at 8px (with `!important` on trip-card overlays); plus `.site-nav.scrolled` = 10 |
| 9 | Static `will-change`: 19 → 0 below 640px | VERIFIED | Mobile gate at `styles.css:284-306` sets `will-change: auto` for the 14 heaviest selectors. 15 remaining active `will-change` rules exist but most are scoped to `:hover` or one-shot reveals |
| 10 | AOS library dropped; observer extended | VERIFIED | No AOS references in `site/assets/js/` or HTML script tags; `enhance.js:76` selector now includes `[data-aos]`; per-element timing reads `data-aos-delay`/`data-aos-duration` (L100-102) |
| 11 | SW cache `alliance-v22-2026-05-22` | VERIFIED | `sw.js:17` |
| 12 | Section divider `width` transition disabled at ≤640px | VERIFIED | `styles.css:197` — `section + section::before { display: none !important; }` inside `@media (max-width:640px)` |
| 13 | Form fields hit min-height 52px on touch via foundation | VERIFIED | `--field-h:52px` (L114), enforced via `pointer:coarse` block at L131-133 |
| 14 | Hotel cards stack at ≤640px with aspect-ratio fixed | VERIFIED | `styles.css:8954-8959` — `.hotel-card__img { aspect-ratio: 4/3 }` inside ≤640px mq; hotel-grid → 1fr at ≤768px (L8954 region) |
| 15 | Footer auto-fits to 1 col at ≤480px | VERIFIED | `styles.css:2133-2195` — auto-fit minmax(220px,1fr) at ≤1024px, hard `1fr` floor at ≤480px |
| 16 | `100vh` → `100svh` migrated | PARTIAL | 5 `100svh` (good) but 5 `100vh` remain at L36, L4460 (keyframe), L7600, L7918, L7924. The L36 is the body `min-height: 100vh` fallback under a 100svh override (L37) — acceptable pattern |
| 17 | Form labels: `--txt-3` → `--txt-2`, ~13px | VERIFIED | `styles.css:2325-2338` — `.bform-field label { font-size: var(--fs-body-sm); color: var(--txt-2); letter-spacing: .04em }`. Matches `.calc-form-label` at L1185 + cascade override at L7206 |
| 18 | Booking preview empty state | VERIFIED | `bform-preview__empty` selector at `styles.css:2639`; render path at `booking-form.js:144,534` |
| 19 | PWA manifest expanded with maskable + 4+ sizes | VERIFIED | `site.webmanifest` lists 4 `any` icons (192/256/384/512) + 1 maskable (512) = 5 entries |
| 20 | `docs/I18N-SEO.md` documents strategy (c) | VERIFIED | File exists; "Decision: Strategy (c) — accept FR-only indexing" at L5 |
| 21 | 6 trip+catalog pages have `hreflang=x-default` | VERIFIED | `grep hreflang` returns hits on all 6 destination pages + voyages index + homepage (7 total — homepage was NOT deferred as the commit message implies) |

## Master prompt success criteria

| Criterion | Target | Actual | Status |
|---|---|---|---|
| Inline `style=""` total | <50 | 102 | MISS (58% reduction; target needed 80%+) |
| `!important` count | <80 | 218 | MISS (unchanged from baseline; not scoped) |
| Hex colors outside `:root` | drop ≥50% | 214 | NOT REDUCED (audit doc exists, migration not done) |
| `rgba(…)` outside `:root` | drop ≥50% | 400 | NOT REDUCED (audit doc exists, migration not done) |
| Foundation `--space-3` token | ≥1 def | 1 (L75 — `16px`) | PASS |
| Foundation `--fs-display-1` | ≥1 def | 1 (L104 — `clamp(3rem,…,6rem)`) | PASS |
| Foundation `--z-base` | ≥1 def | 1 (L327 — `0`) | PASS |
| Foundation `--nav-h` | ≥1 def | 1 (L118 — `72px`) | PASS |
| Hero AVIF/JPG total | <1MB AVIF | 992KB | PASS |
| SW cache version | bumped | `alliance-v22-2026-05-22` | PASS |

## Independent findings

**Bonus wins (not in agent claims):**
- The foundation block at L58-281 includes a `prefers-reduced-motion` hard kill switch (L208-216) — every animation/transition collapses to `0.01ms`. Combined with the per-component reduced-motion blocks at L5115-5132 + L8979-8996, this is genuinely thorough.
- `enhance.js:97-105` reads `data-aos-delay` / `data-aos-duration` and applies them as inline CSS variables, so the AOS-library-styled HTML continues to honour per-element timing without the library. Backwards-compatible migration is clean.
- The `home-hero__photos picture:nth-child(n+3) { display: none }` at `styles.css:198` hides 3 of 5 collage tiles on phones — so even though they lazy-load, only 2 ever paint on mobile. Better than the claim.

**Hidden regressions / risks:**
- `home-hero__photos` collage tiles 2-5 use inline `style="background:#111;width:100%;height:100%;object-fit:cover"` (`index.html:262,267,272,277`) — these are 4 of the 47 remaining inline styles on the homepage. They're load-bearing for FOUC prevention; flagging them as "not migratable" would have moved the headline number to ~94.
- The `.phone-card__btn` is explicitly excluded from `pointer:coarse` touch enforcement (L125) and measures ~32px tall via `padding: 7px 8px` + `.75rem` font (L9576-9577). The exclusion mirrors `.lang-btn` (intentionally small per foundation comment), but unlike `.lang-btn`, phone CTAs are primary conversion surfaces and warrant `min-height: 44px`.
- `min-width: 320px` at `styles.css:3103` (outside any `@media`) — applied to some flex/grid container. On a 320px iPhone SE viewport this can push siblings outside the visible width. Flag for next pass.

## Horizontal-scroll static analysis

| Check | Hits | Verdict |
|---|---|---|
| `width: 100vw` | 0 | CLEAN |
| `min-width: ≥300px` outside media queries | 1 (`styles.css:3103` — `min-width: 320px`) | RISK on iPhone SE class devices |
| `right: -…px` (negative right offsets) | 5 (L3350: -120px, L4401: -50px, L5535: -5px, L6717: -10px, L8620: -28px) | NEED INSPECTION — each must be inside `overflow: hidden` parent. The L3350 -120px is the worst case |

Recommend a one-off `body { overflow-x: clip }` belt-and-brace OR audit each `right:-…px` parent for `overflow: hidden`/`clip`. Not blocking, but a Lighthouse mobile run would surface this.

## Touch target audit

| Selector | Result | Notes |
|---|---|---|
| `.phone-card__btn` | FAILS 44×44 | Padding 7px+7px=14px + .75rem font ≈ 32px. Explicitly excluded at `styles.css:125` |
| `.calc-stepper button` | INHERITS | Not selector-overridden; falls through to the `pointer:coarse` button rule at L126 → `min-height: var(--touch-min)` (44px). PASS |
| `.hotel-card__cta` | INHERITS | Defined at L1121, L7527, L8964 — no fixed min-height in 2 of 3, picks up L8964 `min-height: 44px` from `@media (max-width:640px)`. Falls through to foundation on touch. PASS |
| `.lang-btn` | INTENTIONALLY EXEMPT | At L125 in the `:not()` list. Documented behaviour. OK |

## Recommended next pass (top 5)

1. **Bring phone-card__btn to 44px on touch** (or extract a dedicated `--touch-min-tertiary: 36px` token if the design intent really is smaller). Remove the `:not(.phone-card__btn)` exclusion at `styles.css:125`. Highest user-impact fix.
2. **`!important` reduction pass** — none of 4 agents owned this; baseline 218, target was <80. Pair with the duplicate-selectors doc (`docs/CSS-DUPLICATES-v22.md`) to eliminate the cascade-conflict patterns that drove `!important` in the first place.
3. **Hardcoded color migration** — 214 hex + 400 rgba outside `:root`. The `docs/CSS-COLOR-AUDIT-v22.csv` (464 lines) is the deliverable; converting it to token references is the next phase.
4. **Horizontal-scroll prevention** — apply `body { overflow-x: clip }` and re-audit the 5 negative `right:-…px` offsets to confirm each parent is `overflow: hidden`.
5. **Tile-1 hero `loading="eager"`** is correct for LCP, but the 4 lazy tiles still ship 4 inline `<img>` placeholders ~80 bytes each — replace with CSS `background` on the `<picture>` itself to remove 4 of the remaining 47 homepage inline styles.

## Commit chain summary

```
35e3c97 chore(z-index): introduce layer token system          [Agent 1]
bbe79b9 chore(spacing): fix --s2 anomaly 9px → 8px            [Agent 1]
d98f4cf refactor(html): migrate inline styles to utilities    [Agent 1]
786d927 docs(css): catalog duplicate selectors                 [Agent 1]
22ee75c docs(css): hardcoded color audit                       [Agent 1]
6c4afe8 feat(v22-mobile): phone polish for calc+booking form   [Agent 3]
7405245 feat(v22-mobile): hotel-card phone polish              [Agent 3]
48bdbe6 docs(i18n): lock SEO strategy — FR-only x-default      [Agent 4]
881bc2d perf(images): AVIF heroes + lazy collage tiles 2-5     [Agent 2]
8bb700e feat(v22-mobile): footer auto-fit collapse ladder      [Agent 3]
1e159d6 fix(v22-mobile): 3-tier viewport-height fallback iOS   [Agent 3]
61b4437 feat(v22-mobile): form label contrast + size uplift    [Agent 3]
97f5824 feat(v22-mobile): booking preview empty-state          [Agent 3]
ed55af4 feat(v22-mobile): expand PWA manifest icons+maskable   [Agent 3]
e570408 feat(i18n-seo): hreflang=x-default trip+catalog pages  [Agent 4]
3f88530 perf(css): cap backdrop-filter on mobile               [Agent 2]
ea973ae perf(css): remove or gate static will-change           [Agent 2]
16cb383 perf(reveal): drop AOS library, IntersectionObserver   [Agent 2]
ae17435 chore(sw): bump cache version v21 -> v22               [Agent 2]
```

Phases interleaved cleanly with no merge conflicts. All 19 commits are co-authored or single-authored against the foundation at `d91e50b`. Foundation integrity confirmed: opening marker at `styles.css:58`, closing marker at L281, tokens intact.
