# 🗓️ Session Timeline — How Alliance Travel Was Actually Built

> **Part of the `docs/CONTEXT/` set** — siblings: [`REPO-STATE-AUDIT.md`](REPO-STATE-AUDIT.md), [`I18N-SWITCHER-RECOVERY.md`](I18N-SWITCHER-RECOVERY.md), `PITCH-DECK-ARCHIVE.md`.
> **Generated:** 2026-05-25 · branch `feat/v12-hierarchy-pass` · HEAD `71c8d77`.
> **Method:** read-only git archaeology (`git log --all`, `git reflog`, `git show -s`, stash inspection). No history was rewritten; nothing but this doc was created.
> **Purpose:** give the owner the *one* page that says "here is everything that happened, in order, and here is why it felt chaotic — but nothing is lost."

---

## TL;DR — the project arc in four sentences

Alliance Travel started on **2026-05-01** as a polished post-v8 static site, briefly grew a standalone **B2B pitch deck** (2026-05-18) that spawned two cloud `claude/*` branches, then was rebuilt and hardened into a full 6-page site (real MapLibre maps, cinematic scroll-heroes, calculator, booking flow). A disciplined **v21 cleanup cycle** (phases A→J, 2026-05-11→13) tokenized motion/color and stripped dead code, followed by **prod-prep** for a Cloudflare Pages deploy. Then a **multi-agent v22 push** (2026-05-22, "Agent 3" / "Agent 4" tags) tackled mobile polish + performance — and in a tight two-hour window that morning, a **trilingual i18n switcher was built, stashed, and then deliberately superseded** by a locked "FR-only + `hreflang=x-default`" SEO decision. The most recent work (2026-05-25) dropped AOS, migrated CSS color literals to tokens, and trimmed mobile GPU cost — leaving the branch **28 commits ahead of origin**, FR-only, and ~30 minutes from go-live, with the language switcher safely preserved in a stash.

**Your instinct was correct: you *did* build a language switcher.** It was never deleted — it was stashed (`stash@{1}`), then a deliberate product decision shelved it in favor of FR-only. See the [i18n window](#-the-i18n-window--20260521--0522-the-part-you-remember) below and [`I18N-SWITCHER-RECOVERY.md`](I18N-SWITCHER-RECOVERY.md).

---

## 📊 Phase table

| Phase | Date range | Theme | Representative commits | Outcome |
|---|---|---|---|---|
| **0 · Baseline + first deploy-prep** | 2026-05-01 → 05-02 | Initial polished site (post-v8), favicons/OG, WebP heroes, booking fallbacks, robustness, README + launch tutorial | `50f7497` (initial snapshot) · `eef5ad8` · `71cabdd` · `00455c3` · `ec204db` · `27ae633` · `bf2b19a` · `4ca1055` | A shippable v1 with 5 trip pages, 3D globe, lightbox, sticky bar, service worker |
| **1 · Maps + readability** | 2026-05-04 → 05-05 | Real MapLibre GL maps replace broken SVG; per-trip itinerary maps; anti-clutter engine; dead-CSS sweep | `c39c076` · `27d5747` · `a05bbd8` · `e0c0615` · `f74d9ac` | `algeria-map.js` + `trip-map.js`; 8-strategy anti-clutter engine shared by both |
| **2 · Cinematic UX passes (v12–v19)** | 2026-05-06 → 05-07 | Hierarchy audit, scroll-expand hero (v13 → v14 sticky-scrub rewrite), booking/calc hardening, design-audit fixes, perf v17, brutalist hotel cards, trip-card refresh | `427d4de` (v12) · `5bc5dd1` (v14) · `dc7367b` (v15) · `0650362` (v16) · `3650c55` (v17) · `b3a3b37` (v18) · `3dd83c3` (v19) | The current visual language: sticky-scrub heroes, neo-brutalist hotel cards, image-fill trip cards |
| **3 · v21 cleanup cycle (phases A→J)** | 2026-05-11 → 05-13 | Token consolidation, motion library, ambient-loop cull, button/surface primitives, hero de-noise, single scroll coordinator, SEO (sitemap/robots/JSON-LD), dead-code sweep | `e3166e0` · `c3b186a` (A.1) · `80cd309`/`16b9dd6` (B) · `ebfaf0e`/`5bea2d1` (C) · `412eb3e`/`472e5c5` (D) · `9e9a24b` (F.1) · `ec72825`/`03022e8` (I) · `e78df1a`…`e64b8c1` (J.2) · `22f6029` (J.5) | One canonical `:root`, 4 durations × 4 easings, ~24 commits; CSS down to ~9,115 lines |
| **4 · Prod-prep + handoff** | 2026-05-13 → 05-16 | Cloudflare host config, perf/SEO hardening, WhatsApp FAB rewrite, stale-migration archival, master handoff doc | `8fc2d50` · `801eff6` · `647ffd5` | `_headers`/`_redirects`/`404.html`/`wrangler.toml`; `HANDOFF.md`; deploy-ready |
| **5 · Pitch-deck detour** | 2026-05-18 | Standalone B2B pitch deck (root artifact), full UI/UX overhaul, trilingual (FR/AR/EN) deck, Algeria-map fix | `bab6b5a` · `0549867` · `fecfe19` · `5366f76` · `36be656` | Pitch deck shipped; **two `claude/*` cloud branches forked here** (see below) |
| **6 · v22 deploy-blockers + cleanup** | 2026-05-19 | Fix JSON-LD image URL + 404 metadata + map focus rings; token hygiene + `/voyages/` index; AOS scroll animations added | `ec552c7` · `8e05673` · `61dc047` | Deploy blockers cleared; `/voyages/` catalog index added |
| **7 · algeria-map doc base** | 2026-05-21 15:20 | Header-comment doc update — **the base the i18n stash branched from** | `587ab0d` | This is the last commit pushed to `origin/feat/v12-hierarchy-pass` (everything after is local) |
| **8 · v22 multi-agent push** | 2026-05-22 | Responsive foundation + mobile nav drawer, z-index/spacing tokens, inline→utility migration, **i18n decision**, phone/mobile polish (Agent 3), AVIF heroes, hreflang rollout, perf (backdrop/will-change/AOS drop), a11y, QA + docs | `d91e50b` (foundation) · `35e3c97`/`bbe79b9` (tokens) · `48bdbe6` (**i18n lock**) · `6c4afe8`…`ed55af4` (Agent 3) · `e570408` (hreflang) · `3f88530`/`ea973ae`/`16cb383` (perf) · `b5f201c` (a11y) · `39b8e46` (QA) | Mobile-grade site; AOS dropped; i18n shelved FR-only; 20+ commits in one day |
| **9 · Token cleanup + mobile perf** | 2026-05-22 17:15, 2026-05-25 | Migrate 56 hardcoded colors → tokens; globe bails on mobile before downloading cobe; drop redundant FOUC inline styles | `693346d` · `9cd7dd1` · `71c8d77` | Current HEAD; CSS color discipline complete; lighter mobile payload |

> **Date-correction note (verified via `git show -s --format=%ci`):** the task brief placed the pitch deck at *2026-05-02*; it is actually **2026-05-18** (`bab6b5a` 15:27 UTC, `0549867` 15:44 UTC). 2026-05-02 is when the README/launch-tutorial commits (`6d049c3`, `4ca1055`) landed and around when the `claude/*` cloud branches were forked. The first repo commit is **2026-05-01** (`50f7497`), not 05-05. The full site under `site/` was already present from the initial snapshot; the *maps rebuild* is what began 05-04 → 05-05.

---

## 🌍 The i18n window — 2026-05-21 → 05-22 (the part you remember)

This is the ~20-hour stretch that produced the "wait, didn't I build a language switcher?" feeling. Here it is minute-by-minute (times are local `+0100`, verified):

```
2026-05-21
 │
 ├─ 15:20  587ab0d  docs(algeria-map): header comment
 │         └─► PUSHED to origin. This is the divergence point:
 │             origin/feat/v12-hierarchy-pass still sits HERE.
 │             Everything below is LOCAL-ONLY (28 commits ahead).
 │
2026-05-22  (one very busy morning)
 │
 ├─ 09:09  stash@{1}  wip(i18n): runtime engine + scaffolding
 │         │          "before /en/+/ar/ pre-render migration"
 │         │   • i18n.js engine (41,459 B, FR/EN/AR, 12 namespaces)
 │         │   • 161 data-i18n attrs across 8 HTML files
 │         │   • ~645 lines switcher UI + RTL CSS
 │         └─► 🟢 THE SWITCHER YOU REMEMBER. Stashed, not deleted.
 │
 ├─ 09:44  stash@{0}  wip(nav): mobile drawer refactor
 │         │          "depends on i18n lang-switcher"
 │         │   • enhance.js +93/-17: initNavDrawer()
 │         └─► 🔗 HARD-DEPENDS on stash@{1}. Stashed together because the
 │             drawer polls for .lang-switcher before initializing.
 │
 ├─ 10:21  d91e50b  feat(v22-foundation): responsive foundation +
 │                  mobile nav drawer + FAB/sticky coordination
 │         └─► A *fresh* nav drawer shipped here — NOT the stashed one.
 │             (The stashed drawer was coupled to i18n and stayed shelved.)
 │
 ├─ 11:02  48bdbe6  docs(i18n): LOCK SEO strategy — FR-only + hreflang
 │         └─► 🔒 THE DECISION. "Agent 4" writes docs/I18N-SEO.md:
 │             ship FR-only, hreflang="x-default", do NOT merge EN/AR
 │             until a copywriter reviews brand voice. The switcher is
 │             deliberately abandoned here — superseded, not lost.
 │
 ├─ 11:xx → 14:00  Agent 3 mobile-polish commits stream in
 │         6c4afe8 · 7405245 · 8bb700e · 1e159d6 · 61b4437 · 97f5824 · ed55af4
 │
 ├─ 14:01  e570408  feat(i18n-seo): apply hreflang=x-default to all pages
 │         └─► The locked decision, executed across every indexable page.
 │
 ├─ 14:56  16cb383  perf(reveal): DROP AOS, unify on own IntersectionObserver
 │
 └─ 17:15  693346d  refactor(css): migrate 56 color literals → tokens
```

**What this means for you:** the switcher was real and complete. At 09:09 it went into `stash@{1}`; at 11:02 a product decision (FR-only) made shipping it unnecessary for now. Two hours, two states, one feeling of "where did my work go?" — the answer is "in a stash, on purpose."

> 🔁 **Post-script (2026-05-25) — the switcher came BACK, mid-investigation.** While this doc set was being written, a **concurrent Claude Code session** committed `24c625e feat(i18n): restore runtime language switcher` at **12:36**. It revised `docs/I18N-SEO.md` (FR-only → "runtime engine ships as a UX surface"), committed `site/assets/js/i18n.js` (now **tracked**, byte-identical to the stashed blob), and wired `<script>` tags onto **all 8 pages** plus the switcher + RTL CSS. **So as of HEAD `24c625e` the switcher pill is LIVE** (it flips lang/dir/fonts and persists choice) — but it does **not translate body text yet** (the 161 `data-i18n` attrs were not reapplied) and `stash@{0}`'s mobile-drawer refactor is still unapplied. This is the literal answer to "didn't I build a switcher?": you did, it was shelved, and *today another session put it partway back*. Full state in [`I18N-SWITCHER-RECOVERY.md`](I18N-SWITCHER-RECOVERY.md) and [`README.md`](README.md).

---

## 🤖 Multi-agent workflow — why it looks scattered

The chaos was structural, not accidental. Several **parallel work surfaces** were active in the same window, which is why a single linear "what happened" story is hard to feel from inside the repo:

### 1. Parallel CLI agents — the "Agent 3" / "Agent 4" tags
On 2026-05-22, multiple Claude agents worked the v22 push at once, each owning a lane and tagging its commits:

- **Agent 3** owned **mobile/phone polish** — every `feat(v22-mobile): … (Agent 3)` commit: calc + booking phone polish (`6c4afe8`), hotel-card phone polish (`7405245`), footer collapse ladder (`8bb700e`), iOS viewport-height fallback (`1e159d6`), form label contrast (`61b4437`), booking empty-state (`97f5824`), PWA manifest icons (`ed55af4`).
- **Agent 4** owned **i18n + SEO strategy** — authored `docs/I18N-SEO.md` and the FR-only lock (`48bdbe6`), then the hreflang rollout (`e570408`).
- Interleaved between them: perf, a11y, token, and docs commits from the main lane.

Because the agents committed concurrently to the same branch, the `git log` reads like a shuffled deck — mobile, i18n, perf, docs alternating — even though each lane was internally coherent.

### 2. Cloud `claude/*` branches running separately from local CLI
Two branches exist on `origin` that were created by Claude's **web/cloud** surface (not the local CLI), and they forked off the **pitch-deck** work:

| Branch | Tip | Date | Author |
|---|---|---|---|
| `origin/claude/pitch-deck-standalone` | `36be656` "fix Algeria map + design polish" | 2026-05-18 19:38 UTC | Claude |
| `origin/claude/project-summary-marketing-rJVd8` | `bab6b5a` "add B2B pitch deck" | 2026-05-18 15:27 UTC | Claude |

These never merged into the main line of `feat/v12-hierarchy-pass`. They are pitch-deck artifacts living on a different surface — so work you did "in the browser" appears to have vanished from your local CLI history. It didn't; it's on those remote branches. (`git shortlog -sn --all` confirms: 93 commits by "Alliance Travel" (you), 5 by "Claude", 1 by "YAS-AWAKE".)

### 3. A worktree for docs
A git **worktree** is checked out at `.claude/worktrees/v22-docs` on branch `docs/v22-roadmap` (tip `5c8e0e7`, 2026-05-22 16:26). This let a docs-writing agent draft roadmap entries in parallel without touching the main working tree — which is why `git branch -a` shows a `docs/v22-roadmap` branch you may not remember creating. (Note `5c8e0e7` and the HEAD copy `73be0c6` are the same "20 commits + QA-verified metrics" roadmap entry — one was cherry-picked to HEAD, per the reflog.)

### 4. Two stashes
Covered above — `stash@{1}` (i18n engine) and `stash@{0}` (dependent nav drawer), both created 2026-05-22 morning, both still present.

> **Net effect:** at peak on 2026-05-22 you had (a) 2+ CLI agents committing to one branch, (b) 2 cloud branches from the pitch-deck detour, (c) 1 docs worktree, and (d) 2 stashes — all alive simultaneously, all within a tight window. That is the entire source of the "I feel lost" feeling. None of it is lost; it is just *distributed*.

### 5. (2026-05-25) The live cause: multiple sessions sharing ONE working tree
The "lost" feeling didn't end on 05-22 — it recurred **today**. A process scan (`Get-CimInstance Win32_Process`) found **≥4 Claude Code sessions** that ran against this *single* working directory on 2026-05-25, plus a local preview server:

| PID | Started | Surface |
|---|---|---|
| 21968 | 11:33 | Claude Code CLI (`--effort max`) |
| 21720 | 11:36 | Claude Code CLI (global npm) |
| 17532 | 12:42 | Claude Code **VS Code extension** |
| 28260 | 13:09 | Claude Code CLI (`--effort max`) |
| 35500/4396 | 11:26 | `npx serve site -p 5501` (preview) |

The three commits today line up with the 11:33/11:36 sessions: `9cd7dd1` (11:51), `71c8d77` (12:03), `24c625e` (12:36 — the i18n restore). There is **no cron job and no background task** in the harness (`CronList`/`TaskList` both empty) — these were **interactive concurrent sessions**, not an autonomous loop. ⚠️ **Multiple sessions on one working tree can overwrite each other's edits and corrupt the git index.** Fix: **one session per working tree**, or give each its own `git worktree`. This is the structural root cause — see [`README.md`](README.md).

---

## 🧭 Recent linear sequence (HEAD reflog, most-recent first)

The reflog confirms the clean working order on `feat/v12-hierarchy-pass` from the stash base forward — 28 steps from `587ab0d` (HEAD@{28}) to current `71c8d77` (HEAD@{0}):

```
71c8d77  HEAD@{0}   chore(html): drop redundant inline FOUC placeholder styles      2026-05-25
9cd7dd1  HEAD@{1}   perf(globe): bail before downloading cobe on mobile/tablet      2026-05-25
693346d  HEAD@{2}   refactor(css): migrate 56 color literals → tokens               2026-05-22
…        …          (v22 docs, a11y, QA, perf, hreflang, Agent-3 mobile, i18n lock) …
d91e50b  HEAD@{27}  feat(v22-foundation): responsive foundation + nav drawer        2026-05-22
587ab0d  HEAD@{28}  docs(algeria-map): header comment  ← origin tip / stash base    2026-05-21
```

(One non-commit step is visible: `73be0c6` at HEAD@{4} is a `cherry-pick`, all others are plain `commit` operations.)

---

## 🗺️ Roadmap vs reality

Cross-referenced against `docs/ROADMAP.md` (943 lines, last v21 entry dated 2026-05-13) and `docs/HANDOFF.md` (last updated 2026-05-19).

| Topic | Roadmap / Handoff says | Reality on HEAD | Drift? |
|---|---|---|---|
| **Phases 1 → v19** | Fully documented, phase-by-phase, accurate | Matches commit history exactly | ✅ none |
| **v21 cleanup (A→J)** | 24 commits, one canonical `:root`, motion tokens | Matches; `HANDOFF.md` §10 commit table is accurate | ✅ none |
| **"Branch is N ahead"** | HANDOFF §2: *"25 commits ahead of `main`"*; ROADMAP/HANDOFF written pre-v22 | Branch is **81 commits ahead of `origin/main`** and **28 ahead of `origin/feat/v12-hierarchy-pass`** | ⚠️ **stale** — both docs predate v22 |
| **v22 work** | **Absent from `HANDOFF.md`** (last updated 2026-05-19, before the v22 push) | 20+ v22 commits exist (foundation, mobile, perf, i18n, cleanup) | ⚠️ **major gap** — handoff stops one day before the biggest day |
| **SW cache name** | HANDOFF: `alliance-v21-2026-05-13` | Bumped to **v22** in `ae17435` | ⚠️ stale in doc |
| **AOS library** | Not in HANDOFF; added 2026-05-19 (`61dc047`) | **Dropped** in `16cb383` (own IntersectionObserver) | ⚠️ added *and* removed after the doc froze |
| **i18n / Arabic** | HANDOFF §11 lists "Arabic/RTL translation" as *medium-term, not scoped* | A full switcher was **built (stash), then shelved** by a locked FR-only decision (`docs/I18N-SEO.md`) | ⚠️ reality moved far past the roadmap; see CONTEXT docs |
| **Deploy readiness** | HANDOFF §11: ~30 min via Cloudflare Pages | Still true; more polished now | ✅ still accurate |

**Bottom line:** `ROADMAP.md` and `HANDOFF.md` are *trustworthy up to 2026-05-19* and then go silent — they were frozen the day before the v22 multi-agent surge. This `docs/CONTEXT/` set exists precisely to cover that gap.

---

## 📍 Current state (closing)

```
feat/v12-hierarchy-pass @ 71c8d77   (2026-05-25 12:03)
        │
        │  28 commits ahead of  origin/feat/v12-hierarchy-pass (587ab0d)   ← all local
        │  81 commits ahead of  origin/main (548bf56)
        │
        ├─ FR-only site, hreflang="x-default" on all 7 indexable pages
        ├─ AOS dropped; unified IntersectionObserver reveal
        ├─ 56 color literals migrated to tokens; mobile GPU cost trimmed
        ├─ cobe globe skips download on ≤1024px viewports
        │
        ├─ stash@{1}  ← trilingual i18n switcher (SAFE, recoverable)
        ├─ stash@{0}  ← dependent mobile nav drawer (SAFE, recoverable)
        ├─ worktree   ← .claude/worktrees/v22-docs  (docs/v22-roadmap)
        └─ origin/claude/*  ← 2 pitch-deck cloud branches (separate surface)
```

- **Branch:** `feat/v12-hierarchy-pass`, **28 commits ahead of its origin tip** (the task brief estimated "26"; verified count is **28** via `git rev-list --count origin/feat/v12-hierarchy-pass..HEAD`).
- **Site posture:** FR-only, mobile-polished, perf-tuned, deploy-ready (Cloudflare Pages, ~30 min per `docs/DEPLOY.md`).
- **The switcher you remember:** alive in `stash@{1}`, the engine even sitting untracked on disk — fully documented in [`I18N-SWITCHER-RECOVERY.md`](I18N-SWITCHER-RECOVERY.md). Restoring it is a *choice*, currently gated by a locked product decision.
- **Nothing is lost.** Everything that felt scattered — agents, cloud branches, the worktree, the stashes — is accounted for above.

### Next-step pointers
1. To deploy as-is: follow `docs/DEPLOY.md` (merge → Cloudflare Pages → DNS).
2. To revive the switcher: clear the decision gate in `I18N-SWITCHER-RECOVERY.md` §6, then run its restore playbook.
3. To push your local work: `git push origin feat/v12-hierarchy-pass` lands the 28 local commits on the remote.
4. To refresh the stale docs: `HANDOFF.md` + `ROADMAP.md` need a v22 section (this timeline is the source material).

---

*Generated read-only from git history on 2026-05-25. No commits, branches, stashes, or worktrees were modified in the making of this document.*
