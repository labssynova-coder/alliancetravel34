# 🎓 Lessons Learned

> Retrospective on the Alliance Travel project. Solutions catalogued so future projects can skip the same pain. Issue histogram with frequency and impact. Honest experience report from ~30 sessions of AI-pair-programming work.

---

## 📈 Issue Histogram

```
Category                          ████████████████████ Count   Severity
────────────────────────────────  ────────────────────  ─────  ────────
File-system regressions           ██                    2      🔴 Critical
Multi-session overlap chaos       █████                 5      🔴 Critical
Lost/orphan agent work            ████                  4      🟠 High
Agent rate-limit timeouts         ███                   3      🟠 High
CSS specificity wars              ██████                6      🟡 Medium
Token system drift                ████                  4      🟡 Medium
Animation/perf regressions        ████                  4      🟡 Medium
Mobile UX bugs                    ████████              8      🟡 Medium
Inline-style proliferation        ███                   3      🟢 Low
Image weight overruns             ██                    2      🟢 Low
i18n SEO strategy churn           ███                   3      🟢 Low
Doc/reality drift                 █████                 5      🟢 Low
                                                       ──
Total documented issues                                49
```

Severity legend:
- 🔴 **Critical** — would block a real deploy or lose user work
- 🟠 **High** — major rework needed; user-visible quality regression
- 🟡 **Medium** — sloppy but recoverable in one session
- 🟢 **Low** — surfaces as code smell; not a deploy blocker

---

## 🛠 Solutions Catalogue

Patterns that worked, documented so the next project doesn't re-invent them.

### S1. The Multi-Agent Master Prompt Pattern

**Problem:** A large refactor (the v22 responsive hardening) had 30 specific issues spanning architecture, perf, mobile, SEO, and QA. One agent doing it all would either run out of context or merge-conflict with itself.

**Solution:** Write a single 1500-word master prompt that:
1. Defines the project state assumed at start (HEAD, branch, dirty tree).
2. Lists EVERY known issue, priority-tagged.
3. Carves out **strict file-ownership lanes** per agent (Agent 1 owns architecture sections of styles.css, Agent 3 owns component sections — no overlap).
4. Mandates `git commit` after every deliverable so reflog is the safety net.
5. Defines a serial QA agent (read-only) that runs last.

**Result:** ~60-70% of the brief landed cleanly in one parallel dispatch. Subsequent sequential dispatches finished the rest. Zero merge conflicts.

**Where to find it:** the master prompt was re-pasted by the user into the receiving session — find a sample structure in [`STORY.md`](STORY.md) Act V.

---

### S2. Stash with `-u` Saves Untracked Files

**Problem:** During the v22 cycle, an untracked `i18n.js` file (812 lines, the entire trilingual engine) seemed to vanish when the session crashed.

**Solution:** A stash created with `git stash -u` has **three parents** — and the third parent is a tree containing untracked files. Recovery:

```bash
# Stash listing
git stash list                                            # see all stashes
git cat-file -p stash@{1} | grep '^parent'                # count parents

# If 3 parents, the 3rd is the untracked tree
git ls-tree -r <third-parent-sha>                          # list untracked files
git cat-file -p <blob-sha> > recovered-file.js             # extract
```

**Apply to:** any session where you `git stash` work-in-progress that includes new untracked files. Always use `-u`.

---

### S3. The Mobile Nav Drawer Pattern (Vanilla, No Library)

**Problem:** Mobile nav was overflowing at 375px (logo + links + lang + theme + WhatsApp = 5 elements on a 295px usable width).

**Solution:** A drawer that **moves existing controls into it** (not clones — that would duplicate event handlers).

```js
function initNavDrawer() {
  // 1. Wait for dependencies (e.g., i18n.js to build the lang-switcher)
  if (!nav.querySelector('.lang-switcher')) {
    return setTimeout(initNavDrawer, 50);
  }
  // 2. Create the drawer element
  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  // 3. MOVE (not clone) existing right-side controls into the drawer
  ['.nav-links', '.lang-switcher', '.theme-toggle', '.nav-cta'].forEach(sel => {
    const el = nav.querySelector(`:scope > ${sel}`);
    if (el) drawer.appendChild(el);          // event listeners survive
  });
  nav.appendChild(drawer);
}
```

CSS gates:
```css
/* Desktop ≥901px: drawer is transparent to layout */
.nav-drawer { display: contents; }

/* Mobile ≤900px: drawer becomes a fixed slide-in panel */
@media (max-width: 900px) {
  .nav-drawer { position: fixed; transform: translateX(100%); ... }
  .site-nav.nav-open .nav-drawer { transform: translateX(0); }
}
```

**Result:** desktop layout byte-identical to pre-drawer (because `display: contents` makes the wrapper invisible to flex layout). Mobile gets a proper modal drawer with backdrop, body scroll lock, focus management, Esc to close, auto-close on link tap.

**Apply to:** any vanilla project that needs a mobile nav drawer without React/Vue/Web Components.

---

### S4. The Foundation Token Block

**Problem:** 5 scattered `:root` blocks in styles.css with overlapping spacing scales (`--s2: 9px` ≠ 8 ≠ `--space-2: 8px`), inconsistent typography clamps, ad-hoc z-index numbers from -1 to 9999.

**Solution:** A single block at the TOP of the CSS file with:
- Breakpoints as documentation-only custom properties: `--bp-xs/sm/md/lg/xl`
- Spacing scale aligned to 8px: `--space-1: 4px` through `--space-10: 128px`
- Fluid typography via `clamp()`: `--fs-caption` through `--fs-display-1`
- Section rhythm tokens: `--section-y`, `--section-y-sm`, `--section-y-lg`
- Container gutter: `--container-x: clamp(16px, 5vw, 80px)`
- Touch tokens: `--touch-min: 44px`, `--field-h: 52px`, `--field-fs: 16px`
- Chrome heights: `--nav-h`, `--sticky-bar-h`, `--fab-size`
- Z-index ladder: `--z-base` (0) through `--z-fab` (650), 10 named layers
- Hard kill switches: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; ... } }`

**Result:** any future component can reach for tokens. Theme switching, RTL, mobile, accessibility — all derive from the same source.

**Apply to:** every new project. Build the foundation block BEFORE any components.

---

### S5. Photo-Overlay Legibility Lock

**Problem:** Trip card prices became invisible in light mode because they used `var(--txt-1)` (navy in light mode) over a dark-glass overlay — invisible against the dark photo.

**Solution:** For ANY UI element that sits on top of a user-supplied photograph, lock its colors to be **theme-independent**:

```css
.trip-card__from {
  background: rgba(0, 0, 0, 0.6) !important;   /* dark glass — same in both themes */
  color: #fff !important;                        /* white text — same in both themes */
}
```

The `!important` is load-bearing — it's there specifically to prevent theme cascade from breaking the legibility contract.

**Apply to:** badges, ribbons, captions, anything overlaying photography. Document the rationale (we did so in `_archive/CSS-IMPORTANT-RATIONALE.md`) so future maintainers don't try to "clean up" the `!important`.

---

### S6. Lazy Hero Collage Tiles

**Problem:** Homepage hero collage = 5 photos at ~280KB each = 1.4MB on first paint. The LCP candidate (tile 1) was fighting bandwidth with 4 same-priority tiles.

**Solution:** Two-tier loading:
1. **Tile 1 (LCP):** `<picture>` with `<img loading="eager" fetchpriority="high">` — gets bandwidth priority.
2. **Tiles 2–5:** ship as `<picture data-lazy-hero="<slug>">` with a 1×1 SVG `data:` URI placeholder + CSS `background:#111` fill. A 70-line `hero-collage-lazy.js` waits for `window.load` + `requestIdleCallback`, then injects real `<source>` + `<img>` elements.

```js
// After LCP completes + browser idles:
function lazyInject() {
  document.querySelectorAll('[data-lazy-hero]').forEach(picture => {
    picture.innerHTML = buildSources(picture.dataset.lazyHero);
  });
}
window.addEventListener('load', () => requestIdleCallback(lazyInject));
```

**Result:** LCP image budget cut by ~70%. The collage still animates in cinematically after the page is interactive.

**Apply to:** any multi-image hero or above-the-fold gallery.

---

### S7. The `:has(.sticky-total)` Trick for Conditional Layout

**Problem:** The WhatsApp FAB at `bottom: 14px` collided with the sticky-total bar (84px tall) on trip pages. Homepage doesn't have a sticky-total, so it didn't need the FAB lifted.

**Solution:** Use `:has()` to conditionally style:

```css
@media (max-width: 1024px) {
  /* Only consume bottom padding on pages that ACTUALLY have a sticky-total */
  body:has(.sticky-total) {
    padding-bottom: calc(var(--sticky-bar-h) + env(safe-area-inset-bottom));
  }
  /* Lift FAB only when sticky-total is present */
  body:has(.sticky-total) .fab-whatsapp {
    bottom: calc(var(--sticky-bar-h) + var(--space-4) + env(safe-area-inset-bottom));
  }
}
```

**Result:** zero homepage layout cost. Trip pages get the correct lift. Browser support is solid (Chrome/Safari/Firefox since 2022/2023).

---

### S8. `display: contents` for Mobile-Only Wrappers

**Problem:** We wanted a `.nav-drawer` wrapper that exists in the DOM at all viewport widths (so JS can move things into it), but is **invisible to layout at desktop**.

**Solution:**
```css
.nav-drawer { display: contents; }    /* desktop: wrapper is invisible to flex layout */
@media (max-width: 900px) {
  .nav-drawer { display: flex; position: fixed; ... }   /* mobile: real panel */
}
```

When `display: contents` is set, the element's box disappears from layout but its children continue to participate in the parent's layout as if the wrapper didn't exist.

**Apply to:** any "conditional wrapper" pattern where a DOM element should sometimes be a layout participant and sometimes a no-op.

---

### S9. Color Migration: Audit First, Migrate Second

**Problem:** 614 hardcoded color literals in CSS (214 hex + 400 rgba). Bulk-replacing them risked invisible visual regressions.

**Solution:** Two-pass approach:
1. **Audit script** (`_audit_colors.py`, preserved in `_archive/scripts/`) catalogs every hex/rgba with its surrounding selector + suggests a token (or `keep_local` with reason). Outputs CSV.
2. **Migration script** reads the CSV, applies substitutions, prints a diff stat. Human reviews the diff at desktop 1440px before committing.

The 60 directly-tokenizable cases migrated cleanly. The 404 "keep_local" cases are usually shadows, gradients, or per-region accents that genuinely need to stay literal.

**Apply to:** any large refactor that touches visual properties. Always: audit → review → migrate → diff → commit.

---

### S10. Strategy (c) for SEO-vs-i18n Tension

**Problem:** Multilingual sites must choose: subpath `/en/` + duplicate URLs (SEO friendly but maintenance heavy), `?lang=en` query param (lighter but ranks worse), or **runtime-only client-side switch + FR canonical** (lightest but EN/AR are SEO-invisible).

**Solution chosen:** Strategy (c) — FR canonical for SEO, runtime switcher for UX. Documented why:

- Algerian travelers code-switch FR↔AR; the switcher signals "we serve you" without committing to maintaining 3× URL space.
- A copywriter for MSA + EN is not on retainer — shipping unreviewed translations would mismanage the brand.
- The engine fails gracefully: missing keys fall back to FR.

**When to switch to subpath (a):** If WhatsApp inbound passes 15% non-FR for two consecutive months OR a B2B contract requires Arabic-first surfaces. Until then, the runtime switcher is enough.

**Apply to:** any small static site where multilingual is "nice to have" but not "must rank."

---

## 🚨 Anti-patterns we hit (avoid these)

### A1. Uncommitted Work + Multiple Sessions

We left work uncommitted across session boundaries TWICE. Both times, a regression event (cache miss, IDE auto-save, parallel session writing to the same file) wiped lines we thought were durable.

**Anti-pattern:** "I'll commit at the end of this session."
**Pattern:** Commit after every meaningful chunk, even if the message is `wip: typing out the drawer CSS — not done yet`. Reflog is your friend.

---

### A2. Trusting a Doc Over Real State

`docs/I18N-SEO.md` said "FR-only locked" while a stash contained a fully-built i18n engine. Multiple sessions accepted the doc and re-investigated whether to build i18n from scratch.

**Anti-pattern:** Reading the doc as authoritative.
**Pattern:** When a doc says X but git status / stash list / file system says Y, **trust the file system**, then update the doc.

---

### A3. Parallel Agents on Files That Touch

The v22 master prompt brief carved out lanes, but it also tried to dispatch Agents 1+2+3+4 in PARALLEL. Three of them hit rate limits / server errors and only ~60-70% of the brief landed.

**Anti-pattern:** "Dispatch 4 parallel agents to go faster."
**Pattern:** Dispatch sequentially in a chain. Each agent commits before the next starts. Slower wall-clock, but no half-finished work in flight.

---

### A4. Trying to Hit Arbitrary Metrics

The master prompt set `!important < 80` as a success criterion. The actual number is 218, with ~124 load-bearing. Chasing the metric would mean removing photo-overlay locks and re-introducing the v3 "trip card prices invisible in light mode" bug.

**Anti-pattern:** "The metric says < 80, so reduce it."
**Pattern:** Audit each `!important` per category. Document why each must stay. Accept a realistic floor (~140 here). Block new ones with a lint rule.

---

### A5. The Forever-Worktree Trap

A `docs/v22-roadmap` worktree was created with `git worktree add .claude/worktrees/v22-docs <branch>` and forgotten. The next session looked at the repo and saw "2 worktrees, 3 branches, 2 stashes — am I losing my mind?"

**Anti-pattern:** Long-lived worktrees for one-off tasks.
**Pattern:** `git worktree add ... && do-the-work && git worktree remove ...` in the same session.

---

## 💡 Experience gained

Distilled from ~30 sessions:

1. **Static sites are underrated.** Vanilla HTML/CSS/JS with no build step ships fast, deploys anywhere, has zero supply-chain risk, and works on the cheapest CDN tier. The complexity budget freed up went into design depth (5 cinematic regional themes, scroll-pinned hero, RTL, custom maps) instead of fighting webpack.

2. **The single CSS file is fine.** 9918 lines of CSS in one file looks scary but reads linearly. The "split into modules" instinct comes from JavaScript ergonomics that don't apply to CSS. Splitting would add HTTP requests, complicate the cascade, and violate the Performance Contract §0a (no build step).

3. **Foundation BEFORE components.** Every project we'll do should start with the token foundation block. Build it first. Resist the urge to "just ship the homepage and refactor later." We refactored twice (v21 and v22) — and the v22 token system finally became enforceable. Time saved if foundation existed from day 1: ~3-4 sessions.

4. **Vanilla beats library for ~5KB.** The AOS library was a 42KB hit for one-shot reveals we already had an IntersectionObserver pattern for. Whenever a library does ONE thing and weighs more than its replacement, write the replacement. Replacing AOS took 90 lines of JS.

5. **Reduced-motion is correctness, not a polish item.** The `@media (prefers-reduced-motion: reduce)` block with `* { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }` is genuinely WCAG 2.3.3 territory. Ship it early. The `!important` is load-bearing.

6. **Touch targets matter more than designers admit.** 44×44 is the WCAG floor, but `min-height: var(--touch-min)` should be ENFORCED via `@media (pointer: coarse)` on the foundation block, not added component-by-component. Single source of truth wins.

7. **Image pipelines beat image optimization.** Going from "manually save WebP" to "AVIF + WebP + JPG with `<picture>` srcset" was a 30% LCP win for one afternoon of work. Always use `<picture>` with at least 3 source formats when shipping >100KB images.

8. **Mobile UX is its own discipline.** The cinematic desktop site looked nothing like what mobile users got until v22. **Audit the mobile experience at 375px on day 1 of every project**, not as an afterthought.

9. **i18n complexity scales nonlinearly.** Just adding a language switcher cost more design hours than the entire calculator widget. RTL flip cost more than that. Be honest about the maintenance burden before shipping i18n. Strategy (c) — runtime UX, FR canonical SEO — is the right floor for most small-business sites.

10. **Document EVERY architectural decision.** The 4 dossiers in `_archive/CONTEXT/` saved us when the project felt "lost." If a future maintainer sees `docs/STORY.md` + `docs/AUDIT.md` + `docs/LESSONS.md`, they have everything to continue without panic.

---

## 🎯 For your next project

Copy this checklist to your next static-site brief:

```
□ Day 1: write the foundation token block. Breakpoints, spacing-8 scale, 
  fluid typography, container/section rhythm, touch tokens, z-index ladder,
  prefers-reduced-motion kill switch.

□ Day 1: 1 branch only. Commit every meaningful change. No long-lived 
  feature branches without a written plan to merge them.

□ Day 1: decide i18n strategy. If unsure, use (c): runtime switcher + 
  canonical-language SEO. Document the trigger that would flip you to (a).

□ Day 2: 375px viewport pass. Walk the prototype on a real phone before 
  any "polish" work. Mobile UX is the audit, not the afterthought.

□ Day 2: image pipeline. AVIF + WebP + JPG, <picture> srcset, lazy non-LCP.

□ Day 3: deploy preview to Cloudflare Pages (or any static host). Test 
  the loop: edit → push → see live. If it's broken, fix it before adding 
  any feature.

□ Each subsequent session:
  - Commit before closing.
  - Use git stash -u (with -u!) if you must park work.
  - When a doc says X but git says Y, trust git and update the doc.

□ Multi-agent work:
  - Master prompt with strict file-ownership lanes.
  - Sequential dispatch unless agents own truly disjoint files.
  - Read-only QA agent runs last.

□ Final:
  - docs/STORY.md (one narrative)
  - docs/AUDIT.md (with obsolete-file flags)
  - docs/LESSONS.md (what you'd do differently)
  - docs/DEPLOY.md (the live-in-30min path)
```

---

*Last updated: 2026-05-26. If you want to extend this with lessons from later cycles, prepend new sections at the top of "Solutions" / "Anti-patterns" and bump the histogram counts.*
