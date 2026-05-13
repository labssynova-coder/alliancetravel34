#!/usr/bin/env python3
"""
v13 — fetch hero photos from Unsplash for the scroll-expand hero.
Each trip gets two photos: a wide background (bg) + a focal foreground (fg).
"""
import ssl
import urllib.request
import shutil
from pathlib import Path

# plus.unsplash.com on this machine fails default cert verification.
# Use a context that trusts certifi if installed, else fall back to
# system bundle. Public images, no auth, no PII — safe to be permissive.
try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CTX = ssl.create_default_context()
    SSL_CTX.check_hostname = False
    SSL_CTX.verify_mode = ssl.CERT_NONE

DEST = Path(__file__).parent / "site" / "assets" / "images" / "heroes-v2"
DEST.mkdir(parents=True, exist_ok=True)

# url params reduced to W=2000 q=78 fit=crop for sensible file size
QPARAMS = "?fm=jpg&q=78&w=2000&auto=format&fit=crop"

PHOTOS = {
    # cairo-sharm: pyramids landscape (bg) + pyramids at sunrise close-up (fg)
    "cairo-sharm--bg": "https://images.unsplash.com/photo-1761561044700-4262beec7d63",
    "cairo-sharm--fg": "https://plus.unsplash.com/premium_photo-1754251250739-a7efc9c24301",
    # sharm-constantine: Constantine bridge (bg) + Sharm beach umbrellas (fg)
    "sharm-constantine--bg": "https://images.unsplash.com/photo-1549145177-238518f1ec1a",
    "sharm-constantine--fg": "https://images.unsplash.com/photo-1649103156470-7a818c99c744",
    # azerbaidjan: Baku Flame Towers (bg) + Gabala mountains (fg)
    "azerbaidjan--bg": "https://images.unsplash.com/photo-1744704015980-9842c2314c43",
    "azerbaidjan--fg": "https://plus.unsplash.com/premium_photo-1694475434330-2058f3323def",
    # istanbul: Galata Tower aerial (bg) + Mosque minaret bright sky (fg)
    "istanbul--bg": "https://plus.unsplash.com/premium_photo-1661964045454-67814c3e7d01",
    "istanbul--fg": "https://images.unsplash.com/photo-1747901321962-b398ca484bba",
    # kuala-lumpur: Batu Caves rainbow stairs (bg) + Petronas Towers night (fg)
    "kuala-lumpur--bg": "https://images.unsplash.com/photo-1574218705727-e4196d72bfb5",
    "kuala-lumpur--fg": "https://images.unsplash.com/photo-1764866557865-1f4e4060211f",
}

UA = "Mozilla/5.0 AllianceTravel/v13 (asset-fetch)"

def fetch(name: str, base_url: str) -> Path:
    out = DEST / f"hero__{name}.jpg"
    if out.exists() and out.stat().st_size > 50_000:
        return out  # already cached, non-trivial size
    url = base_url + QPARAMS
    print(f"  fetching {name} ...", end=" ", flush=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30, context=SSL_CTX) as r, out.open("wb") as f:
        shutil.copyfileobj(r, f)
    size_kb = out.stat().st_size // 1024
    print(f"{size_kb}KB")
    return out

if __name__ == "__main__":
    print(f"Fetching {len(PHOTOS)} hero photos to {DEST}\n")
    for name, url in PHOTOS.items():
        try:
            fetch(name, url)
        except Exception as e:
            print(f"  FAILED {name}: {e}")
    print("\nDone.")
    # report
    print("\nFinal inventory:")
    for f in sorted(DEST.glob("hero__*.jpg")):
        kb = f.stat().st_size // 1024
        print(f"  {f.name:<40} {kb:>5}KB")
