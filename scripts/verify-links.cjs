/* SEO / link-integrity check (CI gate).
   Dependency-free. Verifies that the site's internal references are coherent:
     1. every <loc> in sitemap.xml maps to a real page,
     2. every internal _redirects destination resolves to a real page,
     3. every internal href/src/srcset across all HTML pages resolves to a
        real file (or dir/index.html, or a known redirect source).
   Exits non-zero (with a report) on any broken reference so the deploy
   workflow can block on it. Run via `npm run verify:links`. */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');

const problems = [];
const fail = (where, msg) => problems.push(`  ✗ ${where}\n      ${msg}`);

/* ── filesystem helpers ──────────────────────────────────────────── */
function isFile(abs) {
  try { return fs.statSync(abs).isFile(); } catch (_) { return false; }
}

/* Resolve a site-root-relative path ("/cairo-sharm/", "assets/x.css") to a
   real file under site/. Directory-style paths resolve to their index.html. */
function targetExists(relFromSiteRoot) {
  let rel = relFromSiteRoot.replace(/^\/+/, '');
  if (rel === '') rel = 'index.html';
  if (isFile(path.join(SITE, rel))) return true;
  // Directory (trailing slash) or extensionless → try /index.html
  const asIndex = path.join(SITE, rel.replace(/\/+$/, ''), 'index.html');
  return isFile(asIndex);
}

/* Recursively collect every *.html file under site/ */
function htmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(abs, acc);
    else if (entry.isFile() && entry.name.endsWith('.html')) acc.push(abs);
  }
  return acc;
}

/* Normalise a path for redirect-source comparison (no leading/trailing slash). */
const norm = (p) => p.replace(/^\/+/, '').replace(/\/+$/, '');

/* ── parse _redirects (source → dest → status) ───────────────────── */
const redirectSources = new Set();
const redirectsPath = path.join(SITE, '_redirects');
const VALID_STATUS = new Set(['200', '301', '302', '404']);

if (isFile(redirectsPath)) {
  const lines = fs.readFileSync(redirectsPath, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [source, dest, status] = trimmed.split(/\s+/);
    if (!source || !dest) {
      fail(`_redirects:${i + 1}`, `malformed rule: "${trimmed}"`);
      return;
    }
    redirectSources.add(norm(source));
    if (status && !VALID_STATUS.has(status)) {
      fail(`_redirects:${i + 1}`, `unknown status code "${status}" (expected 200/301/302/404)`);
    }
    // Validate internal destinations only (skip external http(s) targets).
    if (dest.startsWith('/') && !targetExists(dest)) {
      fail(`_redirects:${i + 1}`, `destination "${dest}" does not resolve to a page`);
    }
  });
}

/* ── 1. sitemap <loc> → real page ────────────────────────────────── */
const sitemapPath = path.join(SITE, 'sitemap.xml');
let sitemapCount = 0;
if (isFile(sitemapPath)) {
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]);
  for (const loc of locs) {
    sitemapCount++;
    let urlPath;
    try { urlPath = new URL(loc).pathname; } catch (_) { urlPath = loc; }
    if (!targetExists(urlPath)) {
      fail('sitemap.xml', `<loc>${loc}</loc> → no page at "${urlPath}"`);
    }
  }
} else {
  fail('sitemap.xml', 'file missing');
}

/* ── 2. internal href/src/srcset across all pages ────────────────── */
const SKIP = /^(https?:|\/\/|mailto:|tel:|data:|javascript:|#)/i;

function checkRef(raw, pageDirRel, pageLabel) {
  let v = (raw || '').trim();
  if (!v || SKIP.test(v)) return;
  v = v.split('#')[0].split('?')[0];        // drop fragment + query
  if (!v) return;                            // was a pure #fragment
  // Resolve to a site-root-relative path
  const rel = v.startsWith('/')
    ? v
    : path.posix.join(pageDirRel, v);
  if (targetExists(rel)) return;
  if (redirectSources.has(norm(rel))) return; // CF will redirect this — fine
  fail(pageLabel, `broken reference "${raw}" → "${rel.replace(/^\/?/, '/')}"`);
}

const pages = htmlFiles(SITE);
let refCount = 0;
for (const abs of pages) {
  const html = fs.readFileSync(abs, 'utf8');
  const pageLabel = path.relative(ROOT, abs);
  const pageDirRel = path.posix.relative(SITE, path.dirname(abs)) || '.';

  // href="" and src=""
  for (const m of html.matchAll(/(?:href|src)\s*=\s*"([^"]*)"/gi)) {
    refCount++;
    checkRef(m[1], pageDirRel, pageLabel);
  }
  // srcset="" — comma-separated "url descriptor" candidates
  for (const m of html.matchAll(/srcset\s*=\s*"([^"]*)"/gi)) {
    for (const candidate of m[1].split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) { refCount++; checkRef(url, pageDirRel, pageLabel); }
    }
  }
}

/* ── report ──────────────────────────────────────────────────────── */
console.log('Link integrity check');
console.log(`  pages scanned       : ${pages.length}`);
console.log(`  sitemap <loc> URLs  : ${sitemapCount}`);
console.log(`  redirect rules      : ${redirectSources.size}`);
console.log(`  references checked  : ${refCount}`);

if (problems.length) {
  console.error(`\n❌ ${problems.length} broken reference(s):\n`);
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('\n✓ All internal references, sitemap entries, and redirects resolve.');
