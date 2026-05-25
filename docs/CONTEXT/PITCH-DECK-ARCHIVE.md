# Pitch-Deck Archive — Two Orphan Branches

> Part of the `docs/CONTEXT/` audit set. Siblings: `REPO-STATE-AUDIT.md`, `I18N-SWITCHER-RECOVERY.md`, `SESSION-TIMELINE.md`.
>
> **Read-only investigation.** No branches were checked out, merged, deleted, or pruned. Everything below was inspected via `git show` / `git log` / `git ls-tree` / `git cat-file -p` against the existing remote refs.

---

## TL;DR

There are **two old, unmerged pitch-deck branches**, both originating from **cloud/web Claude sessions** (the `claude/` ref prefix), both forked off the same point in history on **2026-05-02**, and both **superseded** by the full `site/` build that lives on `main` / `HEAD` today.

| | |
|---|---|
| 🎯 What they contain | A self-contained, single-file **B2B sales pitch deck** (one big `index.html`) for a freelance product-engineering "Build Squad" pitching to travel agencies, using **Alliance Travel** (BBA, Algeria) as the reference build. |
| 🌍 Headline feature | One branch's deck is **fully trilingual** — **FR (default) / AR (RTL) / EN** — with three complete translation dictionaries and a working language switcher. |
| 🌲 Fork point | Both branched at **`005ccfc` (2026-05-02, "Merge branch 'refactor/audit-execution'")**. `HEAD` is **82 commits ahead** of that point; the deck branches are only **5 / 2 commits** ahead. They are **early-phase artifacts**, not recent work. |
| 🔍 On the live site? | **No.** `HEAD` has no root `index.html` and no deck content anywhere (`git grep "Build Squad" HEAD` → empty). The deck is isolated to these two branches. |
| ✅ Recommendation | Treat as **ARCHIVE**. Keep as historical branches, **or** export the (best) deck HTML into the repo's existing `_archive/` path. **Do not delete without owner confirmation.** |

---

## The two branches at a glance

| Branch | Commits not in `HEAD` | Deck file location | Deck state |
|---|---|---|---|
| `origin/claude/pitch-deck-standalone` | **5** | **`/index.html`** (root) | The **evolved** deck — overhauled + **trilingual** + map fix (3,506 lines) |
| `origin/claude/project-summary-marketing-rJVd8` | **2** | **`/pitch-deck/index.html`** (subfolder) | The **first cut** — single-language, 1,823 lines |

Both also carry one shared older commit, `6d049c3` ("Fix typo in project title in README.md").

---

## Branch-by-branch breakdown

### 1. `origin/claude/pitch-deck-standalone` — the evolved deck

Commits ahead of `HEAD` (newest → oldest), all authored by **Claude** on **2026-05-18** except the shared README commit:

| Commit | Date (UTC) | Author | Subject | Effect on `index.html` |
|---|---|---|---|---|
| `36be656` | 2026-05-18 19:38 | Claude | fix Algeria map + design polish | 3,441 → **3,506** lines |
| `5366f76` | 2026-05-18 18:10 | Claude | **pitch deck: trilingual (FR default, AR RTL, EN)** | 2,923 → **3,441** lines |
| `fecfe19` | 2026-05-18 16:15 | Claude | pitch deck: full UI/UX overhaul | 1,823 → **2,923** lines |
| `0549867` | 2026-05-18 15:44 | Claude | pitch deck standalone artifact | **+1,823** lines (new root `index.html`) |
| `6d049c3` | 2026-05-02 15:39 | YAS-AWAKE | Fix typo in project title in README.md | (README only — shared, see below) |

- **Tree (root):** `.claude/`, `.gitignore`, `README.md`, **`index.html`**. No `site/`, no `docs/`, no `_archive/` — i.e. it lacks the full project build that exists on `HEAD`.
- **The artifact:** a single self-contained HTML file (inline `<style>` + inline `<script>`, external Google Fonts only). Final size **3,506 lines**.
- This is the branch you'd keep if you only keep one — it is a strict superset of the other branch's deck, plus three more iterations.

### 2. `origin/claude/project-summary-marketing-rJVd8` — the first cut

Commits ahead of `HEAD`:

| Commit | Date (UTC) | Author | Subject | Effect |
|---|---|---|---|---|
| `bab6b5a` | 2026-05-18 15:27 | Claude | **add B2B pitch deck for travel-agency squad** | +1,823 lines → `pitch-deck/index.html` |
| `6d049c3` | 2026-05-02 15:39 | YAS-AWAKE | Fix typo in project title in README.md | (README only — shared) |

- **Tree (root):** `.claude/`, `.gitignore`, `README.md`, **`pitch-deck/`** (`index.html`), plus `_archive/`, `docs/`, `site/`, `source of truth/` **inherited unchanged** from the 2026-05-02 base. `git diff 6d049c3..origin/claude/project-summary-marketing-rJVd8` shows the **only** change is adding `pitch-deck/index.html`.
- The deck here is **1,823 lines** — single-language (French), no AR/EN, no map fix.

> ⚠️ **Note on the shared `6d049c3` "typo fix":** it actually *introduces* a typo rather than fixing one — it changed the README title from `# Alliance Travel — guided-tour static site` to `# Alliance Travel — guided-tour  site` (dropped the word "static", left a double space). Cosmetic only; flagged for awareness.

---

## The trilingual pitch deck (commit `5366f76`) — confirmed

Inspected `git cat-file -p 5366f76:index.html`. The trilingual claim is **verified**:

- **Markup root:** `<html lang="fr" dir="ltr">` — French is the default.
- **Switcher UI** (3 buttons, in the nav):
  ```html
  <div class="nav__lang" role="group" aria-label="Language switcher">
    <button data-lang="fr" type="button">FR</button>
    <button data-lang="ar" type="button">AR</button>
    <button data-lang="en" type="button">EN</button>
  </div>
  ```
- **Three full translation dictionaries** in the inline `<script>`: `fr:` (line ~2803), `en:` (~2941), `ar:` (~3070). Every translatable node carries a `data-i18n="…"` key.
- **`setLang(lang)` logic:**
  - sets `html.lang = lang`
  - sets **`html.dir = lang === 'ar' ? 'rtl' : 'ltr'`** ← the AR-RTL behaviour
  - rewrites every `[data-i18n]` node's `innerHTML` from the active dictionary
  - persists choice to **`localStorage['pitch-lang']`**
  - falls back to `fr` for unknown languages
- **Init order:** stored choice → browser language (`navigator.language`, if one of fr/en/ar) → **`fr` default**.
- **RTL stylesheet:** a dedicated `[dir="rtl"] { … }` block (~line 311 onward, ~50+ overrides) swaps Arabic fonts (`IBM Plex Sans Arabic`, `Cairo`), flips list-bullet sides, mirrors WhatsApp bubbles, repositions chips/labels, etc.

### Deck structure (sections, in order)

| # | Section `id` | Theme | What it pitches |
|---|---|---|---|
| 1 | `hero` | — | "Votre agence, enfin en pilote automatique." Headline + 4 stat tiles + animated Algeria map orb (HQ = **BBA / Bordj Bou Arreridj**). |
| 2 | `why` | "Friction, not traffic" | 4 friction cards: opaque pricing, hotel×date×room combo explosion, contact-form drop-off, "no WhatsApp" objection — each with the fix. |
| 3 | `case` | Case study | Alliance Travel reference build hero + metadata. |
| 4 | `modules` | Product modules | The build blocks (catalog showcase, live price calculator, one-tap WhatsApp dossier, etc.). |
| 5 | `pricing` | "Inventaire" | Pricing / package inventory cards. |
| 6 | `engineering` | Dark section | Engineering credibility: sticky-total bar, floating WhatsApp FAB, keyboard-accessible lightbox, dark-mode persisted in `localStorage`. |
| 7 | (unnamed) | — | Secondary cream section. |
| 8 | `contact` | CTA | "Réserver un appel" — book-a-call close. |

**Design system:** dark/cream tokenised palette, vivid per-region accent colors borrowed from the Alliance Travel system, fonts Space Grotesk / Inter / JetBrains Mono (+ Cairo & IBM Plex Sans Arabic for AR). Mock UI of the actual product (phone mock, price calculator, catalog) is embedded.

---

## Lineage — how the branches relate

`git merge-base` results:

- `merge-base(pitch-deck-standalone, HEAD)` = **`005ccfc`** (2026-05-02, "Merge branch 'refactor/audit-execution'")
- `merge-base(project-summary-marketing, HEAD)` = **`005ccfc`** (same)
- `merge-base(pitch-deck-standalone, project-summary-marketing)` = **`6d049c3`** (the README commit)

So both deck branches share the README commit `6d049c3` (a child of `005ccfc`), then **diverge** — each adds its own deck independently. They are **siblings**, not ancestor/descendant.

**Confirmed via blob hash:** the first deck on *both* branches is byte-for-byte identical — `0549867:index.html` and `bab6b5a:pitch-deck/index.html` both resolve to blob **`dc8635ff…`** (1,823 lines). So:

- `project-summary-marketing` (`bab6b5a`, 15:27 UTC) dropped the deck **first**, in `pitch-deck/`.
- `pitch-deck-standalone` (`0549867`, 15:44 UTC, ~17 min later) placed the **same** file at the **root**, then iterated 3 more times (overhaul → trilingual → map fix).

```
005ccfc  "Merge branch 'refactor/audit-execution'"  (2026-05-02)  ← fork point with main/HEAD
   │
   ├──────────────► main / HEAD ……… +82 commits … full site/ build (current)
   │
   └─ 6d049c3  "Fix typo in README"  (2026-05-02, YAS-AWAKE)  ← shared by both deck branches
        │
        ├─ bab6b5a  add pitch-deck/index.html (1823 ln, blob dc8635ff)   ◄ project-summary-marketing-rJVd8
        │
        └─ 0549867  add root index.html      (1823 ln, blob dc8635ff)   ─┐
             └─ fecfe19  full UI/UX overhaul  (2923 ln)                   │
                  └─ 5366f76  trilingual FR/AR-RTL/EN  (3441 ln)         │ ◄ pitch-deck-standalone
                       └─ 36be656  Algeria map fix + polish  (3506 ln) ──┘
```

| Branch | Forked from `HEAD` at | Commits ahead of fork | Deck path | Deck size | Trilingual? |
|---|---|---|---|---|---|
| `…/project-summary-marketing-rJVd8` | `005ccfc` (2026-05-02) | 2 | `pitch-deck/index.html` | 1,823 ln | ❌ FR only |
| `…/pitch-deck-standalone` | `005ccfc` (2026-05-02) | 5 | `index.html` (root) | 3,506 ln | ✅ FR/AR/EN |
| `main` / `HEAD` | — | (+82 from fork) | none (deck not present) | — | — |

---

## "Is it on the live site?" — No.

Verified against `HEAD` (current `feat/v12-hierarchy-pass`, commit `71c8d77`):

- **No root `index.html`** in the `HEAD` tree (`git ls-tree HEAD --name-only` → top level is `.claude .github .gitignore README.md _archive _audit_colors.py _migrate_inline_styles.py docs site "source of truth" wrangler.toml`).
- **No deck content anywhere:** `git grep -l "Build Squad" HEAD` returns nothing.
- The live marketing site lives under **`site/`** (the 6-page guided-tour build). The pitch deck is a separate sales artifact and was **never merged** into it.
- An `_archive/` directory **already exists** on `HEAD` (contains `css-scratch`, `handoff-snapshot-v5.2`, `heroes-original`, `logs`, `migrations`, `README.md`) — a natural home if you choose to export the deck.

**Conclusion:** the pitch-deck content is fully isolated to the two `claude/` branches. Nothing on the live site depends on it; nothing on the live site reproduces it.

---

## Recommendation & options

These are **superseded early-phase artifacts** (2026-05-18 cloud sessions, 82 commits behind today's HEAD). They have **archival value** — the trilingual deck on `pitch-deck-standalone` is a polished, complete sales asset that may be reusable. Recommended posture: **archive, don't lose; don't delete blind.**

Pick one of the three options below. **All commands are marked DO NOT RUN without owner confirmation** (this audit is read-only).

### Option A — Leave as-is (lowest effort) ✅ default-safe
Keep both remote branches exactly as they are; this doc is the index/record. Git already preserves them. Nothing to run.

### Option B — Export the best deck into the repo's `_archive/` (keeps the asset discoverable on `main`)
Pulls the trilingual deck out of the orphan branch into the existing archive folder, so it travels with the main line and survives any future branch cleanup.

```bash
# DO NOT RUN without confirmation — writes a file to the working tree on a feature branch
git show origin/claude/pitch-deck-standalone:index.html > _archive/pitch-deck-2026-05/index.html
# (mkdir the folder first; then review, commit on a dedicated branch, open a PR)
```
After exporting, branches in Option C can be deleted with the asset preserved.

### Option C — Tag-then-delete the branches (declutter remote, keep history reachable)
Convert the branch tips to annotated tags before deleting, so the commits stay reachable (and aren't garbage-collected) without cluttering the branch list.

```bash
# DO NOT RUN without confirmation — mutates refs / deletes remote branches
git tag -a archive/pitch-deck-standalone   origin/claude/pitch-deck-standalone   -m "Archived trilingual pitch deck (2026-05-18)"
git tag -a archive/project-summary-marketing origin/claude/project-summary-marketing-rJVd8 -m "Archived first-cut pitch deck (2026-05-18)"
git push origin archive/pitch-deck-standalone archive/project-summary-marketing
git push origin --delete claude/pitch-deck-standalone
git push origin --delete claude/project-summary-marketing-rJVd8
```

### Suggested combination
**B then C** — export the trilingual deck to `_archive/` (so it's reusable on the main line), then tag-and-delete both branches to declutter. This loses nothing and keeps the remote tidy.

---

*Generated 2026-05-25. Read-only audit; no repository state was modified except the creation of this document.*
