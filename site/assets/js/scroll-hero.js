/* ──────────────────────────────────────────────────────────
   scroll-hero.js — v13
   Vanilla port of motion-primitives' ScrollExpandMedia.
   Pins the .scroll-hero section while user scrolls;
   wheel/touch input drives a 0..1 progress var that the CSS
   reads to expand the centre media + split the title outward.
   When progress hits 1, the section releases to normal scroll
   and the page continues below.

   Markup expectation (per trip page):
     <section class="scroll-hero" data-region="..."
              data-bg="path/to/bg.jpg"
              data-fg="path/to/fg.jpg"
              data-title="Sharm El Sheikh"
              data-eyebrow="Départ Constantine · Avr–Juin 2026"
              data-date="10 jours · All Inclusive Soft"
              data-prompt="Faites défiler pour découvrir">
       <div class="scroll-hero__continuation">
         <!-- traditional hero content (price, CTAs) shown after expansion -->
       </div>
     </section>

   Public API:
     window.AllianceScrollHero.init()    // re-init (idempotent)
     window.AllianceScrollHero.release() // force-release (skip animation)
   ────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // No-op if already initialised on this page
  if (window.AllianceScrollHero && window.AllianceScrollHero.__initialised) return;

  /** Tunable: how fast wheel/touch input advances progress */
  var WHEEL_SCALE = 0.0009;
  var TOUCH_SCALE = 0.005;
  var TOUCH_BACK_SCALE = 0.008;

  /** Snap thresholds: on release, where do we trigger the "done" state */
  var COMPLETE_AT = 1.0;
  var EXIT_TO_TOP_AT = 0.0; // fully back

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  /**
   * Build hero markup inside an existing <section class="scroll-hero">.
   * The section provides data-* attributes, this function injects the bg/media/title/eyebrow.
   * Idempotent: skips if already built.
   */
  function buildMarkup(section) {
    if (section.querySelector('.scroll-hero__bg')) return;

    var bg = section.dataset.bg || '';
    var fg = section.dataset.fg || '';
    var title = section.dataset.title || '';
    var eyebrow = section.dataset.eyebrow || '';
    var date = section.dataset.date || '';
    var prompt = section.dataset.prompt || 'Faites défiler';
    var skipText = section.dataset.skip || 'Passer';

    // Resolve URLs relative to the page, not the CSS file (CSS var(--url) resolves
    // relative to the CSS file that consumes it, which would mangle our paths).
    // Using new URL() with document.baseURI gives an absolute URL we can use anywhere.
    var bgURL = bg ? new URL(bg, document.baseURI).href : '';
    var fgURL = fg ? new URL(fg, document.baseURI).href : '';

    // Split title — prefer explicit data-title-pre / data-title-post (so each
    // trip page can pick the cleanest visual split), else split on first space.
    var explicitPre = section.dataset.titlePre;
    var explicitPost = section.dataset.titlePost;
    var pre, post;
    if (explicitPre || explicitPost) {
      pre = explicitPre || '';
      post = explicitPost || '';
    } else {
      var firstSpace = title.indexOf(' ');
      pre = firstSpace === -1 ? title : title.slice(0, firstSpace);
      post = firstSpace === -1 ? '' : title.slice(firstSpace + 1);
    }

    // Inject layers BEFORE any existing children (continuation card, etc.)
    var firstChild = section.firstChild;

    var bgEl = document.createElement('div');
    bgEl.className = 'scroll-hero__bg';
    bgEl.setAttribute('aria-hidden', 'true');
    if (bgURL) bgEl.style.backgroundImage = 'url("' + bgURL + '")';
    section.insertBefore(bgEl, firstChild);

    var mediaEl = document.createElement('div');
    mediaEl.className = 'scroll-hero__media';
    mediaEl.setAttribute('role', 'img');
    mediaEl.setAttribute('aria-label', title);
    if (fgURL) mediaEl.style.backgroundImage = 'url("' + fgURL + '")';
    section.insertBefore(mediaEl, firstChild);

    if (eyebrow) {
      var eyebrowEl = document.createElement('div');
      eyebrowEl.className = 'scroll-hero__eyebrow';
      eyebrowEl.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="10" r="3"/>' +
        '<path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>' +
        '</svg>' +
        '<span>' + escapeHtml(eyebrow) + '</span>';
      section.insertBefore(eyebrowEl, firstChild);
    }

    var titleEl = document.createElement('h1');
    titleEl.className = 'scroll-hero__title';
    titleEl.innerHTML =
      '<span class="scroll-hero__title-pre">' + escapeHtml(pre) + '</span>' +
      (post ? '<span class="scroll-hero__title-post">' + escapeHtml(post) + '</span>' : '');
    section.insertBefore(titleEl, firstChild);

    var captionEl = document.createElement('div');
    captionEl.className = 'scroll-hero__caption';
    captionEl.setAttribute('aria-hidden', 'true');
    captionEl.innerHTML =
      (date ? '<span class="scroll-hero__date">' + escapeHtml(date) + '</span>' : '') +
      '<span class="scroll-hero__prompt">' + escapeHtml(prompt) + '</span>';
    section.insertBefore(captionEl, firstChild);

    var skipEl = document.createElement('button');
    skipEl.type = 'button';
    skipEl.className = 'scroll-hero__skip';
    skipEl.textContent = skipText;
    skipEl.setAttribute('aria-label', 'Passer l’animation');
    section.appendChild(skipEl);
    skipEl.addEventListener('click', function (e) {
      e.preventDefault();
      release(section);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Apply progress (0..1) to the section */
  function setProgress(section, p) {
    section.style.setProperty('--p', String(p));
    section._progress = p;
  }

  /** Release the section: stop hijacking, allow normal scroll, show continuation */
  function release(section) {
    if (section.classList.contains('is-released')) return;
    setProgress(section, 1);
    section.classList.add('is-released');
    document.documentElement.classList.remove('scroll-hero-active');
    document.body.classList.remove('scroll-hero-active');
    // Clear scroll lock listeners
    section._listeners && section._listeners.forEach(function (cleanup) { cleanup(); });
    section._listeners = [];
  }

  /** Re-engage the section (used when user scrolls back to top while pinned) */
  function reengage(section) {
    section.classList.remove('is-released');
    setProgress(section, 0);
    document.documentElement.classList.add('scroll-hero-active');
    document.body.classList.add('scroll-hero-active');
    bind(section);
  }

  /** Bind wheel + touch listeners while section is active */
  function bind(section) {
    if (section._listeners && section._listeners.length) return; // already bound

    var listeners = [];
    var touchStartY = 0;
    // Grace period: ignore inputs in the first 250ms to avoid auto-release
    // from boot-time wheel events (browser scroll restoration, automation, etc.)
    var engagedAt = Date.now();
    var GRACE_MS = 250;
    function withinGrace() { return Date.now() - engagedAt < GRACE_MS; }

    function onWheel(e) {
      if (section.classList.contains('is-released')) return;
      if (withinGrace()) { e.preventDefault(); return; }
      var p = section._progress || 0;
      // If user scrolls UP at the very top while released → re-engage
      if (e.deltaY < 0 && window.scrollY <= 5 && p >= 1) {
        reengage(section);
        e.preventDefault();
        return;
      }
      e.preventDefault();
      var newP = clamp(p + e.deltaY * WHEEL_SCALE, 0, 1);
      setProgress(section, newP);
      if (newP >= COMPLETE_AT) release(section);
    }

    function onTouchStart(e) {
      touchStartY = e.touches[0].clientY;
    }
    function onTouchMove(e) {
      if (section.classList.contains('is-released')) return;
      if (withinGrace()) { e.preventDefault(); return; }
      if (!touchStartY) return;
      var touchY = e.touches[0].clientY;
      var deltaY = touchStartY - touchY;
      var p = section._progress || 0;
      if (deltaY < -20 && window.scrollY <= 5 && p >= 1) {
        reengage(section);
        e.preventDefault();
        return;
      }
      e.preventDefault();
      var scale = deltaY < 0 ? TOUCH_BACK_SCALE : TOUCH_SCALE;
      var newP = clamp(p + deltaY * scale, 0, 1);
      setProgress(section, newP);
      if (newP >= COMPLETE_AT) release(section);
      touchStartY = touchY;
    }
    function onTouchEnd() { touchStartY = 0; }

    function onScroll() {
      if (section.classList.contains('is-released')) return;
      // Hold the section pinned at top while progress < 1
      if (window.scrollY > 5) window.scrollTo(0, 0);
    }

    function onKey(e) {
      if (section.classList.contains('is-released')) return;
      // Escape skips the animation
      if (e.key === 'Escape' || e.key === 'Esc') {
        release(section);
      }
      // Space / PageDown advances; arrow up retreats
      if (e.key === ' ' || e.key === 'PageDown' || e.key === 'ArrowDown') {
        e.preventDefault();
        var p = section._progress || 0;
        var newP = clamp(p + 0.18, 0, 1);
        setProgress(section, newP);
        if (newP >= COMPLETE_AT) release(section);
      }
      if (e.key === 'PageUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        var p2 = section._progress || 0;
        var newP2 = clamp(p2 - 0.18, 0, 1);
        setProgress(section, newP2);
      }
    }

    var wheelOpts = { passive: false };
    var touchOpts = { passive: false };
    window.addEventListener('wheel', onWheel, wheelOpts);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, touchOpts);
    window.addEventListener('touchmove', onTouchMove, touchOpts);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKey);

    listeners.push(function () { window.removeEventListener('wheel', onWheel, wheelOpts); });
    listeners.push(function () { window.removeEventListener('scroll', onScroll); });
    listeners.push(function () { window.removeEventListener('touchstart', onTouchStart, touchOpts); });
    listeners.push(function () { window.removeEventListener('touchmove', onTouchMove, touchOpts); });
    listeners.push(function () { window.removeEventListener('touchend', onTouchEnd); });
    listeners.push(function () { window.removeEventListener('keydown', onKey); });

    section._listeners = listeners;
  }

  function init() {
    var sections = document.querySelectorAll('.scroll-hero');
    if (!sections.length) return;

    // Disable browser scroll restoration so we always start fresh at the hero
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Detect reduced motion → skip the pin entirely
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    sections.forEach(function (section) {
      buildMarkup(section);

      if (prefersReduced) {
        section.classList.add('is-released');
        setProgress(section, 1);
        return;
      }

      // Always start at progress 0, force scroll to top, then engage
      setProgress(section, 0);
      window.scrollTo(0, 0);
      document.documentElement.classList.add('scroll-hero-active');
      document.body.classList.add('scroll-hero-active');
      bind(section);
    });
  }

  // Public API
  window.AllianceScrollHero = {
    __initialised: true,
    init: init,
    release: function () {
      var s = document.querySelector('.scroll-hero');
      if (s) release(s);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
