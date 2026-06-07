# Alliance Travel

> Static travel website for **Alliance Travel**, a guided-tour agency based in
> Bordj Bou Arreridj, Algeria. Built for fast public demos, Cloudflare Pages
> production hosting, and WhatsApp-first lead capture.

**Live Demo:** [labssynova-coder.github.io/alliancetravel34](https://labssynova-coder.github.io/alliancetravel34/)

---

## About

Alliance Travel is a delivered client website for a guided-tour agency in
Bordj Bou Arreridj, Algeria. The project was completed as paid client work and
handed over as a production-ready static site with a live demo, deployment
workflows, verification scripts, and documentation.

This repository is a fork of the original project by
[`Brvetr4ve1er`](https://github.com/Brvetr4ve1er):

```text
https://github.com/Brvetr4ve1er/alliancetravel34
```

Credit is retained for the original repository owner. This fork contains the
cleanup, verification, documentation, and deployment work delivered under
`labssynova-coder`.

---

## Features

### Visitor Experience

- **Homepage hub** with cinematic hero, agency stats, destinations, branch map,
  and contact sections
- **Trip catalog** at `/voyages/`
- **Five trip landing pages** for Egypt, Sharm from Constantine, Istanbul,
  Azerbaijan, and Kuala Lumpur
- **Trip calculators** with DZD pricing, room choices, children, babies, and
  local USD tax notes
- **Booking form** that builds a pre-filled WhatsApp message and supports email
  or clipboard fallback
- **Runtime language switcher** for French, English, and Arabic with RTL support
- **Responsive navigation** and mobile drawer
- **Branded 404 page**

### SEO and Hosting

- JSON-LD structured data across public pages
- Open Graph and Twitter Card metadata
- `sitemap.xml` and `robots.txt`
- Cloudflare/Netlify-compatible `_headers` and `_redirects`
- Service worker for offline-friendly caching
- GitHub Pages demo workflow with no secrets required
- Cloudflare Pages production workflow, gated by tests

### Quality

- Vanilla JavaScript, no frontend framework
- No build step for the deploy target
- Unit tests for pricing and booking rules
- jsdom integration test for calculator-to-booking-form wiring
- Link and i18n verification scripts
- Dependency audit script

---

## Theme

| Element | Direction |
| --- | --- |
| Primary mood | dark travel editorial |
| Accent | mint green |
| Typography | DM Sans, with Arabic font loading on demand |
| Motion | restrained cinematic transitions |
| Layout | responsive static pages, no app shell |

The UI/theme lives in:

```text
site/assets/css/styles.css
```

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Pages | Static HTML |
| Styling | CSS custom properties |
| Logic | Vanilla JavaScript |
| Tests | Vitest + jsdom |
| Demo hosting | GitHub Pages |
| Production hosting | Cloudflare Pages |

---

## Screenshot

<p>
  <img src="docs/demo/01-homepage.png" alt="Alliance Travel homepage" width="900">
</p>

---

## Quick Start

### Prerequisites

- Node.js 20.19+
- npm

### Install and Run

```bash
git clone https://github.com/labssynova-coder/alliancetravel34.git
cd alliancetravel34
npm install
npm start
```

Open:

```text
http://127.0.0.1:5500/
```

Choose a different port:

```bash
npm start -- --port 5501
```

---

## Scripts

```bash
npm start          # serve site/ locally
npm test           # run unit and integration tests
npm run verify     # format check, tests, i18n, links
npm run verify:audit
npm run format     # format test files only
```

`npm run verify` is deterministic and runs in CI. `npm run verify:audit` is
separate because it depends on the npm registry.

---

## Project Structure

```text
alliancetravel34/
├── site/                     # deploy target
│   ├── index.html
│   ├── voyages/
│   ├── cairo-sharm/
│   ├── sharm-constantine/
│   ├── istanbul/
│   ├── azerbaidjan/
│   ├── kuala-lumpur/
│   ├── assets/css/
│   ├── assets/js/
│   └── assets/images/
├── scripts/                  # local server and verification helpers
├── tests/                    # Vitest coverage
├── docs/                     # deploy and reference docs
│   ├── demo/                 # README screenshots
│   └── reference/
├── .github/workflows/        # GitHub Pages and Cloudflare workflows
├── package.json
├── wrangler.toml
└── README.md
```

---

## Verification

Run before pushing:

```bash
npm run verify
npm run verify:audit
```

Expected result:

- 66 tests pass
- all FR/EN/AR i18n keys resolve
- sitemap, redirects, and internal links resolve
- dependency audit reports 0 vulnerabilities

---

## Deployment

### GitHub Pages Demo

The demo deploys automatically from `main` via:

```text
.github/workflows/pages.yml
```

Demo URL:

```text
https://labssynova-coder.github.io/alliancetravel34/
```

### Cloudflare Pages Production

Production deploy is configured through:

```text
.github/workflows/deploy.yml
wrangler.toml
```

Required repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

See [docs/DEPLOY.md](docs/DEPLOY.md) for details.

---

## Maintenance Notes

- Keep public UI files inside `site/`.
- Keep active docs short and current.
- Do not reintroduce historical session logs into the active tree.
- If a visible release changes cached assets, bump `CACHE_NAME` in `site/sw.js`.

---

## License

This is a delivered client project that has been paid for. The repository keeps
an MIT license notice for code reuse clarity and preserves credit for the
original fork owner. See [LICENSE](LICENSE).
