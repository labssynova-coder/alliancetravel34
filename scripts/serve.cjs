/* Dependency-free local static server for the deploy target.
   Mirrors the no-build Cloudflare Pages shape closely enough for local demos:
   directory URLs serve index.html, missing paths serve 404.html, and assets
   get a useful Content-Type. */
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');

function argValue(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

const HOST = argValue('--host') || process.env.HOST || '127.0.0.1';
const PORT = Number(argValue('--port') || process.env.PORT || 5500);

const TYPES = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function safePath(urlPath) {
  const requested = path.resolve(SITE, `.${decodeURIComponent(urlPath)}`);
  return requested.toLowerCase().startsWith(SITE.toLowerCase()) ? requested : null;
}

function fileFor(urlPath) {
  let file = safePath(urlPath);
  if (!file) return { file: null, status: 403 };
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file)) {
    return { file: path.join(SITE, '404.html'), status: 404 };
  }
  return { file, status: 200 };
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}:${PORT}`);
    const { file, status } = fileFor(url.pathname);
    if (!file) {
      res.writeHead(status);
      res.end('Forbidden');
      return;
    }
    res.writeHead(status, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
    });
    fs.createReadStream(file).pipe(res);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(String(error));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Alliance Travel local demo: http://${HOST}:${PORT}/`);
  console.log(`Serving ${SITE}`);
});
