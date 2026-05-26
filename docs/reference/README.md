# 📚 Reference

> Operational reference material consulted while building or maintaining the site. Each file here is a **current** specification, not a historical artifact (those live in `../_archive/`).

---

## Contents

| File | What it is | When to read it |
|---|---|---|
| [`COLOR-MAP.md`](COLOR-MAP.md) | The dark/light token system with HEX values for every CSS variable | Touching color decisions; verifying contrast |
| [`SITEMAP.md`](SITEMAP.md) | Site structure inventory — every URL, every section ID | Adding a new page; auditing internal links |
| [`IMAGE-ASSETS.md`](IMAGE-ASSETS.md) | Per-page image catalog with sources, sizes, alt text guidance | Adding/replacing imagery; running an orphan-image audit |
| [`I18N-SEO.md`](I18N-SEO.md) | **Locked policy**: runtime FR/EN/AR switcher + FR canonical SEO. Revised 2026-05-25 from "FR-only locked" to "runtime engine ships." | Changing language strategy; adding `data-i18n` attributes |
| [`CSS-DUPLICATES.md`](CSS-DUPLICATES.md) | 10 selectors with 3+ definitions in styles.css. Cascade winner per property. | Consolidating selectors; understanding which rule wins |
| [`CSS-IMPORTANT-RATIONALE.md`](CSS-IMPORTANT-RATIONALE.md) | Why 231 `!important` declarations exist. ~124 load-bearing — DO NOT REMOVE. | Before touching `!important` declarations |
| [`CSS-COLOR-AUDIT.csv`](CSS-COLOR-AUDIT.csv) | 464-row catalog: hex/rgba literals + suggested token (or `keep_local` with reason) | Bulk color → token migration |
| [`design-system/MASTER.md`](design-system/MASTER.md) | Graphic chart derivation, brand color logic, type pairing, motion language | Onboarding a new designer; brand audits |

---

## When to add to this folder

Add a doc here only if it's:
- **Operational** (used while building, not historical),
- **Up to date** (matches the current `main` HEAD),
- **Maintained** (someone updates it when the codebase shifts).

If a doc is a one-time investigation OR explicitly tied to a past milestone, it belongs in `../_archive/` instead.

---

## When to remove from this folder

A reference doc is obsolete when:
- The thing it describes no longer exists in code, AND
- The historical record is preserved elsewhere (commit history, archived doc).

Even then: prefer **moving to `../_archive/` with a header note** over deleting. The pattern from this project: rewrite, don't remove.
