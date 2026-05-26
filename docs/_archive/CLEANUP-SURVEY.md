# ALLIANCE TRAVEL — Cleanup Survey
## Decisions needed before Phase A starts

> Fill in the boxes with `[x]`, leave the others as `[ ]`. Add notes in the **Notes** lines where you want to override or explain. This is the input that drives `docs/MOTION-CLEANUP-MASTER.md` execution.
>
> ⏱  Estimated time to complete: **8–12 minutes**.
> ✏️  How to fill: edit this file in any markdown editor (Obsidian, VS Code) and pick one option per question unless it says "select all that apply".

---

## Section 1 — Overall motion intensity

### Q1.1 — How much motion do you want?

The site currently has 26 keyframes and 6 elements moving while idle on the home page. Pick the target intensity:

- [ ] **(A) Restrained** — Framer / Linear style. Things move only on direct interaction (hover, scroll-into-view). Zero ambient loops except the WhatsApp FAB hint and the HQ "you are here" pulse. *Recommended for editorial / luxury feel.*
- [ ] **(B) Lively** — Keep some subtle ambient motion (1–2 elements drifting slowly), but cut the rest. Middle ground.
- [ ] **(C) Cinematic** — Keep most of the current ambient cast (paper plane, twinkles, region patterns animating), just synchronize timing and easing.

**Notes:**

---

### Q1.2 — Hover lift distance on cards

Currently varies between `-4px`, `-5px`, `-6px` across components. Pick one to standardize:

- [ ] **(A) `-2px`** — barely there, very restrained
- [ ] **(B) `-4px`** — the current v20 target, subtle but felt ← *my recommendation*
- [ ] **(C) `-6px`** — pronounced lift, more "tactile"

**Notes:**

---

### Q1.3 — Image scale on card hover

Currently varies `1.04` / `1.05` / `1.08`. Pick one:

- [ ] **(A) `1.03`** — almost imperceptible zoom
- [ ] **(B) `1.05`** — gentle ← *my recommendation*
- [ ] **(C) `1.08`** — noticeable Ken-Burns-style push

**Notes:**

---

## Section 2 — Specific ambient animations (one decision per row)

For each item, choose: **KEEP** (leave running), **STATIC** (keep the visual element but kill the loop), or **REMOVE** (delete entirely).

### Q2.1 — Home hero paper plane drift

A 14s infinite animation flies a paper plane diagonally across the hero. Lives in `@keyframes plane-arc`.

- [ ] KEEP — it's our mascot, never tire of it
- [ ] STATIC — keep the icon parked at one corner
- [ ] REMOVE — too cute, delete

**Notes:**

---

### Q2.2 — Hero twinkle / star field

`@keyframes twinkle`, `@keyframes glow-pulse`, `@keyframes drift-slow` — three decorative loops on the hero background.

- [ ] KEEP all three
- [ ] STATIC — keep the dots, kill the motion
- [ ] REMOVE — clean hero, no stars

**Notes:**

---

### Q2.3 — Per-region atmospheric body backgrounds (trip pages)

Each trip page has its own body-level pattern that animates subtly:
- Egypt: sand chevrons drifting (`@keyframes drift-up`, `sun-pulse`)
- Azerbaijan: Caspian flame shimmer
- Istanbul: Ottoman stars twinkling
- Malaysia: tropical-haze
- Sharm: coral wave-shimmer + bubbles-rise

- [ ] KEEP all (current state)
- [ ] STATIC — keep the SVG patterns, kill the animations *(recommended)*
- [ ] REMOVE — solid backgrounds, no patterns

**Notes:**

---

### Q2.4 — Card-pulse animation on HQ branch card

A 2.6s breathing border on the "Siège · BBA La Graf" card to signal "you are here".

- [ ] KEEP ← *my recommendation* (it's informational, not decorative)
- [ ] REMOVE

**Notes:**

---

### Q2.5 — Map pin pulses (Algeria map + trip maps)

`amap-pulse`, `tmap-pulse` — affordance cues on active map markers.

- [ ] KEEP ← *my recommendation* (affordance, not decoration)
- [ ] REMOVE

**Notes:**

---

### Q2.6 — WhatsApp FAB pulse

A 2.6s glow on the floating action button, first time it appears.

- [ ] KEEP, dismiss after first 5 seconds *(current behavior — recommended)*
- [ ] KEEP, never dismiss (always-on hint)
- [ ] REMOVE — static button only

**Notes:**

---

### Q2.7 — Stat counter punch animation

When "1 200 voyageurs" / "98 % satisfaction" / etc counters land their final value, they currently do a tiny scale punch.

- [ ] KEEP ← *my recommendation* (delight moment when number is meaningful)
- [ ] REMOVE — counters just appear

**Notes:**

---

## Section 3 — Sticky chrome (elements that hang on the screen)

Trip pages currently can have: top nav + scroll-progress bar + WhatsApp FAB + sticky inquiry bar. That's four pieces of sticky chrome.

### Q3.1 — Scroll-progress bar at top of viewport

A thin mint line that fills as you scroll the page.

- [ ] KEEP — readers like it
- [ ] REMOVE ← *my recommendation* (luxury sites usually drop this)

**Notes:**

---

### Q3.2 — Floating WhatsApp FAB (bottom-right)

Appears after scrolling past the hero on every page.

- [ ] KEEP, all pages *(current)*
- [ ] KEEP, but only on trip detail pages (drop on homepage)
- [ ] REMOVE — rely on the nav-CTA only

**Notes:**

---

### Q3.3 — Sticky inquiry bar (trip pages only)

A bar that slides in from the top after the hero, showing trip name + price + "Demander un devis" button.

- [ ] KEEP, as-is
- [ ] KEEP, but **replace the top nav** with this when scrolled past hero (single sticky chrome row instead of stacking) ← *my recommendation*
- [ ] REMOVE — rely on the WhatsApp FAB only

**Notes:**

---

### Q3.4 — Magnetic buttons (cursor pulls primary CTA toward it on desktop)

`.btn--primary`, `.nav-cta`, `.calc-cta` lean ~8px toward the cursor on mousemove.

- [ ] KEEP, desktop only (current behavior) ← *my recommendation*
- [ ] KEEP, but lower strength (4px instead of 8px)
- [ ] REMOVE — too gimmicky

**Notes:**

---

## Section 4 — Visual tokens

### Q4.1 — Spacing scale duplicate fix

Currently `--s4 = --s5 = 24px` and `--s7 = --s8 = 40px`. The cleanup proposal makes it geometric:

```
NEW: s1=4 · s2=8 · s3=12 · s4=16 · s5=24 · s6=32 · s7=48 · s8=64 · s9=96 · s10=128
OLD: s1=4 · s2=9 · s3=16 · s4=24 · s5=24 · s6=32 · s7=40 · s8=40 · s9=56 · s10=72
```

Migrating means existing components using `--s4` (currently 24px) become `16px`. Could cause visual breaks needing manual fixes.

- [ ] (A) Apply the geometric scale, fix visual breaks as they appear ← *my recommendation*
- [ ] (B) Keep the duplicates, just add new tokens `--s4b` etc for new geometry
- [ ] (C) Don't touch spacing this pass — Phase 2 problem

**Notes:**

---

### Q4.2 — Easing curves

Currently 11 different `cubic-bezier()` values in use. The proposal collapses to 3:

```
--ease-out:    cubic-bezier(.22, 1, .36, 1)    // out-quart, default
--ease-spring: cubic-bezier(.22, 1, .36, 1)    // same curve, semantic alias for "content arriving"
--ease-snap:   cubic-bezier(.4,  0, .2, 1)     // Material standard, for taps
```

**No overshoot springs** (`(.34, 1.4, .64, 1)` and `(.5, 1.5, .5, 1)` get deleted because they make UI feel toy-like).

- [ ] (A) Apply the 3-curve system, no overshoot springs ← *my recommendation*
- [ ] (B) Keep one overshoot spring for "delight" moments (toast appear, card-pulse) — name it `--ease-bounce`
- [ ] (C) Want more curves than 3 — specify which in Notes

**Notes:**

---

### Q4.3 — Duration tokens

Three durations: `--t-fast: 180ms` (micro) · `--t-base: 320ms` (component) · `--t-slow: 560ms` (section).

- [ ] (A) Approve as-is
- [ ] (B) Want a fourth `--t-cinema: 900ms` for hero entrance + map fly-to
- [ ] (C) Pick different numbers — specify in Notes

**Notes:**

---

## Section 5 — Cleanup priority order

The master plan defines phases A → G. Pick the order you want them done in.

### Q5.1 — First commit after the survey lands

- [ ] Phase A — Token consolidation (single `:root`, fix spacing duplicates) ← *my recommendation*
- [ ] Phase B — Motion library (3 durations × 3 easings × 4 patterns)
- [ ] Phase C — Ambient animation cull (kill twinkle / drift / glow-pulse etc.)
- [ ] Phase D — Component primitives (`.surface`, `.btn`)

**Notes:**

---

### Q5.2 — Acceptable timeline

How aggressive should the cleanup be?

- [ ] (A) One phase per commit, validate visually between each ← *my recommendation*
- [ ] (B) Bundle A+B+C into one big commit, ship fast
- [ ] (C) Pause after each phase for me to review screenshots before continuing

**Notes:**

---

## Section 6 — Out-of-scope confirmation

These are areas the master plan says **NOT** to touch. Tick to confirm each is locked, or untick to add it back to the cleanup scope.

- [x] Brand colors (mint + navy + warm cream) — locked
- [x] DM Sans typography — locked
- [x] The 3-agency network structure (just shipped) — locked
- [x] Trip-card v20 layout (just shipped) — locked
- [x] MapLibre maps' interaction model — locked
- [x] Per-region accent colors on trip pages — locked
- [x] 6-staff-phone grid (just shipped) — locked
- [x] Algerian dial-code / WhatsApp deep links / payment copy — locked

**Anything I should ALSO touch that's not in scope?**

---

## Section 7 — Free-form

### Q7.1 — Sites you want this to look/feel like

Drop URLs or product names that capture the "elegant, not cluttered" vibe you're after:

1. 
2. 
3. 

---

### Q7.2 — Pages that bother you most right now

If you had to pick the worst-feeling pages today, which 1-3 would you fix first?

- [ ] Homepage
- [ ] cairo-sharm
- [ ] sharm-constantine
- [ ] istanbul
- [ ] azerbaidjan
- [ ] kuala-lumpur

**Why those:**

---

### Q7.3 — One sentence brief

Finish this sentence to give the cleanup a north star:

> "When this cleanup is done, the site should feel like _______________________________."

---

## How to submit

1. Save this file with your selections.
2. Reply in the chat with **"survey done"** (or paste the filled file back).
3. I'll consolidate your answers into the execution order at the top of `docs/MOTION-CLEANUP-MASTER.md` and start Phase A.

---

*Survey v1 · 2026-05-07 · References `docs/MOTION-CLEANUP-MASTER.md` (the full plan).*
