# I18N + SEO Strategy

**Owner:** Agent 4 (v22) · revisited 2026-05-25. **Status:** REVISED — runtime engine ships, SEO posture unchanged.

## Current decision (2026-05-25)

Ship the runtime language switcher (`site/assets/js/i18n.js`) on every page. SEO posture stays Strategy (c) — FR canonical with `hreflang="x-default"` — for now. The switcher is a **user-facing UX surface**, not an SEO surface.

This is a strict layer split:
- **Crawlers see:** one FR page per URL, declared canonical via `hreflang="x-default"`. No EN/AR subpath, no `?lang=` variants, no duplicate URLs.
- **Visitors see:** a 3-button switcher pill in the navbar that swaps `<html lang>`, `<html dir>` (RTL for AR), lazy-loads Cairo + Tajawal on first AR pick, and persists choice in `localStorage` so it survives page navigation.

## Previous decision (2026-05-22) and what changed

The original Agent 4 brief decided strategy (c) and **collapsed runtime engine work** on the assumption that shipping EN/AR without copywriter review would mismanage brand voice. That decision was reversed on user request 2026-05-25 because:

1. The engine + 3 full dictionaries (FR/EN/AR, 12 namespaces) were already built and just sitting in `stash@{1}` — recovering them was a 30-minute task, not a build-from-scratch.
2. Algerian travelers code-switch FR↔AR in browsing — even without indexable AR pages, the switcher signals "we serve you in your language."
3. The engine fails gracefully: missing keys fall back to FR, so partial dictionary coverage doesn't break anything.

## What ships today (2026-05-25)

- `site/assets/js/i18n.js` recovered from `stash@{1}` and loaded on all 8 HTML pages via `<script src=".../i18n.js" defer>` before `enhance.js` (the switcher must exist when `initNavDrawer` decides whether to move it into the mobile drawer).
- Language switcher pill CSS + Arabic typography (`:root[lang="ar"]` Cairo/Tajawal) + RTL layout adjustments appended to the end of `site/assets/css/styles.css`.
- `hreflang="x-default"` tags on all 7 indexable pages — unchanged, still correct under the new policy.
- `<html lang="fr">` still hardcoded on first paint. The runtime swap is client-side only and crawlers never see it.

## What's NOT shipping today

- **`data-i18n` attribute additions across HTML**: the 161 attribute additions from `stash@{1}` weren't reapplied. Without them, switching to EN/AR will:
  - ✅ Flip `<html lang>` and `<html dir>`
  - ✅ Mirror layout for AR (RTL)
  - ✅ Swap to Cairo/Tajawal fonts
  - ✅ Persist the choice
  - ❌ NOT translate visible body text (the engine has no markup to translate)

This is intentional. The switcher is a foundation; adding `data-i18n` attributes is bounded per-page work that can land incrementally. Start with the navbar, hero, and footer (they appear on every page); trip pages can follow.

## When to add `data-i18n` attributes

Two paths:
1. **Surgical recovery from stash@{1}**: `git diff "stash@{1}^1" "stash@{1}" -- <page>` shows exactly what `data-i18n` attributes were intended per page. Pull them out manually — but expect heavy conflicts because 30+ commits diverged.
2. **Fresh annotation**: walk each page top-to-bottom, add `data-i18n="<namespace>.<key>"` to translatable text nodes. The dictionary in `i18n.js` already has FR/EN/AR for the 12 main namespaces (nav, hero, agency, contact, footer, etc.).

Either way, do it page-by-page with `git commit` per page so partial coverage is safe.

## When to revisit SEO strategy

Switch from (c) to (a) subpath model **only if**:
- Agency closes a B2B contract requiring an Arabic-first surface.
- WhatsApp inbound shows >15% non-FR enquiries for two consecutive months.
- A FR→AR (MSA) + FR→EN copywriter is on retainer.

Until then, the runtime switcher serves the UX without committing to the SEO maintenance burden of subpath duplication.
