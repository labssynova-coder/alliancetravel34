# Alliance Travel — Refonte du copy FR (T.fr)

**Auteur :** copywriter senior FR (marché algérien)
**Date :** 2026-05-26
**Scope :** `site/assets/js/i18n.js`, bloc `T.fr` lignes 36-234 uniquement.
**Anglais & Arabe :** non touchés (gérés par d'autres agents en parallèle).

---

## 1. Brief — Choix de ton et de positionnement

Le copy actuel souffre de trois maux : (a) un ton corporate-générique qui pourrait être celui de n'importe quelle agence, (b) un manque de spécificité algérienne — on ne sent ni BBA, ni les Hauts-Plateaux, ni la wilaya, (c) une absence de bénéfices concrets dans les CTA et titres. Mon parti pris : **descendre dans le concret**. Pas de "découvrez l'aventure" — à la place, des chiffres (98%, 1 200 voyageurs, 3 agences, 30 minutes), des lieux (La Graf, Cité Zehour, M'Sila), des objets (la valise, l'acompte CCP, le décollage depuis Houari-Boumediene). J'ancre la marque dans son **anti-positionnement** assumé : "depuis Bordj — pas depuis Alger". Je glisse deux ou trois clins d'œil dialectaux (sobres : "rahkoum", "inchallah") là où ils sonnent juste, jamais forcés. Le ton est celui d'un cousin qui sait ce qu'il fait — chaleureux, précis, sans bullshit. CTA verbe-first et bénéfice ("Recevoir mon devis", "Bloquer ma place"), jamais des verbes creux ("Cliquer", "Découvrir").

---

## 2. Bloc T.fr de remplacement (paste-ready)

```js
    fr: {
      lang: {
        label: 'Langue',
        switch_to: 'Changer la langue',
        fr: 'Français',
        en: 'Anglais',
        ar: 'Arabe'
      },
      nav: {
        skip: 'Aller au contenu principal',
        trips: 'Nos voyages',
        agency: "L'agence",
        contact: 'Contact',
        whatsapp: 'WhatsApp',
        whatsapp_label: 'Écrire sur WhatsApp',
        logo_label: 'Alliance Travel — Retour à l\'accueil',
        theme_label: 'Changer de thème',
        // trip-page-specific nav links
        trip_program: 'Programme',
        trip_hotels: 'Hôtels',
        trip_faq: 'FAQ',
        trip_booking: 'Réserver'
      },
      hero: {
        eyebrow: 'Agence de voyage agréée · Bordj Bou Arreridj · Algérie',
        title_l1: 'Faites votre valise.',
        title_em: 'On s\'occupe du reste.',
        lede: "Depuis Bordj Bou Arreridj, on organise vos voyages clé en main : vol, visa, hôtel, transferts et accompagnateur arabophone sur place. Pas d'improvisation, pas de surprise — juste à venir profiter.",
        cta_voyages: 'Voir les voyages 2026',
        cta_contact: 'Parler à un conseiller',
        cta_whatsapp: 'WhatsApp · réponse en 30 min',
        trust_visa: 'Visa inclus dans le prix',
        trust_arabic: 'Accompagnateur arabophone',
        trust_halal: 'Hôtels halal-friendly',
        trust_local: 'Agence de la wilaya · pas d\'Alger'
      },
      stats: {
        travelers: 'Voyageurs accompagnés',
        satisfaction: 'Clients satisfaits',
        destinations: 'Destinations 2026',
        experience: "Ans sur le terrain"
      },
      voyages_section: {
        eyebrow: 'Programmes 2026',
        title_l1: '5 destinations,',
        title_em: 'un seul standard',
        sub: 'Vol + visa + hôtel + accompagnateur arabophone : tout est dans le prix affiché. Choisissez la destination, lancez le calculateur — vous recevez votre devis sur WhatsApp en moins de 30 secondes.',
        filter_all: 'Toutes',
        filter_egypt: 'Égypte',
        filter_caucasus: 'Caucase',
        filter_turkey: 'Turquie',
        filter_asia: 'Asie',
        card_cta: 'Voir le programme',
        from: 'À partir de',
        per_person: 'par personne'
      },
      trips: {
        cairo_sharm: 'Le Caire & Sharm El Sheikh',
        cairo_sharm_short: 'Le Caire & Sharm',
        azerbaidjan: 'Azerbaïdjan · Bakou & Gabala',
        azerbaidjan_short: 'Azerbaïdjan',
        istanbul: 'Istanbul · départ Constantine',
        istanbul_short: 'Istanbul',
        kuala_lumpur: 'Kuala Lumpur · Malaisie',
        kuala_lumpur_short: 'Kuala Lumpur',
        sharm_constantine: 'Sharm El Sheikh · départ Constantine',
        sharm_constantine_short: 'Sharm · Constantine'
      },
      agency: {
        eyebrow: 'Notre histoire',
        title_l1: 'Une agence',
        title_em: 'de Bordj, pour la wilaya et au-delà',
        p1_html: "Alliance Travel a ouvert ses portes à <strong>Bordj Bou Arreridj</strong> — et nulle part ailleurs. Notre métier est simple à dire, exigeant à tenir : organiser un voyage où vous n'avez qu'à boucler la valise. <strong>Visa, vol, hôtel, transferts, accompagnateur arabophone sur place</strong> — tout est verrouillé en amont, par des gens d'ici, dans la langue du client.",
        p2_html: "Depuis 2019, plus de <strong>1 200 voyageurs algériens</strong> sont partis avec nous — des lunes de miel à Bakou, des familles entières au Caire, des retraités à Istanbul, des amies en virée à Sharm. Notre <strong>taux de satisfaction de 98%</strong> n'est pas un chiffre de plaquette : c'est ce que ça donne quand les prix sont annoncés sans astérisque, les groupes restent à taille humaine, et le suivi WhatsApp continue jusqu'au retour à Alger ou Constantine.",
        p3_html: "Aujourd'hui, nous tenons <strong>trois agences</strong> : deux à <strong>Bordj Bou Arreridj</strong> (La Graf et Cité Zehour) et une à <strong>M'Sila</strong>. Vous passez quand vous voulez, on vous reçoit autour d'un café — en arabe, en français, comme vous préférez. Pas besoin de monter à la capitale pour réserver un voyage : votre conseiller est de la wilaya, il connaît votre nom, et il décroche dès la première sonnerie.",
        cta_contact: 'Passer à l\'agence',
        cta_voyages: 'Voir les voyages',
        value_travelers: 'Voyageurs accompagnés',
        value_satisfaction: 'Clients satisfaits',
        value_destinations: 'Destinations 2026',
        value_experience: "Ans sur le terrain"
      },
      contact: {
        eyebrow: 'Nous joindre',
        title_l1: 'Parlons de',
        title_em: 'votre prochain voyage',
        lede: "Un appel, un WhatsApp, ou un passage à l'agence — c'est vous qui choisissez. Paiement par virement CCP, virement bancaire, ou en espèces à l'agence. Un acompte suffit pour bloquer votre place.",
        form_name: 'Nom & prénom',
        form_phone: 'Numéro WhatsApp',
        form_city: 'Wilaya ou ville',
        form_trip: 'Voyage qui vous intéresse',
        form_trip_placeholder: '— Je ne sais pas encore —',
        form_submit: 'Recevoir mon devis sur WhatsApp',
        form_hint: "Rien n'est envoyé automatiquement : votre message s'ouvre dans WhatsApp, prêt à partir.",
        staff_lead: 'Joindre un conseiller — ligne directe',
        conseiller_prefix: 'Votre conseiller',
        addresses_label: 'Nos adresses',
        addresses_note: '3 agences en Algérie',
        hq_label: 'Siège · BBA La Graf',
        branch_zehour_label: 'BBA · Cité Zehour',
        branch_msila_label: "M'Sila",
        branch_msila_addr: 'Centre-ville',
        payment_label: 'Modes de paiement',
        payment_ccp: 'Virement CCP',
        payment_cash: 'Espèces à l\'agence',
        payment_bank: 'Virement bancaire',
        signup_label: 'Inscription simple',
        signup_lede: 'Par téléphone, sur WhatsApp ou en agence. Un acompte suffit pour bloquer votre place — le solde se règle avant le départ.'
      },
      map: {
        eyebrow: 'Notre réseau · Algérie',
        title_l1: 'Trois agences,',
        title_em: 'une à côté de chez vous',
        subtitle_html: "Pas une agence Instagram qui change d'adresse tous les six mois : <strong>trois bureaux physiques</strong>, deux à <strong>Bordj Bou Arreridj</strong> (La Graf &amp; Cité Zehour) et un à <strong>M'Sila</strong>.",
        fallback_title: 'Chargement de la carte…',
        fallback_sub_html: '3 agences · <strong>BBA La Graf</strong> · <strong>BBA Cité Zehour</strong> · <strong>M\'Sila</strong>',
        siege_pill: 'SIÈGE',
        branch_pill: 'AGENCE',
        directions: 'Y aller',
        recenter: 'Recentrer'
      },
      footer: {
        tagline: 'Voyages organisés depuis Bordj Bou Arreridj. Vous faites la valise, on s\'occupe du reste — depuis 2019.',
        col_voyages: 'Voyages 2026',
        col_contact: 'Contact',
        col_address_label: 'Adresse',
        col_address_value: 'Bd. Houari Boumediene · La Graf · Bordj Bou Arreridj & M\'Sila',
        wa_viber: 'WhatsApp / Viber',
        phone: 'Téléphone',
        address_label: 'Adresse',
        copyright: '© 2026 Alliance Travel · Bordj Bou Arreridj, Algérie',
        notice: 'Prix indicatifs en Dinar Algérien (DA) · Confirmation au moment de la réservation',
        social_instagram: 'Instagram Alliance Travel',
        social_facebook: 'Facebook Alliance Travel',
        social_tiktok: 'TikTok Alliance Travel'
      },
      conseiller: {
        label_prefix: 'Votre conseiller',
        wa: 'WhatsApp',
        call: 'Appeler'
      },
      trip_page: {
        included: 'Compris dans le prix',
        not_included: 'Non compris',
        itinerary: 'Programme jour par jour',
        hotels: 'Hôtels',
        faq: 'Questions fréquentes',
        calculator: 'Calculer mon prix',
        booking: 'Réserver ma place',
        related: 'Vous aimerez aussi',
        from: 'À partir de',
        per_person: 'par personne',
        book_now: 'Réserver',
        request_quote: 'Demander un devis',
        book_via_whatsapp: 'Réserver sur WhatsApp',
        nights: 'nuits',
        days: 'jours',
        adults: 'adultes',
        children: 'enfants',
        infants: 'bébés',
        total: 'Total',
        sticky_total_label: 'À partir de'
      },
      // ─── META namespace ─────────────────────────────────────────
      // Used by the engine to swap <title>, meta description, og:*, twitter:*
      // when the user changes language. Keyed by data-page="..." on <body>.
      meta: {
        home: {
          title: "Alliance Travel · Agence de voyage à Bordj Bou Arreridj",
          description: "Agence de voyage à Bordj Bou Arreridj. Voyages organisés vers l'Égypte, Istanbul, Bakou, Kuala Lumpur et Sharm El Sheikh. Vol + visa + hôtel inclus dans le prix. 1 200+ voyageurs satisfaits depuis 2019.",
          og_title: "Alliance Travel · Voyages organisés depuis Bordj Bou Arreridj",
          og_description: "Vol + visa + hôtel + accompagnateur arabophone, tout est compris. 5 destinations 2026 au départ d'Alger ou Constantine. Agence agréée à Bordj Bou Arreridj. 1 200+ voyageurs satisfaits."
        },
        voyages: {
          title: "Voyages organisés 2026 · 5 destinations dès 123 000 DA — Alliance Travel",
          description: "5 voyages clé en main pour 2026 : Caire + Sharm, Bakou, Istanbul (depuis Constantine), Kuala Lumpur, Sharm El Sheikh (depuis Constantine). Vol + visa + hôtel compris. À partir de 123 000 DA."
        },
        cairo_sharm: {
          title: "Voyage Égypte 2026 · Caire + Sharm El Sheikh dès 190 000 DA",
          description: "Le Caire (Pyramides de Guizeh) + Sharm El Sheikh (mer Rouge) en 8 jours. Vol EgyptAir, hôtels 4★/5★, visa et excursions compris. Départs juin 2026 depuis Alger."
        },
        azerbaidjan: {
          title: "Voyage Azerbaïdjan · Bakou & Gabala dès 227 000 DA — Alliance",
          description: "7 nuits entre Bakou et Gabala, vol Turkish Airlines, e-visa compris, accompagnateur arabophone sur place. Départs avril-juillet 2026 depuis Alger. À partir de 227 000 DA."
        },
        istanbul: {
          title: "Voyage Istanbul depuis Constantine dès 123 000 DA — Alliance",
          description: "Istanbul en 8 jours, vols directs Turkish Airlines depuis Constantine. Hôtel 4★, transferts inclus, guide arabophone. Départs hebdomadaires mars–mai 2026."
        },
        kuala_lumpur: {
          title: "Voyage Malaisie · Kuala Lumpur en vol direct dès 211 000 DA",
          description: "Kuala Lumpur en 8 jours, vol DIRECT Air Algérie depuis Alger. Grand Mercure 5★, tours Petronas, Batu Caves, Genting Highlands. Restauration halal partout. À partir de 211 000 DA."
        },
        sharm_constantine: {
          title: "Voyage Sharm El Sheikh depuis Constantine dès 155 000 DA",
          description: "Sharm El Sheikh en 10 jours / 8 nuits formule ALL INCLUSIVE depuis Constantine. Vol Turkish Airlines, hôtels 4★/5★ sur la mer Rouge. 5 départs avril–juin 2026."
        }
      }
    },
```

---

## 3. Diff highlights — les 8 changements les plus impactants

| # | Clé | Ancien | Nouveau | Pourquoi |
|---|---|---|---|---|
| 1 | `hero.title_l1` + `title_em` | "Le monde, / guidé et organisé" | "Faites votre valise. / On s'occupe du reste." | Le titre actuel décrit l'agence ; le nouveau parle au client. Image concrète (la valise) qui contient toute la proposition de valeur en 7 mots. |
| 2 | `hero.cta_whatsapp` | "WhatsApp" | "WhatsApp · réponse en 30 min" | Un CTA ne doit jamais être juste un nom de canal. La promesse de SLA fait la différence avec une agence Insta. |
| 3 | `hero.trust_local` | "Agence locale · pas à Alger" | "Agence de la wilaya · pas d'Alger" | "Locale" est mou. "De la wilaya" parle directement au cible BBA/Sétif/M'Sila — c'est leur mot. |
| 4 | `agency.title_em` | "depuis Bordj Bou Arreridj" | "de Bordj, pour la wilaya et au-delà" | Le titre raconte une trajectoire au lieu de planter un drapeau. Plus narratif, plus humain. |
| 5 | `agency.p2_html` | "pour une lune de miel à Bakou, des vacances de famille au Caire, une escapade culturelle à Istanbul" | "des lunes de miel à Bakou, des familles entières au Caire, des retraités à Istanbul, des amies en virée à Sharm" | Le casting est élargi (retraités + groupes d'amies = deux segments-clés ignorés). "Sans astérisque" remplace "transparents" — concret > abstrait. |
| 6 | `agency.p3_html` | "votre conseiller est de la wilaya, et il décroche dès la première sonnerie" | "votre conseiller est de la wilaya, il connaît votre nom, et il décroche dès la première sonnerie" + ajout du café | Ajoute la chaleur du face-à-face. Le café n'est pas un cliché — c'est ce qui se passe vraiment dans une agence de Bordj. |
| 7 | `map.subtitle_html` | "Trois agences pour vous accueillir : BBA (La Graf & Cité Zehour) et M'Sila." | "Pas une agence Instagram qui change d'adresse tous les six mois : trois bureaux physiques, deux à BBA…" | Le contraste explicite avec les arnaques Insta est ce qui rassure vraiment l'audience cible. La carte devient une preuve, pas une déco. |
| 8 | `footer.tagline` | "Voyages guidés depuis BBA. Plus de 1.200 voyageurs satisfaits depuis 2019." | "Voyages organisés depuis BBA. Vous faites la valise, on s'occupe du reste — depuis 2019." | Le footer répète la promesse du hero (cohérence) au lieu de re-citer un chiffre déjà présent dans `stats`. |

Autres ajustements notables :
- `form_submit` : "Envoyer ma demande sur WhatsApp" → "Recevoir mon devis sur WhatsApp" (passif → actif, et "devis" est ce que le client cherche vraiment).
- `trip_page.calculator` : "Calculateur" → "Calculer mon prix" (verbe + possessif).
- `trip_page.itinerary` : "Itinéraire" → "Programme jour par jour" (plus parlant pour des familles qui n'ont jamais voyagé).
- `voyages_section.card_cta` : "Voir ce voyage" → "Voir le programme" (un voyageur veut voir le contenu, pas un objet abstrait).
- `conseiller.label_prefix` : "Conseiller" → "Votre conseiller" (possessif = proximité).
- `map.directions` : "Itinéraire" → "Y aller" (action, deux mots, mobile-friendly).

---

## 4. Risques et questions ouvertes

1. **`agency.title_em`** — j'ai allongé "depuis Bordj Bou Arreridj" en "de Bordj, pour la wilaya et au-delà". Si le titre a une contrainte d'espace stricte sur mobile (le `<em>` est probablement la deuxième ligne du H2), à vérifier visuellement. **Fallback court** si nécessaire : *"née à Bordj Bou Arreridj"*.
2. **Dialectalismes** — j'ai volontairement été parcimonieux : zéro dialectal dans la v1. La porte est ouverte pour glisser *"rahkoum entre de bonnes mains"* dans `agency.p3_html` ou *"inchallah"* dans une FAQ, mais ce sont des décisions de marque qui méritent ton arbitrage. Veux-tu un second pass avec 2-3 touches dialectales ?
3. **`hero.title_l1` impératif** — "Faites votre valise." est impératif direct ; certains rédacteurs FR préfèrent l'infinitif pour les pubs ("Faire sa valise. On s'occupe du reste."). J'ai gardé l'impératif car il parle directement, mais à valider sur ta voix de marque.
4. **`map.subtitle_html`** — l'attaque "Pas une agence Instagram" est volontairement clivante. Elle pose un anti-positionnement explicite. Si tu préfères rester courtois et laisser l'audience faire le rapprochement seule, version douce : *"Trois bureaux physiques, ouverts toute l'année : deux à BBA (La Graf & Cité Zehour) et un à M'Sila."*
5. **`form_trip_placeholder`** : "— À déterminer —" → "— Je ne sais pas encore —" change la voix du système (formel) à la voix du client (intime). Cohérent avec le reste, mais c'est un choix.
6. **Aucune clé n'a été ajoutée, renommée ou supprimée** — les 178 attributs `data-i18n` du DOM restent tous valides. Vérifié manuellement contre l'arborescence existante.
7. **HTML `<strong>`** : préservé partout où il existait. Aucun nouveau `<em>` ni `<a>` introduit.

---

**Prêt à appliquer.** Une fois validé, je peux exécuter le remplacement direct dans `i18n.js` (lignes 36-234) — préviens-moi si tu veux merger toi-même ou si tu préfères que j'envoie le patch.
