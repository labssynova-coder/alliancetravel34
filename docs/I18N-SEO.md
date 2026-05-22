# I18N + SEO Strategy

**Owner:** Agent 4 (v22). **Decided:** 2026-05-22. **Status:** locked.

## Decision: Strategy (c) — accept FR-only indexing

Alliance Travel serves Algerian outbound travelers from Bordj Bou Arreridj. French is the dominant search language for educated Algerian travelers; EN/AR are diaspora UX nice-to-haves, not ranking surfaces. We pick (c).

## Rationale (50 words)

The agency has no international-expansion goal. FR is the conversion language. Pre-rendered EN/AR subpaths would triple content-maintenance load against zero measurable upside, and query-param variants pollute SERPs without ranking benefit. A single canonical FR site with `hreflang="x-default"` is honest, cheap, and correct.

## Implementation

- Every indexable page keeps `<html lang="fr">` hardcoded (no runtime language swap ships today — see below).
- Every indexable page gets `<link rel="alternate" hreflang="x-default" href="https://alliance-travel.dz{path}"/>` declaring the FR URL as the default for all languages.
- `sitemap.xml` and `robots.txt` need no changes — there are no language variants to declare.
- The 404 page stays untouched (`noindex,nofollow`).

## Premise correction

The engagement brief described an existing `site/assets/js/i18n.js`. **No such file exists in the repo.** The only artefact is a stashed WIP (`stash@{1}: wip(i18n): runtime engine + scaffolding`) that touches 9 files and 939 lines and was never merged.

Under strategy (c), brief-deliverables 2 (extend dictionary) and 3 (add `data-i18n` attrs) **collapse**: no engine to extend, no consumer for `data-i18n`. We do not build one, because shipping EN/AR without copywriter review would mismanage the brand voice.

## When to revisit

Switch to strategy (a) — subpath `/en/` `/ar/` — when one of:
- Agency closes a B2B contract requiring an Arabic-first surface.
- WhatsApp inbound shows >15% non-FR enquiries for two consecutive months.
- A FR→AR (MSA) + FR→EN copywriter is on retainer.

Until then, bare FR URL with `hreflang="x-default"` is the policy.
