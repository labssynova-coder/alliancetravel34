# Deploy

Alliance Travel is a static site. The deploy target is the `site/` directory.

## Live Demo

GitHub Pages publishes the public demo from `main`:

<https://labssynova-coder.github.io/alliancetravel34/>

Workflow:

```text
.github/workflows/pages.yml
```

The workflow runs `npm run verify`, uploads `site/`, and deploys it through
GitHub Pages. It does not need Cloudflare secrets.

## Production

Recommended production host:

```text
Cloudflare Pages
Project name: alliance-travel
Output directory: site
Build command: empty
```

Production workflow:

```text
.github/workflows/deploy.yml
```

Required GitHub repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

Without those secrets the quality gate will pass, but the Cloudflare deploy step
will fail before upload.

## Manual Cloudflare Setup

1. Open <https://dash.cloudflare.com/>.
2. Go to Workers & Pages.
3. Create a Pages project from Git.
4. Select `labssynova-coder/alliancetravel34`.
5. Use:
   - Framework preset: None
   - Build command: empty
   - Build output directory: `site`
   - Production branch: `main`
6. Save and deploy.
7. Add the production domain when ready.

## Custom Domain

Target production domain:

```text
alliance-travel.dz
```

Add the domain in Cloudflare Pages, then configure the DNS records Cloudflare
gives you at the registrar. Cloudflare will issue HTTPS after DNS is correct.

## Pre-Deploy Checks

Run locally before pushing:

```bash
npm run verify
npm run verify:audit
```

Expected:

- format check passes
- 66 tests pass
- i18n keys resolve for FR, EN, and AR
- internal links, sitemap entries, and redirects resolve
- npm audit reports 0 vulnerabilities

## Smoke Checklist

After any deploy:

- `/` returns 200 and shows the homepage hero
- `/voyages/` returns 200
- each trip page returns 200
- `/missing-demo-page/` returns the branded 404 page
- calculator updates the trip total
- booking form opens a `wa.me/213561616266` link after valid contact fields
- language switcher works for FR, EN, and AR
- mobile drawer opens under 900px
- browser console has no blocking errors

## Cache Notes

HTML is short-cached. Assets are long-cached through `site/_headers`.

When shipping a major visible update, bump the service-worker cache name in:

```text
site/sw.js
```

The constant is:

```js
const CACHE_NAME = 'alliance-v...';
```
