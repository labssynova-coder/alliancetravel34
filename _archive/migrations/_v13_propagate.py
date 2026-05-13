#!/usr/bin/env python3
"""
v13 propagate — replace the legacy <section class="hero"> on each trip page
with the new <section class="scroll-hero"> markup, and add the scroll-hero.js
script tag. Idempotent: re-running won't double-apply.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
SITE = ROOT / "site"

# Per-page configuration: title split, eyebrow, date, lede (kept short for hero card)
PAGES = {
    "azerbaidjan": {
        "region": "azerbaijan",
        "bg": "hero__azerbaidjan--bg.jpg",
        "fg": "hero__azerbaidjan--fg.jpg",
        "title_pre": "Bakou",
        "title_post": "& Gabala",
        "title_html": "Azerbaïdjan <em>Bakou & Gabala</em>",
        "eyebrow": "Voyage guidé · Départ Alger · 2026",
        "date": "7 nuits · 5 Bakou + 2 Gabala · Visa inclus",
        "lede": "La Cité du Feu rencontre les montagnes du Caucase. 5 nuits dans la capitale moderne de Bakou, 2 nuits au cœur des sommets de Gabala. Visa électronique inclus.",
        "price": "227.000 DA",
        "price_meta": "par personne · chambre double",
    },
    "istanbul": {
        "region": "istanbul",
        "bg": "hero__istanbul--bg.jpg",
        "fg": "hero__istanbul--fg.jpg",
        "title_pre": "Istanbul",
        "title_post": "Entre deux continents",
        "title_html": "Istanbul <em>Entre deux continents</em>",
        "eyebrow": "Départ Constantine · Turkish Airlines · Mars–Mai 2026",
        "date": "8 jours · 7 nuits · Hôtel River 3★",
        "lede": "Aya Sofya, le Grand Bazar, les îles des Princes et le Bosphore au coucher du soleil. 8 jours de découverte totale depuis l'aéroport de Constantine, chaque semaine.",
        "price": "123.000 DA",
        "price_meta": "par personne · chambre double · Hotel River 3★",
    },
    "kuala-lumpur": {
        "region": "malaysia",
        "bg": "hero__kuala-lumpur--bg.jpg",
        "fg": "hero__kuala-lumpur--fg.jpg",
        "title_pre": "Kuala",
        "title_post": "Lumpur",
        "title_html": "Kuala <em>Lumpur</em>",
        "eyebrow": "Vol direct Air Algérie · Départ Alger · Mars–Mai 2026",
        "date": "8 jours · Grand Mercure 5★",
        "lede": "Les Tours Petronas depuis le sol, le téléphérique de Genting dans les nuages, et Batu Caves en pleine forêt tropicale. 8 jours de Malaisie en vol direct depuis Alger. Grand Mercure 5★.",
        "price": "211.000 DA",
        "price_meta": "par personne · chambre double",
    },
}


def build_new_hero(slug: str, cfg: dict) -> str:
    return f"""<section class="scroll-hero" data-region="{cfg['region']}"
         data-bg="../assets/images/heroes-v2/{cfg['bg']}"
         data-fg="../assets/images/heroes-v2/{cfg['fg']}"
         data-title-pre="{cfg['title_pre']}"
         data-title-post="{cfg['title_post']}"
         data-eyebrow="{cfg['eyebrow']}"
         data-date="{cfg['date']}"
         data-prompt="Faites défiler pour découvrir"
         data-skip="Passer">
  <div class="scroll-hero__continuation">
    <h1>{cfg['title_html']}</h1>
    <p>{cfg['lede']}</p>
    <div class="hero__price">
      <strong>{cfg['price']}</strong><span>{cfg['price_meta']}</span>
    </div>
    <div class="hero__ctas">
      <a href="#calculator" class="btn btn--primary">Calculer mon prix</a>
      <a href="https://wa.me/213561616266" class="btn btn--ghost" target="_blank" rel="noopener">WhatsApp</a>
    </div>
  </div>
</section>
"""


# Match the FIRST <section class="hero" ...> ... </section> directly inside <main>.
# Uses a tolerant pattern — needs DOTALL — and stops at the matching </section>.
LEGACY_HERO_RE = re.compile(
    r'(<main[^>]*>\s*)'                          # 1: <main ...>
    r'(?:<!--[^>]*-->\s*)?'                      # optional comment
    r'(<section\s+class="hero"(?:\s[^>]*)?>'    # 2: opening of hero
    r'.*?'
    r'</section>\s*)',                           # closing
    re.DOTALL,
)


def has_v13(html: str) -> bool:
    return 'class="scroll-hero"' in html


def add_script(html: str) -> tuple[str, bool]:
    if 'scroll-hero.js' in html:
        return html, False
    new_html = html.replace(
        '<script src="../assets/js/calculator.js"></script>',
        '<script src="../assets/js/scroll-hero.js" defer></script>\n<script src="../assets/js/calculator.js"></script>',
        1,
    )
    return new_html, new_html != html


def process(slug: str) -> dict:
    path = SITE / slug / "index.html"
    if not path.exists():
        return {"slug": slug, "error": "missing"}

    cfg = PAGES[slug]
    html = path.read_text(encoding="utf-8")

    if has_v13(html):
        return {"slug": slug, "skipped": "already migrated"}

    new_hero = build_new_hero(slug, cfg)

    def replace(m):
        return m.group(1) + new_hero
    new_html, n = LEGACY_HERO_RE.subn(replace, html, count=1)
    if n == 0:
        return {"slug": slug, "error": "regex did not match legacy hero"}

    new_html, script_added = add_script(new_html)

    path.write_text(new_html, encoding="utf-8")
    return {"slug": slug, "hero_replaced": True, "script_added": script_added}


if __name__ == "__main__":
    print("v13 propagate — replacing legacy hero with scroll-hero on 3 trip pages\n")
    for slug in PAGES.keys():
        r = process(slug)
        if "error" in r:
            print(f"  [FAIL] {slug:<20} {r['error']}")
        elif "skipped" in r:
            print(f"  [SKIP] {slug:<20} {r['skipped']}")
        else:
            print(f"  [OK]   {slug:<20} hero:{r['hero_replaced']}  script:{r['script_added']}")
    print("\nDone.")
