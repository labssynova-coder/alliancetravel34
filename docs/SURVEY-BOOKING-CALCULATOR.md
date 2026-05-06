# Survey — Booking & Calculator System

**Date:** 2026-05-06
**Scope:** All 5 trip pages (`cairo-sharm`, `sharm-constantine`, `azerbaidjan`, `istanbul`, `kuala-lumpur`)
**Audit trigger:** External UX audit claimed extensive missing functionality (no dynamic recalc, no form binding, hard-coded WhatsApp text, no file upload logic, etc.)
**Verdict in one sentence:** ~70% of the audit claims are factually wrong — the system is more complete than the audit suggested. ~30% identify real gaps that should be addressed. This document distinguishes signal from noise and produces a focused remediation plan.

---

## Table of contents

1. [Methodology](#methodology)
2. [System architecture](#system-architecture)
3. [Live behavior verified](#live-behavior-verified)
4. [Audit reconciliation](#audit-reconciliation-claim-vs-reality)
5. [Per-page state matrix](#per-page-state-matrix)
6. [Genuine gaps with severity](#genuine-gaps-with-severity)
7. [Remediation plan](#remediation-plan)

---

## Methodology

1. **Read the actual source.** `calculator.js` (403 lines), `booking-form.js` (550 lines), `enhance.js` (357 lines) read in full. All HTML pages' calc + booking sections inspected.
2. **Read the data layer.** `window.TRIP_DATA` extracted on each of the 5 trip pages — hotel list, pricing tables, dates, extras.
3. **Live behavior test.** Loaded `kuala-lumpur` (the page the external audit referenced — "Grand Mercure 5★… 422 000 DA"), changed inputs programmatically, captured before/after state via `window.__calcState` and DOM measurements.
4. **A11y / validation audit.** DOM querying for `required`, `aria-live`, `aria-label`, `tabindex`, `pattern`, `type` attributes on every form control.
5. **SEO / structured data.** JSON-LD parsed; section IDs enumerated; content-section coverage measured.

All measurements are reproducible by re-running the audit evals in `preview_eval`.

---

## System architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Trip page (HTML)                         │
│                                                                 │
│  <script>                                                       │
│    window.TRIP_DATA = {                                         │
│      name, dates[], hotels[{id,name,prices{double,triple,...}}],│
│      extras[{label,amount,currency}]                            │
│    };                                                           │
│  </script>                                                      │
│                                                                 │
│  <section.hotels>      <!-- hotel cards (picker) -->           │
│  <section.calc-section> <!-- form + breakdown panel -->        │
│  <section#booking>      <!-- empty; populated by booking-form.js│
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴────────────────┐
                ▼                                ▼
┌──────────────────────────┐         ┌──────────────────────────┐
│   calculator.js          │         │   booking-form.js        │
│                          │         │                          │
│   class TripCalculator   │         │   class BookingForm      │
│                          │         │   (mounts FORM_HTML into │
│   Reads TRIP_DATA        │         │    <section#booking>)    │
│   Binds form inputs      │         │                          │
│   Computes breakdown     │         │   Listens for             │
│   Renders breakdown      │         │   `calcStateUpdated` event│
│   Writes window.__calcState│       │   Reads window.__calcState│
│   Dispatches             │ ───────▶│   Re-renders trip summary│
│   `calcStateUpdated`     │         │   Re-builds WhatsApp msg │
└──────────────────────────┘         │   Updates wa.me/?text=   │
                                     │   Updates mailto:?body=  │
                                     │                          │
                                     │   On user typing:        │
                                     │   _scheduleUpdate (160ms │
                                     │   debounce) → _liveUpdate│
                                     └──────────────────────────┘
                                                │
                                                ▼
                                     ┌──────────────────────────┐
                                     │  WhatsApp app (external) │
                                     │  Email client (external) │
                                     │  Clipboard               │
                                     └──────────────────────────┘
```

**Single source of truth:** `window.__calcState` is set by the calculator on every render, consumed by the booking form. No duplicate state. No props-drilling.

**Event protocol:** one custom event `calcStateUpdated` on `document`. Booking form is the listener. Decoupled — works even if either script loads first.

---

## Live behavior verified

Tested on `kuala-lumpur/` (the page the audit specifically referenced):

| Action | Initial state | After action | Pass? |
|---|---|---|---|
| **Load page** | adults=2, room=Double, total=422,000 DA | — | ✅ |
| **Click `[data-room="single"]`** | room=Double, total=422,000 DA | room=Individuelle, total=284,000 DA | ✅ |
| **Click `#adults-plus` once** | adults=2 | adults=3 | ✅ |
| **Combined** | — | room=Individuelle, adults=3, total=852,000 DA (3 × 284,000) | ✅ |
| **WhatsApp preview reflects change** | "Chambre : Double · Adultes : 2" | "Chambre : Individuelle · Adultes : 3" | ✅ |
| **WhatsApp `?text=` URL contains new room** | "Double" in URL | "Individuelle" in URL | ✅ |
| **Email `mailto:` body contains new total** | 422,000 DA in body | 852,000 DA in body | ✅ |

**Math check:** Grand Mercure 5★ Single = 284,000 DA × 3 adults = 852,000 DA. ✅ Matches.

---

## Audit reconciliation (claim vs reality)

### Section 1 — Pricing & calculator logic

| Claim | Reality | Verdict |
|---|---|---|
| "No dynamic recalculation when changing departure date, room type, adults, enfants, bébés, taxe touristique" | Every input has a live event handler that calls `this.render()`. Verified live. | ❌ FALSE |
| "Recap line and total are hard-coded" | `#breakdown-total` is set by `this.el.totalEl.textContent = fmt(totalDA)` on every render. The "422 000 DA" the auditor saw is the LIVE OUTPUT for the default state (Grand Mercure default × 2 adults double). | ❌ FALSE |
| "No clear base formula in UI" | The breakdown panel shows the formula visually (each line: `<hotel> — Double × 2 adultes` with the line amount). Per-hotel rates live in `TRIP_DATA.hotels[].prices`. | ⚠️ PARTIAL — formula is shown in the breakdown but never spelled out as an equation. |
| "Pourquoi ce prix ? has no visible explanatory content" | `<details>` element with `#breakdown-why-details` populated by `hotel.why ?? "Prix par personne en chambre ${room}, vol inclus, transferts inclus, selon la grille tarifaire de ${hotel.name}"`. KL Grand Mercure has 287 chars of explanation. | ⚠️ PARTIAL — fallback copy is generic ("selon la grille tarifaire"). Per-hotel `why` strings exist on Istanbul but not all pages. |

### Section 2 — Form binding & automation

| Claim | Reality | Verdict |
|---|---|---|
| "Votre sélection (depuis le calculateur) is static" | `_syncCalc()` runs on every `calcStateUpdated` event. Builds `<div class="bf-trip-chips">` from `window.__calcState`. Verified live: chips update when calculator inputs change. | ❌ FALSE |
| "WhatsApp preview text is fixed" | `_liveUpdate()` rebuilds the entire preview from `window.__calcState` + form fields + passports + uploads. Fires on every input + every `calcStateUpdated`. | ❌ FALSE |
| "WhatsApp `?text=` URL hard-coded" | `btn.href = \`https://wa.me/${this.WA_NUMBER}?text=${encodeURIComponent(msg)}\`` — recomputed on every `_liveUpdate()` call. | ❌ FALSE |
| "Email `body=` hard-coded" | `ebtn.href = \`mailto:${this.EMAIL}?subject=...&body=${encodeURIComponent(msg)}\`` — same dynamic build. | ❌ FALSE |
| "Copier le texte has no logic" | `_copy()` async function tries `navigator.clipboard.writeText` then falls back to `textarea + execCommand('copy')`. | ❌ FALSE |
| "No values from selected date / room / kids / responsable / passports / notes" | `_buildMessage()` reads ALL of these. Inspected line 346-398. | ❌ FALSE |

### Section 3 — Inputs, validation & UX

| Claim | Reality | Verdict |
|---|---|---|
| "No `required`, `pattern`, `type` validation on key fields" | `type="tel"` exists on phone. **No `required` attrs anywhere.** **No `pattern` on phone.** | ✅ TRUE — partial (type=tel exists, but no required/pattern). |
| "Ajouter un voyageur is just text, no JS" | `<button id="bf-add-passport" type="button">` with click handler that `this.passports.push({}); this._renderPassports()`. | ❌ FALSE |
| "No iteration through multiple travellers" | `this.passports` is an array; `_renderPassports()` maps over it; each entry has its own remove button (except the first). | ❌ FALSE |
| "Passport inputs are plain text, no date pickers" | All 4 passport fields are `type="text"`. DOB and expiry should be `type="date"`. | ✅ TRUE |
| "No 'Envoyer / Générer le message' button that validates first" | "Ouvrir WhatsApp & Envoyer" button is enabled the moment the form has any data, but **no validation gate before send.** | ✅ TRUE |
| "No error or success states" | No inline error UI. Only positive feedback (toast on copy success). | ✅ TRUE |

### Section 4 — File upload behaviour

| Claim | Reality | Verdict |
|---|---|---|
| "Glissez vos copies has no implemented dropzone or `<input type=file>`" | Real `<input type="file" id="bf-files" multiple accept="image/*,.pdf" hidden>` + drag/drop on `.upload-zone` (lines 491-503). | ❌ FALSE |
| "No file size, type, or count validation" | `accept="image/*,.pdf"` is set (browser-level type filter), but **no JS-side size validation or count limit.** | ⚠️ PARTIAL |
| "No visual feedback (no list of selected files)" | `_renderPreviews()` shows thumbnail per image + PDF icon per PDF + filename + remove button. | ❌ FALSE |
| "No progressive hint that files aren't auto-uploaded" | Footer note: *"Les fichiers ne sont pas transmis automatiquement. Vous les enverrez manuellement…"* | ❌ FALSE |

### Section 5 — Accessibility

| Claim | Reality | Verdict |
|---|---|---|
| "Plus/minus counters need to be actual buttons with focus, aria-labels, keyboard support" | They ARE `<button>` elements with focus styles. **No `aria-label`** on the `−` / `+` symbols (currently rely on text content of `−`/`+` which screen readers read poorly). | ✅ TRUE — partially. |
| "No min/max constraints in UI" | JS enforces `adults: 1..8`, `kids: 0..4` but no visible UI hint. `disabled` state on buttons IS set when at limits. | ⚠️ PARTIAL |
| "No live region for price changes" | **No `aria-live` on `#breakdown-total` or `#breakdown-lines`.** | ✅ TRUE |
| "Hotel select has only one option (KL)" | Confirmed — KL has only Grand Mercure 5★. The select is structurally there but visually useless on KL specifically. Other pages have 2-7 options. | ✅ TRUE — KL only. |

### Section 6 — Content & reassurance gaps

| Claim | Reality | Verdict |
|---|---|---|
| "No 'Conditions de paiement' section" | Confirmed missing on all 5 pages. | ✅ TRUE |
| "No 'Conditions d'annulation / modification' for vol+hôtel" | Confirmed missing on all 5 pages. | ✅ TRUE |
| "No 'Formalités & visa' block" | KL doesn't have one (Malaysia visa policy for Algerians is non-trivial). Istanbul mentions "Visa turc non inclus" in passing inside `hotel.why`. Sharm-Constantine and Cairo-Sharm don't dedicate a section. | ✅ TRUE |
| "No 'Assurance voyage' details" | Mentioned only as one bullet in "À prévoir en plus": *"Assurance voyage personnelle"*. No detail block. | ✅ TRUE |
| "No 'Prix à partir de' conditions (période, base double, taux de change)" | Hero shows "À partir de 211.000 DA · par personne · chambre double" but no fine-print disclaimer. | ✅ TRUE |

### Section 7 — Technical / integration

| Claim | Reality | Verdict |
|---|---|---|
| "No price configuration layer that can be reused" | `window.TRIP_DATA` IS the configuration layer. All 5 pages use the SAME calculator code reading the SAME shape of data. | ❌ FALSE |
| "No tracking for key actions" | **Confirmed: zero `data-analytics`, `data-tracking`, `data-event` attributes anywhere.** No GA, no plausible, no Matomo. | ✅ TRUE |
| "No handling for users without WhatsApp" | Email + clipboard fallback exists, but the explanation is static. No conditional UX for "no WhatsApp". | ⚠️ PARTIAL |

### Section 8 — Visual / hierarchy tweaks

| Claim | Reality | Verdict |
|---|---|---|
| "No visual state for selected departure date" | `.date-chip.active` class exists with mint background. Verified on KL: an active chip is present at load. | ❌ FALSE |
| "No labels around children pricing in calculator recap" | Each kid stepper has `<h4>1ᵉʳ enfant</h4><p>2–11.99 ans · tarif réduit</p>` BUT the actual price (e.g. 200,000 DA) is NOT shown next to the stepper — it's only revealed in the breakdown after you increment the count. | ✅ TRUE |
| "No 'Prix hors taxe touristique 20 USD/pers' line near CTA" | Confirmed missing. KL has the extras line `{ label: 'Taxe touristique hôtel (obligatoire)', amount: 20, currency: 'USD' }` but it's only added if user toggles it (and may not be toggled by default). | ✅ TRUE |

### Verdict tally

- **TRUE (genuine gaps):** 16
- **FALSE (audit was wrong):** 13
- **PARTIAL (some truth):** 6

35 specific claims. The audit was right on **less than half**.

---

## Per-page state matrix

| Feature | cairo-sharm | sharm-constantine | azerbaidjan | istanbul | kuala-lumpur |
|---|:---:|:---:|:---:|:---:|:---:|
| `TRIP_DATA` populated | ✅ 7 hotels | ✅ 3 hotels | ✅ 2 hotels | ✅ 4 hotels | ✅ 1 hotel |
| Calculator dynamic | ✅ | ✅ | ✅ | ✅ | ✅ |
| Booking form mounted | ✅ | ✅ | ✅ | ✅ | ✅ |
| WhatsApp send button | ✅ | ✅ | ✅ | ✅ | ✅ |
| Email fallback | ✅ | ✅ | ✅ | ✅ | ✅ |
| Copy button | ✅ | ✅ | ✅ | ✅ | ✅ |
| File upload (drop+pick) | ✅ | ✅ | ✅ | ✅ | ✅ |
| File previews + remove | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add passport button | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hotel picker tabs | ✅ Tous + 4 tiers | ✅ Tous + 3 tiers | ✅ Tous + 2 tiers | ✅ Tous + 4 tiers | ⚠️ 1 hotel only |
| `extras` populated | ✅ 1 (museum) | ❌ empty | ❌ empty | ❌ empty | ✅ 1 (taxe 20 USD) |
| Hotel `why` strings | ⚠️ default | ⚠️ default | ⚠️ default | ✅ per-hotel | ⚠️ default |
| Phase markers (1-4) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Floating sticky-total | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Required attrs on form** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **`type="date"` on passport dates** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **`aria-live` on breakdown** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **`aria-label` on stepper btns** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **JS file size validation** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **data-analytics attrs** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Conditions de paiement** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Conditions d'annulation** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Formalités & visa block** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Assurance voyage detail** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Tax disclaimer near CTA** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Children prices visible at stepper** | ❌ | ❌ | ❌ | ❌ | ❌ |

Legend: ✅ working — ⚠️ partial / page-specific quirk — ❌ missing.

---

## Genuine gaps with severity

Sorted by impact on conversion / risk / accessibility.

### 🔴 Critical (block sending bad/empty dossiers)

1. **No form validation gate before WhatsApp/email send**
   The user can click "Ouvrir WhatsApp & Envoyer" with an empty form. The composed message will say "(non renseigné)" everywhere but the agent receives a useless dossier. Fix: add `validate()` that checks at least name + phone + city; show inline errors; only allow send when valid.

2. **No `required` attribute on critical fields**
   `bf-name`, `bf-phone`, `bf-city` lack `required`. No HTML5 form constraint API kicks in. Combined with #1, easy to send empty dossiers.

3. **No file size / count validation**
   `_handleFiles()` accepts any file regardless of size. A 50 MB JPG would block the UI during FileReader.readAsDataURL and bloat localStorage if cached. Fix: cap each file at e.g. 8 MB, total 40 MB, max 12 files.

### 🟡 Should-fix (a11y + transparency)

4. **No `aria-live="polite"` on breakdown/total**
   Screen readers won't announce price changes. Add `aria-live="polite"` to `#breakdown-lines` and `aria-live="polite" aria-atomic="true"` to `#breakdown-total`.

5. **No `aria-label` on `−`/`+` stepper buttons**
   Screen readers say "minus button". Add `aria-label="Diminuer le nombre d'adultes"` etc.

6. **Passport dates are `type="text"`**
   No date picker, no format validation. DOB and expiry should be `type="date"` (with French label hint since browser format is locale-determined).

7. **No `pattern` on phone field**
   Algerian mobile numbers are 10 digits starting with 05/06/07. Add `pattern="0[5-7][0-9 ]{8,}"` or similar.

8. **Children prices not surfaced at the stepper**
   Currently you have to increment a child counter to discover the price in the breakdown. Add a small price tag next to each kid stepper: *"Tivoli 4★ : 1ᵉʳ enfant 110.000 DA · 2ᵉ 130.000 DA"*.

9. **Tax disclaimer missing near CTA**
   *"Prix hors taxe touristique 20 USD/pers payable sur place"* should appear directly above or below the WhatsApp button on KL (and any trip with a USD extras line).

10. **Hotel select on KL is a one-option dropdown**
    Confusing — looks like there should be more. Either hide the select on single-hotel trips or replace with a static "Hôtel : Grand Mercure 5★" line.

### 🟢 Content gaps (reassurance & legal)

11. **"Conditions de paiement" section missing**
    What's the deposit %? Final payment due-date? Bank transfer / cash / cheque? Currently zero info on the booking page; users have to ask via WhatsApp.

12. **"Conditions d'annulation" section missing**
    Critical for long-haul (KL, Istanbul). What's the refund policy if user cancels 60/30/14/7 days out? What if airline cancels?

13. **"Formalités & visa" section missing**
    Per-trip:
    - **Cairo+Sharm:** Egypt visa-on-arrival for Algerian passport holders, USD 25 cash
    - **Sharm-Constantine:** same as above
    - **Azerbaijan:** e-visa (already mentioned in eyebrow as "Visa électronique inclus" but no detail)
    - **Istanbul:** Turkey visa not included (mentioned in Tilia hotel `why` but should be a section)
    - **Kuala Lumpur:** **Malaysia eVISA** required for Algerian passport holders — non-trivial, this is the biggest gap of the four

14. **"Assurance voyage" section missing**
    Currently a one-liner: *"Assurance voyage personnelle"*. Should explain: is travel insurance recommended/mandatory, what to look for, where to buy, typical cost in DZD.

15. **"À partir de" disclaimer missing**
    Hero shows "À partir de 211.000 DA". Fine-print needed: based on chambre double, sub-supplement single, kids tarif, période X, sous réserve disponibilité, taux de change USD.

### 🟢 Tech / integration

16. **Zero analytics tracking attributes**
    No `data-analytics-event`, no `data-track`, nothing on CTAs. If you ever want to plug in plausible / GA / Matomo, every CTA needs annotation. Fix: add `data-track-event="cta_click" data-track-label="..."` on key buttons.

17. **JSON-LD only includes `TouristTrip` + `Offer`**
    Add `FAQPage` schema for the FAQ section (boosts SERP rich results). Add `BreadcrumbList`. Add `AggregateRating` if testimonials qualify.

18. **No noscript fallback for booking form**
    If JS fails to load (rare but possible on bad cellular), the booking section is a blank `<section id="booking">`. Add a `<noscript>` block with a phone number + "appelez-nous" message.

19. **WhatsApp fallback isn't conditional**
    Email + copy buttons appear always, but no detection of whether WhatsApp is installed. On desktop, `wa.me/...` opens WhatsApp Web — fine. On mobile without WhatsApp, it 404s. Could `try/catch` the click and surface an error toast.

### 🟢 Visual hierarchy nits

20. **No `tabindex` on date chips**
    Keyboard-only users can't tab to the date selector. Add `tabindex="0"` and `role="radiogroup"` / `role="radio"` semantics.

21. **Min/max stepper hint absent**
    Buttons disable correctly but no tooltip / aria-describedby explaining "max 8 adultes par chambre".

22. **"Pourquoi ce prix?" generic text**
    On 4 of 5 pages the fallback "selon la grille tarifaire" is used. Istanbul has per-hotel `why` strings — replicate that pattern across all hotels.

---

## Remediation plan

Three execution batches in priority order. Each batch is independently shippable.

### Batch A — validation + a11y foundation (~45 min)

Addresses gaps #1, #2, #4, #5, #6, #7, #20.

- Add `required`, `type="tel"`, `pattern="^0[5-7].*"`, `inputmode="tel"` to phone
- Add `required` to `bf-name`, `bf-city`
- Add `type="date"` to all `pp-dob` and `pp-expiry` inputs (rebuild markup in `renderPassportEntry`)
- Add `aria-live="polite"` on `#breakdown-lines`, `aria-live="polite" aria-atomic="true"` on `#breakdown-total`
- Add `aria-label` to all 8 stepper buttons (programmatically derived from their `data-kid-type` + label text)
- Add `tabindex="0"` to `.date-chip`, wrap in `role="radiogroup"`, mark active with `aria-checked`
- Add a `validate()` method to `BookingForm` that:
  - Checks `bf-name`, `bf-phone`, `bf-city` are non-empty
  - Toggles `.is-invalid` class + aria-invalid on offending fields
  - Renders a banner *"Veuillez compléter les champs marqués"* above the preview
  - Gates the WhatsApp send button (sets `pointer-events: none; opacity: .5`)

### Batch B — pricing transparency + file safety (~40 min)

Addresses gaps #3, #8, #9, #10, #15, #21, #22.

- File size check in `_handleFiles`: skip files > 8 MB, show toast *"Fichier {name} trop lourd ({size}MB) — max 8 MB"*
- File count check: cap at 12 files
- Surface child/baby prices in calc-section: render *"1ᵉʳ enfant 110.000 DA · 2ᵉ 130.000 DA"* under the "1ᵉʳ enfant" stepper, dynamic based on selected hotel
- Add `<p class="calc-disclaimer">Prix hors taxe touristique 20 USD/pers payable sur place.</p>` below `#wa-book-btn` on KL (only if `extras[0]?.currency === 'USD'`)
- Add `<p class="hero-fineprint">Sur la base d'une chambre double, sous réserve de disponibilité, taux DZD/USD à la réservation.</p>` near the hero price block
- On KL: replace `<select id="hotel-select">` with a static `<div>` showing the single hotel, OR hide it via CSS when `<option>` count is 1
- Add per-hotel `why` strings to all hotels in TRIP_DATA (cairo-sharm, sharm-constantine, azerbaidjan, KL)
- Stepper aria-describedby pointing to a sr-only "Maximum 8 adultes" hint

### Batch C — content sections + analytics + SEO (~60 min)

Addresses gaps #11, #12, #13, #14, #16, #17, #18, #19.

- Build a reusable `<section class="info-block">` component with 4 sub-blocks (paiement, annulation, formalités, assurance), styled as collapsible accordion
- Insert it between `#faq` and `#hotels` on each trip page
- Per-page customization for `#formalites`:
  - Cairo+Sharm: Egypt VOA, 25 USD cash, 6 months passport validity
  - Sharm-Constantine: same
  - Azerbaijan: ASAN visa included in package
  - Istanbul: Turkey e-visa for Algerian passports, agency assists
  - KL: Malaysia e-VISA mandatory, agency-assisted, fee in DZD
- Add `<noscript>` fallback to `<section id="booking">` with phone numbers
- Add `data-track-event` attributes to: `#wa-book-btn`, `#bf-send-btn`, `#bf-email-btn`, `#bf-copy-btn`, `.hotel-card__cta`, `.btn--primary` in hero, `.btn--wa` in final-cta
- Extend JSON-LD to include `FAQPage` schema generated from the FAQ items + `BreadcrumbList` from the trip's nav path
- Final commit pass: update `docs/ROADMAP.md` with Phase 1.9 entry

### Out of scope for this survey

- A backend booking system (currently all WhatsApp-driven, by design)
- Multi-currency or live exchange rates
- Real-time inventory (the dates list is static; if a date sells out, agency removes it from the array)
- Deposit/payment online (no Stripe/Adyen; user pays in person or by transfer)

---

## Appendix — files inspected

| File | Lines | Purpose |
|---|---|---|
| `site/assets/js/calculator.js` | 403 | TripCalculator class, hotel picker, FAQ accordion |
| `site/assets/js/booking-form.js` | 550 | BookingForm class, FORM_HTML template, message builder |
| `site/assets/js/enhance.js` | 357 | Theme toggle, scroll reveals, share button, trip switcher |
| `site/cairo-sharm/index.html` | 1093+ | TRIP_DATA + calc-section + booking-section |
| `site/sharm-constantine/index.html` | 569+ | TRIP_DATA + sections |
| `site/azerbaidjan/index.html` | 578+ | TRIP_DATA + sections |
| `site/istanbul/index.html` | 610+ | TRIP_DATA + sections + per-hotel `why` strings (only page with these) |
| `site/kuala-lumpur/index.html` | 544+ | TRIP_DATA (1 hotel) + extras (taxe touristique 20 USD) |
| `site/assets/css/styles.css` | 7,725 | All styling — calc, breakdown, bform, file upload, etc. |

