# ALLIANCE TRAVEL — Layout, Motion & Visual Architecture Cleanup
## Master Prompt v2 · 2026-05-07 *(survey-locked)*

> **Read this whole document before touching code.** The site has shipped through 20 versioned design passes (v1 → v20) without anyone ever pruning the previous ones. Lines stack instead of replacing. Tokens get redefined in four places. Animations multiply. The result reads as cluttered because every element carries 4 years of compounded "polish" instead of a single voice.
>
> The goal of this cleanup is **one coherent motion language, one token surface, one entrance choreography**, applied to every component on every page. Framer-style: nothing moves unless it has a reason to, every move feels like the same hand wrote it. **Within a strict performance budget.**

---

## 0a · Consolidated survey answers (the contract)

Survey filled 2026-05-07. These answers override anything that contradicts them elsewhere in this document.

| # | Decision | Locked value |
|---|---|---|
| Q1 | Overall motion intensity | **C — Cinematic** (very animated, but performance-locked) |
| Q2 | Hover micro-feel | **C — Pronounced** (`-6px` lift, `1.08` image scale) |
| Q3 | Hero motion profile | **A — Full theater** (paper plane + twinkles + glow + drift, *synchronized & choreographed*) |
| Q4 | Per-region body patterns | **C — Animate, gated by IntersectionObserver** (paused when off-screen) |
| Q5 | HQ branch-card pulse | **KEEP** |
| Q6 | Map pin pulses | **KEEP** |
| Q7 | WhatsApp FAB pulse | **KEEP, dismiss after 5s** |
| Q8 | Stat counter punch | **KEEP** |
| Q9 | Scroll-progress bar | **KEEP** |
| Q10 | WhatsApp FAB scope | **All pages** |
| Q11 | Trip-page sticky inquiry bar | **KEEP, but replaces top nav when scrolled past hero** (single sticky chrome row) |
| Q12 | Magnetic buttons | **KEEP**, desktop only, full strength |
| Q13 | Easing curves | **B — 3 + 1 bounce** reserved for delight moments (toast, counter punch) |
| Q14 | Duration tokens | **B — Add `--t-cinema: 900ms`** for hero entrance + map fly-to |
| Q15 | Spacing scale | **A — Fix `--s4=--s5` duplicate now**, repair visual breaks as they appear |
| Q16 | First phase | **A — Phase A (token consolidation) first** |
| Q17 | Reference sites | *(skipped — defer to engineering north star)* |
| Q18 | First canary page | *(absorbed into Phase E — hero overhaul applied uniformly across all 6 pages)* |
| **Q19** | **North star** | **"A professional site with clean readable code, consistent naming, clear architecture, modern SEO end-to-end, and a sitemap that doesn't bother the user."** |

### Performance Contract (non-negotiable, applies to every phase)

> User directive: **"FOCUS ON THE PERFORMANCE."**

1. **GPU properties only** for animation — `transform` and `opacity` are the entire animatable surface. No animated `filter`, `box-shadow`, `width`, `height`, `top/left`.
2. **IntersectionObserver gates every decorative loop** — paper plane, twinkles, glow, drift, region patterns all pause when off-screen.
3. **Single `rAF` scroll coordinator** — currently 2 separate scroll listeners; merging into one in `enhance.js`.
4. **`content-visibility: auto`** on long sections below the fold.
5. **`will-change`** applied surgically (≤ 4 elements per page, removed after animation completes). Never blanket.
6. **`prefers-reduced-motion`** respected — every animation has a "snap to final state" fallback, no half-states.
7. **Lighthouse targets**: Performance ≥ **90** on homepage, ≥ **92** on trip pages (currently 84). CLS = **0** on hero photos (aspect-ratio reservation).
8. **No JS animation loops** for decorative motion — CSS keyframes only. JS owns scroll-driven and interactive motion exclusively.
9. **LCP < 1.8s** on 4G — hero LCP image uses `loading="eager" fetchpriority="high"`, all others lazy.
10. **No animation runs above 60fps RAF** — long tasks ≤ 50ms.

### Cinematic Choreography Doctrine

The survey says "Cinematic Q3=A keep all loops" AND "current heroes feel cluttery". This is not a contradiction — it is the principle:

> **Cinema = one element commands the eye at a time. Everything else holds breath.**

Cinematic ≠ everything moves at once. Cinematic = one motion is the focal verb, everything else is supporting grammar. The four hero loops (paper plane + twinkles + glow + drift) are kept *but choreographed* so only one is the focal element at any given moment. The rest run at reduced opacity / longer duration / paused when not the focal element.

This doctrine is enforced in **Phase E (Hero Overhaul)**.

---

## 0 · Context for the next agent (read first)

**Codebase shape**
- Vanilla HTML/CSS/JS, no build step, no framework. 6 HTML pages (`/`, `/cairo-sharm`, `/sharm-constantine`, `/istanbul`, `/azerbaidjan`, `/kuala-lumpur`).
- One stylesheet: `site/assets/css/styles.css` — currently **9 582 lines, 211 `!important`s, 44 `══` v-block headers.**
- 7 JS modules in `site/assets/js/`: `enhance.js`, `enhance-pro.js`, `scroll-hero.js`, `globe.js`, `algeria-map.js`, `trip-map.js`, `booking-form.js`, `calculator.js`.
- Inline `<style>` block in `site/index.html` (head, ~150 lines) carries v1 baseline rules that still leak into the cascade for some legacy components.

**Brand non-negotiables (don't change these)**
- Typography: **DM Sans**, weights 300/400/500/600/700.
- Brand colours: **Prussian Blue `#002c51`** + **Mint `#9ce8b2`** (dark mode) / **`#237a4a`** (light mode, AA contrast).
- Per-region accent overrides on trip pages: `egypt #e0a04a`, `azerbaijan #e07b5a`, `istanbul #5cb1c1`, `malaysia #8acaa1`, `sharm #5cc4c1`.
- Language: **French**. Country: **Algeria**. Currency: **DA**.

---

## 1 · Diagnosis (what's actually wrong)

### Motion debt
| Metric | Current | Target |
|---|---|---|
| Unique `@keyframes` | **26** | ≤ 10 |
| Unique `cubic-bezier` curves | **11** | **3** (spring / snap / out) |
| Inline `transition:` declarations | **~120** | All routed through tokens |
| Concurrent infinite animations on home above-the-fold | **6** (paper-plane drift, twinkle, glow-pulse, drift-slow, photo-fade, ken-burns, fab-pulse) | **2 max** (FAB pulse + nav scroll state) |
| Conflicting timing systems | **2** (original `--t-fast: 200ms` + later `--t-fast: 180ms`) | **1** |

**The 11 curves currently in use, raw:**
```
ease-out, ease-in-out, linear,
cubic-bezier(.22, .68, 0, 1.02)   // 1× — drop
cubic-bezier(.5,  1.5, .5, 1)     // 1× — drop (over-bouncy)
cubic-bezier(.22, 1,   .36, 1)    // many× — KEEP as --ease-spring
cubic-bezier(.34, 1.4, .64, 1)    // many× — drop (overshoot wobble)
cubic-bezier(.4,  0,   .2, 1)     // ~6× — KEEP as --ease-snap (Material standard)
cubic-bezier(.25, 1,   .5, 1)     // 0× declared — drop
cubic-bezier(.34, 1.6, .64, 1)    // 1× — drop
cubic-bezier(.23, 1,   .32, 1)    // 4× — drop, almost-duplicate of spring
```

### Token debt
- **Spacing scale has duplicates**: `--s4 = --s5 = 24px`, `--s7 = --s8 = 40px`. Linear progression broken.
- **Colour tokens redefined in 4 places**: `:root` (line 59), `[data-theme="light"]` (line 3253), v3.1 light WCAG fix (line 3666), v19 palette refresh (line 9185). Each pass adds new names instead of replacing. By v19 there are **7 surface tokens** (`bg`, `bg-deep`, `bg-low`, `bg-2`, `bg-card`, `bg-elev`, `bg-glass`) — all good, but the v1 name `--bg-2` was redefined by v19 with a different luminance, so older components pick up the wrong tone.
- **Mint aliased to bronze**: legacy components still reference `--bronze` because the v1 brand was bronze-on-cream. Currently shimmed via `--bronze: var(--mint)`. Acceptable but adds a hop.

### Architecture debt
- **44 `v-N` blocks** in `styles.css`. Many obsolete (e.g. v18 neo-brutalist hotel cards was scrapped, but its CSS is still resident).
- **211 `!important`** — cascade fight, mostly v17–v20 trying to override earlier blocks.
- **Inline `<style>` in `index.html` (lines 122-200ish) — REMOVED in v20** for the trip-card portion, but other trip pages still embed similar baseline rules. Audit each.
- **Two scroll listeners run on every page**: one in `enhance.js` (counter + reveal observer), one in `enhance-pro.js` (parallax + progress bar + FAB threshold + sticky bar). Each binds its own `scroll` event with rAF throttling. Should be a single coordinator.
- **Two reveal systems**: `.reveal` + `.visible` (enhance.js) and `[data-fx]` + `.is-in` (enhance-pro.js). Same job, different attributes, different observers. Pick one.

### Component-level inconsistencies (spotted during audit)
- Cards: `.dest-card`, `.testi-card`, `.stat-card`, `.info-card`, `.faq-item`, `.contact-form`, `.bform-block`, `.breakdown`, `.upload-zone`, `.trip-card`, `.hotel-card`, `.value-card`, `.branch-card`, `.phone-card` — **14 card classes**, no shared base. Some lift `-4px`, some `-5px`, some `-6px`. Some scale image `1.04`, some `1.05`, some `1.08`.
- Buttons: `.btn--primary`, `.btn--ghost`, `.btn--wa`, `.nav-cta`, `.calc-cta`, `.fab-whatsapp`, `.tier-tab`, plus per-component CTAs (`.trip-card__cta`, `.hotel-card__cta`, `.phone-card__btn`). **No shared button primitive** — each rolls its own padding / radius / hover.
- Pulses: `card-pulse`, `fab-pulse`, `badge-pulse`, `amap-pulse`, `tmap-pulse`, `shv14-pulse`, `sun-pulse`, `glow-pulse`. **8 pulses with subtly different rhythms** (1.6s / 1.9s / 2s / 2.4s / 2.6s / 6s / 7s). On any page with a map you have 3-4 of these running.

---

## 2 · The new design language

### 2.1 Motion vocabulary — single source of truth

**Three durations.** That's it. Anything outside this is a typo.

```css
:root {
  --t-fast: 180ms;   /* taps, focus, micro state */
  --t-base: 320ms;   /* component hover, dropdown, modal */
  --t-slow: 560ms;   /* section entrance, sticky reveal */
}
```

**Three easings.** Named by intent.

```css
:root {
  --ease-out:    cubic-bezier(.22, 1, .36, 1);  /* default exit */
  --ease-spring: cubic-bezier(.22, 1, .36, 1);  /* same curve — alias */
  --ease-snap:   cubic-bezier(.4,  0, .2, 1);   /* Material — for taps + chrome */
}
```

**`--ease-spring` and `--ease-out` are the same bezier.** Springs that overshoot (`(.34, 1.4, .64, 1)`, `(.5, 1.5, .5, 1)`) make UI feel toy-like. Framer's house style is overshoot-free; we copy that. The token is split in two names purely so future authors can say "this is a tap" vs "this is content arriving" — both resolve to the same out-quart curve.

**Four motion patterns.** Every interactive element on the site picks ONE.

| Pattern | Use it on | Visual rule |
|---|---|---|
| **Lift** | Cards on hover | `transform: translateY(-4px)` + shadow deepens, `--t-base var(--ease-spring)` |
| **Reveal** | Sections / cards entering viewport | `opacity 0 → 1` + `translate3d(0, 24px, 0) → 0`, `--t-slow var(--ease-spring)`, optional `--d` stagger child index × 60ms |
| **Tap** | Buttons / pills on `:active` | `transform: scale(.97)`, `--t-fast var(--ease-snap)` |
| **Highlight** | Focus rings, selected states, hover-on-non-card | `border-color` + `box-shadow` change, `--t-fast var(--ease-out)` |

**That's the entire motion language. No element gets a custom curve. No element gets translateY(-6px) "just because".** When the next agent finds a component with a different lift distance or duration, they normalize it.

### 2.2 Visual tokens — single root

Consolidate to a single `:root` declaration at the top of the file. Light-mode override only redefines the deltas. Names below are the canonical set after dedupe.

```css
:root {
  /* Surfaces — 6-layer ladder, dark mode */
  --bg-deep:  #06090d;
  --bg:       #0a0f15;
  --bg-low:   #0d131b;
  --bg-2:     #11181f;
  --bg-card:  #161e28;
  --bg-elev:  #1c2532;
  --bg-glass: rgba(20, 26, 36, .72);

  /* Borders */
  --border:      rgba(255, 255, 255, .06);
  --border-hi:   rgba(255, 255, 255, .12);
  --border-mint: rgba(156, 232, 178, .32);

  /* Text — same temperature across the scale */
  --txt-1: #f3ede2;
  --txt-2: #b6ada0;
  --txt-3: #7a7268;

  /* Brand */
  --navy:      #002c51;
  --navy-soft: #003d72;
  --mint:      #9ce8b2;
  --mint-soft: #7dd4a0;
  --mint-deep: #5cb37c;
  --mint-dim:  rgba(156, 232, 178, .10);
  --mint-glow: rgba(156, 232, 178, .28);
  --ring:      rgba(156, 232, 178, .55);

  /* Per-page accent (overridden by trip pages, defaults to mint) */
  --accent:      var(--mint);
  --accent-dim:  var(--mint-dim);
  --accent-glow: var(--mint-glow);

  /* Status */
  --sage:   #3B7A65;   --sage-soft:   rgba(59, 122, 101, .18);
  --danger: #cf5252;   --danger-soft: rgba(207, 82, 82, .12);
  --warn:   #e0a04a;   --warn-soft:   rgba(224, 160, 74, .14);

  /* Type */
  --font-display: 'DM Sans', system-ui, sans-serif;
  --font-body:    'DM Sans', system-ui, sans-serif;

  /* Spacing — strictly geometric, no duplicates */
  --s1:  4px;
  --s2:  8px;
  --s3:  12px;
  --s4:  16px;
  --s5:  24px;
  --s6:  32px;
  --s7:  48px;
  --s8:  64px;
  --s9:  96px;
  --s10: 128px;

  /* Radii */
  --r1: 4px;
  --r2: 8px;
  --r3: 14px;
  --r4: 999px;

  /* Elevation — three steps */
  --elev-1: 0 1px 0 rgba(255, 255, 255, .04) inset, 0 8px 16px -8px rgba(0, 0, 0, .55);
  --elev-2: 0 1px 0 rgba(255, 255, 255, .05) inset, 0 14px 28px -12px rgba(0, 0, 0, .6),  0 24px 48px -24px rgba(0, 0, 0, .35);
  --elev-3: 0 1px 0 rgba(255, 255, 255, .07) inset, 0 24px 48px -16px rgba(0, 0, 0, .65), 0 48px 96px -32px rgba(0, 0, 0, .4);

  /* Motion (see § 2.1) */
  --t-fast: 180ms;
  --t-base: 320ms;
  --t-slow: 560ms;
  --ease-out:    cubic-bezier(.22, 1, .36, 1);
  --ease-spring: cubic-bezier(.22, 1, .36, 1);
  --ease-snap:   cubic-bezier(.4,  0, .2, 1);

  /* Legacy shim — keep until all components migrate */
  --bronze:     var(--mint);
  --bronze-hov: var(--mint-soft);
  --bronze-dim: var(--mint-dim);
}

:root[data-theme="light"] {
  --bg-deep: #ede5d4;
  --bg:      #fbf8f1;
  --bg-low:  #f5efe1;
  --bg-2:    #f7f1e3;
  --bg-card: #ffffff;
  --bg-elev: #ffffff;
  --bg-glass: rgba(251, 248, 241, .82);

  --border:      rgba(0, 44, 81, .08);
  --border-hi:   rgba(0, 44, 81, .16);
  --border-mint: rgba(35, 122, 74, .35);

  --txt-1: #002c51;
  --txt-2: #4a5567;
  --txt-3: #5a6a7c;

  --mint:      #237a4a;
  --mint-soft: #2c8a55;
  --mint-deep: #1f6b40;
  --mint-dim:  rgba(35, 122, 74, .10);
  --mint-glow: rgba(35, 122, 74, .25);
  --ring:      rgba(35, 122, 74, .50);
}
```

**Spacing fix:** `--s4 = 16` (was 24), `--s5 = 24`, `--s7 = 48` (was 40), `--s8 = 64` (was 40). This matches the 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 progression every modern design system uses (Vercel, Linear, Stripe, Framer). When the next agent migrates components, run a project-wide grep for `var(--s4)` and `var(--s5)` first to spot any visual breaks (most are fine because the difference is 8px).

### 2.3 Component primitive: `.surface`

Most cards differ by background, border, padding, hover lift. Introduce a single base class:

```css
.surface {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--r3);
  padding: var(--s5);
  box-shadow: var(--elev-1);
  transition:
    transform   var(--t-base) var(--ease-spring),
    border-color var(--t-base) var(--ease-out),
    box-shadow  var(--t-base) var(--ease-out);
}
.surface--lift:hover {
  transform: translateY(-4px);
  border-color: var(--border-hi);
  box-shadow: var(--elev-2);
}
.surface--accent  { border-color: var(--border-mint); }
.surface--glass   { background: var(--bg-glass); backdrop-filter: blur(16px); }
.surface--elev    { background: var(--bg-elev); }
.surface--padless { padding: 0; }
```

Then each existing card class extends `.surface --lift` instead of redefining padding / border / shadow inline. Goal: collapse the **14 card classes** to one base + 14 thin variants for content layout only.

### 2.4 Component primitive: `.btn`

```css
.btn {
  --btn-bg:   var(--bg-elev);
  --btn-fg:   var(--txt-1);
  --btn-bd:   var(--border-hi);
  --btn-bg-h: var(--bg-card);
  --btn-fg-h: var(--accent);

  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font: 600 14px/1.2 var(--font-body);
  letter-spacing: .01em;
  background: var(--btn-bg);
  color:      var(--btn-fg);
  border: 1.5px solid var(--btn-bd);
  border-radius: var(--r4);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background   var(--t-fast) var(--ease-out),
    color        var(--t-fast) var(--ease-out),
    border-color var(--t-fast) var(--ease-out),
    transform    var(--t-fast) var(--ease-snap);
}
.btn:hover  { background: var(--btn-bg-h); color: var(--btn-fg-h); border-color: var(--btn-fg-h); }
.btn:active { transform: scale(.97); }
.btn:focus-visible { outline: 2px solid var(--ring); outline-offset: 3px; }

.btn--primary { --btn-bg: var(--mint); --btn-fg: var(--navy); --btn-bd: var(--mint); --btn-bg-h: var(--mint-soft); --btn-fg-h: var(--navy); }
.btn--wa      { --btn-bg: #25d366;     --btn-fg: #052e16;    --btn-bd: #25d366;    --btn-bg-h: #20bf5b;       --btn-fg-h: #052e16; }
.btn--ghost   { --btn-bg: transparent; }
.btn--lg      { padding: 14px 24px; font-size: 15px; }
.btn--sm      { padding: 6px 12px;  font-size: 12px; }
```

Single primitive replaces ~9 hand-rolled button styles.

---

## 3 · The cleanup, sequenced

Each phase is **a self-contained agent task**. Run sequentially, validate visually after each phase, commit between.

### Phase A — Token consolidation (1 commit)
1. Locate every `:root { ... }` block in `styles.css` (4 of them: lines 56, 3253, 3666, 9185). Merge them into a single canonical `:root` at the top of the file using the §2.2 spec.
2. Move the `[data-theme="light"]` override to a single block beneath it.
3. Delete the now-orphaned override blocks.
4. Spacing migration: replace `--s4` / `--s5` / `--s7` / `--s8` references with the new geometric values where they look broken.
5. Verify: every page renders identically before/after on a 1920×1080 screenshot diff.

### Phase B — Motion library (1 commit)
1. Create the `--t-fast`/`--t-base`/`--t-slow` + `--ease-out`/`--ease-spring`/`--ease-snap` tokens (already in §2.2).
2. Project-wide find-and-replace:
   - `cubic-bezier(.34, 1.4, .64, 1)` → `var(--ease-spring)` (and audit each — they often pair with translateY values that should be smaller now).
   - `cubic-bezier(.23, 1, .32, 1)` → `var(--ease-spring)`.
   - `cubic-bezier(.5, 1.5, .5, 1)`, `cubic-bezier(.22, .68, 0, 1.02)` → `var(--ease-spring)`.
   - `cubic-bezier(.4, 0, .2, 1)` → `var(--ease-snap)`.
   - All `200ms ease-out` (the legacy `--t-fast`) → `var(--t-fast)`.
3. Audit every `transition:` declaration. If duration/easing aren't tokens, fix them.

### Phase C — Ambient cull (1 commit)
**Remove these `@keyframes` and the rules that consume them:**
- `twinkle`, `glow-pulse`, `drift-slow` (hero star field — visual noise)
- `drift-up` (homepage atmospheric)
- `sun-pulse`, `wave-shimmer`, `tropical-haze`, `bubbles-rise` (per-region body backgrounds — keep the SVG patterns, kill the animation)
- `tilt-bob` (related-card icon wiggle)
- `plane-arc` — KEEP only if user explicitly wants the paper-plane gimmick; otherwise remove
- `photo-fade`, `ken-burns` — KEEP only on home hero photo collage at low opacity, kill elsewhere

**Keep these (they signal information):**
- `card-pulse` on `.branch-card--hq` — single "you are here" anchor
- `fab-pulse` on the WhatsApp FAB — first-time hint, removed after dismissal
- `amap-pulse` / `tmap-pulse` on the active map pin — affordance cue
- `acc-slide` — accordion open transition
- `counter-punch` — stat counter landing

After this phase, the home page should have **at most 2 elements moving while idle**.

### Phase D — Component pass (multiple commits, one per component family)
Migrate each component family to the new primitives. Order:

1. **Buttons** → all CTAs use `.btn` + variants. Delete custom button styles in `.calc-cta`, `.tier-tab`, etc.
2. **Cards** → all card classes extend `.surface --lift`. Delete the duplicated padding/border/shadow rules.
3. **Pills/Chips** → consolidate `.dep-badge`, `.amenity-pill`, `.phase-marker`, `.tip-pill`, `.trip-tag`, `.branch-flag`, `.staff-phones__lead`, `.section-head__eyebrow` into one `.pill` primitive with size + tint variants.
4. **Inputs** → all form fields use one base class with the focus-ring system from `.bform-field input:focus`.
5. **Section heads** → already mostly consolidated via `.section-head`; verify every page uses it.

Acceptance criteria per component: zero `!important`, zero ad-hoc `cubic-bezier`, fits the `lift / reveal / tap / highlight` vocabulary.

### Phase E — Hero Overhaul (new — multiple commits, one per archetype)

> The user-flagged primary debt. Two hero archetypes share one design doctrine, applied uniformly to all 6 pages.

**Doctrine:** Cinema = one element commands the eye at a time. Everything else holds breath. The four hero loops (paper plane + twinkles + glow + drift) are KEPT but choreographed so only one is the focal verb at any moment; the others run at reduced opacity / longer duration / paused when not focal.

#### E.1 — Homepage hero ("Brand Theater")

**Current** (`site/index.html` lines 234–340ish): 6 visual layers stacked — `.home-hero__photos` (5-photo collage all visible) + `.home-hero__bg` + `.home-hero__noise` + `.home-hero__faded` ("TRAVEL" watermark) + `.home-hero__content` + `.home-hero__globe`.

**Action**:
- **DELETE** `.home-hero__noise` — film-grain overlay that competes with photo grain. *(User-confirmed kill.)*
- **DELETE** `.home-hero__faded` — giant "TRAVEL" watermark behind everything. *(User-confirmed kill.)*
- **KEEP** the 5-photo collage but **cross-fade ONE at a time** every 8s (GPU `opacity` keyframes, not all 5 visible simultaneously). Use a CSS-only fader; no JS.
- **KEEP** the globe widget BUT simplify to a single slow rotation (~30s loop), kill `globe-aura` and `globe-hint-bob` if present.
- **KEEP** the paper plane — it's the mascot, it earned the stage.
- **KEEP** twinkles + glow + drift, BUT reduce each to ≤ 30% opacity and stagger their cycles so they never peak simultaneously (manual phase-offset in CSS animation-delay).

**Markup result**: 3 layers max — photos · gradient overlay · content (with paper plane + globe inside content layer).

#### E.2 — Trip-page hero ("Destination Reveal")

**Current** (`site/{trip}/index.html` + `assets/js/scroll-hero.js`): scroll-pinned bg/fg parallax — solid cinematic infrastructure already in place. Chrome below the title is over-stacked: `eyebrow → meta-row → h1 → lede → price → fineprint → 2× CTAs`.

**Action**:
- **KEEP** `scroll-hero.js` parallax — this is the cinematic spine, don't touch.
- **KEEP** region eyebrow + h1 + price chip + ONE primary CTA + ONE ghost CTA.
- **MOVE** `.hero-fineprint` out of the hero into the first content section (it's tax/availability copy, doesn't belong above the fold).
- **FOLD** the meta-row (dates · duration · departure airport) **into the eyebrow as a single line** — `ÉGYPTE · 5 JOURS · DÉPART ALGER`.
- **DELETE** any duplicated CTA that appears both in hero AND in the sticky inquiry bar (the sticky bar takes over once you scroll, so the hero doesn't need to repeat it).

**Markup result**: eyebrow (one line) · h1 · price chip · 2 CTAs. Five elements, single hierarchy.

#### E.3 — Shared hero rules (apply to both archetypes)

- **Type rhythm locked**: `eyebrow 11px/0.14em uppercase · h1 clamp(40px, 6vw, 88px) · lede clamp(15px, 1.1vw, 18px) · price chip 13px`.
- **Entrance choreography**: `0ms eyebrow · 120ms h1 · 280ms lede · 480ms CTAs · 720ms ambient motion starts`. Uses CSS `transition-delay` cascade.
- **CLS = 0** on hero photo container via `aspect-ratio: 16 / 9` (desktop) / `4 / 5` (mobile) reservation.
- **LCP < 1.8s** on 4G — hero LCP image uses `loading="eager" fetchpriority="high"`; all other hero photos lazy.
- **IntersectionObserver gates every ambient loop** — when hero scrolls out of viewport, paper plane / twinkles / globe rotation all pause via `.is-paused` class that flips `animation-play-state`.
- **GPU-only animations** — `transform` and `opacity` only. Any existing `@keyframes` using `filter`, `box-shadow`, or `background-position` gets rewritten or dropped.
- **`prefers-reduced-motion`** = static final state, no transitions, no infinite loops.
- **One ambient motion focal at a time** — implement via CSS animation phasing: paper plane gets full opacity, twinkles get 25%, glow gets 15%, drift gets 10%. Adjust phase-offsets so peaks don't overlap.

**Acceptance for Phase E** (verified per-page):
- ✅ Hero contains ≤ 3 visual layers above the gradient overlay
- ✅ Above-the-fold has ≤ 5 demanding elements (eyebrow, h1, lede/price, primary CTA, ghost CTA)
- ✅ `getComputedStyle(hero).contains('animation')` returns at most 1 animation with `opacity > 0.5`
- ✅ Lighthouse Performance ≥ 90 on each page
- ✅ CLS on hero photo container = 0
- ✅ Zero animated `filter` / `box-shadow` / layout properties
- ✅ Visual diff confirms eyebrow → title → CTA hierarchy is the same on all 6 pages

### Phase F — JS consolidation (was Phase E)
1. Single scroll coordinator consolidated into `site/assets/js/enhance-pro.js` (the original plan named a new `motion.js` file, but execution consolidated in place — `enhance-pro.js` already owned the scroll listener so the merge happened there). Pattern:
   ```js
   const scrollObservers = new Set();
   let ticking = false;
   const onScroll = () => {
     if (ticking) return;
     ticking = true;
     requestAnimationFrame(() => {
       const y = window.scrollY;
       scrollObservers.forEach(fn => fn(y));
       ticking = false;
     });
   };
   window.addEventListener('scroll', onScroll, { passive: true });
   export const onScrollY = (fn) => scrollObservers.add(fn);
   ```
2. Single reveal observer using `[data-fx]` only. Delete the `.reveal` / `.visible` system and migrate any HTML using `.reveal` to `data-fx="up"`.
3. Single stagger token: `--d` (child index). Delete the redundant `--i`.
4. Move trust-strip and sticky-bar injection to ON-DEMAND modules so they don't ship on the homepage.
5. **Single IntersectionObserver** for all "pause-when-off-screen" decoration. Pattern:
   ```js
   const pauseObserver = new IntersectionObserver(entries => {
     entries.forEach(e => e.target.classList.toggle('is-paused', !e.isIntersecting));
   }, { rootMargin: '50px' });
   document.querySelectorAll('[data-pause-off-screen]').forEach(el => pauseObserver.observe(el));
   ```
   Then CSS: `.is-paused { animation-play-state: paused !important; }`. This is the performance hammer.

Result (as shipped): scroll coordinator + IntersectionObservers + magnetic buttons + FAB + sticky bar + hero choreography all consolidated into `enhance-pro.js` (~663 lines). `enhance.js` (~382 lines) retained for reveals + counters + share + toasts. No new `motion.js` file was created; consolidation happened in place.

### Phase G — Section choreography (was Phase F)
Define a **single entrance rhythm** at the section level. When a `<section>` enters viewport:
1. **0ms** — section background fades in (if `data-elev`)
2. **80ms** — `.section-head__eyebrow` reveals
3. **160ms** — `.section-head__title` reveals
4. **240ms** — `.section-head__sub` reveals
5. **320ms** — first row of body content (cards / form / etc.) reveals with stagger (60ms × child index)

Implementation: drive via CSS variables on the section. The IntersectionObserver only sets `.is-in` on the section root; child timings come from `transition-delay: calc(var(--d, 0) * 60ms + 320ms)`.

### Phase H — Obsolete v-block sweep (was Phase G)
Delete these blocks from `styles.css` (verified obsolete during this audit):
- v18 neo-brutalist hotel cards (line 8358ish) — superseded by current hotel-card design
- v15 info-block second pass (line 7880) — ensure not still referenced
- The duplicated `.trip-card__art` / `.trip-card__flag` / `.trip-card__from` blocks at lines 2971, 3015, 3075, 3599 (compress to one)
- Any `:root[data-theme="light"]` block redundant with the canonical light override
- Two `.trip-card__hero::after` declarations — keep only the v20 one

Target after Phase H: **`styles.css` ≤ 6 500 lines, ≤ 50 `!important`.**

### Phase I — SEO modernization (new)

> Directly serves the user's north star: *"modern SEO end-to-end + a sitemap that doesn't bother the user."*

**I.1 — Meta + Open Graph audit**
- Every page has unique `<title>` (50-60 chars), `<meta name="description">` (140-160 chars), `<link rel="canonical">`.
- Open Graph tags per page (not site-wide defaults): `og:title`, `og:description`, `og:image` (per-trip 1200×630 image), `og:url`, `og:type` (`website` on `/`, `article` on trip pages), `og:locale="fr_DZ"`.
- Twitter Card tags: `twitter:card="summary_large_image"`, `twitter:image` per page.

**I.2 — JSON-LD structured data**
- Homepage: keep `TravelAgency` (already there) + add `BreadcrumbList`, `WebSite` with `SearchAction`.
- Trip pages: add `TouristTrip` (or `Product` with `Offer`) + `AggregateRating` (if testimonials present) + `FAQPage` + `BreadcrumbList`.
- Validate every page with [Schema Markup Validator](https://validator.schema.org/) — must return zero errors.

**I.3 — Sitemap & robots**
- Generate `site/sitemap.xml` with proper `lastmod` + `changefreq` + `priority`. Include image entries for hero photos.
- `site/robots.txt` with `Sitemap:` line and `Disallow:` for `/assets/` only if needed.
- Submit to Google Search Console once deployed (manual step — note in deploy doc).

**I.4 — Semantic HTML pass**
- Single `<h1>` per page. Trip pages currently have correct h1 → h2 → h3 hierarchy; homepage has 2 h1s (verify & fix).
- Wrap main content in `<main>`, nav in `<nav>`, hero in `<header>` or `<section role="banner">`, secondary content in `<aside>`.
- Every interactive `<div onclick=…>` → proper `<button>` or `<a>`.

**I.5 — Image hygiene**
- Every `<img>` has descriptive French `alt` text. Decorative images get `alt=""` + `aria-hidden="true"`.
- Hero LCP images verified `loading="eager" fetchpriority="high"`; rest lazy.
- AVIF added alongside WebP fallback in `<picture>` sources (better compression than WebP).

**I.6 — Internal linking**
- Each trip page links to 2-3 sibling trips contextually (in a "Vous aimeriez aussi" rail, not just the footer).
- Footer carries the full trip list with proper anchor text.

**I.7 — Core Web Vitals lock**
- LCP < 2.5s (target 1.8s) — hero photo is the LCP element.
- INP < 200ms — single scroll coordinator from Phase F helps.
- CLS = 0 — `aspect-ratio` reservation on every photo + map container.

**Acceptance for Phase I**:
- ✅ Lighthouse SEO ≥ 95 on every page (currently varies 78-92)
- ✅ Schema validator passes on every page
- ✅ `sitemap.xml` returns valid XML with all 6 pages + lastmod dates
- ✅ Every `<img>` has alt or `aria-hidden`
- ✅ Open Graph debugger renders the right preview on Facebook + Twitter
- ✅ Each page has exactly one `<h1>`

### Phase J — Code hygiene (new)

> Directly serves the user's north star: *"clean readable code, consistent naming, clear architecture."*

**J.1 — BEM consistency pass**
- Every class follows `block__element--modifier`. Audit & rename strays (e.g. `phone-card-btn--wa` → `phone-card__btn--wa`).
- No tag-name selectors outside `:root` and `body` resets.
- No `> *` or `> div` selectors in component CSS — use proper class names.

**J.2 — Dead code elimination**
- Run a project-wide audit: for each CSS class in `styles.css`, grep HTML + JS for usage. Delete unused classes.
- Same for keyframes: any `@keyframes` not referenced by `animation:` gets deleted.
- Same for CSS variables: any `--foo` not used outside its declaration gets deleted.

**J.3 — File organization**
- Split `styles.css` into 4 imported files via CSS `@import` (or build-step concat — no JS build, so probably `@import`):
  - `tokens.css` — `:root` + `[data-theme=light]` only
  - `base.css` — body/h1-h6 resets, scrollbar, focus-ring, selection, prefers-reduced-motion
  - `components.css` — `.surface` + `.btn` + `.pill` + all component-specific styles
  - `utilities.css` — `data-elev`, `data-fx`, helpers
- Move `_v19_*.py` migration scripts from repo root to `scripts/`.
- Consolidate `IMAGE-FETCH-REPORT.md` + `IMAGE-ASSETS.md` + `COLOR-MAP.md` + `SITEMAP.md` into `docs/`.

**J.4 — Comment hygiene**
- Every CSS block has a 1-line header explaining what + why.
- Delete orphaned "v18 — REMOVED?" / "todo: check this" / "@@CLAUDE@@" comments.
- README at top of `styles.css` explains the architecture in ≤ 20 lines.

**J.5 — Naming pass**
- Delete the `--bronze` shim, rename all references to `--mint`.
- `hero__faded`, `home-hero__noise` already deleted in Phase E (good).
- Rename any class that confuses (e.g. `.phase-marker` → `.timeline__phase` if it's a timeline element).

**J.6 — JS module boundaries**
- `enhance-pro.js` — scroll coordinator, magnetic buttons, FAB, sticky bar, hero choreography. (Consolidated in Phase F — the plan called for a new `motion.js`, but the merge happened in place into `enhance-pro.js`.)
- `enhance.js` — reveal observer, counters, share, toasts. (Kept separate; clear single-responsibility.)
- `maps.js` — combine `algeria-map.js` + `trip-map.js` *if* sharing the de-clutter engine is worth the merge; otherwise leave separate.
- `booking-form.js`, `calculator.js`, `scroll-hero.js`, `globe.js` — keep separate (clear single-responsibility boundaries).

**Acceptance for Phase J**:
- ✅ `styles.css` split into 4 files, total ≤ 6 500 lines
- ✅ `grep -c "!important" *.css` returns ≤ 50 total
- ✅ Zero unused CSS classes (verified by automated audit)
- ✅ Zero unused `@keyframes`
- ✅ All migration scripts moved to `scripts/`
- ✅ Single README block at top of `tokens.css` explains the architecture
- ✅ `--bronze` shim deleted, no references remain

---

## 4 · Acceptance gate (run before declaring done)

### Architecture
| Check | Method |
|---|---|
| One `:root` block | `grep -c "^:root {" styles.css` returns `1` |
| One light-mode override | `grep -c "^:root\[data-theme" styles.css` returns `1` |
| ≤ 4 cubic-bezier curves (3 base + 1 bounce) | `grep -oE "cubic-bezier\([^)]+\)" styles.css \| sort -u \| wc -l` ≤ 4 |
| ≤ 50 `!important` | `grep -c "!important" styles.css` |
| ≤ 10 `@keyframes` *(survey kept many ambient loops, so this lifts to ≤ 14 — see Phase E choreography)* | `grep -c "@keyframes" styles.css` ≤ 14 |
| Single scroll listener | `grep -E "addEventListener\('scroll'" site/assets/js/*.js \| wc -l` returns `1` (excluding map JS which manages its own) |
| Single pause-observer for off-screen decoration | Verified in `enhance-pro.js` |
| No inline `<style>` overrides for components | `grep -A 200 "<style>" site/index.html` carries only utility helpers |

### Motion fidelity
| Check | Method |
|---|---|
| Hero has ≤ 3 visual layers above gradient | Manual inspect each page |
| Above-the-fold has ≤ 5 demanding elements | Manual inspect each page |
| Only one ambient loop is focal (opacity > 50%) per viewport | `getComputedStyle` audit during scroll |
| Reduced-motion mode | `prefers-reduced-motion: reduce` → every animation snaps, no infinite loops |
| Visual diff | Screenshot every section on every page at 1920×1080 + 375×667. Compare before/after. Layout identical; motion should feel calmer + more deliberate |

### Performance Contract (per the survey lock)
| Check | Method |
|---|---|
| Lighthouse Performance ≥ 90 | Homepage |
| Lighthouse Performance ≥ 92 | Each trip page |
| LCP < 1.8s on 4G | WebPageTest with Mobile 4G profile |
| CLS = 0 on hero photos | DevTools Performance panel layout-shift events |
| INP < 200ms | DevTools or RUM |
| Zero animated `filter` / `box-shadow` / layout properties | `grep -E "transition:.*filter\|transition:.*box-shadow\|transition:.*width\|transition:.*height" styles.css` returns nothing decorative |
| Single rAF loop per scroll event | DevTools Performance panel inspection |

### SEO (Phase I)
| Check | Method |
|---|---|
| Lighthouse SEO ≥ 95 | Each page |
| Single `<h1>` per page | `grep -c "<h1" page.html` returns `1` |
| Schema markup validates | <https://validator.schema.org/> returns zero errors |
| `sitemap.xml` present & valid | `xmllint --noout site/sitemap.xml` |
| Open Graph preview correct | Facebook Sharing Debugger + Twitter Card Validator |
| Every `<img>` has alt or aria-hidden | Automated audit |

### Zero console errors
- Verified for each of the 6 pages.

---

## 5 · The TL;DR prompt to paste into a future agent

> Read `docs/MOTION-CLEANUP-MASTER.md` end-to-end, especially §0a (the survey contract). Then execute **Phase A** (token consolidation). Stop after Phase A and show me a screenshot diff of the homepage agences section + the contact section before declaring done. Do not skip phases. The full phase order is **A → B → C → D → E (hero) → F → G → H → I (SEO) → J (code hygiene)**.
>
> **The four allowed motion patterns are Lift / Reveal / Tap / Highlight**, with three durations (`--t-fast: 180ms` / `--t-base: 320ms` / `--t-slow: 560ms` / `--t-cinema: 900ms`) and four easings (`--ease-out` / `--ease-spring` / `--ease-snap` / `--ease-bounce` — last one reserved for delight moments only).
>
> **The Performance Contract in §0a is non-negotiable**: GPU properties only, IntersectionObserver-gated decoration, single rAF scroll coordinator, prefers-reduced-motion respected, Lighthouse Performance ≥ 90.
>
> The cinematic doctrine: *one ambient motion is focal at a time; the rest hold breath*. When you find a viewport with 4 things moving at peak opacity simultaneously, fix it by phase-offsetting their cycles so only one peaks at a time.
>
> When you find an existing component using a different curve or duration, normalize it — that's the point of the work. Use `mcp__Claude_Preview__preview_*` tools for visual verification, not just bounding-box maths. Commit between phases on the existing `feat/v12-hierarchy-pass` branch. After each commit, append a one-line entry to `docs/ROADMAP.md` under the v21 phase header.

---

## 6 · What we are NOT touching (out of scope)

- The brand colours themselves (mint + navy + warm cream are signed-off).
- The DM Sans typography choice.
- The 3-agency network structure on the homepage (just shipped — keep).
- The trip-card v20 layout (just shipped — keep, but tokenize its motion).
- The MapLibre GL maps' interaction model (zoom-to-stack, popups, recenter).
- Per-region accent colours on trip pages.
- The 6-staff-phone grid in the contact section (just shipped — keep).
- The Algerian dial-code conventions / WhatsApp deep links / payment copy.

---

## 7 · Open questions — RESOLVED via survey (2026-05-07)

All previously-open design calls were resolved in the survey. Locked answers in §0a. Quick recap of the five originally-open questions:

| # | Question | Resolution |
|---|---|---|
| 1 | Paper plane gimmick on home hero | **KEEP** — earned its place as brand mascot; gets opacity priority over other ambient loops |
| 2 | Per-region atmospheric body backgrounds | **KEEP animating, gated by IntersectionObserver** — full atmosphere on screen, zero CPU off-screen |
| 3 | Scroll-progress bar at top of viewport | **KEEP** — fits the cinematic brief |
| 4 | Magnetic buttons (cursor pulls CTA) | **KEEP**, desktop only, full strength |
| 5 | Trip-page sticky inquiry bar | **KEEP, replaces top nav** when scrolled past hero (single sticky chrome row, not three) |

### Decisions delegated to the cleanup agent
- Phase placement of hero overhaul → **Option X (dedicated Phase E)** — hero overhaul gets its own phase after tokens + motion library + ambient cull + component primitives land.
- Homepage hero kills → **`.home-hero__noise` and `.home-hero__faded` both deleted** in Phase E.1.

---

## 8 · Files this cleanup will touch

For agent reference. Touch order matches phase order.

### Phase A (tokens)
- `site/assets/css/styles.css` — merge 4 `:root` blocks into 1 canonical
- `site/index.html` (head) — remove obsolete inline `<style>` token redefinitions

### Phase B (motion library)
- `site/assets/css/styles.css` — project-wide find-replace on cubic-beziers + durations

### Phase C (ambient cull + choreography)
- `site/assets/css/styles.css` — delete keyframes for unwanted ambient; add phase-offset to surviving loops
- `site/assets/js/enhance-pro.js` — IntersectionObserver gating

### Phase D (component primitives)
- `site/assets/css/styles.css` — `.surface` + `.btn` + `.pill` definitions; migrate existing components

### Phase E (hero overhaul)
- `site/index.html` — homepage hero markup simplification
- `site/cairo-sharm/index.html` · `site/sharm-constantine/index.html` · `site/istanbul/index.html` · `site/azerbaidjan/index.html` · `site/kuala-lumpur/index.html` — trip hero markup simplification
- `site/assets/css/styles.css` — `.home-hero` + `.hero` rewrite

### Phase F (JS consolidation)
- `site/assets/js/enhance.js` + `enhance-pro.js` — scroll/observer logic consolidated into `enhance-pro.js`; `enhance.js` retained for reveal + counter + share + toast. No new `motion.js` file created (plan called for one; execution chose in-place merge).

### Phase G (section choreography)
- `site/assets/css/styles.css` — section-level reveal cascade

### Phase H (v-block sweep)
- `site/assets/css/styles.css` — deletions only

### Phase I (SEO)
- All 6 HTML files — meta + OG + JSON-LD updates
- `site/sitemap.xml` — new file
- `site/robots.txt` — new file

### Phase J (code hygiene)
- `site/assets/css/styles.css` → split into `tokens.css` + `base.css` + `components.css` + `utilities.css`
- `_v19_*.py`, `_inject_*.py`, `_hotels_*.py`, `_assets_*.py`, `_design_migrate.py`, `_migrate_v2.py`, `_reorganize_pages.py`, `_enrich.py`, `_v*_styles.css` → move to `scripts/`
- `docs/` — consolidate IMAGE-* + COLOR-MAP + SITEMAP (the markdown one, not the SEO XML one)

---

*This document is the contract. If a future agent (or future me) deviates from §0a, §2.1, or §2.2 without amending this doc first, the cleanup has failed.*
