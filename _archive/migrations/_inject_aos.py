"""
_inject_aos.py — AOS (Animate On Scroll) injection for Alliance Travel
Injects:
  1. AOS CSS link in <head> (all 6 pages)
  2. AOS JS + init script before </body> (all 6 pages)
  3. data-aos attributes on:
     - homepage: trip cards (staggered), section-head titles, value-cards
     - trip pages: hl-cards (replacing .fade-up classes), tl-day items,
       section-head__title, hotel-card divs, faq-items
"""

import re
import os

BASE = r"C:\Users\ROG STRIX\Documents\alliance travel"
SITE = os.path.join(BASE, "site")

PAGES = [
    os.path.join(SITE, "index.html"),
    os.path.join(SITE, "cairo-sharm", "index.html"),
    os.path.join(SITE, "azerbaidjan", "index.html"),
    os.path.join(SITE, "istanbul", "index.html"),
    os.path.join(SITE, "kuala-lumpur", "index.html"),
    os.path.join(SITE, "sharm-constantine", "index.html"),
]

AOS_CSS = '  <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />'

AOS_INIT = """  <!-- AOS scroll animations (michalsnik/aos) -->
  <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
  <script>
    (function () {
      var pref = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      AOS.init({
        duration: 650,
        easing:   "ease-out-cubic",
        once:     true,
        offset:   60,
        disable:  pref
      });
      /* Recalc positions after all resources load (fonts/images shift layout) */
      window.addEventListener("load", function () { AOS.refresh(); });
    })();
  </script>"""


def inject_aos_css(html, page_path):
    if "aos.css" in html:
        return html
    pattern = re.compile(
        r'(<link\s+rel="stylesheet"\s+href="(?:\.\.\/)?assets\/css\/styles\.css"[^>]*>)'
    )
    def replacer(m):
        return m.group(0) + "\n" + AOS_CSS
    result, n = pattern.subn(replacer, html)
    if n == 0:
        print("  WARNING: could not find styles.css link in " + page_path)
    return result


def inject_aos_init(html):
    if "aos.js" in html:
        return html
    return html.replace("</body>", AOS_INIT + "\n</body>")


# ── Homepage injections ────────────────────────────────────────────────────
def inject_homepage(html):
    # 1. Trip cards — staggered fade-up
    delays = [0, 100, 200, 300, 400]
    idx = [0]

    def add_trip_card_aos(m):
        tag = m.group(0)
        if "data-aos" in tag:
            return tag
        d = delays[min(idx[0], len(delays) - 1)]
        idx[0] += 1
        insert = ' data-aos="fade-up" data-aos-delay="{}" data-aos-duration="600"'.format(d)
        return tag.rstrip(">") + insert + ">"

    html = re.sub(
        r'<a\s+href="[^"]+/index\.html"\s+class="trip-card"',
        add_trip_card_aos,
        html
    )

    # 2. Section-head titles — fade-up (all h2.section-head__title)
    def add_sh_title_aos(m):
        tag = m.group(0)
        if "data-aos" in tag:
            return tag
        return tag.replace(
            '<h2 class="section-head__title"',
            '<h2 class="section-head__title" data-aos="fade-up" data-aos-duration="500"'
        )
    html = re.sub(r'<h2 class="section-head__title"', add_sh_title_aos, html)

    # 3. Value-cards — zoom-in staggered
    vc_delays = [0, 100, 200, 300]
    vc_idx = [0]
    def add_value_card_aos(m):
        tag = m.group(0)
        if "data-aos" in tag:
            return tag
        d = vc_delays[min(vc_idx[0], len(vc_delays) - 1)]
        vc_idx[0] += 1
        return tag.replace(
            '<div class="value-card"',
            '<div class="value-card" data-aos="zoom-in" data-aos-delay="{}" data-aos-duration="600"'.format(d)
        )
    html = re.sub(r'<div class="value-card"', add_value_card_aos, html)

    # 4. Section eyebrow paragraphs — fade-up
    def add_eyebrow_aos(m):
        tag = m.group(0)
        if "data-aos" in tag:
            return tag
        return tag.replace(
            '<p class="section-head__eyebrow"',
            '<p class="section-head__eyebrow" data-aos="fade-up" data-aos-duration="400"'
        )
    html = re.sub(r'<p class="section-head__eyebrow"', add_eyebrow_aos, html)

    return html


# ── Trip-page injections ───────────────────────────────────────────────────
def inject_trip_page(html):
    # 1. Replace .fade-up classes on hl-cards with data-aos attrs (longest first)
    html = html.replace(
        'class="hl-card fade-up fade-up--d3"',
        'class="hl-card" data-aos="fade-up" data-aos-delay="300" data-aos-duration="600"'
    )
    html = html.replace(
        'class="hl-card fade-up fade-up--d2"',
        'class="hl-card" data-aos="fade-up" data-aos-delay="200" data-aos-duration="600"'
    )
    html = html.replace(
        'class="hl-card fade-up fade-up--d1"',
        'class="hl-card" data-aos="fade-up" data-aos-delay="100" data-aos-duration="600"'
    )
    html = html.replace(
        'class="hl-card fade-up"',
        'class="hl-card" data-aos="fade-up" data-aos-delay="0" data-aos-duration="600"'
    )

    # 2. Timeline days — stagger fade-up (skip .tl-day.active — it's above fold)
    tl_delay = [0]
    def add_tl_day_aos(m):
        tag = m.group(0)
        if "data-aos" in tag:
            return tag
        d = tl_delay[0]
        tl_delay[0] = min(tl_delay[0] + 80, 400)
        return tag.replace(
            '<div class="tl-day"',
            '<div class="tl-day" data-aos="fade-up" data-aos-delay="{}" data-aos-duration="550"'.format(d)
        )
    html = re.sub(r'<div class="tl-day"(?=[^>]*>)', add_tl_day_aos, html)

    # 3. Section-head titles — fade-up
    def add_sh_title_aos(m):
        tag = m.group(0)
        if "data-aos" in tag:
            return tag
        return tag.replace(
            '<h2 class="section-head__title"',
            '<h2 class="section-head__title" data-aos="fade-up" data-aos-duration="500"'
        )
    html = re.sub(r'<h2 class="section-head__title"', add_sh_title_aos, html)

    # 4. Section eyebrow paragraphs — fade-up
    def add_eyebrow_aos(m):
        tag = m.group(0)
        if "data-aos" in tag:
            return tag
        return tag.replace(
            '<p class="section-head__eyebrow"',
            '<p class="section-head__eyebrow" data-aos="fade-up" data-aos-duration="400"'
        )
    html = re.sub(r'<p class="section-head__eyebrow"', add_eyebrow_aos, html)

    # 5. Hotel cards — stagger fade-up
    hc_delay = [0]
    def add_hotel_card_aos(m):
        tag = m.group(0)
        if "data-aos" in tag:
            return tag
        d = hc_delay[0]
        hc_delay[0] = min(hc_delay[0] + 60, 360)
        return tag.replace(
            '<div class="hotel-card"',
            '<div class="hotel-card" data-aos="fade-up" data-aos-delay="{}" data-aos-duration="550"'.format(d)
        )
    html = re.sub(r'<div class="hotel-card"', add_hotel_card_aos, html)

    # 6. FAQ items — stagger fade-up
    faq_delay = [0]
    def add_faq_aos(m):
        tag = m.group(0)
        if "data-aos" in tag:
            return tag
        d = faq_delay[0]
        faq_delay[0] = min(faq_delay[0] + 50, 250)
        return tag.replace(
            '<div class="faq-item"',
            '<div class="faq-item" data-aos="fade-up" data-aos-delay="{}" data-aos-duration="500"'.format(d)
        )
    html = re.sub(r'<div class="faq-item"', add_faq_aos, html)

    return html


# ── Main ──────────────────────────────────────────────────────────────────
for path in PAGES:
    if not os.path.exists(path):
        print("SKIP (not found): " + path)
        continue
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()

    print("\nProcessing: " + os.path.relpath(path, BASE))
    before_size = len(html)

    html = inject_aos_css(html, path)
    html = inject_aos_init(html)

    is_homepage = path == os.path.join(SITE, "index.html")
    if is_homepage:
        html = inject_homepage(html)
        print("  -> Applied homepage injections")
    else:
        html = inject_trip_page(html)
        print("  -> Applied trip-page injections")

    with open(path, "w", encoding="utf-8") as f:
        f.write(html)

    added = len(html) - before_size
    print("  OK saved ({:,} -> {:,} bytes, +{:,})".format(before_size, len(html), added))

print("\nAll done.")
