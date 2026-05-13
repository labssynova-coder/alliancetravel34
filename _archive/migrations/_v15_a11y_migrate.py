#!/usr/bin/env python3
"""
v15 — accessibility + transparency migration.

Batch A4: Add aria-live to breakdown, aria-label to stepper buttons,
          tabindex/role to date chips, role=tablist to tier-tabs.

Batch B3: Inject "à partir de" fineprint near hero price (continuation card)
          and "Prix hors taxe" disclaimer near calculator CTA on KL.

Batch B4: Hide hotel select on single-hotel pages by adding a class.

Idempotent: re-running won't double-apply.
"""
import re
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


# ─── 1. aria-live on breakdown ────────────────────────────────────
# The breakdown lines list and total amount need aria-live so screen
# readers announce price changes when the user toggles inputs.
BREAKDOWN_LINES_RE = re.compile(
    r'(<div class="breakdown__lines" id="breakdown-lines")(?!\s+aria-live)([^>]*>)'
)
BREAKDOWN_TOTAL_RE = re.compile(
    r'(<span class="breakdown__total-amount" id="breakdown-total")(?!\s+aria-live)([^>]*>)'
)


# ─── 2. aria-label on stepper buttons ────────────────────────────
# The − / + symbols read poorly to screen readers. Add explicit labels.
# Pattern: <button class="stepper__btn" id="adults-minus">−</button>
ADULTS_MINUS_RE = re.compile(
    r'<button class="stepper__btn" id="adults-minus">−</button>'
)
ADULTS_PLUS_RE = re.compile(
    r'<button class="stepper__btn" id="adults-plus">\+</button>'
)
# Kid steppers — their parent has data-kid-type="child_a|child_b|baby"
KID_STEPPER_RE = re.compile(
    r'<div class="stepper kid-stepper" data-kid-type="(child_a|child_b|baby)">'
    r'<button class="stepper__btn kid-minus">−</button>'
    r'<span class="stepper__val kid-val">0</span>'
    r'<button class="stepper__btn kid-plus">\+</button>'
    r'</div>'
)
KID_LABELS = {
    "child_a": ("2ᵉ enfant", "2ᵉ enfant"),
    "child_b": ("1ᵉʳ enfant", "1ᵉʳ enfant"),
    "baby":    ("bébé", "bébé"),
}


# ─── 3. role + tabindex on date chips ────────────────────────────
# Wrap chips in a role=radiogroup region. The chips themselves need
# aria-checked and tabindex.
DATE_CHIPS_WRAP_RE = re.compile(
    r'(<label class="calc-form-label">Date de départ</label>\s*)'
    r'<div class="date-chips">'
)
DATE_CHIP_RE = re.compile(
    r'<button class="date-chip(?:\s+active)?" data-date="([^"]+)">([^<]+)</button>'
)


# ─── 4. role=tablist on tier-tabs already present? Augment ──────
# Already has role="tablist" on the wrapper. Each <button role="tab"> ok.
# Just make sure the active tab has aria-selected="true" too (spec-compliant).
# (Existing has aria-pressed which is more "toggle" semantics.)
# Keep as-is for now — too risky to mess with the JS that toggles aria-pressed.


# ─── 5. KL single-hotel: hide select ────────────────────────────
# Add data-single-hotel="true" attribute so CSS can hide the select.
# Detect by counting <option> in the select.


# ─── 6. Add fineprint to hero (À partir de disclaimer) ──────────
# Insert below .hero__price strong in the scroll-hero__continuation.
# Match: <div class="hero__price">...</div> (the one INSIDE
# scroll-hero__continuation, not the legacy hero).
HERO_PRICE_BLOCK_IN_CONT_RE = re.compile(
    r'(<div class="scroll-hero__continuation">.*?'
    r'<div class="hero__price">.*?</div>)\s*'
    r'(<div class="hero__ctas">)',
    re.DOTALL,
)
HERO_FINEPRINT = (
    '<p class="hero-fineprint">Sur la base d\'une chambre double, sous réserve de '
    'disponibilité — taux DZD/USD à la réservation.</p>\n    '
)


# ─── 7. Add tax disclaimer near WA CTA on KL only ───────────────
# Look for the breakdown__ctas div and inject a small line above it.
KL_TAX_DISCLAIMER_RE = re.compile(
    r'(<div class="breakdown__ctas">)'
)
KL_TAX_DISCLAIMER = (
    '<p class="calc-disclaimer"><svg width="13" height="13" viewBox="0 0 24 24" '
    'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
    'stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px"><circle '
    'cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg> '
    'Prix hors <strong>taxe touristique de 20 USD/personne</strong> à régler à l\'hôtel.</p>\n          '
)


# ─── Driver functions ────────────────────────────────────────────
def patch_aria_live(html: str) -> tuple[str, int]:
    n = 0
    new, k = BREAKDOWN_LINES_RE.subn(r'\1 aria-live="polite"\2', html)
    n += k
    new, k = BREAKDOWN_TOTAL_RE.subn(r'\1 aria-live="polite" aria-atomic="true"\2', new)
    n += k
    return new, n


def patch_stepper_aria(html: str) -> tuple[str, int]:
    n = 0
    new, k = ADULTS_MINUS_RE.subn(
        '<button class="stepper__btn" id="adults-minus" type="button" '
        'aria-label="Diminuer le nombre d\'adultes">−</button>',
        html, count=1)
    n += k
    new, k = ADULTS_PLUS_RE.subn(
        '<button class="stepper__btn" id="adults-plus" type="button" '
        'aria-label="Augmenter le nombre d\'adultes">+</button>',
        new, count=1)
    n += k
    # Kid steppers
    def kid_repl(m):
        kid_type = m.group(1)
        label, _ = KID_LABELS[kid_type]
        return (
            f'<div class="stepper kid-stepper" data-kid-type="{kid_type}">'
            f'<button class="stepper__btn kid-minus" type="button" '
            f'aria-label="Diminuer le nombre de {label}">−</button>'
            f'<span class="stepper__val kid-val" aria-live="polite" aria-atomic="true">0</span>'
            f'<button class="stepper__btn kid-plus" type="button" '
            f'aria-label="Augmenter le nombre de {label}">+</button>'
            f'</div>'
        )
    new, k = KID_STEPPER_RE.subn(kid_repl, new)
    n += k
    return new, n


def patch_date_chips(html: str) -> tuple[str, int]:
    n = 0
    # Wrap the date-chips div in role=radiogroup
    new, k = DATE_CHIPS_WRAP_RE.subn(
        r'\1<div class="date-chips" role="radiogroup" aria-label="Choisissez votre date de départ">',
        html, count=1)
    n += k
    # Add tabindex + aria-checked to each button
    def chip_repl(m):
        date = m.group(1)
        label = m.group(2)
        is_active = 'active' in m.group(0)
        return (
            f'<button class="date-chip{" active" if is_active else ""}" '
            f'type="button" role="radio" '
            f'tabindex="{"0" if is_active else "-1"}" '
            f'aria-checked="{"true" if is_active else "false"}" '
            f'data-date="{date}">{label}</button>'
        )
    new, k = DATE_CHIP_RE.subn(chip_repl, new)
    n += k
    return new, n


def patch_hero_fineprint(html: str) -> tuple[str, bool]:
    if 'hero-fineprint' in html:
        return html, False
    new, k = HERO_PRICE_BLOCK_IN_CONT_RE.subn(
        rf'\1\n    {HERO_FINEPRINT}\2', html, count=1)
    return new, k > 0


def patch_kl_tax_disclaimer(html: str, slug: str) -> tuple[str, bool]:
    """Only on pages whose TRIP_DATA includes a USD extra (currently only KL)."""
    if slug != 'kuala-lumpur':
        return html, False
    if 'calc-disclaimer' in html:
        return html, False
    new, k = KL_TAX_DISCLAIMER_RE.subn(
        KL_TAX_DISCLAIMER + r'\1', html, count=1)
    return new, k > 0


def patch_kl_single_hotel_select(html: str, slug: str) -> tuple[str, bool]:
    """Hide the hotel select on single-hotel pages by wrapping its parent
    .calc-form-group with class data-single-hotel."""
    if slug != 'kuala-lumpur':
        return html, False
    if 'data-single-hotel' in html:
        return html, False
    pat = re.compile(
        r'(<div class="calc-form-group">\s*<label class="calc-form-label" for="hotel-select">[^<]*</label>)',
        re.DOTALL,
    )
    new, k = pat.subn(
        r'<div class="calc-form-group" data-single-hotel="true" hidden>'
        r'\1'.replace(r'\1', r'\1').replace(  # noqa: simply re-insert label
            '', '', 1
        ),
        html, count=1)
    # Simpler: just wrap with data-single-hotel attribute (no hidden, CSS will hide)
    pat2 = re.compile(r'<div class="calc-form-group">(\s*<label class="calc-form-label" for="hotel-select">)')
    new, k = pat2.subn(r'<div class="calc-form-group" data-single-hotel="true">\1', html, count=1)
    return new, k > 0


def process_page(path: Path) -> dict:
    if not path.exists():
        return {"slug": path.parent.name, "error": "missing"}
    slug = path.parent.name
    original = path.read_text(encoding="utf-8")
    html = original

    html, aria_live_n = patch_aria_live(html)
    html, stepper_n   = patch_stepper_aria(html)
    html, datechip_n  = patch_date_chips(html)
    html, fineprint_added = patch_hero_fineprint(html)
    html, tax_added       = patch_kl_tax_disclaimer(html, slug)
    html, single_hotel_added = patch_kl_single_hotel_select(html, slug)

    changed = html != original
    if changed:
        path.write_text(html, encoding="utf-8")

    return {
        "slug": slug,
        "changed": changed,
        "aria_live_added": aria_live_n,
        "stepper_aria_added": stepper_n,
        "datechip_a11y_added": datechip_n,
        "hero_fineprint_added": fineprint_added,
        "kl_tax_disclaimer_added": tax_added,
        "kl_single_hotel_added": single_hotel_added,
    }


if __name__ == "__main__":
    print("v15 a11y + transparency migration\n")
    print(f"  {'page':<22} {'aria-live':<10} {'stepper':<8} {'datechip':<9} {'fp':<3} {'tax':<4} {'1htl':<5}")
    for path in TRIP_PAGES:
        r = process_page(path)
        if "error" in r:
            print(f"  [SKIP] {r['slug']:<20} {r['error']}")
            continue
        flag = "OK" if r["changed"] else "--"
        print(
            f"  [{flag}] {r['slug']:<20} "
            f"{r['aria_live_added']:<10} "
            f"{r['stepper_aria_added']:<8} "
            f"{r['datechip_a11y_added']:<9} "
            f"{int(r['hero_fineprint_added']):<3} "
            f"{int(r['kl_tax_disclaimer_added']):<4} "
            f"{int(r['kl_single_hotel_added']):<5}"
        )
    print("\nDone.")
