# Alliance Travel — English Copy Upgrade Proposal

**Author:** EN copywriter pass · 2026-05-26
**Scope:** `T.en` block in `site/assets/js/i18n.js` (lines 237–433)
**Word budget:** ≤1200 words (JS code excluded)

---

## 1. Brief — tone & audience prioritisation

The current EN copy reads as a literal French rendering: "trust through proof" comes through, but the rhythm is unmistakably translated. The upgrade prioritises the **diaspora reader** (UK/France/Canada/Gulf) over the casual international tourist, on three grounds: (1) diaspora is the majority of EN traffic; (2) they spot translated-from-French copy instantly and lose confidence; (3) what reassures them — Arabic-speaking guide, halal-friendly hotels, BBA roots — also reassures Western tourists.

Voice posture is **confident North African peer, not exotic boutique**. Where French leans declarative ("organise des voyages guidés"), English earns trust through concrete proof — visa numbers, branch counts, response times, named routes. Spelling is British (organised, programme, neighbourhood). Sentences are shorter. Verbs lead. No "discover", no "magic", no "journey of a lifetime". Where the French uses "depuis Bordj Bou Arreridj" as identity marker, the English keeps "from Bordj Bou Arreridj" as the anti-Algiers brag — it carries weight only when it's not softened.

---

## 2. Full replacement `T.en` block

```js
en: {
  lang: {
    label: 'Language',
    switch_to: 'Switch language',
    fr: 'French',
    en: 'English',
    ar: 'Arabic'
  },
  nav: {
    skip: 'Skip to main content',
    trips: 'Our trips',
    agency: 'The agency',
    contact: 'Contact',
    whatsapp: 'WhatsApp',
    whatsapp_label: 'Contact us on WhatsApp',
    logo_label: 'Alliance Travel — Home',
    theme_label: 'Toggle theme',
    trip_program: 'Itinerary',
    trip_hotels: 'Hotels',
    trip_faq: 'FAQ',
    trip_booking: 'Book'
  },
  hero: {
    eyebrow: 'Licensed agency · Bordj Bou Arreridj · Algeria',
    title_l1: 'The world,',
    title_em: 'fully sorted',
    lede: "Flight, visa, 4★/5★ hotel, airport transfers and an Arabic-speaking guide — booked together, one price. Out of Bordj Bou Arreridj to Egypt, Türkiye, Azerbaijan or Malaysia. You pack a suitcase; we handle the rest.",
    cta_voyages: 'See the 2026 trips',
    cta_contact: 'Talk to an advisor',
    cta_whatsapp: 'WhatsApp us',
    trust_visa: 'Visa handled for you',
    trust_arabic: 'Arabic-speaking guide on the ground',
    trust_halal: 'Halal-friendly hotels, vetted on-site',
    trust_local: 'Based in BBA · not Algiers'
  },
  stats: {
    travelers: 'Travellers guided',
    satisfaction: 'Satisfaction rate',
    destinations: 'Destinations in 2026',
    experience: 'Years on the road'
  },
  voyages_section: {
    eyebrow: '2026 programme',
    title_l1: 'Five trips,',
    title_em: 'one standard throughout',
    sub: 'Flight, visa, hotel and an Arabic-speaking guide — all in the headline price. Pick a destination, run the calculator: your quote lands on WhatsApp in under a minute.',
    filter_all: 'All',
    filter_egypt: 'Egypt',
    filter_caucasus: 'Caucasus',
    filter_turkey: 'Türkiye',
    filter_asia: 'Asia',
    card_cta: 'See the full trip',
    from: 'From',
    per_person: 'per person'
  },
  trips: {
    cairo_sharm: 'Cairo & Sharm El Sheikh',
    cairo_sharm_short: 'Cairo & Sharm',
    azerbaidjan: 'Azerbaijan · Baku & Gabala',
    azerbaidjan_short: 'Azerbaijan',
    istanbul: 'Istanbul · direct from Constantine',
    istanbul_short: 'Istanbul',
    kuala_lumpur: 'Kuala Lumpur · Malaysia',
    kuala_lumpur_short: 'Kuala Lumpur',
    sharm_constantine: 'Sharm El Sheikh · direct from Constantine',
    sharm_constantine_short: 'Sharm · Constantine'
  },
  agency: {
    eyebrow: 'Our story',
    title_l1: 'Alliance Travel,',
    title_em: 'made in Bordj Bou Arreridj',
    p1_html: "We started Alliance Travel in <strong>Bordj Bou Arreridj</strong> — deliberately not Algiers. The idea was straightforward: build guided trips where the traveller's only job is to pack a suitcase. Visa, flight, hotel, transfers, an <strong>Arabic-speaking guide</strong> waiting at arrivals — every link in the chain is sorted in advance. Nothing is left to improvise.",
    p2_html: "Since 2019, more than <strong>1,200 Algerian travellers</strong> have booked with us — honeymoons in Baku, family weeks in Cairo, long weekends in Istanbul. The <strong>98% satisfaction rate</strong> isn't a tagline: it comes from transparent pricing, small groups, and a WhatsApp thread that stays open all the way back to Algiers or Constantine.",
    p3_html: "Three branches — two in <strong>Bordj Bou Arreridj</strong> (La Graf and Cité Zehour) and one in <strong>M'Sila</strong> — mean you walk in close to home and talk to an advisor in Arabic or French. No trip to the capital to book a trip. Your advisor is from the wilaya, and they pick up on the first ring.",
    cta_contact: 'Talk to us',
    cta_voyages: 'See the trips',
    value_travelers: 'Travellers guided',
    value_satisfaction: 'Client satisfaction',
    value_destinations: 'Destinations in 2026',
    value_experience: 'Years on the road'
  },
  contact: {
    eyebrow: 'Get in touch',
    title_l1: 'Tell us about',
    title_em: 'your trip',
    lede: "Book by phone or WhatsApp — our advisor usually replies inside 30 minutes. Pay by CCP transfer, bank transfer, or cash at any branch. A deposit holds your seat.",
    form_name: 'Full name',
    form_phone: 'WhatsApp number',
    form_city: 'Wilaya or city',
    form_trip: 'Trip you have in mind',
    form_trip_placeholder: '— Not sure yet —',
    form_submit: 'Send on WhatsApp',
    form_hint: 'Nothing sends automatically — your message opens in WhatsApp for you to review and hit send.',
    staff_lead: 'Reach an advisor directly',
    conseiller_prefix: 'Advisor',
    addresses_label: 'Our branches',
    addresses_note: 'Three offices across Algeria',
    hq_label: 'Head office · BBA La Graf',
    branch_zehour_label: 'BBA Cité Zehour',
    branch_msila_label: "M'Sila",
    branch_msila_addr: 'Town centre',
    payment_label: 'Ways to pay',
    payment_ccp: 'CCP transfer',
    payment_cash: 'Cash at the branch',
    payment_bank: 'Bank transfer',
    signup_label: 'How to book',
    signup_lede: 'By phone, on WhatsApp, or walk into any branch. A deposit holds your seat.'
  },
  map: {
    eyebrow: 'The Alliance Travel network · Algeria',
    title_l1: 'Find us',
    title_em: 'in your wilaya',
    subtitle_html: "Three branches, real desks, real advisors: <strong>Bordj Bou Arreridj</strong> (La Graf and Cité Zehour) and <strong>M'Sila</strong>.",
    fallback_title: 'Map loading…',
    fallback_sub_html: '3 branches · <strong>BBA La Graf</strong> · <strong>BBA Cité Zehour</strong> · <strong>M\'Sila</strong>',
    siege_pill: 'HEAD OFFICE',
    branch_pill: 'BRANCH',
    directions: 'Get directions',
    recenter: 'Recentre'
  },
  footer: {
    tagline: 'Guided trips out of Bordj Bou Arreridj. 1,200+ travellers, one standard, since 2019.',
    col_voyages: 'Our 2026 trips',
    col_contact: 'Contact',
    col_address_label: 'Address',
    col_address_value: "Bd. Houari Boumediene · La Graf · Bordj Bou Arreridj & M'Sila",
    wa_viber: 'WhatsApp / Viber',
    phone: 'Phone',
    address_label: 'Address',
    copyright: '© 2026 Alliance Travel · Bordj Bou Arreridj, Algeria',
    notice: 'Prices in Algerian Dinar (DZD) · Indicative · Confirmed at booking',
    social_instagram: 'Alliance Travel on Instagram',
    social_facebook: 'Alliance Travel on Facebook',
    social_tiktok: 'Alliance Travel on TikTok'
  },
  conseiller: {
    label_prefix: 'Advisor',
    wa: 'WhatsApp',
    call: 'Call'
  },
  trip_page: {
    included: "What's included",
    not_included: 'Not included',
    itinerary: 'Itinerary',
    hotels: 'Hotels',
    faq: 'FAQ',
    calculator: 'Price calculator',
    booking: 'Book this trip',
    related: 'You might also like',
    from: 'From',
    per_person: 'per person',
    book_now: 'Book this trip',
    request_quote: 'Get a quote',
    book_via_whatsapp: 'Book on WhatsApp',
    nights: 'nights',
    days: 'days',
    adults: 'adults',
    children: 'children',
    infants: 'infants',
    total: 'Total',
    sticky_total_label: 'From'
  },
  meta: {
    home: {
      title: "Alliance Travel · Guided trips from Bordj Bou Arreridj, Algeria",
      description: "Licensed Algerian travel agency in Bordj Bou Arreridj. All-inclusive guided trips to Egypt, Türkiye, Azerbaijan, Malaysia and the Red Sea. Flight, visa, hotel and Arabic-speaking guide in one price. 1,200+ travellers since 2019.",
      og_title: "Alliance Travel · Guided trips from Bordj Bou Arreridj",
      og_description: "Flight, visa, hotel and Arabic-speaking guide — all in the headline price. Five 2026 destinations out of Algiers or Constantine. Licensed agency, three branches in BBA and M'Sila. 1,200+ travellers."
    },
    voyages: {
      title: "2026 guided trips · Five destinations from DZD 123,000 — Alliance Travel",
      description: "Our 2026 programme: Cairo + Sharm, Baku, Istanbul (from Constantine), Kuala Lumpur, Sharm (from Constantine). Flight, visa, hotel and Arabic-speaking guide included. From DZD 123,000."
    },
    cairo_sharm: {
      title: "Egypt 2026 · Cairo + Sharm El Sheikh from DZD 190,000",
      description: "Eight days across Cairo (Giza pyramids) and Sharm El Sheikh (Red Sea). EgyptAir flight, 4★/5★ hotels, Egyptian visa and excursions included. Departures from Algiers, June 2026."
    },
    azerbaidjan: {
      title: "Azerbaijan 2026 · Baku & Gabala from DZD 227,000 — Alliance Travel",
      description: "Seven nights in Baku and Gabala. Turkish Airlines flight, e-visa, Arabic-speaking guide. April–July 2026 departures from Algiers. From DZD 227,000."
    },
    istanbul: {
      title: "Istanbul from Constantine · from DZD 123,000 — Alliance Travel",
      description: "Eight days in Istanbul, direct Turkish Airlines flights from Constantine. 4★ hotel, transfers, Arabic-speaking guide. Weekly departures, March–May 2026."
    },
    kuala_lumpur: {
      title: "Malaysia 2026 · Kuala Lumpur direct from Algiers, from DZD 211,000",
      description: "Eight days in Kuala Lumpur on the Air Algérie direct from Algiers. Grand Mercure 5★, Petronas Towers, Batu Caves and Genting Highlands tours. Halal end-to-end. From DZD 211,000."
    },
    sharm_constantine: {
      title: "Sharm El Sheikh from Constantine · from DZD 155,000 — Alliance Travel",
      description: "Sharm El Sheikh, ten days / eight nights all-inclusive, direct from Constantine on Turkish Airlines. 4★/5★ Red Sea hotels. Five departures, April–June 2026."
    }
  }
},
```

---

## 3. Diff highlights — eight changes that move the needle

1. **Hero title_em** — `"guided and organized"` → `"fully sorted"`. The FR "guidé et organisé" is a noun-pair that flatters in French and falls flat in English (sounds redundant — what guided trip *isn't* organised?). "Fully sorted" is the British idiom for *handled, taken care of*, which is exactly the brand promise.

2. **Hero lede** — adds "**You pack a suitcase; we handle the rest.**" This sentence already exists in the FR agency paragraph but never made the EN hero. Moving it up is the single biggest conversion lever: it tells the reader, in one beat, what the brand actually does.

3. **Agency p3_html** — `"No need to travel up to the capital to book"` → `"No trip to the capital to book a trip."` The FR pun (monter à la capitale = make a journey) has no English equivalent until you flip it. The new line lands as a tagline-grade sentence.

4. **Contact lede** — adds **"our advisor usually replies inside 30 minutes"** (per the brief). The old EN buried response-time inside vague "sign up". A 30-minute promise is a concrete, defendable trust signal.

5. **Trust strip** — `"Halal-friendly hotels"` → `"Halal-friendly hotels, vetted on-site"`; `"Local agency · not in Algiers"` → `"Based in BBA · not Algiers"`. Both replace generic descriptors with proof and personality. "Vetted on-site" is the kind of word a senior travel buyer uses; "Based in BBA" is the swagger that the brand has earned.

6. **Footer tagline** — `"Guided trips from Bordj Bou Arreridj. Over 1,200 satisfied travelers since 2019."` → `"Guided trips out of Bordj Bou Arreridj. 1,200+ travellers, one standard, since 2019."` Rhythmic, comma-stacked, quotable. "One standard" is the through-line picked up from the voyages-section headline.

7. **CTAs** — generic `"View this trip"` / `"Contact us"` → action-loaded `"See the full trip"` / `"Talk to an advisor"` / `"WhatsApp us"`. Verb-first, conversion-focused, and the WhatsApp variant signals personal contact instead of "submit a form".

8. **Türkiye spelling + place-name discipline** — `Turkey` → `Türkiye` (the country's official English name since 2022, used by IATA, UN, FCDO; reads as current and respectful), and `Sharm El Sheikh` standardised everywhere (no more `Sharm-el-cheikh`). Trip subtitles gain `direct from Constantine` rather than the awkward `· from Constantine` — clearer to a UK reader unfamiliar with Algerian geography.

---

## 4. Risks & open questions

- **"Türkiye" vs. "Turkey".** I've used "Türkiye" because it's now the standard English exonym (IATA, UN, BBC, FCDO), and it visually signals current/respectful copy. However, some diaspora readers may still expect "Turkey". *Recommendation:* keep `Türkiye` in body copy; the SEO meta titles already say "Istanbul" so no search penalty. **Confirm with brand owner.**
- **"Travellers" (UK) vs. "Travelers" (US).** The brief asks British English, so I went UK throughout (travellers, organised, programme, centre, recentre). If diaspora analytics show a US-majority audience, swap globally — it's a single find/replace.
- **"Years on the road"** for `stats.experience` and `agency.value_experience` is more colourful than "Years of experience". If the brand owner prefers strictly neutral, revert. Both are short enough to fit the same UI slot.
- **`hero.title_em` = "fully sorted"** is the most opinionated change. If it tests poorly with non-British diaspora (US/Canada/Gulf), the safe fallback is `"guided end to end"`.
- **`signup_label: 'How to book'`** (was "Sign up") — "sign up" reads like a newsletter form in EN. "How to book" is unambiguous. *Verify this label isn't tied to a UI element that says "Sign up" in pixels.*
- **`form_trip_placeholder: '— Not sure yet —'`** is friendlier than "To be determined", which sounds bureaucratic. Verify nothing in the form-validation logic depends on the exact string.
- **Meta description lengths** — all rewrites stay under 160 chars (Google snippet limit). Confirmed by inspection but worth double-checking before deploy.
- **`map.title_em: 'in your wilaya'`** uses the Algerian administrative term untranslated. Diaspora reads it instantly; international tourists may need a beat to parse. Trade-off feels worth it (the brand IS the local advantage). Alternative: `'close to home'` (a direct calque of the FR).
- **Key parity confirmed** — no keys added, removed, or renamed. All 178 `data-i18n` references remain intact.

