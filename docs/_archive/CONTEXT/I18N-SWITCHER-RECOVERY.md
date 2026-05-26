# 🌐 i18n Language-Switcher — Recovery Dossier

> **Part of the `docs/CONTEXT/` set** — siblings: `REPO-STATE-AUDIT.md`, `PITCH-DECK-ARCHIVE.md`, `SESSION-TIMELINE.md`.
> **Status of this doc:** ⚡ **UPDATED 2026-05-25 — the switcher is now PARTIALLY RESTORED.** Commit `24c625e` (made by a *concurrent* Claude Code session at 12:36) committed the engine, wired `<script>` tags onto all 8 pages, shipped the switcher + RTL CSS, and revised `docs/I18N-SEO.md`. So §5 below is no longer a from-scratch restore — it is a **finish-the-job checklist** (steps a/c/d are DONE; **b** = the 161 `data-i18n` text attrs and **e** = `stash@{0}` nav refactor remain).
> **Originally generated:** 2026-05-25 at HEAD `71c8d77` · reconciled at HEAD `24c625e` · branch `feat/v12-hierarchy-pass`.
>
> ### 🟡 What works today vs. what's missing (HEAD `24c625e`)
> | Behavior | Status on HEAD |
> |---|---|
> | Switcher pill (`FR · EN · عر`) renders in nav | ✅ live (engine committed + loaded on 8 pages) |
> | Flips `<html lang>` / `<html dir>` (RTL for AR) | ✅ live |
> | Lazy-loads Cairo/Tajawal on first AR pick | ✅ live |
> | Persists choice in `localStorage` (`al-lang`) | ✅ live |
> | **Translates visible body text** | ❌ **NO** — 0 `data-i18n` attrs on HEAD (the 161 attrs in `stash@{1}` were not reapplied) |
> | Mobile drawer moves the switcher inside it | ❌ NO — `stash@{0}` (`enhance.js`) still unapplied |
>
> **Net:** the switcher is a working *chrome/UX foundation* (lang/dir/font/persistence) but is **not yet a translating site.** Adding the `data-i18n` attrs (step b) is the remaining bounded work.

---

## 1. TL;DR

A complete, working **trilingual (FR / EN / AR) runtime language switcher** was built and then **deliberately shelved** — it was never merged. **Nothing is lost.** The whole feature still lives in git:

| Piece | Location | Verified |
|---|---|---|
| Runtime engine (`i18n.js`, 41 459 bytes) | untracked blob in `stash@{1}^3` → `d82e096b88bd4aeb54a078e281b6774b563cccf3` | ✅ read in full |
| Markup scaffolding (161 `data-i18n` attrs, `<script>` tags, `data-page` attrs) | tracked diff `stash@{1}^1 … stash@{1}` across 8 HTML files | ✅ |
| Switcher UI + RTL CSS (~645 lines into `styles.css`) | same stash diff | ✅ |
| Dependent mobile-drawer nav refactor | `stash@{0}` → `enhance.js` (+93/−17) | ✅ |

It was shelved by a **locked product decision** (Agent 4, 2026-05-22): ship **FR-only** with `hreflang="x-default"`, and **do not** merge EN/AR until a copywriter reviews the brand voice. See [`docs/I18N-SEO.md`](../I18N-SEO.md) and §6 below.

> ⚠️ **Restoring this feature is OPTIONAL and currently against policy.** Treat §5 as a recipe to be run *only after* the decision gate in §6 is cleared by the owner.

### 🔎 Surprise finding (now resolved — superseded by the 2026-05-25 restore)
*This section originally noted that `i18n.js` was sitting on disk **untracked** and unreferenced — that was the half-finished restore caught mid-flight.* As of commit **`24c625e`** the engine is now **tracked/committed** (byte-identical to the stashed blob `d82e096b…`), **referenced by `<script>` on all 8 pages**, and `styles.css` now carries the real switcher + RTL rules (32 `.lang-switcher`/`.lang-btn`/`[dir="rtl"]` selectors, no longer just the 2 orphans). So the "inert footprint" is now a **functioning chrome foundation**. What it still lacks is the body-text translation layer (the `data-i18n` attrs) — see the status table above and §5 step (b).

---

## 2. What the feature does — engine architecture

`site/assets/js/i18n.js` is a **zero-dependency IIFE**. It self-initializes on `DOMContentLoaded` (or immediately if the DOM is already parsed) on any page that has `<nav class="site-nav">`.

### Header comment (verbatim — the public contract)

```js
/**
 * Alliance Travel — i18n engine
 * Languages: French (default) · English · Arabic
 *
 * Usage in HTML:
 *   <h1 data-i18n="hero.title_l1">Le monde,</h1>
 *   <em data-i18n="hero.title_em">guidé et organisé</em>
 *   <a data-i18n="nav.trips" href="#voyages">Nos voyages</a>
 *   <button data-i18n-aria-label="lang.label" data-i18n="cta.book">Réserver</button>
 *
 * Behavior:
 *   - Injects a 3-button language switcher into .site-nav (before .theme-toggle)
 *   - Persists choice in localStorage ("al-lang")
 *   - Toggles <html lang> and <html dir> ("rtl" for Arabic)
 *   - Lazy-loads Cairo + Tajawal from Google Fonts on first Arabic selection
 *   - Falls back to French if a key is missing
 *   - Dispatches "langchange" event for other modules
 *
 * No external dependencies. Loads from any page that has <nav class="site-nav">.
 */
```

### Configuration constants

| Constant | Value |
|---|---|
| `STORAGE_KEY` | `'al-lang'` |
| `DEFAULT_LANG` | `'fr'` |
| `SUPPORTED` | `['fr', 'en', 'ar']` |
| `AR_FONT_HREF` | Google Fonts CSS2 — `Cairo:wght@300..700` + `Tajawal:wght@300..700`, `display=swap` |

### The `T` dictionary shape

A single nested object `T[lang][namespace][key]`, addressed by **dot-path** strings (`hero.title_l1` → `T.fr.hero.title_l1`). `lookup(key, dict)` walks the path with `reduce`, returning `null` on any miss. Namespaces: `lang, nav, hero, stats, voyages_section, trips, agency, contact, map, footer, conseiller, trip_page, meta` (see §3).

### Core functions / behavior

| Function | What it does |
|---|---|
| `getLang()` | localStorage → `navigator.language` (first 2 chars) → `DEFAULT_LANG`. Only returns a value in `SUPPORTED`. Wrapped in try/catch for private-mode. |
| `persistLang(lang)` | Writes `al-lang` to localStorage (try/catch). |
| `setHtmlAttrs(lang)` | Sets `<html lang>`, `<html dir>` (`rtl` for `ar`, else `ltr`), and `<html data-lang>`. Called **first in `init()`** to pre-set ASAP and prevent a flash. |
| `ensureArabicFont()` | Idempotently appends a `<link rel=stylesheet data-arabic-font="1">` for Cairo+Tajawal. **Lazy** — only fired when `ar` is selected. |
| `translate(lang)` | Three passes: `[data-i18n]` → `textContent`; `[data-i18n-html]` → `innerHTML` (trusted strings, allows embedded `<strong>`/`<em>`); attribute pass for `aria-label`, `title`, `placeholder`, `alt` via `data-i18n-aria-label` / `data-i18n-title` / `data-i18n-placeholder` / `data-i18n-alt`. Every lookup **falls back to FR** if the active-lang key is missing. Ends by dispatching `langchange`. |
| `updateMeta(lang)` | Reads `<body data-page="…">`, looks up `T[lang].meta[pageKey]`, and swaps `<title>`, `meta[name=description]`, `og:title`, `og:description`, `twitter:title`, `twitter:description`, and `og:locale` (`fr_DZ` / `en_US` / `ar_DZ`). FR fallback. |
| `buildSwitcher()` | Idempotent. Creates `.lang-switcher` (`role="group"`, trilingual `aria-label`) with three `.lang-btn` buttons (`FR`, `EN`, `عر`/`.lang-btn--ar`). Inserts **before `.theme-toggle`** in `.site-nav`; falls back to before `.nav-cta`, else appends. Wires click → `setLang`. |
| `reflectActive(lang)` | Sets `aria-pressed` + `.lang-btn--active` on the matching button. |
| `setLang(lang)` | Orchestrator: validate → `ensureArabicFont` (ar only) → persist → `setHtmlAttrs` → `translate` → `updateMeta` → `reflectActive`. |
| `init()` | `setHtmlAttrs` (flash-prevent) → ar-font if needed → `buildSwitcher` → `translate` → `updateMeta` → `reflectActive`. |

### Public API (exposed on `window`)

```js
window.alSetLang      = setLang;   // alSetLang('ar')
window.alGetLang      = getLang;   // -> 'fr' | 'en' | 'ar'
window.alTranslations = T;         // the full dictionary, for debugging / other modules
```

### Events
Dispatches `langchange` on `document` with `detail: { lang }` after every translate — the documented hook other modules use (see the dependent nav refactor in §4 / `stash@{0}`).

---

## 3. Translation coverage

The `T` object is **fully populated in all three languages** across these namespaces:

| Namespace | Covers | FR | EN | AR |
|---|---|:--:|:--:|:--:|
| `lang` | switcher labels (Français/Anglais/Arabe, etc.) | ✅ | ✅ | ✅ |
| `nav` | skip link, menu links, WhatsApp, theme/logo labels, trip-page nav (Programme/Hôtels/FAQ/Réserver) | ✅ | ✅ | ✅ |
| `hero` | eyebrow, two-line title, lede, 3 CTAs, 4 trust chips | ✅ | ✅ | ✅ |
| `stats` | travelers / satisfaction / destinations / experience | ✅ | ✅ | ✅ |
| `voyages_section` | eyebrow, title, sub, 5 filters, card CTA, from/per-person | ✅ | ✅ | ✅ |
| `trips` | 5 destination names + short forms | ✅ | ✅ | ✅ |
| `agency` | eyebrow, title, **3 rich HTML paragraphs** (`p1_html`–`p3_html`), 2 CTAs, 4 value labels | ✅ | ✅ | ✅ |
| `contact` | eyebrow/title/lede, 6 form fields + hint, advisor lead, 3 addresses, 3 payment methods, signup | ✅ | ✅ | ✅ |
| `map` | eyebrow/title/subtitle, fallback strings, HQ/branch pills, directions/recenter | ✅ | ✅ | ✅ |
| `footer` | tagline, columns, address, phone, copyright, notice, 3 socials | ✅ | ✅ | ✅ |
| `conseiller` | advisor / WhatsApp / call | ✅ | ✅ | ✅ |
| `trip_page` | included/itinerary/hotels/FAQ/calculator/booking + pax labels (adults/children/infants) + totals | ✅ | ✅ | ✅ |
| `meta` | per-page `title` / `description` / `og_*` for `home`, `voyages`, and 5 trips | ✅ | ✅ | ✅ |

### Quality assessment (human-written vs placeholder)

**All three locales read as human-authored, not machine placeholder.** Evidence:

- **AR is Modern Standard Arabic**, idiomatic and brand-accurate — e.g. `العالم، / بمرافقة وتنظيم` (hero), `وكالتك في برج، لا في العاصمة` ("your agency in Bordj, not the capital" — a deliberate local-pride angle), proper transliterations (`أليانس ترافل`, `كوالا لمبور`, `برج بوعريريج`). It even localizes numerals/currency (`123 000 د.ج`) and months (`جوان`, `أفريل` — Maghrebi French-derived month names, not MSA standard).
- **EN** mirrors FR meaning with locale-correct currency (`DZD 123,000` vs FR `123 000 DA`) and idiom ("answers on the first ring", "small-group tours").
- **FR** is the source of truth and matches the live site copy.

This is **not** lorem/placeholder content. ⚠️ **But** note the shelving rationale (§6): the locked decision is precisely that this copy must still pass **copywriter brand-voice review** before shipping — quality of translation ≠ approval to ship.

---

## 4. Exact file inventory

The feature spans **one untracked engine + 8 tracked HTML files + 1 CSS file** (in `stash@{1}`), plus **1 JS file** in the dependent `stash@{0}`.

> 🧹 **Noise warning:** the stash base is `587ab0d` (2026-05-21), which is **28 commits behind current HEAD** (`git rev-list --count 587ab0d..HEAD` = 28; base *is* an ancestor of HEAD). So `git diff stash@{1}^1 stash@{1}` carries **unrelated meta/CSS churn** alongside the i18n work. The table below isolates the **i18n-specific** additions you actually want.

### `stash@{1}` — the switcher feature

| File | i18n-specific additions | Notes |
|---|---|---|
| `site/assets/js/i18n.js` | **entire 41 459-byte engine** (untracked, in `stash@{1}^3` tree as blob `d82e096b…`) | The engine. Already on disk, byte-identical (see §1 finding). |
| `site/index.html` | **88** `data-i18n*` attrs · `<script src="assets/js/i18n.js" defer>` (inserted *before* `enhance.js`) · `<body data-page="home">` | Largest consumer. Diff shows +287 lines (includes base noise). |
| `site/voyages/index.html` | **16** attrs · `<script src="../assets/js/i18n.js" defer>` · `data-page="voyages"` | |
| `site/cairo-sharm/index.html` | **13** attrs · script tag (`../assets/…`) · `data-page="cairo_sharm"` `data-region="egypt"` | |
| `site/azerbaidjan/index.html` | **11** attrs · script tag · `data-page="azerbaidjan"` `data-region="azerbaijan"` | |
| `site/istanbul/index.html` | **11** attrs · script tag · `data-page="istanbul"` | |
| `site/kuala-lumpur/index.html` | **11** attrs · script tag · `data-page="kuala_lumpur"` `data-region="malaysia"` | |
| `site/sharm-constantine/index.html` | **11** attrs · script tag · `data-page="sharm_constantine"` | |
| `site/404.html` | **0** `data-i18n` (its +4 lines are base noise, not i18n) | ⚠️ The 4-line change is **not** i18n — do not treat 404 as feature scope. Policy keeps 404 `noindex`. |
| `site/assets/css/styles.css` | **~645 lines** (incl. base noise): `.lang-switcher`, `.lang-btn`, `.lang-btn--active`, `.lang-btn--ar`, light-theme variants, responsive shrink, mobile `display:none`, and a large `[dir="rtl"] …` block (icon/arrow flips, ribbon/flag/price re-anchoring, `padding-inline-start`, drawer-from-left) | The switcher UI + full RTL layout pass. |

**Totals (verified):** 161 added `data-i18n` / `data-i18n-aria-label` / `data-i18n-title` attrs · 7 `<script>` tags (root uses `assets/js/`, 6 subpages use `../assets/js/`) · 7 `data-page` body attrs · diffstat = 9 files, +939 / −224 (noise-inflated).

### `stash@{0}` — dependent companion (restore *with* the switcher)

| File | Change | Coupling to i18n |
|---|---|---|
| `site/assets/js/enhance.js` | +93 / −17 — `initNavDrawer()`: hamburger + slide-in drawer + backdrop; **moves** `.nav-links`, `.lang-switcher`, `.theme-toggle`, `.nav-cta` into the drawer at ≤900px | **Hard dependency.** Code comment: *"Wait one tick so i18n.js can finish building `.lang-switcher` first."* It polls `if (!nav.querySelector('.lang-switcher')) return setTimeout(initNavDrawer, 50);` — without the switcher, the drawer never initializes. |

---

## 5. RESTORE PLAYBOOK

> ✅ **Steps (a), (c), (d) already shipped in commit `24c625e` (2026-05-25).** The engine is recovered + committed, `<script>` tags are on all 8 pages, and the switcher + RTL CSS are in `styles.css`. **Only (b) and (e) remain** to complete the feature:
> - **(b)** Re-add the 161 `data-i18n` attrs so body text actually translates — *bounded per-page work; this is the real remaining task.*
> - **(e)** Apply `stash@{0}` so the mobile drawer absorbs the switcher.
>
> 🛑 The owner runs these; this doc does not execute them. Step (b) still draws from `stash@{1}` (28+ commits of drift → expect to hand-place attrs rather than apply cleanly).

### Step 0 — Pre-flight
1. Clear the §6 decision gate (copywriter sign-off + a revisit trigger met).
2. Work on a throwaway branch: `git switch -c restore/i18n-switcher`.
3. **Read `git status` first.** Per the §1 finding, `site/assets/js/i18n.js` may already be on disk (untracked) and identical to the stashed blob.

### Step (a) — Recover the untracked engine
The engine is untracked, so `git stash apply` will **not** bring it back the normal way. Materialize it straight from the blob:

```bash
git cat-file -p d82e096b88bd4aeb54a078e281b6774b563cccf3 > site/assets/js/i18n.js
git hash-object site/assets/js/i18n.js   # MUST print d82e096b88bd4aeb54a078e281b6774b563cccf3
```

> If the file is already on disk and `git hash-object` already matches `d82e096b…`, this step is a no-op — the engine is present; just `git add` it when ready.

### Step (b) — Re-introduce the markup (`data-i18n` + `data-page`)
Three options, in increasing safety:

| Option | Command sketch | Trade-off |
|---|---|---|
| **B1 — Apply whole stash** | `git stash apply stash@{1}` | Fastest, but **will conflict** (28 commits of drift) **and** drags in the unrelated base noise (meta/CSS churn, the 404 +4 lines). Resolve conflicts by hand, then `git checkout --theirs`/manual-merge per hunk. Not recommended as-is. |
| **B2 — Filtered diff** | `git diff stash@{1}^1 stash@{1} -- site/index.html > /tmp/i18n.patch` then `git apply --reject /tmp/i18n.patch` per file | Keeps it per-file; `.rej` files flag the hunks that don't land cleanly. You still inherit the base noise inside that file. |
| **B3 — Manual cherry-pick of attrs (recommended)** | Use `git diff stash@{1}^1 stash@{1} -- <file> \| grep '^\+'` as a checklist; hand-add each `data-i18n*` attr and the `<body data-page>` to current HEAD markup | Slowest but **surgical** — you add exactly the 161 attrs + 7 `data-page` attrs onto today's markup, skipping all noise and avoiding conflict churn. Safest given the drift. |

Whichever path: confirm each page ends with the **7 expected `data-page` values** — `home`, `voyages`, `cairo_sharm`, `azerbaidjan`, `istanbul`, `kuala_lumpur`, `sharm_constantine` — since `updateMeta()` is keyed off them.

### Step (c) — Re-add the `<script>` tags
On **every** page, add the engine **before `enhance.js`** (load order matters — `enhance.js`'s drawer waits on `i18n.js` building `.lang-switcher`):

- Root `site/index.html`: `<script src="assets/js/i18n.js" defer></script>`
- All 6 subpages (`voyages/`, `cairo-sharm/`, `azerbaidjan/`, `istanbul/`, `kuala-lumpur/`, `sharm-constantine/`): `<script src="../assets/js/i18n.js" defer></script>`

### Step (d) — Restore the CSS (switcher + RTL)
Bring the `.lang-switcher` / `.lang-btn*` / `[dir="rtl"]` blocks from the stash into `styles.css`:

```bash
git diff stash@{1}^1 stash@{1} -- site/assets/css/styles.css > /tmp/i18n-css.patch
git apply --reject /tmp/i18n-css.patch     # then resolve .rej hunks
```

⚠️ HEAD already has two **orphaned** `.lang-switcher` selectors (styles.css lines ~698, ~713 inside `.nav-drawer` rules). De-duplicate against them so you don't get double declarations.

### Step (e) — Restore the dependent nav refactor (`stash@{0}`)
```bash
git stash apply stash@{0}      # touches only site/assets/js/enhance.js; resolve conflicts
```
Verify `initNavDrawer()` lands and still gates on `.lang-switcher`.

### Step (f) — Verification checklist
Serve the site locally and confirm:

- [ ] 3-button switcher (`FR · EN · عر`) appears in the nav, **before** the theme toggle.
- [ ] **FR → EN**: all text + form placeholders + `aria-label`s swap; `<html lang="en">`, `dir="ltr"`.
- [ ] **EN → AR**: `<html lang="ar" dir="rtl">`; layout mirrors (arrows/ribbons/flags flip); MSA text renders.
- [ ] **Arabic fonts**: a `<link data-arabic-font="1">` (Cairo+Tajawal) is injected **only** on first AR selection (Network tab).
- [ ] **Persistence**: reload → last language sticks (localStorage `al-lang`).
- [ ] **Meta swap**: `document.title`, `meta[description]`, `og:*`, `twitter:*`, `og:locale` change per `data-page`.
- [ ] **FR fallback**: temporarily remove an EN/AR key → that node shows FR, no crash.
- [ ] **`langchange` event** fires (`document.addEventListener('langchange', e => console.log(e.detail.lang))`).
- [ ] **Mobile (≤900px)**: hamburger drawer opens and contains the moved `.lang-switcher` (proves `stash@{0}` integration).
- [ ] Console: `window.alGetLang()`, `window.alSetLang('ar')`, `window.alTranslations` all work.

---

## 6. Decision gate — ⚠️ the lock was REVISED on 2026-05-25

> **UPDATE:** the "do not ship" lock below was **partially reversed** on 2026-05-25. `docs/I18N-SEO.md` now reads **"REVISED — runtime engine ships, SEO posture unchanged"**: the switcher ships as a **client-side UX surface** (FR stays canonical for crawlers via `hreflang="x-default"`; no `/en/` `/ar/` subpaths). That reversal is what commit `24c625e` implemented. The original locked rationale is preserved below for context — and its core caveat still applies: **EN/AR body copy hasn't had copywriter brand-voice review, which is exactly why step (b) `data-i18n` rollout was deliberately deferred.**

The original shelving was a **deliberate product decision**, not an accident. From [`docs/I18N-SEO.md`](../I18N-SEO.md) (Owner: **Agent 4**, originally Decided **2026-05-22** as Status **locked**, since **revised 2026-05-25**):

> **Strategy (c) — accept FR-only indexing.** French is the conversion language for Alliance Travel's Algerian outbound market; EN/AR are diaspora UX nice-to-haves, not ranking surfaces. Ship a single canonical FR site with `<html lang="fr">` hardcoded and `<link rel="alternate" hreflang="x-default">` on every indexable page. No runtime language swap ships today.

> The doc explicitly states the WIP engine *"was never merged"* and that *"we do not build one, because shipping EN/AR without copywriter review would mismanage the brand voice."*

### Revisit triggers (any **one** unlocks a move to subpath `/en/` `/ar/`)
- 🤝 The agency closes a **B2B contract** requiring an Arabic-first surface.
- 📈 WhatsApp inbound shows **>15% non-FR enquiries** for **two consecutive months**.
- ✍️ A **FR→AR (MSA) + FR→EN copywriter** is on retainer to review/own the voice.

> Until one of these is true, the policy is **bare FR URL + `hreflang="x-default"`**. Restoring the switcher before then is a conscious override of a locked decision — get owner sign-off and update `docs/I18N-SEO.md` first.

> 📝 Architectural note for a future revisit: the locked target is **pre-rendered subpaths** (`/en/`, `/ar/`), which is SEO-superior to this **runtime/client-side** switcher. If you restore this engine, treat it as a **UX bridge**, not the final SEO strategy — the indexing concern in `I18N-SEO.md` is unaffected by a client-side swap.
