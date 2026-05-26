# CSS duplicate-selector audit · v22

Cascade catalog of every selector with three or more redefinitions in
`site/assets/css/styles.css`. For each duplicate, the **WINNING block**
is the last source-order definition that survives without being
overridden by higher-specificity rules (we have no inline-style
collisions so source order decides). Properties only listed per block
to make the "what each block actually controls" obvious; consolidation
is deferred to Phase 4 — this pass only documents.

Generated against commit `d98f4cf` after deliverables 1-3.

Legend:
- **Source**: file:line of the opening selector
- **Props**: comma-separated declared properties in that block
- **Winner**: marked with [WIN]; the block that survives the cascade
  for its declared properties (note: an earlier block can still win
  for a property the winner doesn't redeclare).

---

## `.site-nav` — 5 definitions

| #  | Source       | Props                                                                      | Winner per-prop |
| -- | ------------ | -------------------------------------------------------------------------- | --------------- |
| 1  | styles.css:478 | position, top, inset-inline, z-index, padding, display, align-items, …   | position/top/inset-inline (overridden #4) |
| 2  | styles.css:3285 | gap                                                                       | (overridden #3) |
| 3  | styles.css:3400 | display, grid-template-columns, align-items, padding, gap                 | (most props overridden by #4 !important) |
| 4  | styles.css:3612 | display !important, flex-* !important, position fixed, top:16px, left/right, height, padding, background, backdrop-filter, border, border-radius, box-shadow, z-index, gap, grid-template-columns/rows !important | [WIN] — most properties, since this is the floating-pill nav variant w/ !important |
| 5  | styles.css:4550 | z-index !important                                                        | [WIN] z-index (later same-specificity + !important) |

**Why duplicated**: nav design changed three times (v1 fixed bar →
v5 grid layout → v18 floating pill). Each rewrite added a new full
`.site-nav` block instead of editing the old one. Block #4 reuses
`!important` to override block #3's grid layout. Block #5 reinforces
z-index against legacy sibling rules.

**Phase 4 plan**: delete blocks #1-3, merge their unique props into #4,
delete block #5 once `--z-nav` is stable.

---

## `.trip-card` — 5 definitions

| #  | Source        | Props                                                          | Winner per-prop |
| -- | ------------- | -------------------------------------------------------------- | --------------- |
| 1  | styles.css:3017 | display:block, position, background, border, border-radius, padding, transition, overflow | (border/border-radius overridden #2) |
| 2  | styles.css:3297 | border-color, border-radius                                    | (overridden by #4) |
| 3  | styles.css:4722 | position:relative, isolation:isolate                           | (still wins; later #4/#5 don't redeclare position) |
| 4  | styles.css:5446 | display:grid, grid-template-columns, gap, background:transparent, border:none, padding:0, overflow:visible | [WIN] — overrides display, grid, border, etc. (this is the v6 card redesign) |
| 5  | styles.css:8805 | gap, padding (mobile-specific media query inside)              | [WIN] gap/padding when matched (likely conditional) |

**Why duplicated**: trip-card was rewritten from "block stack" (#1) to
"grid layout" (#4). Block #5 patches mobile.

**Phase 4 plan**: keep #4 as canonical, fold #1/#2/#5 into it,
delete #3 if isolation is preserved elsewhere.

---

## `.trip-card__from` — 4 definitions

| #  | Source        | Props                                       | Winner per-prop |
| -- | ------------- | ------------------------------------------- | --------------- |
| 1  | styles.css:3245 | position:absolute, top/right, background, padding, font-size, color, border-radius, z-index, backdrop-filter | (border-radius overridden #2) |
| 2  | styles.css:3300 | border-radius                                | (overridden #3 or #4) |
| 3  | styles.css:3790 | background, border, color, font-weight, padding (full redesign — pill shape) | (most props overridden by #4) |
| 4  | styles.css:8916 | background, color, border, padding, font-size, font-weight, border-radius, transform, transition | [WIN] — latest redesign |

**Phase 4 plan**: canonicalize #4, merge unique props from #1 (z-index, position) into it.

---

## `.hotel-card__ribbon` — 4 definitions

| #  | Source       | Props                                                              | Winner per-prop |
| -- | ------------ | ------------------------------------------------------------------ | --------------- |
| 1  | styles.css:969 | position, top, right, padding, font-size, font-weight, color, background, border-radius | (border-radius overridden #2) |
| 2  | styles.css:3305 | border-radius                                                      | (still wins for border-radius if #3/#4 don't set it) |
| 3  | styles.css:3799 | background, color, padding (luxe-ribbon redesign)                  | (background/color overridden #4) |
| 4  | styles.css:8501 | position, top:0, right:0, padding, background, color, font-weight, font-size, letter-spacing | [WIN] for redeclared props |

**Phase 4 plan**: keep #4, merge in unique props from #1 (border-radius), delete #2/#3.

---

## `.hotel-card` — 3 definitions

| #  | Source        | Props                                                  | Winner per-prop |
| -- | ------------- | ------------------------------------------------------ | --------------- |
| 1  | styles.css:936 | display, background, border, border-radius, overflow, transition | (border, border-radius overridden) |
| 2  | styles.css:3303 | border-radius, border-color                            | (overridden #3) |
| 3  | styles.css:8362 | display:grid, grid-template-columns, gap, padding, border, background, border-radius | [WIN] — full v6 redesign |

---

## `.hl-card` — 3 definitions

| #  | Source       | Props                                                       | Winner per-prop |
| -- | ------------ | ----------------------------------------------------------- | --------------- |
| 1  | styles.css:815 | display, background, border, border-radius, padding, transition, position | (some overridden #3) |
| 2  | styles.css:3349 | border-color, border-radius                                 | (overridden #3) |
| 3  | styles.css:9179 | background, border, padding, border-radius, font-size, etc. (full redesign) | [WIN] |

---

## `.related-card` — 3 definitions

| #  | Source        | Props                                                         | Winner per-prop |
| -- | ------------- | ------------------------------------------------------------- | --------------- |
| 1  | styles.css:2833 | display, background, border, border-radius, padding, transition | (border-* overridden #2) |
| 2  | styles.css:3344 | border-color, border-radius                                   | (overridden #3) |
| 3  | styles.css:7293 | display:grid, grid-template-columns, gap, background, border, padding, etc. | [WIN] |

---

## `.stat-card` — 3 definitions

| #  | Source        | Props                                                  | Winner per-prop |
| -- | ------------- | ------------------------------------------------------ | --------------- |
| 1  | styles.css:1666 | background, border, border-radius, padding, display, text-align | (some overridden) |
| 2  | styles.css:3348 | border-color                                            | (overridden #3) |
| 3  | styles.css:7189 | background, border, border-radius, padding, transition, etc. (refresh) | [WIN] |

---

## `.section-head__title` — 3 definitions

| #  | Source       | Props                                                       | Winner per-prop |
| -- | ------------ | ----------------------------------------------------------- | --------------- |
| 1  | styles.css:876 | font-size, line-height, font-weight, color                   | (font-size overridden #3) |
| 2  | styles.css:4742 | opacity, transform, transition (scroll-reveal animation)   | (animation wins for transition props) |
| 3  | styles.css:7174 | font-size:clamp(...), font-weight, line-height, letter-spacing, color, margin-bottom | [WIN] for redeclared props (latest v6 typography pass) |

---

## `.hero__bg` — 3 definitions

| #  | Source       | Props                                                  | Winner per-prop |
| -- | ------------ | ------------------------------------------------------ | --------------- |
| 1  | styles.css:671 | position:absolute, inset:0, z-index, opacity, background-image, background-position/size | (overridden #3 for some) |
| 2  | styles.css:4362 | will-change, transform, transition (parallax)         | [WIN] parallax props |
| 3  | styles.css:4573 | background-image, background-position, background-size (per-region overrides via attr) | [WIN] background-* for matching attrs |

---

## Summary

10 distinct selectors with 3+ definitions, totaling **39 redundant
declaration blocks** that future maintainers must mentally cascade in
their heads.

**Risk**: any greenfield rule that targets these selectors competes
against blocks scattered across 9000 lines. The compiled-cascade
behavior is correct but the source intent is opaque — and small
specificity changes (adding a parent class, removing `!important`)
can flip which definition "wins" in subtle ways.

**Phase 4 deliverable** (separate engagement): consolidate to a single
canonical block per selector + an optional "Per-Page Override" block
that only declares props that legitimately differ. Estimate: 4-6 hours
with thorough visual regression check at the 5 trip-page breakpoints.
