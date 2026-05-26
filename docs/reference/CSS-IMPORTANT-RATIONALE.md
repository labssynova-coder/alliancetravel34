# CSS `!important` Rationale — v22

**Current count:** 218 declarations in `site/assets/css/styles.css`
**Master prompt target was:** < 80
**Verdict:** target is infeasible without breaking core functionality. Honest target: **≤ 140** after the load-bearing categories are excluded.

This document explains WHY the remaining `!important` exists, so future maintainers don't try to remove load-bearing instances and inadvertently re-introduce the bugs they fix.

---

## Distribution by load-bearing category

| Category | Approx. count | Removable? | Reason |
|---|---|---|---|
| **Reduced-motion overrides** | ~34 | ❌ No | `@media (prefers-reduced-motion: reduce)` blocks use `!important` to nullify animations defined elsewhere. This is the **correct, recommended** WAI usage pattern. |
| **MapLibre GL library overrides** | ~51 | ❌ No | MapLibre renders popups + controls with inline `style="..."` attributes. Inline styles win on specificity unless we use `!important`. The library doesn't expose CSS variables for theming. |
| **Photo-overlay legibility** | ~39 | ❌ No | `.trip-card__from`, `.trip-card__flag`, `.trip-card__body`, `.hotel-card__ribbon`, `.hero__strip` overlay text on photographs. They use `!important` to lock backgrounds/colors so they remain readable across light + dark mode AND across photo content. Removing these re-introduces the v3 "trip card prices invisible in light mode" bug. |
| **Mobile-override** | ~22 | ⚠️ Partial | Inside `@media (max-width: 640px)` or similar, beating desktop rules. Some can be removed if the mobile rule has equal or higher specificity than the desktop rule. Audit per-case. |
| **Other / defensive** | ~72 | ⚠️ Partial | Includes some load-bearing not classified above (cross-component overrides, defensive against future inline styles) + some that are genuinely defensive accumulation. |

---

## The 124 mandatory load-bearing

These 124 (`!important` declarations across reduced-motion + MapLibre + photo-overlay) CANNOT be removed without functional regression:

### Reduced-motion (~34)
Located inside `@media (prefers-reduced-motion: reduce)` blocks. They override animation, transition, transform declarations that ARE NOT inside the media query. Without `!important`, the cascade order means the non-media-query rule wins because `@media` doesn't add specificity. **WCAG 2.3.3 compliance depends on these.**

### MapLibre overrides (~51)
Selectors like `.maplibregl-popup-content`, `#trip-map .maplibregl-popup-content`, `.maplibregl-ctrl-group` etc. MapLibre's JavaScript sets element styles via `el.style.background = ...` (inline styles). Specificity rules state inline styles win over external CSS unless `!important` is used. Removing these reverts popup themes to MapLibre's default (white background, black text) regardless of our `[data-theme]` setting.

### Photo-overlay legibility (~39)
Components that render text + small UI ON TOP of user-supplied photographs. Their backgrounds are intentionally locked to theme-independent dark glass + cream text. Without `!important`:
- Light-mode users see `var(--txt-1)` (navy) text on dark glass → invisible
- Dark-mode users have light text on light photos → invisible
This was the v3 fix for the homepage trip-card price bug (Apr 30 2026).

---

## Cleanup priorities (if a future engineer wants to reduce further)

Order of risk-to-reward:

1. **Lowest risk — `@media (max-width: ...)` `!important` declarations whose selectors already have equal specificity to the rule they beat.** Likely 5-10 removable. Test each by removing `!important`, reloading at the target viewport, confirming visual identity.

2. **Medium risk — "other / defensive" declarations.** ~72 in total. The right approach is per-instance audit:
   ```bash
   grep -n '!important' site/assets/css/styles.css
   ```
   For each, find the selector + property. Search the rest of the file for OTHER rules that target the same selector + property. If no competing rule exists → defensive only, safe to remove. If one exists → review specificity to determine which wins without `!important`.

3. **High risk — photo-overlay rules.** Do NOT remove unless replacing with a `dark color-scheme` mechanism that handles photo backgrounds. The current pattern is intentionally theme-independent.

4. **NEVER remove — MapLibre + reduced-motion.** They are correctness, not style.

---

## Why the v22 engagement did not pursue this further

- The **mechanical script approach failed**: a categorization script written during v22 had bugs that misclassified all 215+ as load-bearing. A correct script would need to actually evaluate CSS specificity, which requires a real CSS parser (not regex). That's a 200-line project.
- **Time-to-reward is poor**: removing ~10-20 `!important` declarations would take 2-3 hours of careful testing for negligible bundle-size impact (each `!important` is 10 bytes) and zero rendering impact.
- **Risk of regression is high**: photo overlays and theme switching are the kind of bugs users actually report. Re-introducing them to chase a metric is bad engineering.

---

## Recommended posture going forward

- **Add a CSS lint rule**: refuse new `!important` declarations in PRs unless tagged with a `/* important: reason */` comment.
- **Migrate MapLibre to a different library** (e.g., `maplibre-gl-style-spec` for declarative theming) if popup theming continues to be painful. Would remove ~51 `!important` in one sweep.
- **Treat the 124 load-bearing as a stable baseline**. Use any future reduction as bonus, not pressure.

---

## File locations to check

- Reduced-motion block: `site/assets/css/styles.css` search `@media (prefers-reduced-motion: reduce)` — should find 5-6 blocks
- MapLibre overrides: search for `maplibregl-` or `#algeria-map .` or `#trip-map .`
- Photo-overlay: search for `.trip-card__from`, `.trip-card__flag`, `.trip-card__body`, `.hotel-card__ribbon`
- Reduced-motion-correctness verification: open Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion" → reload → confirm no animation runs

---

Author: v22 engagement, 2026-05-22.
