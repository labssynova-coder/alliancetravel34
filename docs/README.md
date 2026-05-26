# 📚 Alliance Travel — Docs

> Static marketing site for **Alliance Travel**, an Algerian travel agency based in Bordj Bou Arreridj (BBA) with 3 branches. Six pages: homepage + 5 guided-tour landing pages (Egypt, Azerbaijan, Istanbul, Malaysia, Sharm-from-Constantine). Trilingual runtime switcher (FR · EN · AR) with FR-canonical SEO.
>
> **Branch:** `main` only (consolidated 2026-05-26). **Deploy target:** Cloudflare Pages at `alliance-travel.dz`.

---

## 🧭 Start here

| If you want to… | Read |
|---|---|
| Understand what happened on this project | [`STORY.md`](STORY.md) |
| See what the codebase looks like today + obsolete-file flags | [`AUDIT.md`](AUDIT.md) |
| Learn from the mistakes + apply to your next project | [`LESSONS.md`](LESSONS.md) |
| Take it live on Cloudflare Pages | [`DEPLOY.md`](DEPLOY.md) |
| Look up a token, color, sitemap entry, asset path | [`reference/`](reference/README.md) |
| Read deep historical detail — every session, every U-turn | [`_archive/`](_archive/) |

---

## 🗂 Map

```
docs/
├── README.md                  ← you are here
├── STORY.md                   one chronological narrative
├── AUDIT.md                   final codebase audit + obsolete-file flags
├── LESSONS.md                 solutions + issue histogram + retrospective
├── DEPLOY.md                  Cloudflare Pages + domain wiring
│
├── reference/                 operational reference (consult while building)
│   ├── COLOR-MAP.md           dark/light token system
│   ├── SITEMAP.md             site structure inventory
│   ├── IMAGE-ASSETS.md        per-page image catalog
│   ├── I18N-SEO.md            locked policy: runtime switcher + FR canonical
│   ├── CSS-DUPLICATES.md      10 selectors with 3+ definitions (consolidation map)
│   ├── CSS-IMPORTANT-RATIONALE.md  why 218 !important declarations are mostly load-bearing
│   ├── CSS-COLOR-AUDIT.csv    464-row color catalog (60 tokenizable, 404 keep-local)
│   └── design-system/MASTER.md  graphic chart + brand token derivation
│
└── _archive/                  preserved historical artifacts
    ├── ROADMAP.md             942-line chronicle of phases v0 → v22
    ├── HANDOFF.md             852-line comprehensive handoff
    ├── MOTION-CLEANUP-MASTER.md      historical motion cleanup plan
    ├── QA-REPORT-v22.md       Agent 5 verification of v22 cycle
    ├── CLEANUP-{FLAGGED,SURVEY}.md   historical cleanup investigations
    ├── SURVEY-BOOKING-CALCULATOR.md  pre-rewrite booking flow survey
    ├── LAUNCH-AND-DEPLOY.md          earlier deploy guide, superseded
    ├── DEPLOY-old-2026-05-13.md      original DEPLOY.md before the v22 rewrite
    ├── CONTEXT/               4 recovery dossiers from the "everything seems lost" session
    └── scripts/               one-off migration scripts (jobs done, kept for reference)
```

---

## 🔑 The single most important fact

**Nothing is lost.** The Alliance Travel project went through ~30 Claude Code sessions, multiple parallel agents, two file-system regressions, and a stash that "vanished" — but every commit, every fix, every architectural decision is preserved on `main` (and `git reflog` retains the rest). The four CONTEXT dossiers in `_archive/CONTEXT/` document the recovery operations in forensic detail if you ever need to follow the trail.

---

## 🗓️ Timeline at a glance

```
v1-v10    (Apr 2026)    initial build, 3D globe, scroll-pinned hero, MapLibre maps
v11       (Apr 2026)    anti-clutter cycle — collapsed accordions, calmer rhythm
v12-v16   (May 2026)    hierarchy + design-system + UX-audit refinements
v17-v20   (May 2026)    perf wins (WebP, AVIF, lazy loading, rAF coordinator)
v21       (May 13)      token consolidation + production-prep + first SEO hardening
v22       (May 22-26)   ⭐ multi-agent responsive hardening cycle:
                          Agent 1: foundation (tokens, utilities, perf gates)
                          Agent 2: perf (AVIF, AOS removal, will-change pruning)
                          Agent 3: mobile components (calc, hotel cards, footer)
                          Agent 4: i18n SEO strategy decision
                          Agent 5: read-only QA verification
                        + i18n recovery (engine restored from stash)
                        + mobile nav drawer ship + RTL Arabic
                        + 178 data-i18n attribute wiring
                        + branch consolidation → single `main`
```

The full chronological narrative is in [`STORY.md`](STORY.md).

---

*Maintenance: this doc + the 4 top-level docs are the single source of truth. When something major changes, update the relevant top-level doc first; reference/ updates are append-only; _archive/ is frozen.*
