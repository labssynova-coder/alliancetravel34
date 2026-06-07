# 🚀 Deploy — Alliance Travel to Production

> Single source of truth for taking the site live on `alliance-travel.dz`. Targets **Cloudflare Pages** via GitHub integration (recommended path). Total active work: **~30 minutes**, plus DNS propagation.
>
> **Repo state:** single `main` branch, deploy-ready. Previous deploy guides at [`_archive/DEPLOY-old-2026-05-13.md`](_archive/DEPLOY-old-2026-05-13.md) and [`_archive/LAUNCH-AND-DEPLOY.md`](_archive/LAUNCH-AND-DEPLOY.md) are superseded by this doc.

---

## ⚡ TL;DR — the 30-minute path

```
1. Push main to GitHub                              (1 min)
2. Sign in to dash.cloudflare.com                   (2 min, free plan)
3. Workers & Pages → Create → Pages → Connect Git   (5 min)
4. Select repo labssynova-coder/alliancetravel34    (1 min)
5. Config: framework=None, build=empty, output=site (1 min)
6. Save & Deploy → wait ~30s                        (1 min)
7. Smoke-test the *.pages.dev URL (checklist below) (5 min)
8. Add custom domain alliance-travel.dz             (5 min)
9. Configure DNS at registrar → CNAME to .pages.dev (5 min + propagation)
10. Submit sitemap to Google Search Console         (2 min)
```

DNS propagation: 0 min – 24 hrs depending on registrar.

---

## ✅ What's already in place

Everything needed to deploy was shipped during v21–v22. Verified at HEAD on `main`:

### Host config
- **`site/_headers`** — Cache-Control rules: 1-hour for HTML, 1-year immutable for `/assets/*`, never-cache for `sw.js`. Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- **`site/_redirects`** — Trailing-slash normalization for all 5 trip slugs + 10 alias redirects (`/azerbaijan/` → `/azerbaidjan/`, `/turkey/` → `/istanbul/`, etc.). 301 permanent for SEO preservation.
- **`site/404.html`** — Branded error page with eyebrow + h1 + 2 CTAs + nav to all 5 trips. CF Pages auto-serves it on unmatched paths.

### SEO
- **`site/sitemap.xml`** — All 7 canonical URLs (homepage + voyages catalog + 5 trip pages) with lastmod, priority, changefreq, per-page `image:image` block.
- **`site/robots.txt`** — Crawl-friendly + Sitemap: directive. AhrefsBot/SemrushBot rate-limited.
- **17 JSON-LD blocks** across 6 pages — TravelAgency + WebSite (home), TouristTrip + Offer + BreadcrumbList + FAQPage (each trip).
- **Per-page Open Graph + Twitter Card** with dedicated 1200×630 images in `site/assets/images/og/`.
- **Single `<h1>` per page** + clean heading hierarchy.
- **`hreflang="x-default"`** declared on all 7 indexable pages, pointing to themselves (FR canonical strategy per [`reference/I18N-SEO.md`](reference/I18N-SEO.md)).

### Performance
- **Hero LCP image** preloaded via `<link rel="preload" as="image" fetchpriority="high">` on every page with responsive srcset.
- **Homepage hero collage:** tile 1 eager (LCP), tiles 2-5 lazy-injected after `window.load` + `requestIdleCallback`. Saves ~1MB upfront on slow connections.
- **AVIF + WebP + JPG** for all hero images via `<picture>` element. Modern browsers get ~30% smaller files.
- **Mobile crops** for hero images at 768px breakpoint.
- **DM Sans** via Google Fonts with `display=swap`. Cairo + Tajawal lazy-loaded only on first AR selection.
- **Service Worker** (`site/sw.js`) — network-first HTML, stale-while-revalidate assets, cache-first images. Cache name: `alliance-v22-2026-05-22`.
- **Single rAF scroll coordinator** in `enhance-pro.js` (4 listeners → 1).
- **IntersectionObserver** auto-pauses ambient animations when offscreen (`.is-paused` freeze).
- **4 canonical cubic-bezier curves + 4 canonical durations** — all motion routes through tokens.
- **AOS library removed** in v22 — replaced with extended `IntersectionObserver` in `enhance.js`. Saves 42KB cold-cache.

### Deploy automation
- **`wrangler.toml`** at repo root — config for the `wrangler pages deploy site` CLI path.
- **`.github/workflows/deploy.yml`** — auto-deploys on push to `main` (requires 2 secrets, see "Optional GitHub Actions" below).

---

## 🌐 Path A — Cloudflare Pages via GitHub integration (recommended)

No CLI, no auth on your machine, no GitHub Actions config. Cloudflare polls the GitHub repo and deploys on every push.

### 1. Push current state to GitHub

The branch is `main` (consolidated from `feat/v12-hierarchy-pass` on 2026-05-26). Push it:

```bash
git status                         # confirm clean tree (only .obsidian/ + .claude/settings.local.json untracked)
git log --oneline -5               # confirm HEAD looks right
git push origin main               # publish to GitHub
```

### 2. Create Cloudflare account + Pages project

1. Go to <https://dash.cloudflare.com> → sign up (free plan).
2. Sidebar → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**.
3. Authorize Cloudflare to access GitHub. Select repo `labssynova-coder/alliancetravel34`.
4. Configure the build:
   - **Project name:** `alliance-travel`
   - **Production branch:** `main`
   - **Framework preset:** **None**
   - **Build command:** *(leave empty)*
   - **Build output directory:** `site`
   - **Root directory:** `/` *(default)*
   - **Environment variables:** none
5. **Save and Deploy.**

Cloudflare takes ~30 seconds. You get a URL like `https://alliance-travel.pages.dev`.

### 3. Smoke-test the preview URL

Walk this checklist on the `*.pages.dev` URL:

```
[ ] /  loads, hero renders, photo collage visible
[ ] Stats counters animate (1.2K+, 98%, 5, 7+)
[ ] Globe widget renders on desktop ≥1024px (gated off on mobile)
[ ] Trip cards grid renders (5 cards, hover lift works)
[ ] Filter tabs filter trip cards
[ ] Algeria branch map loads with 3 pins
[ ] Contact form renders, phone-card grid visible
[ ] Footer renders with all contact info
[ ] /cairo-sharm/ loads, hero parallax scrolls
[ ] Calculator on cairo-sharm/, can pick dates + see price
[ ] Trip map renders with day-by-day route
[ ] All 5 trip pages load identically
[ ] Mobile drawer opens at <=900px (resize browser to 375px to test)
[ ] Language switcher works: FR → EN → AR → flips RTL → back
[ ] /404-page-that-doesnt-exist returns the branded 404.html
[ ] Trailing-slash redirect: /cairo-sharm → /cairo-sharm/ (301)
[ ] DevTools console — zero errors on every page
[ ] DevTools Network — sw.js registers without error
```

### 4. Add the custom domain

In the Pages project:

1. **Custom domains** → **Set up a custom domain** → enter `alliance-travel.dz`.
2. Cloudflare gives you DNS records to add at your registrar.
3. If using an external registrar (most common):
   - Add a **CNAME** record: `alliance-travel.dz` → `alliance-travel.pages.dev`
   - For `www.alliance-travel.dz` → same CNAME target.
4. Wait for propagation (5 min – 24 hrs). Check with `nslookup alliance-travel.dz`.

Cloudflare auto-provisions a free Let's Encrypt HTTPS certificate within minutes of DNS being correct.

### 5. Submit sitemap to Google

1. Sign in to <https://search.google.com/search-console>.
2. **Add property** → **URL prefix** → `https://alliance-travel.dz/`.
3. Verify ownership (HTML tag method is easiest — Google gives you a `<meta>` to drop into `<head>`).
4. **Sitemaps** → enter `sitemap.xml` → **Submit**.

Google starts crawling within hours; rankings appear within 1–4 weeks.

### 6. (Optional) Bing Webmaster

<https://www.bing.com/webmasters> — same flow. Bing has 5–8% global search share.

---

## ✅ Post-deploy checklist (do these once live)

| Task | Time | Why |
|---|---|---|
| Lighthouse mobile audit on `https://alliance-travel.dz` | 5 min | Verify Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 |
| Test every WhatsApp CTA on a real phone | 10 min | Confirm `wa.me/213…` deep-links open WhatsApp natively |
| Test the calculator on iPhone Safari | 5 min | Date pickers + form keyboard behavior |
| Verify maps render on mobile | 5 min | MapLibre GL touch + cooperative-zoom |
| Run schema validator on every page | 10 min | <https://validator.schema.org/> — paste each URL, expect zero errors |
| Open Facebook Sharing Debugger | 5 min | <https://developers.facebook.com/tools/debug/> — paste each URL, confirm OG image renders |
| Open Twitter Card Validator | 5 min | <https://cards-dev.twitter.com/validator> — same |
| `curl -I https://alliance-travel.dz/assets/css/styles.css` | 2 min | Verify `Cache-Control: public, max-age=31536000, immutable` |
| Verify SW registers | 2 min | DevTools → Application → Service Workers — should show active |
| Test FR→EN→AR switcher on every page | 5 min | localStorage persists across navigation |

---

## 🔄 Updating the site after launch

Cloudflare Pages auto-deploys every push to `main`:

```bash
git add -A
git commit -m "fix: typo in cairo-sharm hero"
git push
# Cloudflare deploys within ~30s
```

## 🧪 GitHub Pages demo fallback

The repo also includes `.github/workflows/pages.yml`, which publishes the
static `site/` folder to GitHub Pages without Cloudflare secrets. Use this for
quick demos while the production Cloudflare token/domain are not configured:

`https://labssynova-coder.github.io/alliancetravel34/`

Cloudflare remains the recommended production host for `alliance-travel.dz`
because it supports the checked-in `_headers`, `_redirects`, custom domain, and
edge caching rules.

### Cache-busting CSS/JS

The 1-year immutable cache means returning users won't see CSS/JS changes immediately. For high-impact changes, append a query string to the asset URL in HTML:

```html
<!-- Before -->
<link rel="stylesheet" href="assets/css/styles.css" />
<!-- After cache-bust -->
<link rel="stylesheet" href="assets/css/styles.css?v=2026-05-26" />
```

### Service worker cache

The SW (`sw.js`) cache-busts via the `CACHE_NAME` constant. **Bump it on every major release**:

```js
// site/sw.js
const CACHE_NAME = 'alliance-v23-2026-MM-DD';  // increment when shipping a major update
```

Users get the new SW on their next visit; the activate handler purges the old cache.

---

## 🔧 Path B — GitHub Actions fallback (optional, advanced)

If you want CI-driven deploys (e.g., to gate deploys on a passing test or deploy a specific branch on demand), `.github/workflows/deploy.yml` handles that. To enable:

1. Cloudflare dashboard → **My Profile** → **API Tokens** → **Create Token** → "Cloudflare Pages — Edit" template.
2. Copy the token.
3. GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - `CLOUDFLARE_API_TOKEN` = *(the token)*
   - `CLOUDFLARE_ACCOUNT_ID` = *(your account ID from CF sidebar)*
4. The workflow runs on every push to `main`. CF Pages dashboard reflects the deploy.

**This is redundant with Path A.** Use it only if you want CI gates.

---

## 🌍 Path C — Other static hosts

The site has zero server-side dependencies. Any static-file host works:

| Host | Pros | Cons |
|---|---|---|
| **Netlify** | Best DX, free CDN, simple `_headers`/`_redirects` (same syntax — no changes) | Slightly slower edge in North Africa than Cloudflare |
| **GitHub Pages** | Free, zero config | No `_headers` (no Cache-Control control), no edge CDN, no preview URLs per PR |
| **Vercel** | Same DX as Netlify, slightly different `vercel.json` syntax | Some optimizations are paid |
| **AWS S3 + CloudFront** | Maximum control | Manual cert provisioning, manual CloudFront config, paid |

The `_headers` and `_redirects` files use Cloudflare/Netlify-compatible syntax — both hosts work without changes.

---

## 🩹 Troubleshooting

**"My CSS update doesn't appear."**
Browser cached the old `styles.css` with 1-year immutable directive. Force-reload with Ctrl+F5, OR add `?v=YYYY-MM-DD` to the asset URL in HTML to break the cache.

**"Google isn't indexing the site."**
Check Search Console for crawl errors. Confirm `robots.txt` is reachable: `https://alliance-travel.dz/robots.txt`. Re-submit sitemap. Indexing takes 1–4 weeks for new domains.

**"OG image doesn't show on WhatsApp/Facebook."**
Facebook caches the first crawl. Use the Facebook Sharing Debugger to force a re-scrape: <https://developers.facebook.com/tools/debug/>.

**"Service worker is showing stale content."**
Bump `CACHE_NAME` in `sw.js` to a new release date. Push. Users get the new SW on their next visit; the activate handler purges the old cache.

**"Maps don't load."**
MapLibre GL loads from `unpkg.com` CDN. If a corporate firewall blocks it, swap to a self-hosted bundle (would require a build step, not currently in scope).

**"The language switcher works on desktop but not mobile."**
The switcher is moved into the nav drawer at ≤900px viewport. Tap the hamburger to open the drawer — switcher is inside.

**"Arabic numbers look wrong in RTL flow."**
Should be impossible — `.value-card__num`, `.price`, `.phone-card__num` explicitly set `direction: ltr; unicode-bidi: embed`. If you see broken Arabic numbers, check the element's class list against `site/assets/css/styles.css` "Arabic numerals stay LTR" block.

---

## 🌐 Production URLs (after deploy)

| URL | Purpose |
|---|---|
| `https://alliance-travel.dz/` | Homepage |
| `https://alliance-travel.dz/voyages/` | Catalog of all 5 trips |
| `https://alliance-travel.dz/cairo-sharm/` | Trip: Egypt |
| `https://alliance-travel.dz/sharm-constantine/` | Trip: Sharm El Sheikh from Constantine |
| `https://alliance-travel.dz/istanbul/` | Trip: Istanbul |
| `https://alliance-travel.dz/azerbaidjan/` | Trip: Azerbaijan |
| `https://alliance-travel.dz/kuala-lumpur/` | Trip: Malaysia |
| `https://alliance-travel.dz/sitemap.xml` | Sitemap for Google |
| `https://alliance-travel.dz/robots.txt` | Robots config |
| `https://alliance-travel.dz/site.webmanifest` | PWA manifest |
| `https://alliance-travel.dz/sw.js` | Service worker |
| `https://alliance-travel.dz/404.html` | Branded 404 (auto-served by CF Pages on miss) |

---

*Maintained alongside [`STORY.md`](STORY.md), [`AUDIT.md`](AUDIT.md), and [`LESSONS.md`](LESSONS.md). When the deploy process changes, update this doc first.*
