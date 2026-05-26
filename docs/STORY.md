# 📖 The Story of Alliance Travel

> One narrative, end-to-end. Sourced from the 942-line `_archive/ROADMAP.md`, the four `_archive/CONTEXT/` dossiers, the v22 QA report, and the commit log. Read this first if you want the big picture; jump into `_archive/` for forensic depth.

**Project:** static marketing site for a real Algerian travel agency in Bordj Bou Arreridj.
**Scope:** 8 HTML pages + 1 monolithic CSS + 10 JS modules + responsive imagery + trilingual UX.
**Duration:** ~30 Claude Code sessions across April–May 2026.
**Final state:** single `main` branch, 97 commits, deploy-ready on Cloudflare Pages.

---

## Act I — Building (April 2026)

The project started as a vanilla static site for **Alliance Travel**, a guided-tour agency running outbound trips from BBA to Egypt, Azerbaijan, Istanbul, Malaysia, and Sharm El Sheikh. No framework, no build step, no dependencies. The first ten phases (v1–v10) established the visual language:

- **v1–v3** laid down structure: 6 HTML pages, a single 9000+ line CSS file, brand colors (Prussian Blue + Mint), DM Sans typography.
- **v4–v8** added the cinematic surfaces: hero with photo collage, the 3D globe widget (cobe-powered) on the homepage, the per-trip MapLibre map showing day-by-day routes, region-tinted accent palettes.
- **v9–v10** introduced the Algeria branch network map and the trip-card grid.

By the end of Act I, the site looked beautiful on desktop but had accumulated architectural debt: 5 scattered `:root` blocks, hard-coded values throughout, no responsive foundation, no token system.

---

## Act II — Refinement (April–May 2026)

The next ten phases (v11–v20) tackled debt while shipping features:

- **v11 — Anti-clutter.** A maximalist visual identity was deliberately calmed. Collapsed FAQ accordions, fewer ambient animations, a single rAF scroll coordinator replacing four scattered listeners.
- **v12–v13 — Hierarchy + scroll-expand hero.** A vanilla port of motion-primitives' ScrollExpandMedia replaced the static hero. Phase markers and hotel-card restructure landed.
- **v14 — Sticky-scrub rewrite.** Bidirectional scroll-pinned hero that rewinds when the user scrolls back up.
- **v15 — Booking hardening.** Form validation, accessibility, transparency, info sections. The "no PII to server" approach was locked in: everything flows through WhatsApp deep-links.
- **v16 — External design-system audit.** Selective fixes from an outside review (contrast, focus states, motion sensibility).
- **v17 — Perf round 1.** WebP heroes, `<picture>` + srcset, lazy non-hero, deferred scripts, globe pause when offscreen.
- **v18 — Hotel cards.** Card structure refresh, monument icons, color hierarchy.
- **v19 — Trip cards v2.** Image-fill cards, ribbon system, hover lift.
- **v20 — Token consolidation prep.** Spotted the duplicate `:root` blocks and motion sprawl; planned cleanup for v21.

---

## Act III — The v21 Cleanup Cycle (May 13)

A single intense day of consolidation:

- All 5 scattered `:root` blocks merged into one canonical token block.
- Motion: 23 keyframes audited; 9 ambient loops gated behind IntersectionObserver pause; 4 canonical cubic-bezier curves locked in.
- The first SEO hardening pass: 17 JSON-LD blocks across 6 pages, BreadcrumbList + WebSite SearchAction, per-page Open Graph and Twitter Cards with dedicated 1200×630 images.
- `_headers`, `_redirects`, `sitemap.xml`, `robots.txt`, `sw.js`, `wrangler.toml`, `404.html` — full Cloudflare Pages-ready host config.
- `feat/v12-hierarchy-pass` branch opened to track v21 work.

By end of v21 the site was technically deployable. But it was still **desktop-first** — mobile was an afterthought.

---

## Act IV — The Mobile Reckoning (May 21–22)

A new user pass at 375px viewport surfaced the real problem: the navbar overflowed, the hero ate the entire viewport with no content visible, hotel cards stacked but kept desktop padding, the calculator's stepper buttons were 36px (failing WCAG touch target).

A **forensic responsive audit** catalogued 30 specific issues across 7 categories: foundation gaps, layout failures, typography overflow, perf regressions, mobile-specific UX bugs, accessibility violations, and SEO inconsistencies. The full report became the brief for v22.

---

## Act V — The v22 Multi-Agent Cycle (May 22–25)

The v22 engagement was structured as **5 parallel agents** dispatched from a single master prompt, each owning one track with strict file-ownership boundaries so they couldn't step on each other:

| Agent | Track | Deliverables |
|---|---|---|
| **Agent 1** | Foundation + architecture | New token system, z-index ladder, spacing-scale fix, inline-style migration script, duplicate-selector catalog, hardcoded-color audit |
| **Agent 2** | Performance + assets | AVIF heroes (1.4MB → 992KB), lazy collage tiles, backdrop-filter cap on mobile, `will-change` pruning, AOS library removed in favor of native IntersectionObserver, SW cache version bump |
| **Agent 3** | Mobile components | Calculator + booking-form polish, hotel-card phone tuning, footer auto-fit, `100vh` → `100svh` migration, form-label contrast, booking preview empty-state, PWA manifest expansion |
| **Agent 4** | i18n SEO | Decision doc locked strategy (c) — FR canonical with `hreflang="x-default"`. Engine was deliberately NOT built (later reversed) |
| **Agent 5** | QA | Read-only verification: 21 claim matrix + 10 master-prompt criteria + independent measurements |

**The result:** 19 commits in the `d91e50b..ae17435` range, foundation tokens enforced, mobile usable, AVIF shipped, no merge conflicts.

What didn't land in v22: `!important` reduction (218 unchanged), full color tokenization (audit only), `data-i18n` markup wiring.

---

## Act VI — The "Everything Seems Lost" Session (May 25 morning)

The user reported the language switcher was "not appearing in previews." A forensic audit revealed:

- **i18n.js was never committed.** It existed only as an untracked file inside `stash@{1}`, recoverable from a 3-parent stash that captured untracked files (`git stash -u`).
- **Two pitch-deck branches** (`claude/pitch-deck-standalone`, `claude/project-summary-marketing-rJVd8`) existed remotely as artifacts of one-off agent sessions.
- **A `docs/v22-roadmap` worktree** was sitting at `.claude/worktrees/v22-docs` with one commit not yet integrated.
- **Four CONTEXT dossiers** were written to document the recovery map: `REPO-STATE-AUDIT.md`, `I18N-SWITCHER-RECOVERY.md`, `PITCH-DECK-ARCHIVE.md`, `SESSION-TIMELINE.md` — all preserved in `_archive/CONTEXT/`.

**The recovery:** `git cat-file -p d82e096b...` extracted the 812-line i18n engine from the dangling blob inside stash@{1}'s untracked tree. The engine was committed (`24c625e`), wired into all 8 pages with `<script src=".../i18n.js" defer>`, the switcher pill CSS + Arabic typography + RTL adjustments appended to styles.css, and `docs/I18N-SEO.md` revised from "FR-only locked" to "runtime engine ships as UX surface."

---

## Act VII — Drawer + Translations (May 25 evening)

The user noted the mobile nav was still cramped. The drawer refactor was sitting in `stash@{0}` ("wip(nav): mobile drawer refactor — depends on i18n lang-switcher") — but now that i18n was unblocked, the dependency was satisfied.

**The drawer ship:**

- `initHamburger()` (the simple class-toggle stub) was replaced with `initNavDrawer()` (proper modal drawer pattern).
- A `.nav-drawer` element is built once on first run. Existing right-side nav controls (links, switcher, theme, WhatsApp CTA) are *moved* (not cloned) into it — preserving all event listeners and i18n bindings.
- At desktop (`min-width: 901px`) the drawer has `display: contents` — the wrapper is transparent to flex layout, so the desktop nav looks byte-identical to pre-drawer.
- At mobile (`max-width: 900px`) it slides in from right (LTR) or left (RTL), with backdrop, body scroll lock, focus management, Esc/outside-click close, and auto-close on link tap (200ms delay for visual feedback).

**The 178 data-i18n attributes:** the original stash had 161 across 7 pages; the live wiring landed 178 (slightly more coverage). FR baseline was rebuilt from the live DOM rather than from the older stashed dictionary, so translations now match what's actually shown. Arabic number isolation was hardened (`direction: ltr; unicode-bidi: embed` on `.value-card__num`, `.price`, `.phone-card__num`) so dates and prices stay readable in RTL flow.

---

## Act VIII — One Branch (May 26)

The repo had accumulated cruft from session-overlap: 3 local branches, 4 remote branches, 2 stashes, 2 worktrees, dozens of "did I lose work" anxieties. A consolidation pass:

- Deleted the 2 stale pitch-deck remotes (preserved as `archive/*` tags for recovery).
- Verified `feat/v12-hierarchy-pass` was a strict descendant of `main` (72 commits ahead, 0 missing).
- Fast-forwarded `main` to the feat branch tip.
- Force-pushed `main` to overwrite a one-line README regression on origin (`6d049c3` had REMOVED "static" from the title).
- Deleted `feat/v12-hierarchy-pass` (local + remote).
- Stashes dropped, worktrees removed.

**End state: one branch named `main`, locally and on origin, with the full project history.**

---

## What ships today

- **8 HTML pages**, each with structured data, OG/Twitter cards, hreflang, sitemap entry, JSON-LD.
- **One CSS file** (~9900 lines) with a single canonical token block, foundation + light-mode + 5 regional themes.
- **10 JS modules** (~50KB gzipped total), all vanilla, no framework, no build step.
- **AVIF + WebP + JPG hero pipeline** with mobile crops, lazy collage tiles, preload-ed LCP candidate.
- **Trilingual runtime switcher** (FR · EN · AR) with localStorage persistence, RTL flip for Arabic, lazy-loaded Cairo + Tajawal fonts. 178 `data-i18n` attributes wired.
- **Mobile nav drawer** with focus management + body scroll lock + auto-close.
- **MapLibre algeria-map** showing 3 real owned branches; **MapLibre trip-map** per trip showing day-by-day route.
- **Service worker** with version-bumped cache (`alliance-v22-2026-05-22`).
- **Cloudflare Pages config:** `_headers`, `_redirects`, `wrangler.toml`, GitHub Actions deploy workflow.

See [`AUDIT.md`](AUDIT.md) for the full inventory and obsolete-file flags. See [`DEPLOY.md`](DEPLOY.md) for the path to live.

---

## What was painful

See [`LESSONS.md`](LESSONS.md) for the issue histogram + the catalogued solutions. Headline:

- **File-system regressions** happened twice (CSS reverted ~350 lines, HTML reverted entirely). Root cause: agents made changes WITHOUT committing immediately. The fix is procedural: commit every meaningful change, treat git reflog as the safety net.
- **The i18n engine sat in stash for ~3 days** because the original v22 brief assumed it didn't exist. The fix is dual: (1) catalog stashes as soon as they're created, (2) when a doc says "FR-only locked" but a stash says otherwise, trust the stash and revisit the doc.
- **Parallel agent rate limits** capped Phase 2 of the master prompt — Agents 2 + 4 hit usage limits mid-run, Agent 3 hit a 500 server error. ~60-70% of the master prompt landed before the platform stopped them. The fix: dispatch sequentially when in doubt, not in parallel.

---

*Last updated: 2026-05-26. Next event in this story is the Cloudflare Pages deploy — see [`DEPLOY.md`](DEPLOY.md).*
