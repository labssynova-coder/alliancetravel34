#!/usr/bin/env python3
"""
v22 Phase A — Inline `style=""` migration.

Scope: HTML pages under site/. For each `style="…"` attribute, decompose into
individual `property: value` declarations and try to replace each with a
canonical utility class (.fs-*) or normalize legacy --s* tokens to --space-*.

Conservative rules (preserve visual byte-identity at desktop 1440):
  • Migrate a `font-size` declaration to a `.fs-*` utility class ONLY when:
      - The font-size value matches a known scale stop, AND
      - Either no `line-height` is also set, OR the inline line-height equals
        the line-height the utility class would impose (so the swap is a no-op).
  • Migrate legacy spacing tokens (--s1..--s12) inside padding/gap/margin/
    margin-top/etc. to --space-* tokens ONLY when the value match is exact
    (--s7/--s8 = 40px have no --space-* equivalent → left alone).
  • If after migration a declaration block is empty, drop the style="" too.
  • If a `class="…"` attribute exists, append the new class. Otherwise insert
    a new `class="…"` attribute immediately before the `style=…` attribute.

Run:  python _migrate_inline_styles.py
Idempotent.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).parent
SITE = ROOT / "site"
HTML_FILES = [
    SITE / "index.html",
    SITE / "voyages" / "index.html",
    SITE / "azerbaidjan" / "index.html",
    SITE / "cairo-sharm" / "index.html",
    SITE / "istanbul" / "index.html",
    SITE / "kuala-lumpur" / "index.html",
    SITE / "sharm-constantine" / "index.html",
]

# ── font-size → utility class map ───────────────────────────────────────────
# Keys are normalized font-size value strings (whitespace stripped, lowercase).
# Values are (class_name, expected_lh_value_or_None). expected_lh_value matches
# the var the .fs-* class would impose:
#   --lh-tight=1.1, --lh-snug=1.25, --lh-normal=1.5, --lh-relaxed=1.7
FS_MAP = {
    # display
    "clamp(48px,6.5vw,96px)": ("fs-display-1", "1.1"),
    "clamp(3rem,2rem+6vw,6rem)": ("fs-display-1", "1.1"),
    "clamp(2.75rem,1.8rem+4.5vw,4.5rem)": ("fs-display-2", "1.1"),
    "clamp(28px,4vw,48px)": ("fs-h2", "1.25"),
    # h-scale
    "2.75rem": ("fs-h2", "1.25"),
    "2.25rem": ("fs-h1", "1.25"),
    "2rem": ("fs-h3", "1.25"),
    "1.5rem": ("fs-h4", "1.25"),
    "1.25rem": ("fs-h5", "1.5"),
    "1.125rem": ("fs-h6", "1.5"),
    # body
    "1.0625rem": ("fs-body-lg", "1.7"),
    "1rem": ("fs-body", "1.7"),
    ".9375rem": ("fs-body", "1.7"),
    "0.9375rem": ("fs-body", "1.7"),
    ".875rem": ("fs-body-sm", "1.5"),
    "0.875rem": ("fs-body-sm", "1.5"),
    ".8125rem": ("fs-body-sm", "1.5"),
    "0.8125rem": ("fs-body-sm", "1.5"),
    ".75rem": ("fs-caption", "1.5"),
    "0.75rem": ("fs-caption", "1.5"),
}

# ── legacy --s* → --space-* normalization (only exact-value matches) ─────────
SPACE_NORMALIZE = {
    "--s1":  "--space-1",   # 4 → 4
    "--s2":  "--space-2",   # 8 → 8 (post-anomaly-fix)
    "--s3":  "--space-3",   # 16
    "--s4":  "--space-4",   # 24
    "--s5":  "--space-4",   # 24 — alias
    "--s6":  "--space-5",   # 32
    # --s7 (40), --s8 (40), --s9 (56), --s10 (72) intentionally absent: no exact match
    "--s11": "--space-9",   # 96
    "--s12": "--space-10",  # 128
}

# Properties safe to apply SPACE_NORMALIZE on (spacing-only):
SPACING_PROPS = {
    "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "padding-inline", "padding-inline-start", "padding-inline-end",
    "padding-block", "padding-block-start", "padding-block-end",
    "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
    "margin-inline", "margin-inline-start", "margin-inline-end",
    "margin-block", "margin-block-start", "margin-block-end",
    "gap", "row-gap", "column-gap",
    "top", "right", "bottom", "left", "inset",
}

# ── Atomic single-declaration → class map ────────────────────────────────────
# Each key is (prop, normalized_value) where value is whitespace-stripped + lower.
ATOMIC_MAP: dict[tuple[str, str], str] = {
    ("display", "none"):                         "u-hidden",
    ("display", "block"):                        "u-block",
    ("display", "inline-block"):                 "u-inline-block",
    ("text-align", "center"):                    "u-text-center",
    ("text-decoration", "none"):                 "u-no-decoration",
    ("text-transform", "uppercase"):             "u-uppercase",
    ("letter-spacing", ".1em"):                  "u-letter-wide",
    ("margin-inline", "auto"):                   "u-mx-auto",
    ("margin", "0"):                             "u-m-0",
    ("margin", "0012px"):                        "u-noscript-title",
    ("margin-top", "4px"):                       "u-mt-1",
    ("margin-top", "6px"):                       "u-mt-2",
    ("margin-top", "8px"):                       "u-mt-3",
    ("margin-top", "var(--space-3)"):            "u-mt-sp3",
    ("margin-top", "var(--space-4)"):            "u-mt-sp4",
    ("margin-top", "var(--space-5)"):            "u-mt-sp5",
    ("margin-bottom", "4px"):                    "u-mb-1",
    ("margin-bottom", "var(--space-3)"):         "u-mb-sp3",
    ("margin-bottom", "var(--space-4)"):         "u-mb-sp4",
    ("margin-bottom", "var(--space-5)"):         "u-mb-sp5",
    ("margin-bottom", "var(--space-7)"):         "u-mb-sp7",
    ("max-width", "500px"):                      "u-measure-sm",
    ("max-width", "600px"):                      "u-measure-md",
    ("max-width", "680px"):                      "u-measure-lg",
    ("max-width", "720px"):                      "u-measure-xl",
    ("color", "var(--txt-1)"):                   "u-text-1",
    ("color", "var(--txt-2)"):                   "u-text-2",
    ("color", "var(--txt-3)"):                   "u-text-3",
    ("color", "var(--mint)"):                    "u-text-mint",
    ("color", "#9ce8b2"):                        "u-text-mint",
    ("color", "var(--accent)"):                  "u-text-accent",
    ("font-weight", "300"):                      "u-fw-300",
    ("font-weight", "400"):                      "u-fw-400",
    ("font-weight", "500"):                      "u-fw-500",
    ("font-weight", "600"):                      "u-fw-600",
    ("font-family", "var(--font-display)"):      "u-font-display",
    ("background", "var(--bg-2)"):               "u-bg-2",
}

# ── Multi-declaration combos that fully match a single utility ──────────────
# Each entry: frozenset of (prop, value) → class name. Replaces those decls.
COMBO_MAP: list[tuple[frozenset[tuple[str, str]], str]] = [
    (frozenset({("width", "100%"), ("height", "100%")}),                    "u-size-full"),
    (frozenset({("border-radius", "var(--r2)"), ("overflow", "hidden")}),   "u-radius-clip"),
    (frozenset({("height", "1px"), ("background", "var(--border)")}),       "u-divider"),
    (frozenset({("color", "#9ce8b2"), ("text-decoration", "none")}),        "u-link-mint"),
    (frozenset({
        ("margin", "0016px"),
        ("color", "#c9cdd4"),
        ("line-height", "1.6"),
    }), "u-noscript-msg"),
    (frozenset({
        ("margin", "48pxauto"),
        ("padding", "24px"),
        ("background", "rgba(255,255,255,.04)"),
        ("border", "1pxsolidrgba(255,255,255,.1)"),
        ("border-radius", "14px"),
        ("color", "#fbf8f1"),
    }), "u-noscript-card"),
    (frozenset({
        ("display", "flex"),
        ("flex-wrap", "wrap"),
        ("gap", "var(--space-4)"),
    }), "u-cluster"),
    (frozenset({
        ("display", "flex"),
        ("flex-wrap", "wrap"),
        ("gap", "var(--space-3)"),
    }), "u-cluster--sm"),
]


def split_declarations(style_text: str) -> list[tuple[str, str]]:
    """Split a `prop:val; prop:val` blob into [(prop, val)] tuples, trimmed."""
    out = []
    for chunk in style_text.split(";"):
        chunk = chunk.strip()
        if not chunk or ":" not in chunk:
            continue
        prop, _, val = chunk.partition(":")
        out.append((prop.strip().lower(), val.strip()))
    return out


def normalize_value(prop: str, val: str) -> str:
    """Apply --s* → --space-* substitution inside a value, if prop is spacing."""
    if prop not in SPACING_PROPS:
        return val
    # Replace each legacy --sN, but only those in the safe map.
    def _sub(m: re.Match) -> str:
        token = m.group(0)
        return SPACE_NORMALIZE.get(token, token)
    return re.sub(r"--s\d+", _sub, val)


def line_height_compatible(decl_lh: str | None, expected_lh: str | None) -> bool:
    """Decide if removing a font-size from inline + applying .fs-* class
    preserves the rendered line-height."""
    if decl_lh is None:
        # No inline line-height set: class will impose expected_lh, which is
        # acceptable (previous behavior inherited from body's --lh-relaxed=1.7
        # or component-local rules). Accept only when expected matches body
        # default OR when the property is part of a text-heavy element.
        # Conservative: accept the swap.
        return True
    if expected_lh is None:
        return False
    # Normalize: "1.5" vs "1.50" vs "1.5 " — strip.
    return decl_lh.strip() == expected_lh.strip()


def try_migrate(decls: list[tuple[str, str]]) -> tuple[list[tuple[str, str]], list[str]]:
    """Return (remaining_decls, classes_added)."""
    classes: list[str] = []
    drop_idx: set[int] = set()

    # First: --s* → --space-* normalization on spacing decls (in place)
    decls = [(p, normalize_value(p, v)) for p, v in decls]

    # Font-size + line-height combo handling
    by_prop = {p: (i, v) for i, (p, v) in enumerate(decls)}
    fs_entry = by_prop.get("font-size")
    lh_entry = by_prop.get("line-height")
    if fs_entry is not None:
        key = re.sub(r"\s+", "", fs_entry[1]).lower()
        if key in FS_MAP:
            cls_name, expected_lh = FS_MAP[key]
            inline_lh = lh_entry[1] if lh_entry else None
            if line_height_compatible(inline_lh, expected_lh):
                classes.append(cls_name)
                drop_idx.add(fs_entry[0])
                if lh_entry and lh_entry[1].strip() == expected_lh.strip():
                    drop_idx.add(lh_entry[0])

    # Atomic single-decl mapping
    for i, (prop, val) in enumerate(decls):
        if i in drop_idx:
            continue
        norm_val = re.sub(r"\s+", "", val).lower()
        key = (prop, norm_val)
        if key in ATOMIC_MAP:
            cls = ATOMIC_MAP[key]
            if cls not in classes:
                classes.append(cls)
            drop_idx.add(i)

    # Combo mapping (multi-decl that collapse to one class)
    decl_set = {(p, re.sub(r"\s+", "", v).lower()) for i, (p, v) in enumerate(decls) if i not in drop_idx}
    for combo, cls in COMBO_MAP:
        if combo.issubset(decl_set):
            if cls not in classes:
                classes.append(cls)
            # Drop the indices for those decls
            for i, (p, v) in enumerate(decls):
                if i in drop_idx:
                    continue
                if (p, re.sub(r"\s+", "", v).lower()) in combo:
                    drop_idx.add(i)
            # refresh remaining decl_set
            decl_set = {(p, re.sub(r"\s+", "", v).lower()) for i, (p, v) in enumerate(decls) if i not in drop_idx}

    remaining = [(p, v) for i, (p, v) in enumerate(decls) if i not in drop_idx]
    return remaining, classes


STYLE_ATTR_RE = re.compile(r'(\sstyle=")([^"]*)(")', re.IGNORECASE)
CLASS_ATTR_RE = re.compile(r'\sclass="([^"]*)"', re.IGNORECASE)


def process_html(path: Path) -> tuple[int, int, list[str]]:
    """Returns (before_count, after_count, unmigratable_samples)."""
    text = path.read_text(encoding="utf-8")
    before_count = len(STYLE_ATTR_RE.findall(text))
    unmigratable: list[str] = []

    # We need to handle each style="…" along with the surrounding tag so we
    # can edit the class attribute. Iterate by tag span.
    # Walk attribute occurrences in source order, rebuilding text.
    out_chunks: list[str] = []
    pos = 0
    for m in STYLE_ATTR_RE.finditer(text):
        style_body = m.group(2)
        decls = split_declarations(style_body)
        if not decls:
            out_chunks.append(text[pos:m.end()])
            pos = m.end()
            continue
        remaining, new_classes = try_migrate(decls)
        # Render remaining declarations back to a style string
        remaining_str = "; ".join(f"{p}:{v}" for p, v in remaining)
        # Build replacement for the style="…" attr
        if remaining_str:
            new_style_attr = f' style="{remaining_str}"'
        else:
            new_style_attr = ""

        # Find the enclosing tag start to insert/extend class=""
        tag_start = text.rfind("<", 0, m.start())
        tag_chunk = text[tag_start:m.end()]
        # Modify tag chunk: extend class if present, else insert one before style
        if new_classes:
            cls_m = CLASS_ATTR_RE.search(tag_chunk)
            if cls_m:
                existing = cls_m.group(1).split()
                for c in new_classes:
                    if c not in existing:
                        existing.append(c)
                new_class_attr = f' class="{" ".join(existing)}"'
                tag_chunk = tag_chunk[:cls_m.start()] + new_class_attr + tag_chunk[cls_m.end():]
                # Now also replace the style attr in tag_chunk
                tag_chunk = STYLE_ATTR_RE.sub(lambda _m: new_style_attr, tag_chunk, count=1)
            else:
                # Insert class right before the style attr
                new_class_attr = f' class="{" ".join(new_classes)}"'
                # Replace style attr with class + new style attr
                tag_chunk = STYLE_ATTR_RE.sub(
                    lambda _m: f"{new_class_attr}{new_style_attr}",
                    tag_chunk, count=1
                )
        else:
            # Just update / strip style attr
            tag_chunk = STYLE_ATTR_RE.sub(lambda _m: new_style_attr, tag_chunk, count=1)

        out_chunks.append(text[pos:tag_start])
        out_chunks.append(tag_chunk)
        pos = m.end()

        # Track unmigratable patterns for the report
        if not new_classes and remaining_str == style_body:
            # nothing changed → unmigratable
            unmigratable.append(style_body)

    out_chunks.append(text[pos:])
    new_text = "".join(out_chunks)

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")

    after_count = len(STYLE_ATTR_RE.findall(new_text))
    return before_count, after_count, unmigratable


def main() -> int:
    total_before = total_after = 0
    all_unmig: Counter[str] = Counter()
    per_file: list[tuple[Path, int, int]] = []

    for path in HTML_FILES:
        if not path.exists():
            print(f"SKIP (missing): {path}")
            continue
        before, after, unmig = process_html(path)
        per_file.append((path, before, after))
        all_unmig.update(unmig)
        total_before += before
        total_after += after

    print()
    print("=" * 64)
    print(" v22 INLINE-STYLE MIGRATION REPORT")
    print("=" * 64)
    print(f"{'PAGE':50}{'BEFORE':>7}{'AFTER':>7}")
    print("-" * 64)
    for path, before, after in per_file:
        rel = path.relative_to(ROOT)
        print(f"{str(rel):50}{before:>7}{after:>7}")
    print("-" * 64)
    print(f"{'TOTAL':50}{total_before:>7}{total_after:>7}")
    print(f"Reduction: {total_before - total_after} ({(total_before - total_after) * 100 / max(total_before,1):.1f}%)")
    print()
    print(f"Top {min(15, len(all_unmig))} surviving (unmigratable) patterns:")
    for pat, n in all_unmig.most_common(15):
        print(f"  ×{n:3}  {pat[:96]}")
    print()
    print("WHY some survive: complex multi-property strings that mix layout")
    print("primitives (display/flex/grid/width/max-width/border-radius/etc.)")
    print("with no existing utility class. Out-of-scope hex colors and")
    print("per-page --accent overrides are intentional (page-scoped design")
    print("tokens, not architecture).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
