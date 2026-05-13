#!/usr/bin/env python3
"""
v15 Batch C1 — Insert practical info-block section on each trip page.

Four sub-blocks: Paiement · Annulation · Formalités · Assurance.
Inserted right before <section class="related-section section">.
Idempotent — re-running won't duplicate.

Per-page formalités content varies:
- cairo-sharm / sharm-constantine: Egypt VOA, 25 USD cash, 6 months passport
- azerbaidjan: ASAN visa included
- istanbul: Turkey e-visa for Algerian passports
- kuala-lumpur: Malaysia eVISA mandatory (the most complex)
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


# Per-page formalités content (visa specifics)
FORMALITES = {
    "cairo-sharm": {
        "title": "Visa égyptien à l'arrivée",
        "items": [
            ("Visa", "<strong>Visa on Arrival</strong> (VOA) délivré au comptoir à l'arrivée. Aucune démarche préalable."),
            ("Coût", "<strong>25 USD en espèces</strong> par personne, à régler en arrivant à l'aéroport (Le Caire ou Sharm). Prévoir le montant exact en USD."),
            ("Passeport", "Validité minimum <strong>6 mois après la date de retour</strong>, 2 pages vierges minimum."),
            ("Documents", "Passeport + billet retour. Photo d'identité non requise. Le formulaire d'immigration est rempli dans l'avion ou à l'arrivée."),
            ("Bébés / enfants", "Mêmes conditions. Les enfants doivent figurer sur leur propre passeport."),
        ],
    },
    "sharm-constantine": {
        "title": "Visa égyptien à l'arrivée",
        "items": [
            ("Visa", "<strong>Visa on Arrival</strong> (VOA) délivré au comptoir à Sharm El Sheikh. Aucune démarche préalable."),
            ("Coût", "<strong>25 USD en espèces</strong> par personne. Prévoir le montant exact en USD."),
            ("Passeport", "Validité minimum <strong>6 mois après le retour</strong>, 2 pages vierges minimum."),
            ("Vol", "Trajet Constantine → Istanbul → Sharm El Sheikh (Turkish Airlines). Transit Istanbul sans sortir."),
            ("Bébés / enfants", "Mêmes conditions. Les enfants doivent figurer sur leur propre passeport."),
        ],
    },
    "azerbaidjan": {
        "title": "Visa électronique Azerbaïdjan — INCLUS",
        "items": [
            ("Visa", "<strong>e-Visa ASAN inclus dans le forfait.</strong> Alliance Travel s'occupe de la demande et vous transmet le visa par email."),
            ("Délai", "Délai de traitement <strong>3 à 5 jours ouvrés</strong>. Nous demandons les copies de passeport au plus tard 21 jours avant le départ."),
            ("Coût visa", "Inclus — vous n'avez rien à payer en plus pour le visa."),
            ("Passeport", "Validité minimum <strong>6 mois après le retour</strong>, 2 pages vierges minimum."),
            ("Documents requis", "Copie scan/photo du passeport en couleur (page d'identité) — c'est tout. Aucun rendez-vous consulaire."),
        ],
    },
    "istanbul": {
        "title": "Visa Turquie pour les ressortissants algériens",
        "items": [
            ("Visa", "<strong>Visa Turquie obligatoire</strong> pour les passeports algériens. Demande en ligne sur evisa.gov.tr OU vignette à l'arrivée selon votre profil."),
            ("Coût", "Environ <strong>50 USD</strong>. Variable selon le mode de demande."),
            ("Délai", "e-Visa : <strong>1 à 3 jours ouvrés</strong>. Vignette à l'arrivée : immédiate mais files d'attente possibles."),
            ("Accompagnement", "Sur demande, Alliance Travel peut <strong>vous assister dans la démarche e-Visa</strong> (assistance gratuite, le visa lui-même restant à votre charge)."),
            ("Passeport", "Validité minimum <strong>6 mois après le retour</strong>."),
        ],
    },
    "kuala-lumpur": {
        "title": "Visa Malaisie — eVISA obligatoire",
        "items": [
            ("Visa", "<strong>eVISA Malaisie obligatoire</strong> pour les passeports algériens. Demande en ligne via le portail officiel imi.gov.my."),
            ("Coût", "Environ <strong>40 USD</strong> + frais de service éventuels. À votre charge."),
            ("Délai", "Traitement <strong>2 à 5 jours ouvrés</strong>. Nous recommandons d'initier la demande au moins 3 semaines avant le départ."),
            ("Accompagnement", "Alliance Travel <strong>vous assiste pas à pas</strong> dans la procédure eVISA — fournit la check-list documents, vérifie le dossier avant soumission. Service gratuit."),
            ("Passeport", "Validité minimum <strong>6 mois après le retour</strong>, 2 pages vierges minimum, en bon état."),
            ("Documents requis", "Copie passeport (page d'identité) + photo d'identité format passeport sur fond blanc + billet retour confirmé."),
        ],
    },
}

# Common content shared across all pages
PAIEMENT_HTML = """
        <details class="info-card" open>
          <summary class="info-card__head">
            <span class="info-card__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </span>
            <span class="info-card__title">Conditions de paiement</span>
            <svg class="info-card__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div class="info-card__body">
            <ul class="info-list">
              <li><strong>Acompte de réservation</strong> · 30 % du montant total au moment de la confirmation, à régler dans les 48 h après accord par WhatsApp.</li>
              <li><strong>Solde</strong> · 70 % restants au plus tard <strong>21 jours avant le départ</strong>.</li>
              <li><strong>Modes acceptés</strong> · Virement bancaire (BNA, BEA, CPA), versement en agence, espèces. Pas de carte bancaire en ligne pour le moment.</li>
              <li><strong>Reçu</strong> · Reçu officiel Alliance Travel remis à chaque versement.</li>
              <li><strong>Devis valable</strong> 7 jours · Les prix peuvent évoluer selon la disponibilité aérienne et le taux de change.</li>
            </ul>
          </div>
        </details>
"""

ANNULATION_HTML = """
        <details class="info-card">
          <summary class="info-card__head">
            <span class="info-card__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </span>
            <span class="info-card__title">Conditions d'annulation</span>
            <svg class="info-card__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div class="info-card__body">
            <p class="info-card__lede">Annulation par le client (selon le délai avant départ) :</p>
            <ul class="info-list info-list--tiered">
              <li><strong>≥ 60 jours avant départ</strong> · Remboursement intégral moins frais de dossier (5 000 DA).</li>
              <li><strong>30 à 59 jours</strong> · Retenue de 30 % du montant total.</li>
              <li><strong>14 à 29 jours</strong> · Retenue de 60 % du montant total.</li>
              <li><strong>7 à 13 jours</strong> · Retenue de 80 %.</li>
              <li><strong>&lt; 7 jours</strong> · Pas de remboursement (frais aériens et hôteliers définitifs).</li>
            </ul>
            <p class="info-card__note">
              <strong>Annulation par la compagnie aérienne ou l'hôtel</strong> · Remboursement intégral ou re-routing sans frais supplémentaires de notre part.
              <br>
              <strong>Modification de date</strong> possible jusqu'à 30 jours avant départ, sous réserve de disponibilité et du différentiel tarifaire.
            </p>
          </div>
        </details>
"""

ASSURANCE_HTML = """
        <details class="info-card">
          <summary class="info-card__head">
            <span class="info-card__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            <span class="info-card__title">Assurance voyage</span>
            <svg class="info-card__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div class="info-card__body">
            <p class="info-card__lede">
              L'assurance voyage <strong>n'est pas incluse</strong> dans le forfait mais elle est <strong>fortement recommandée</strong> — surtout pour les voyages long-courrier.
            </p>
            <ul class="info-list">
              <li><strong>Couverture conseillée</strong> · Frais médicaux d'urgence (≥ 100 000 €), rapatriement sanitaire, perte/vol de bagages, annulation voyage.</li>
              <li><strong>Coût indicatif</strong> · 1 500 à 4 000 DA par personne selon la durée et la destination.</li>
              <li><strong>Où souscrire</strong> · Assureurs algériens (CAAR, SAA, CAAT) ou compagnies internationales (Mondial Assistance, Europ Assistance).</li>
              <li><strong>Sur demande</strong>, Alliance Travel peut vous orienter vers un partenaire assureur qui propose des formules voyage.</li>
            </ul>
          </div>
        </details>
"""


def build_formalites_html(slug: str) -> str:
    cfg = FORMALITES[slug]
    items_html = "\n".join(
        f'              <li><strong>{label}</strong> · {body}</li>'
        for label, body in cfg["items"]
    )
    return f"""
        <details class="info-card">
          <summary class="info-card__head">
            <span class="info-card__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 21v-1a5 5 0 0 1 10 0v1"/></svg>
            </span>
            <span class="info-card__title">Formalités &amp; visa</span>
            <svg class="info-card__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div class="info-card__body">
            <p class="info-card__lede"><strong>{cfg['title']}</strong></p>
            <ul class="info-list">
{items_html}
            </ul>
          </div>
        </details>
"""


def build_section_html(slug: str) -> str:
    return f"""<section class="info-block-section section" id="conditions" aria-label="Informations pratiques pour votre réservation">
  <div class="container">
    <div class="section-head">
      <p class="section-head__eyebrow">Avant de partir</p>
      <h2 class="section-head__title">Tout ce qu'il <em>faut savoir</em></h2>
      <p class="section-head__sub">Paiement, annulation, formalités visa, assurance — la transparence en quatre blocs.</p>
    </div>
    <div class="info-block-grid">
{PAIEMENT_HTML}
{ANNULATION_HTML}
{build_formalites_html(slug)}
{ASSURANCE_HTML}
    </div>
  </div>
</section>
"""


# Insertion target: right before the related-section
INSERT_RE = re.compile(r'(<section class="related-section section"[^>]*>)')


def process(slug: str) -> dict:
    path = SITE / slug / "index.html"
    if not path.exists():
        return {"slug": slug, "error": "missing"}

    html = path.read_text(encoding="utf-8")
    if 'class="info-block-section' in html or 'id="conditions"' in html:
        return {"slug": slug, "skipped": "already present"}

    section = build_section_html(slug)
    new_html, n = INSERT_RE.subn(section + r'\1', html, count=1)
    if n == 0:
        return {"slug": slug, "error": "no related-section anchor found"}

    path.write_text(new_html, encoding="utf-8")
    return {"slug": slug, "inserted": True}


if __name__ == "__main__":
    print("v15 Batch C1 — info-block insertion\n")
    for slug in ["cairo-sharm", "sharm-constantine", "azerbaidjan", "istanbul", "kuala-lumpur"]:
        r = process(slug)
        if r.get("error"):
            print(f"  [FAIL] {slug:<20} {r['error']}")
        elif r.get("skipped"):
            print(f"  [SKIP] {slug:<20} {r['skipped']}")
        else:
            print(f"  [OK]   {slug:<20} info-block-section inserted")
    print("\nDone.")
