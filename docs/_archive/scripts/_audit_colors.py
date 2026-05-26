#!/usr/bin/env python3
"""
v22 Phase A — hardcoded-color audit.

Walks site/assets/css/styles.css and emits a CSV row for every hex or
rgba() literal that appears OUTSIDE the canonical :root token blocks.
For each occurrence we capture:
  • file:line
  • literal value (normalized: lowercase hex, whitespace-stripped rgba)
  • current_context (the selector/rule chain the literal lives inside)
  • suggested_token  (best-fit existing token, or "keep_local")

Suggestions are heuristic — Agent 5 will validate. Token table is the
canonical surface/border/text/brand palette from the styles.css :root.
"""

from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
CSS = ROOT / "site" / "assets" / "css" / "styles.css"
OUT = ROOT / "docs" / "CSS-COLOR-AUDIT-v22.csv"

# ── Token palette (extracted from styles.css :root canonical block) ──
# Hex literals (lowercase) → token name. Includes a small set of
# semantically-meaningful close matches.
HEX_TOKENS = {
    # Surfaces
    "#06090d": "--bg-deep",
    "#0a0f15": "--bg",
    "#0d131b": "--bg-low",
    "#11181f": "--bg-2",
    "#161e28": "--bg-card",
    "#1c2532": "--bg-elev",
    # Text
    "#f3ede2": "--txt-1",
    "#b6ada0": "--txt-2",
    "#7a7268": "--txt-3",
    # Brand
    "#002c51": "--navy",
    "#003d72": "--navy-soft",
    "#9ce8b2": "--mint",
    "#7dd4a0": "--mint-soft",
    "#5cb37c": "--mint-deep",
    # Status
    "#3b7a65": "--sage",
    "#cf5252": "--danger",
    "#e0a04a": "--warn",
    "#f5c842": "--star-gold",
    # WhatsApp
    "#25d366": "--wa-green",
    "#1ebe5d": "--wa-green-hov",
    # Region atmospheres
    "#0a0703": "--region-bg-egypt",
    "#050a14": "--region-bg-azerbaijan",
    "#080612": "--region-bg-istanbul",
    "#030a05": "--region-bg-malaysia",
    "#020a10": "--region-bg-sharm",
}

# Common rgba() flavors that map to existing tokens.
RGBA_TOKENS = {
    # Borders
    "rgba(255,255,255,.06)":  "--border",
    "rgba(255,255,255,.12)":  "--border-hi",
    "rgba(156,232,178,.32)":  "--border-mint",
    "rgba(156,232,178,.10)":  "--mint-dim",
    "rgba(156,232,178,.28)":  "--mint-glow",
    "rgba(156,232,178,.55)":  "--ring",
    "rgba(156,232,178,.12)":  "--accent-dim",
    "rgba(156,232,178,.26)":  "--accent-glow",
    "rgba(0,44,81,.30)":      "--navy-dim",
    "rgba(59,122,101,.18)":   "--sage-soft",
    "rgba(207,82,82,.12)":    "--danger-soft",
    "rgba(224,160,74,.14)":   "--warn-soft",
    # Glass surface
    "rgba(20,26,36,.72)":     "--bg-glass",
}

# Rules to recognize "intentionally local" rgba (regression/shadow ladders)
# — these stay raw because they form a graduated tonal scale.
LOCAL_HINTS = ("box-shadow", "filter:", "background-image", "linear-gradient",
               "radial-gradient", "transparent")


def normalize_hex(s: str) -> str:
    """#FFF → #ffffff, #ABC → #aabbcc, leave #abcdef alone, lowercase always."""
    s = s.lower()
    if len(s) == 4:  # #rgb
        return "#" + "".join(c * 2 for c in s[1:])
    if len(s) == 5:  # #rgba
        return "#" + "".join(c * 2 for c in s[1:])
    return s


def normalize_rgba(s: str) -> str:
    """Strip whitespace inside rgba(...) and lowercase function name."""
    return re.sub(r"\s+", "", s).lower()


def find_enclosing_selector(lines: list[str], line_idx: int) -> str:
    """Walk backwards from line_idx looking for the nearest opening selector,
    accounting for brace nesting. Returns "selector [in @media ...]" if the
    selector lives inside an @media block."""
    selector = "(unknown)"
    media = None
    depth = 0  # positive when we've moved up out of inner blocks
    for j in range(line_idx, -1, -1):
        L = lines[j]
        # Reverse-iterate characters in this line to track braces correctly
        for ch in reversed(L):
            if ch == "}":
                depth += 1
            elif ch == "{":
                if depth == 0:
                    # This opening brace is on this line — selector precedes it
                    m = re.match(r"^\s*(.+?)\s*\{", L)
                    if m:
                        candidate = m.group(1).strip()
                        if candidate.startswith("@media"):
                            media = candidate
                            selector = "(directly inside @media)" if selector == "(unknown)" else selector
                            # Continue scanning further up for the parent selector if needed
                            # but for our purposes, we've found the wrapping context.
                            return f"{selector} [in {media}]" if selector != "(directly inside @media)" else media
                        else:
                            selector = candidate
                            # Now keep walking up to find an enclosing @media (if any)
                            # by setting depth artificially so we exit this loop
                            break
                else:
                    depth -= 1
        if selector != "(unknown)" and not selector.startswith("@media") and selector != "(directly inside @media)":
            # Walk further up for @media wrapper
            inner_depth = 0
            for k in range(j - 1, -1, -1):
                LL = lines[k]
                for ch in reversed(LL):
                    if ch == "}":
                        inner_depth += 1
                    elif ch == "{":
                        if inner_depth == 0:
                            mm = re.match(r"^\s*(@media[^{]+)\{", LL)
                            if mm:
                                media = mm.group(1).strip()
                                return f"{selector} [in {media}]"
                            # Not a media wrapper — exit (selector has no media)
                            return selector
                        else:
                            inner_depth -= 1
            return selector
    return selector


def suggest_token(value: str, prop_context: str) -> str:
    """Return suggested replacement token or 'keep_local'."""
    norm = value.lower() if value.startswith("#") else normalize_rgba(value)
    if norm in HEX_TOKENS:
        return f"var({HEX_TOKENS[norm]})"
    if norm in RGBA_TOKENS:
        return f"var({RGBA_TOKENS[norm]})"
    # Heuristics for local-keeping
    lower_ctx = prop_context.lower()
    if any(h in lower_ctx for h in LOCAL_HINTS):
        return "keep_local (shadow/gradient ladder)"
    # rgba with near-zero alpha is usually a hover/divider — needs review
    if norm.startswith("rgba"):
        if ",.0" in norm or ",0." in norm:
            return "keep_local (decorative low-alpha)"
    return "keep_local (no token match)"


# Hex literals: 3, 4, 6, or 8 hex digits after #
HEX_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b")
# rgba/rgb function calls
RGBA_RE = re.compile(r"rgba?\([^\)]*\)", re.IGNORECASE)


def main() -> int:
    text = CSS.read_text(encoding="utf-8")
    lines = text.split("\n")

    # Skip the :root canonical-token blocks (where literals are DEFINITIONS).
    # These ranges are the :root {} blocks we extracted earlier.
    skip_ranges = []
    for m in re.finditer(r":root[^{]*\{", text):
        start = m.start()
        # find matching }
        depth = 0
        end = start
        for i in range(start, len(text)):
            ch = text[i]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i
                    break
        # Convert offset → line number (1-based)
        start_line = text.count("\n", 0, start) + 1
        end_line = text.count("\n", 0, end) + 1
        skip_ranges.append((start_line, end_line))

    def in_skip(line_num: int) -> bool:
        return any(a <= line_num <= b for a, b in skip_ranges)

    rows: list[tuple[str, str, str, str]] = []
    for i, line in enumerate(lines, start=1):
        if in_skip(i):
            continue
        # Skip comment lines (best-effort: pure comment lines starting with /* or *)
        stripped = line.lstrip()
        if stripped.startswith("/*") or stripped.startswith("*"):
            continue
        # Find hex literals
        for m in HEX_RE.finditer(line):
            raw = m.group(0)
            # Skip 8-char hex with alpha that's also part of a CSS class name? unlikely.
            value = normalize_hex(raw)
            # context: full property line, e.g. "color: #aabbcc;"
            prop_ctx = line.strip().rstrip("{").rstrip(";").strip()
            selector = find_enclosing_selector(lines, i - 1)
            suggestion = suggest_token(value, prop_ctx)
            rows.append((f"styles.css:{i}", value, f"{selector} :: {prop_ctx}", suggestion))
        # Find rgba/rgb literals
        for m in RGBA_RE.finditer(line):
            raw = m.group(0)
            value = normalize_rgba(raw)
            prop_ctx = line.strip().rstrip("{").rstrip(";").strip()
            selector = find_enclosing_selector(lines, i - 1)
            suggestion = suggest_token(value, prop_ctx)
            rows.append((f"styles.css:{i}", value, f"{selector} :: {prop_ctx}", suggestion))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["file:line", "value", "current_context", "suggested_token_or_keep_local"])
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {OUT.relative_to(ROOT)}")
    # Brief stats
    keep = sum(1 for r in rows if r[3].startswith("keep_local"))
    tokenable = len(rows) - keep
    print(f"  Tokenable: {tokenable} | Keep local: {keep}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
