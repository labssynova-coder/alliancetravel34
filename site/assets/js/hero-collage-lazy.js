/**
 * Alliance Travel — Hero collage lazy injection (v22, 2026-05-22)
 *
 * The homepage hero is a 5-photo collage spread across .home-hero__photos.
 * Tile 1 is the LCP candidate and loads eagerly with fetchpriority="high".
 * Tiles 2–5 are *above the fold* but visually secondary — the browser
 * would otherwise begin downloading them in parallel with tile 1, stealing
 * bandwidth from the LCP. To prevent that we ship tiles 2–5 as inert
 * placeholders (transparent SVG data URI) and inject real <source>/<img>
 * elements only *after*:
 *   1. The window 'load' event has fired (tile 1 has had its shot).
 *   2. The browser reports an idle frame (requestIdleCallback fallback to
 *      setTimeout for Safari which still doesn't ship it).
 *
 * Each placeholder picture must carry a data-lazy-hero="<slug>" attribute
 * pointing to the asset basename (without the `hero__` prefix or extension)
 * under /assets/images/heroes/. The real source order is AVIF → WebP →
 * JPEG with mobile-cropped variants gated on (max-width: 768px), matching
 * the eager tile.
 *
 * Vanilla JS, no deps, no external state. Bails silently if the targets
 * aren't on the page (so the same script can sit in <head> on every page
 * without checking page kind).
 */
(function () {
  'use strict';

  /** Build the real <source>/<img> markup for a given trip slug. */
  function buildSources(slug) {
    var base = 'assets/images/heroes/hero__' + slug;
    // Order is critical: mobile-cropped AVIF/WebP/JPG first (media-gated to
    // <=768px), then desktop AVIF, WebP, JPG. Browser picks the first
    // matching <source> it can decode.
    var html = ''
      + '<source media="(max-width: 768px)" type="image/avif" srcset="' + base + '--mobile.avif">'
      + '<source media="(max-width: 768px)" type="image/webp" srcset="' + base + '--mobile.webp">'
      + '<source media="(max-width: 768px)" type="image/jpeg" srcset="' + base + '--mobile.jpg">'
      + '<source type="image/avif" srcset="' + base + '.avif">'
      + '<source type="image/webp" srcset="' + base + '.webp">'
      + '<img src="' + base + '.jpg" alt="" loading="lazy" decoding="async">';
    return html;
  }

  /** Replace every placeholder picture's innerHTML with real sources. */
  function inject() {
    var pictures = document.querySelectorAll('picture[data-lazy-hero]');
    if (!pictures.length) return;
    pictures.forEach(function (pic) {
      var slug = pic.getAttribute('data-lazy-hero');
      if (!slug) return;
      pic.innerHTML = buildSources(slug);
      // Strip the marker so a second invocation is a no-op.
      pic.removeAttribute('data-lazy-hero');
    });
  }

  /** Schedule the injection so it doesn't compete with the LCP. */
  function schedule() {
    var ric = window.requestIdleCallback;
    if (typeof ric === 'function') {
      ric(inject, { timeout: 1500 });
    } else {
      // Safari fallback — give the LCP ~200ms to settle.
      setTimeout(inject, 200);
    }
  }

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
})();
