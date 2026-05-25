/**
 * Alliance Travel — Site enhancements
 * - Animated stat counters
 * - Scroll-triggered reveals (staggered)
 * - Share button (Web Share API + WhatsApp fallback)
 * - Trip quick-switcher dropdown
 * - Toast notifications
 *
 * Respects prefers-reduced-motion. Vanilla JS, no deps.
 */

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ─── Stat counters ────────────────────────────────────────
   On a fresh visit, the counter animates 0 → target which adds polish
   but feels repetitive on every page reload (and ever-so-slightly
   dishonest for a brief moment — "0.2K voyageurs"). Use sessionStorage
   to mark "already played"; subsequent counters in the same session
   (including across page navigations) just snap to final. */
const COUNTER_PLAYED_KEY = 'at-counters-played';
function _counterAlreadyPlayed() {
  try {
    return sessionStorage.getItem(COUNTER_PLAYED_KEY) === '1';
  } catch (e) {
    return false;
  }
}
function _markCountersPlayed() {
  try {
    sessionStorage.setItem(COUNTER_PLAYED_KEY, '1');
  } catch (e) { /* private mode / disabled storage */ }
}

function animateCounter(el) {
  // If reduced-motion OR counters already played this session: snap to final
  if (reducedMotion || _counterAlreadyPlayed()) {
    el.textContent = el.dataset.counterFormat
      ? el.dataset.counterFormat.replace('{n}', el.dataset.counter)
      : el.dataset.counter;
    return;
  }
  const target = parseFloat(el.dataset.counter);
  const format = el.dataset.counterFormat || '{n}';
  const dur    = parseInt(el.dataset.counterDuration || '1600');
  const start  = performance.now();

  function step(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const cur = target * eased;
    let display;
    if (target >= 1000)      display = (cur / 1000).toFixed(cur >= target * 0.95 ? 1 : 1).replace('.0', '');
    else if (target >= 100)  display = Math.floor(cur);
    else                     display = (Math.round(cur * 10) / 10).toString().replace(/\.0$/, '');
    el.textContent = format.replace('{n}', display);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      // Animation finished — mark this session as having played the counters
      // so subsequent reloads / navigations show final values immediately.
      _markCountersPlayed();
    }
  }
  requestAnimationFrame(step);
}

/* ─── Scroll reveals with stagger ──────────────────────────
   Unified reveal system (v22): handles legacy `.reveal` /
   `.reveal-stagger` classes AND `data-aos` attributes (replaced AOS
   library 2026-05-22). Reads optional `data-aos-delay` (ms) and
   `data-aos-duration` (ms) — applied inline so per-element timing
   tracks the same values the AOS markup specified. The CSS variant
   per `data-aos` value lives in styles.css under "AOS-compat reveal". */
function initRevealObserver() {
  const els = document.querySelectorAll(
    '.reveal, .reveal-stagger > *, [data-counter], [data-aos]'
  );
  if (!els.length) return;

  // Reduced motion: skip animation entirely, mark every element visible now
  if (reducedMotion) {
    els.forEach(el => {
      el.classList.add('visible');
      if (el.hasAttribute('data-counter')) animateCounter(el);
    });
    return;
  }

  // Mark stagger children with index for sequential reveal
  document.querySelectorAll('.reveal-stagger').forEach(parent => {
    [...parent.children].forEach((child, i) => {
      child.style.setProperty('--i', i);
      if (!child.classList.contains('reveal')) child.classList.add('reveal');
    });
  });

  // Per-element timing from data-aos-* attributes — applied as CSS vars so
  // the transition rule in styles.css can pick them up without extra JS.
  els.forEach(el => {
    if (el.hasAttribute('data-aos')) {
      const delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10);
      const dur   = parseInt(el.getAttribute('data-aos-duration') || '650', 10);
      if (delay) el.style.setProperty('--aos-delay', delay + 'ms');
      if (dur)   el.style.setProperty('--aos-duration', dur + 'ms');
    }
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');
      if (el.hasAttribute('data-counter')) animateCounter(el);
      obs.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
}

/* ─── Toast notifications ─────────────────────────────────── */
function showToast(msg, kind = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast toast--${kind}`;
  toast.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>${msg}`;
  // Force reflow before adding .show class so transition fires
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ─── Share button on trip cards ──────────────────────────── */
async function shareTrip(url, title, text) {
  if (navigator.share) {
    try { await navigator.share({ url, title, text }); return; } catch (e) { /* user cancel */ }
  }
  // Fallback: WhatsApp share URL
  const wa = `https://wa.me/?text=${encodeURIComponent(`${title}\n${text}\n${url}`)}`;
  window.open(wa, '_blank', 'noopener');
}

function initTripCardShares() {
  document.querySelectorAll('.trip-card').forEach(card => {
    if (card.querySelector('.trip-card__share')) return;
    const btn = document.createElement('button');
    btn.className = 'trip-card__share';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Partager ce voyage');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>`;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const title = card.querySelector('.trip-card__title')?.textContent.trim() || 'Voyage Alliance Travel';
      const flag  = card.querySelector('.trip-card__flag')?.textContent.trim() || '';
      const price = card.querySelector('.trip-card__from')?.textContent.replace(/\s+/g, ' ').trim() || '';
      const url   = new URL(card.getAttribute('href'), location.href).toString();
      shareTrip(url, `${title} — Alliance Travel`, `${flag}\n${price}`);
    });
    card.appendChild(btn);
  });
}

/* ─── Trip quick-switcher in nav ──────────────────────────── */
const ALL_TRIPS = [
  { slug: 'cairo-sharm',       name: 'Le Caire & Sharm El Sheikh',  price: '190.000 DA', color: '#C9872E', sub: 'Égypte · Juin 2026' },
  { slug: 'azerbaidjan',       name: 'Azerbaïdjan · Bakou & Gabala', price: '219.000 DA', color: '#3AAFAF', sub: 'Avril–Juillet 2026' },
  { slug: 'istanbul',          name: 'Istanbul',                     price: '123.000 DA', color: '#5B9EC9', sub: 'Mars–Mai 2026' },
  { slug: 'kuala-lumpur',      name: 'Kuala Lumpur · Malaisie',     price: '211.000 DA', color: '#4CAF82', sub: 'Mars–Mai 2026' },
  { slug: 'sharm-constantine', name: 'Sharm El Sheikh · Constantine', price: '155.000 DA', color: '#28B4D4', sub: 'Avr–Juin 2026' },
];

function initTripSwitcher() {
  const nav = document.querySelector('.site-nav');
  if (!nav || nav.querySelector('.trip-switcher')) return;

  // Detect current trip from path
  const currentSlug = location.pathname.split('/').filter(Boolean).pop()?.replace('.html','') || '';
  const isHomepage = currentSlug === 'site' || currentSlug === '' || currentSlug === 'index';
  if (isHomepage) return; // Don't show on homepage

  // Build the switcher
  const wrap = document.createElement('div');
  wrap.className = 'trip-switcher';
  wrap.innerHTML = `
    <button class="trip-switcher__trigger" type="button" aria-haspopup="true" aria-expanded="false">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      <span>Tous les voyages</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    <div class="trip-switcher__menu" role="menu">
      ${ALL_TRIPS.map(t => `
        <a class="trip-switcher__item ${t.slug === currentSlug ? 'current' : ''}"
           href="../${t.slug}/" role="menuitem">
          <span class="trip-switcher__item-flag" style="background:${t.color}"></span>
          <span class="trip-switcher__item-name">
            ${t.name}
            <span style="display:block;font-size:.6875rem;color:var(--txt-3);font-weight:400;letter-spacing:0;margin-top:1px">${t.sub}</span>
          </span>
          <span class="trip-switcher__item-price">dès ${t.price}</span>
        </a>`).join('')}
    </div>
  `;

  // Insert before the nav-cta
  const cta = nav.querySelector('.nav-cta');
  if (cta) {
    nav.insertBefore(wrap, cta);
  } else {
    nav.appendChild(wrap);
  }

  // Toggle
  const trigger = wrap.querySelector('.trip-switcher__trigger');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.toggle('open');
    trigger.setAttribute('aria-expanded', wrap.classList.contains('open') ? 'true' : 'false');
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      wrap.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ─── Smooth-scroll for anchor links ──────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
}

/* ─── Add subtle parallax on hero based on mouse (desktop) ── */
function initHeroParallax() {
  if (reducedMotion) return;
  const heroes = document.querySelectorAll('.hero__visual');
  if (!heroes.length || window.innerWidth < 1024) return;

  heroes.forEach(hero => {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
      const art = hero.querySelector('.hero__visual-art > svg');
      if (art) art.style.transform = `translate(${-x}px, ${-y}px)`;
    });
    hero.addEventListener('mouseleave', () => {
      const art = hero.querySelector('.hero__visual-art > svg');
      if (art) art.style.transform = '';
    });
  });
}

/* ─── Mobile nav drawer ─────────────────────────────────────
   Builds the hamburger button + drawer panel + backdrop on first
   run, then moves the existing right-side controls (nav-links,
   lang-switcher, theme-toggle, nav-cta) into the drawer. The drawer
   wrapper has `display: contents` at desktop so the layout is
   identical to pre-drawer at ≥901px. */
function initNavDrawer() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  // Wait one tick so i18n.js can finish building .lang-switcher first.
  // (i18n.js runs before this script via defer + DOMContentLoaded order,
  //  but if the switcher is built async this still catches it.)
  if (!nav.querySelector('.lang-switcher')) {
    return setTimeout(initNavDrawer, 50);
  }

  /* ── 1. Hamburger button ── */
  let btn = nav.querySelector('.nav-hamburger');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'nav-hamburger';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Ouvrir le menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'nav-drawer');
    btn.innerHTML = `
      <svg class="icon-menu" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="3" y1="6"  x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
      <svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6"  x2="6"  y2="18"/>
        <line x1="6"  y1="6"  x2="18" y2="18"/>
      </svg>`;
    nav.appendChild(btn);
  }

  /* ── 2. Drawer container ── */
  let drawer = nav.querySelector('.nav-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.className = 'nav-drawer';
    drawer.id = 'nav-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Menu de navigation');
    drawer.setAttribute('aria-hidden', 'true');

    // Move (not clone) right-side controls into the drawer so existing
    // event listeners (lang-switcher click, theme toggle, i18n bindings)
    // survive intact.
    ['.nav-links', '.lang-switcher', '.theme-toggle', '.nav-cta'].forEach((sel) => {
      const el = nav.querySelector(`:scope > ${sel}`);
      if (el) drawer.appendChild(el);
    });

    // Drawer is appended INSIDE .site-nav so at desktop its `display: contents`
    // declaration makes its children become flex items of .site-nav. On mobile,
    // a CSS rule strips .site-nav's backdrop-filter at <=900px so the drawer's
    // position:fixed escapes the nav's containing block and resolves to the
    // viewport (fills full height + slides from edge).
    nav.appendChild(drawer);
  }

  /* ── 3. Backdrop overlay (under drawer, over page content) ── */
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  /* ── 4. Open / close ── */
  const setOpen = (open) => {
    nav.classList.toggle('nav-open', open);
    drawer.classList.toggle('is-open', open);            // drives drawer transform
    backdrop.classList.toggle('is-visible', open);
    document.body.classList.toggle('nav-scroll-lock', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (open) {
      // Move focus to first interactive in drawer (accessibility)
      const firstFocusable = drawer.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
      requestAnimationFrame(() => firstFocusable?.focus({ preventScroll: true }));
    } else {
      btn.focus({ preventScroll: true });
    }
  };

  /* ── 5. Wire events ── */
  btn.addEventListener('click', () => setOpen(!nav.classList.contains('nav-open')));
  backdrop.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      setOpen(false);
    }
  });

  // Auto-close when a nav link is tapped (gives immediate UI feedback that
  // navigation has been initiated). Skip the lang buttons + theme toggle so
  // users can switch language/theme without the drawer disappearing.
  drawer.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (link && !link.closest('.lang-switcher, .theme-toggle')) {
      setTimeout(() => setOpen(false), 200);
    }
  });

  // If viewport widens past 900px while drawer is open (rotation, resize),
  // close it so the desktop layout takes over cleanly.
  let resizeRaf;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      if (window.innerWidth > 900 && nav.classList.contains('nav-open')) {
        setOpen(false);
      }
    });
  });
}

/* ─── Boot ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initRevealObserver();
  initTripCardShares();
  initTripSwitcher();
  initSmoothScroll();
  initHeroParallax();
  initNavDrawer();   // v22 Phase 3 — mobile nav drawer
});

// Export toast for other scripts
window.AT_showToast = showToast;


/* ─── Safe localStorage wrapper ──────────────────────────────────
   Safari private mode and some embedded webviews throw on setItem.
   This wrapper makes every call a no-op on failure so the UI keeps
   working even if persistence isn't available. */
const safeStorage = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  remove(k) { try { localStorage.removeItem(k); return true; } catch (e) { return false; } }
};

/* ─── Theme switcher (added in migration v2) ────────────────── */
function initThemeSwitcher() {
  const root = document.documentElement;
  const KEY = 'at-theme';

  // Initial: stored preference > system preference > dark
  const stored = safeStorage.get(KEY);
  const sysLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  const initial = stored || (sysLight ? 'light' : 'dark');
  if (initial === 'light') root.setAttribute('data-theme', 'light');

  // Bind toggle buttons (one per page typically in nav)
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
        safeStorage.set(KEY, 'dark');
      } else {
        root.setAttribute('data-theme', 'light');
        safeStorage.set(KEY, 'light');
      }
    });
  });

  // React to system preference changes if user hasn't explicitly chosen
  if (!stored) {
    window.matchMedia?.('(prefers-color-scheme: light)')?.addEventListener?.('change', e => {
      if (safeStorage.get(KEY)) return;
      if (e.matches) root.setAttribute('data-theme', 'light');
      else root.removeAttribute('data-theme');
    });
  }
}

document.addEventListener('DOMContentLoaded', initThemeSwitcher);

/* ─── Service worker registration ───────────────────────────────
   Stale-while-revalidate cache for fonts/images/CSS so repeat
   visits load near-instantly and the site is browsable offline.
   Skipped on http://localhost (avoids cache surprises in dev) AND
   when the page is served from file:// (no SW context). */
if ('serviceWorker' in navigator
    && location.protocol === 'https:'
    && location.hostname !== 'localhost') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {/* fail silent */});
  });
}
