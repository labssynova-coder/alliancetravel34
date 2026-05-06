#!/usr/bin/env python3
"""
v15 Batch C2/C3/C4 — analytics + SEO + noscript

C2: Add data-track-event="..." attributes on key CTAs (no analytics
    library wired up — just markup so a future plausible/GA/Matomo
    integration has stable hook names).

C3: Add FAQPage JSON-LD schema to each trip page, generated from the
    actual <div class="faq-item"> content already on the page.

C4: Add a <noscript> fallback to <section id="booking"> so users with
    JS disabled (rare but real) get a phone number + agency address
    rather than a blank section.

Idempotent.
"""
import re
import html as html_mod
from pathlib import Path

ROOT = Path(__file__).parent
SITE = ROOT / "site"

TRIP_PAGES = [
    SITE / "cairo-sharm" / "index.html",
    SITE / "sharm-constantine" / "index.html",
    SITE / "azerbaidjan" / "index.html",
    SITE / "istanbul" / "index.html",
    SITE / "kuala-lumpur" / "index.html",
]


# ─── C2 — Tracking attributes ──────────────────────────────────
TRACKING = [
    # (regex, replacement) pairs
    # Hero "Calculer mon prix" CTA
    (
        re.compile(r'(<a href="#calculator" class="btn btn--primary"(?![^>]*data-track))'),
        r'\1 data-track-event="hero_cta_calculate"',
    ),
    # Hero WhatsApp ghost CTA
    (
        re.compile(r'(<a href="https://wa\.me/213561616266" class="btn btn--ghost"(?![^>]*data-track))'),
        r'\1 data-track-event="hero_cta_whatsapp"',
    ),
    # Hotel-card select buttons
    (
        re.compile(r'(<button class="hotel-card__cta"(?![^>]*data-track))'),
        r'\1 data-track-event="hotel_select"',
    ),
    # Tier-tab filter chips — track by tier
    (
        re.compile(r'(<button class="tier-tab" role="tab" aria-pressed="(?:true|false)" data-tier="([^"]+)")(?![^>]*data-track)'),
        r'\1 data-track-event="tier_filter" data-track-label="\2"',
    ),
    # Calculator continue CTA
    (
        re.compile(r'(<a href="#booking" class="btn btn--primary btn--full"(?![^>]*data-track))'),
        r'\1 data-track-event="calc_continue_to_booking"',
    ),
    # Final CTA WhatsApp
    (
        re.compile(r'(<a href="https://wa\.me/213561616266\?text=[^"]+" class="btn btn--wa"(?![^>]*data-track))'),
        r'\1 data-track-event="final_cta_whatsapp"',
    ),
    # Final CTA phone tel:
    (
        re.compile(r'(<a href="tel:\+213561616266" class="btn btn--ghost"(?![^>]*data-track))'),
        r'\1 data-track-event="final_cta_phone"',
    ),
    # Sticky-total bar button
    (
        re.compile(r'(<button class="btn btn--primary btn--sm" id="sticky-cta-btn"(?![^>]*data-track))'),
        r'\1 data-track-event="sticky_cta_book"',
    ),
]


def patch_tracking(html: str) -> int:
    n = 0
    for pat, repl in TRACKING:
        html2, k = pat.subn(repl, html)
        if k:
            n += k
            html = html2
    return html, n


# ─── C3 — FAQPage JSON-LD ──────────────────────────────────
FAQ_ITEM_RE = re.compile(
    r'<div class="faq-item(?:\s+open)?">\s*'
    r'<button class="faq-q"[^>]*>\s*'
    r'(.*?)'                   # 1: question text (lazy, may include whitespace)
    r'\s*<svg.*?</svg>\s*'    # the chevron svg (lazy)
    r'</button>\s*'
    r'<div class="faq-a">'
    r'(.*?)'                   # 2: answer html (may contain nested tags incl <ul>)
    r'</div>\s*'
    r'</div>',
    re.DOTALL,
)


def extract_faqs(html: str) -> list:
    """Extract FAQ Q/A pairs. Strips the answer to plain text for schema."""
    out = []
    for m in FAQ_ITEM_RE.finditer(html):
        q = m.group(1).strip()
        a_html = m.group(2).strip()
        # Strip HTML tags from answer for schema (leaves just text)
        a_text = re.sub(r'<[^>]+>', ' ', a_html)
        a_text = re.sub(r'\s+', ' ', a_text).strip()
        # Decode entities
        a_text = html_mod.unescape(a_text)
        q_text = html_mod.unescape(q)
        if q_text and a_text:
            out.append((q_text, a_text))
    return out


def build_faqpage_jsonld(faqs: list) -> str:
    if not faqs:
        return ''
    questions = [
        {
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {"@type": "Answer", "text": a},
        }
        for q, a in faqs
    ]
    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions,
    }
    import json
    return (
        '<!-- AT:faqpage-jsonld START -->\n'
        '<script type="application/ld+json">\n'
        + json.dumps(schema, ensure_ascii=False, indent=2)
        + '\n</script>\n'
        '<!-- AT:faqpage-jsonld END -->\n'
    )


FAQPAGE_INSERT_RE = re.compile(r'(<!-- /enrich:meta -->)')
FAQPAGE_EXISTING_RE = re.compile(r'<!-- AT:faqpage-jsonld START -->.*?<!-- AT:faqpage-jsonld END -->', re.DOTALL)


def patch_faqpage_jsonld(html: str) -> tuple[str, bool]:
    faqs = extract_faqs(html)
    if not faqs:
        return html, False
    new_block = build_faqpage_jsonld(faqs)
    # If already present, replace it (so re-running picks up FAQ edits)
    if FAQPAGE_EXISTING_RE.search(html):
        return FAQPAGE_EXISTING_RE.sub(new_block.strip(), html), True
    # Otherwise insert before the enrich:meta closing comment if present
    if FAQPAGE_INSERT_RE.search(html):
        return FAQPAGE_INSERT_RE.sub(new_block + r'\1', html), True
    # Last resort: append to <head>
    head_close = re.compile(r'</head>')
    if head_close.search(html):
        return head_close.sub(new_block + '</head>', html), True
    return html, False


# ─── C4 — noscript fallback ──────────────────────────────────
NOSCRIPT_FALLBACK = """<noscript><div style="max-width:680px;margin:48px auto;padding:24px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:14px;text-align:center;color:#fbf8f1"><h3 style="margin:0 0 12px;font-size:1.25rem">Activez JavaScript pour réserver en ligne</h3><p style="margin:0 0 16px;color:#c9cdd4;line-height:1.6">Le formulaire de réservation interactif requiert JavaScript. En attendant, vous pouvez nous contacter directement&nbsp;:</p><p style="margin:0;font-size:1.0625rem"><a href="https://wa.me/213561616266" style="color:#9ce8b2;font-weight:600;text-decoration:none">WhatsApp&nbsp;: 0561 616 266</a><br><br><a href="tel:+213561616266" style="color:#9ce8b2;text-decoration:none">Téléphone&nbsp;: 0561 616 266</a></p></div></noscript>
"""

# Match the booking section (open + content + close) so we can insert
# noscript AFTER it. booking-form.js overwrites the section's innerHTML
# on init, so anything INSIDE would get wiped — outside is safe.
NOSCRIPT_INSERT_RE = re.compile(
    r'(<section class="booking-section section" id="booking"[^>]*>.*?</section>)',
    re.DOTALL,
)
NOSCRIPT_EXISTING_RE = re.compile(r'<noscript>.*?Activez JavaScript pour r[ée]server', re.DOTALL)


def patch_noscript(html: str) -> tuple[str, bool]:
    # Remove any existing fallback first so we relocate it cleanly
    cleaned = NOSCRIPT_EXISTING_RE.sub('', html)
    cleaned = re.sub(r'<noscript>.*?</noscript>\s*', lambda m: m.group(0) if 'Activez JavaScript' not in m.group(0) else '', cleaned, flags=re.DOTALL)
    new_html, n = NOSCRIPT_INSERT_RE.subn(r'\1\n' + NOSCRIPT_FALLBACK, cleaned, count=1)
    return new_html, n > 0


# ─── Driver ──────────────────────────────────────────────────
def process(path: Path) -> dict:
    if not path.exists():
        return {"slug": path.parent.name, "error": "missing"}
    slug = path.parent.name
    original = path.read_text(encoding="utf-8")
    html = original

    html, tracking_n = patch_tracking(html)
    html, faqpage_added = patch_faqpage_jsonld(html)
    html, noscript_added = patch_noscript(html)

    changed = html != original
    if changed:
        path.write_text(html, encoding="utf-8")
    return {
        "slug": slug,
        "changed": changed,
        "tracking_attrs": tracking_n,
        "faqpage_jsonld": faqpage_added,
        "noscript_added": noscript_added,
    }


if __name__ == "__main__":
    print("v15 Batch C2/C3/C4 — tracking + FAQPage SEO + noscript fallback\n")
    print(f"  {'page':<22} {'tracking':<10} {'faqpage':<8} {'noscript':<9}")
    for path in TRIP_PAGES:
        r = process(path)
        if r.get("error"):
            print(f"  [SKIP] {r['slug']:<20} {r['error']}")
            continue
        flag = "OK" if r["changed"] else "--"
        print(f"  [{flag}] {r['slug']:<20} {r['tracking_attrs']:<10} {int(r['faqpage_jsonld']):<8} {int(r['noscript_added']):<9}")
    print("\nDone.")
