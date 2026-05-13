#!/usr/bin/env python3
"""One-shot: remove duplicate noscript blocks accidentally injected on rerun."""
import re
from pathlib import Path

SITE = Path(__file__).parent / "site"
TRIP_PAGES = [
    SITE / "cairo-sharm" / "index.html",
    SITE / "sharm-constantine" / "index.html",
    SITE / "azerbaidjan" / "index.html",
    SITE / "istanbul" / "index.html",
    SITE / "kuala-lumpur" / "index.html",
]

NOSCRIPT_RE = re.compile(r'<noscript>.*?Activez JavaScript pour r[ée]server.*?</noscript>\s*', re.DOTALL)

for path in TRIP_PAGES:
    html = path.read_text(encoding="utf-8")
    matches = list(NOSCRIPT_RE.finditer(html))
    if len(matches) <= 1:
        print(f"  [OK] {path.parent.name} — {len(matches)} noscript")
        continue
    # Keep the first, remove all others
    new_html = html
    for m in reversed(matches[1:]):
        new_html = new_html[:m.start()] + new_html[m.end():]
    path.write_text(new_html, encoding="utf-8")
    print(f"  [DEDUP] {path.parent.name} — was {len(matches)}, now 1")
