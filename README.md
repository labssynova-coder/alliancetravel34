# Alliance Travel

Static travel-agency website for Alliance Travel in Bordj Bou Arreridj, Algeria.

The site is intentionally simple: hand-written HTML, one CSS file, vanilla
browser JavaScript, no backend, no build step, and no framework. Trip inquiry
flows open a pre-filled WhatsApp message, with email and clipboard fallbacks.

Live demo:

- GitHub Pages: <https://labssynova-coder.github.io/alliancetravel34/>
- Production target: Cloudflare Pages, project `alliance-travel`

## Quick Start

```bash
npm install
npm start
```

Open <http://127.0.0.1:5500/>.

Use a different port when needed:

```bash
npm start -- --port 5501
```

## Scripts

```bash
npm start          # serve site/ locally with no extra dependency
npm test           # run Vitest unit + jsdom integration tests
npm run verify     # format check, tests, i18n coverage, link integrity
npm run verify:audit
npm run format     # format test files only
```

`npm run verify` is the deterministic CI gate. `npm run verify:audit` is kept
separate because it depends on the npm registry being reachable.

## Project Layout

```text
.
├── site/                    # deploy target
│   ├── index.html
│   ├── voyages/
│   ├── cairo-sharm/
│   ├── sharm-constantine/
│   ├── istanbul/
│   ├── azerbaidjan/
│   ├── kuala-lumpur/
│   ├── assets/css/styles.css
│   └── assets/js/
├── scripts/                 # local server and verification helpers
├── tests/                   # Vitest coverage for pricing and booking logic
├── docs/                    # deployment and reference docs
├── .github/workflows/       # GitHub Pages demo and Cloudflare deploy workflows
└── wrangler.toml            # Cloudflare Pages config
```

## Stack

- HTML5 static pages
- CSS custom properties and a single `site/assets/css/styles.css`
- Vanilla browser JavaScript
- Vitest + jsdom for client-side business logic
- Cloudflare Pages for production hosting
- GitHub Pages for a no-secrets public demo

## Verification

Before pushing:

```bash
npm run verify
npm run verify:audit
```

Expected result:

- 66 Vitest tests pass
- all i18n keys resolve for FR, EN, and AR
- sitemap, redirects, and internal references resolve
- npm audit reports 0 vulnerabilities

## Deployment

GitHub Pages demo deploys automatically from `main` with
`.github/workflows/pages.yml`.

Cloudflare production deploy is configured in `.github/workflows/deploy.yml`
and `wrangler.toml`. It requires these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

See [docs/DEPLOY.md](docs/DEPLOY.md) for the production checklist.

## Maintenance Notes

- Keep UI/theme changes inside `site/`.
- Keep testable business rules in `site/assets/js/calculator.js` and
  `site/assets/js/booking-form.js`.
- If `site/` changes in a user-visible way, consider bumping `CACHE_NAME` in
  `site/sw.js`.
- Historical cleanup notes were removed from the active tree; recover them from
  git history if needed.
