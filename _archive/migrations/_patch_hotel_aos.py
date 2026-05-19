import re, os

BASE = r"C:\Users\ROG STRIX\Documents\alliance travel"
SITE = os.path.join(BASE, "site")

trip_pages = [
    os.path.join(SITE, "cairo-sharm", "index.html"),
    os.path.join(SITE, "azerbaidjan", "index.html"),
    os.path.join(SITE, "istanbul", "index.html"),
    os.path.join(SITE, "kuala-lumpur", "index.html"),
    os.path.join(SITE, "sharm-constantine", "index.html"),
]

for path in trip_pages:
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()

    hc_delay = [0]
    def add_hotel_card_aos(m):
        tag = m.group(0)
        if "data-aos" in tag:
            return tag
        d = hc_delay[0]
        hc_delay[0] = min(hc_delay[0] + 60, 360)
        return tag + ' data-aos="fade-up" data-aos-delay="{}" data-aos-duration="550"'.format(d)

    new_html = re.sub(r'<article class="hotel-card"', add_hotel_card_aos, html)
    changed = new_html != html
    if changed:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_html)
    print(os.path.basename(os.path.dirname(path)), "->", "patched" if changed else "no change")
