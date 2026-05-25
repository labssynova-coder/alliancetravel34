/**
 * Alliance Travel — i18n engine
 * Languages: French (default) · English · Arabic
 *
 * Usage in HTML:
 *   <h1 data-i18n="hero.title_l1">Le monde,</h1>
 *   <em data-i18n="hero.title_em">guidé et organisé</em>
 *   <a data-i18n="nav.trips" href="#voyages">Nos voyages</a>
 *   <button data-i18n-aria-label="lang.label" data-i18n="cta.book">Réserver</button>
 *
 * Behavior:
 *   - Injects a 3-button language switcher into .site-nav (before .theme-toggle)
 *   - Persists choice in localStorage ("al-lang")
 *   - Toggles <html lang> and <html dir> ("rtl" for Arabic)
 *   - Lazy-loads Cairo + Tajawal from Google Fonts on first Arabic selection
 *   - Falls back to French if a key is missing
 *   - Dispatches "langchange" event for other modules
 *
 * No external dependencies. Loads from any page that has <nav class="site-nav">.
 */
(() => {
  'use strict';

  const STORAGE_KEY  = 'al-lang';
  const DEFAULT_LANG = 'fr';
  const SUPPORTED    = ['fr', 'en', 'ar'];
  const AR_FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap';

  /* ════════════════════════════════════════════════════════════════
     TRANSLATIONS
     Keys are dot-separated paths: "hero.title_l1" → T[lang].hero.title_l1
     Strings preserve the punctuation style of each language.
     ════════════════════════════════════════════════════════════════ */
  const T = {
    /* ─── FRENCH (default — source of truth) ───────────────────── */
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
        whatsapp_label: 'Contacter via WhatsApp',
        logo_label: 'Alliance Travel — Accueil',
        theme_label: 'Changer de thème',
        // trip-page-specific nav links
        trip_program: 'Programme',
        trip_hotels: 'Hôtels',
        trip_faq: 'FAQ',
        trip_booking: 'Réserver'
      },
      hero: {
        eyebrow: 'Agence agréée · Bordj Bou Arreridj · Algérie',
        title_l1: 'Le monde,',
        title_em: 'guidé et organisé',
        lede: "Vol, visa, hôtel 4★/5★, transferts, accompagnateur arabophone — tout est compris. Depuis Bordj Bou Arreridj, partez vers l'Égypte, la Turquie, l'Azerbaïdjan ou la Malaisie, l'esprit léger.",
        cta_voyages: 'Voir nos voyages',
        cta_contact: 'Nous contacter',
        cta_whatsapp: 'WhatsApp',
        trust_visa: 'Visa inclus',
        trust_arabic: 'Guide arabophone',
        trust_halal: 'Hôtels halal-friendly',
        trust_local: 'Agence locale · pas à Alger'
      },
      stats: {
        travelers: 'Voyageurs guidés',
        satisfaction: 'Taux de satisfaction',
        destinations: 'Destinations 2026',
        experience: "Ans d'expérience"
      },
      voyages_section: {
        eyebrow: 'Programmes 2026',
        title_l1: '5 voyages,',
        title_em: 'un même standard',
        sub: 'Vol + visa + hôtel + accompagnateur arabophone : tout est compris dans le prix. Choisissez votre destination, lancez le calculateur — votre devis arrive sur WhatsApp en 30 secondes.',
        filter_all: 'Tous',
        filter_egypt: 'Égypte',
        filter_caucasus: 'Caucase',
        filter_turkey: 'Turquie',
        filter_asia: 'Asie',
        card_cta: 'Voir ce voyage',
        from: 'À partir de',
        per_person: 'par pers.'
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
        title_l1: 'Alliance Travel,',
        title_em: 'depuis Bordj Bou Arreridj',
        p1_html: "Alliance Travel est née à <strong>Bordj Bou Arreridj</strong> — pas à Alger. Notre promesse tient en une phrase : organiser des voyages guidés où le client n'a qu'à faire sa valise. Visa, vol, hôtel, transferts, accompagnateur arabophone sur place — tout est pensé en amont, rien n'est improvisé.",
        p2_html: "Depuis 2019, plus de <strong>1 200 voyageurs algériens</strong> nous ont fait confiance — pour une lune de miel à Bakou, des vacances de famille au Caire, une escapade culturelle à Istanbul. Notre taux de satisfaction de <strong>98%</strong> n'est pas un argument marketing : c'est le résultat de prix transparents, de groupes à taille humaine, et d'un suivi WhatsApp jusqu'au retour à Alger ou Constantine.",
        p3_html: "Avec <strong>trois agences</strong> — deux à <strong>Bordj Bou Arreridj</strong> (La Graf et Cité Zehour) et une à <strong>M'Sila</strong> — nous vous recevons près de chez vous, en arabe ou en français. Pas besoin de monter à la capitale pour réserver : votre conseiller est de la wilaya, et il décroche dès la première sonnerie.",
        cta_contact: 'Nous contacter',
        cta_voyages: 'Voir les voyages',
        value_travelers: 'Voyageurs guidés',
        value_satisfaction: 'Satisfaction client',
        value_destinations: 'Destinations 2026',
        value_experience: "Ans d'expérience"
      },
      contact: {
        eyebrow: 'Nous joindre',
        title_l1: 'Parlez-nous de',
        title_em: 'votre projet',
        lede: "Inscrivez-vous par téléphone ou WhatsApp. Paiement par virement CCP ou en espèces à l'agence. Un acompte suffit pour bloquer votre place.",
        form_name: 'Nom & Prénom',
        form_phone: 'Téléphone WhatsApp',
        form_city: 'Wilaya / Ville',
        form_trip: 'Voyage qui vous intéresse',
        form_trip_placeholder: '— À déterminer —',
        form_submit: 'Envoyer ma demande sur WhatsApp',
        form_hint: "Aucun envoi automatique : votre message s'ouvre dans WhatsApp prêt à envoyer.",
        staff_lead: 'Joindre un conseiller — direct',
        conseiller_prefix: 'Conseiller',
        addresses_label: 'Adresses',
        addresses_note: '3 agences en Algérie',
        hq_label: 'Siège · BBA La Graf',
        branch_zehour_label: 'BBA Cité Zehour',
        branch_msila_label: "M'Sila",
        branch_msila_addr: 'Centre-ville',
        payment_label: 'Paiement accepté',
        payment_ccp: 'Virement CCP',
        payment_cash: 'Espèces agence',
        payment_bank: 'Virement bancaire',
        signup_label: 'Inscription possible',
        signup_lede: 'Par téléphone · WhatsApp · En agence. Un acompte suffit pour bloquer votre place.'
      },
      map: {
        eyebrow: 'Réseau Alliance Travel · Algérie',
        title_l1: 'Trouvez-nous',
        title_em: 'près de chez vous',
        subtitle_html: "Trois agences pour vous accueillir : <strong>Bordj Bou Arreridj</strong> (La Graf &amp; Cité Zehour) et <strong>M'Sila</strong>.",
        fallback_title: 'Chargement de la carte…',
        fallback_sub_html: '3 agences · <strong>BBA La Graf</strong> · <strong>BBA Cité Zehour</strong> · <strong>M\'Sila</strong>',
        siege_pill: 'SIÈGE',
        branch_pill: 'AGENCE',
        directions: 'Itinéraire',
        recenter: 'Recentrer'
      },
      footer: {
        tagline: 'Voyages guidés depuis Bordj Bou Arreridj. Plus de 1.200 voyageurs satisfaits depuis 2019.',
        col_voyages: 'Nos Voyages 2026',
        col_contact: 'Contact',
        col_address_label: 'Adresse',
        col_address_value: 'Bd. Houari Boumediene · La Graf · Bordj Bou Arreridj & M\'Sila',
        wa_viber: 'WhatsApp / Viber',
        phone: 'Téléphone',
        address_label: 'Adresse',
        copyright: '© 2026 Alliance Travel · Bordj Bou Arreridj, Algérie',
        notice: 'Prix en Dinar Algérien (DA) · Indicatifs · Confirmation à la réservation',
        social_instagram: 'Instagram Alliance Travel',
        social_facebook: 'Facebook Alliance Travel',
        social_tiktok: 'TikTok Alliance Travel'
      },
      conseiller: {
        label_prefix: 'Conseiller',
        wa: 'WhatsApp',
        call: 'Appel'
      },
      trip_page: {
        included: 'Inclus',
        not_included: 'Non inclus',
        itinerary: 'Itinéraire',
        hotels: 'Hôtels',
        faq: 'FAQ',
        calculator: 'Calculateur',
        booking: 'Réservation',
        related: 'Vous aimerez aussi',
        from: 'À partir de',
        per_person: 'par pers.',
        book_now: 'Réserver',
        request_quote: 'Demander un devis',
        book_via_whatsapp: 'Réserver via WhatsApp',
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
          description: "Agence de voyage à Bordj Bou Arreridj. Voyages organisés vers l'Égypte, Istanbul, Bakou, Kuala Lumpur, Sharm. Vol + visa + hôtel inclus. 1 200+ voyageurs satisfaits.",
          og_title: "Alliance Travel · Voyages organisés depuis Bordj Bou Arreridj",
          og_description: "Vol + visa + hôtel + accompagnateur arabophone — tout est compris. 5 destinations 2026 depuis Alger ou Constantine. Agence agréée à Bordj Bou Arreridj. 1 200+ voyageurs satisfaits."
        },
        voyages: {
          title: "Voyages organisés 2026 · 5 destinations dès 123 000 DA — Alliance Travel",
          description: "5 voyages organisés 2026 : Caire+Sharm, Bakou, Istanbul (depuis Constantine), Kuala Lumpur, Sharm (depuis Constantine). Vol + visa + hôtel inclus. Dès 123 000 DA."
        },
        cairo_sharm: {
          title: "Voyage Égypte 2026 · Caire + Sharm El Sheikh dès 190 000 DA",
          description: "Caire (Pyramides de Guizeh) + Sharm El Sheikh (mer Rouge) en 8 jours. Vol EgyptAir, hôtel 4★/5★, visa et excursions inclus. Départs juin 2026 depuis Alger."
        },
        azerbaidjan: {
          title: "Voyage Azerbaïdjan · Bakou & Gabala dès 227 000 DA — Alliance",
          description: "7 nuits Bakou + Gabala, vol Turkish Airlines, e-visa inclus, accompagnateur arabophone. Départs avril-juillet 2026 depuis Alger. Dès 227 000 DA."
        },
        istanbul: {
          title: "Voyage Istanbul depuis Constantine dès 123 000 DA — Alliance",
          description: "Istanbul en 8 jours, vols directs Turkish Airlines depuis Constantine. Hôtel 4★, transferts, guide arabophone. Départs hebdomadaires mars–mai 2026."
        },
        kuala_lumpur: {
          title: "Voyage Malaisie · Kuala Lumpur vol direct dès 211 000 DA",
          description: "Kuala Lumpur en 8 jours, vol DIRECT Air Algérie depuis Alger. Grand Mercure 5★, tours Petronas, Batu Caves, Genting. Halal partout. Dès 211 000 DA."
        },
        sharm_constantine: {
          title: "Voyage Sharm El Sheikh depuis Constantine dès 155 000 DA",
          description: "Sharm El Sheikh en 10 jours / 8 nuits ALL INCLUSIVE depuis Constantine. Vol Turkish Airlines, hôtels 4★/5★ mer Rouge. 5 départs avril–juin 2026."
        }
      }
    },

    /* ─── ENGLISH ──────────────────────────────────────────────── */
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
        whatsapp_label: 'Contact via WhatsApp',
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
        title_em: 'guided and organized',
        lede: "Flight, visa, 4★/5★ hotel, transfers, Arabic-speaking guide — all included. From Bordj Bou Arreridj, head to Egypt, Turkey, Azerbaijan or Malaysia with peace of mind.",
        cta_voyages: 'See our trips',
        cta_contact: 'Contact us',
        cta_whatsapp: 'WhatsApp',
        trust_visa: 'Visa included',
        trust_arabic: 'Arabic-speaking guide',
        trust_halal: 'Halal-friendly hotels',
        trust_local: 'Local agency · not in Algiers'
      },
      stats: {
        travelers: 'Travelers guided',
        satisfaction: 'Satisfaction rate',
        destinations: '2026 destinations',
        experience: 'Years of experience'
      },
      voyages_section: {
        eyebrow: '2026 programs',
        title_l1: '5 trips,',
        title_em: 'one consistent standard',
        sub: 'Flight + visa + hotel + Arabic-speaking guide: everything included in the price. Pick your destination, run the calculator — your quote arrives on WhatsApp in 30 seconds.',
        filter_all: 'All',
        filter_egypt: 'Egypt',
        filter_caucasus: 'Caucasus',
        filter_turkey: 'Turkey',
        filter_asia: 'Asia',
        card_cta: 'View this trip',
        from: 'From',
        per_person: 'per person'
      },
      trips: {
        cairo_sharm: 'Cairo & Sharm El Sheikh',
        cairo_sharm_short: 'Cairo & Sharm',
        azerbaidjan: 'Azerbaijan · Baku & Gabala',
        azerbaidjan_short: 'Azerbaijan',
        istanbul: 'Istanbul · from Constantine',
        istanbul_short: 'Istanbul',
        kuala_lumpur: 'Kuala Lumpur · Malaysia',
        kuala_lumpur_short: 'Kuala Lumpur',
        sharm_constantine: 'Sharm El Sheikh · from Constantine',
        sharm_constantine_short: 'Sharm · Constantine'
      },
      agency: {
        eyebrow: 'Our story',
        title_l1: 'Alliance Travel,',
        title_em: 'from Bordj Bou Arreridj',
        p1_html: "Alliance Travel was born in <strong>Bordj Bou Arreridj</strong> — not in Algiers. The premise is simple: organize guided trips where you only have to pack a suitcase. Visa, flight, hotel, transfers, an Arabic-speaking guide on the ground — everything is planned upstream, nothing is improvised.",
        p2_html: "Since 2019, more than <strong>1,200 Algerian travelers</strong> have trusted us — for a honeymoon in Baku, a family holiday in Cairo, a cultural break in Istanbul. Our <strong>98% satisfaction rate</strong> isn't a marketing number: it's the result of transparent prices, small-group tours, and WhatsApp follow-up all the way home to Algiers or Constantine.",
        p3_html: "With <strong>three branches</strong> — two in <strong>Bordj Bou Arreridj</strong> (La Graf and Cité Zehour) and one in <strong>M'Sila</strong> — we welcome you close to home, in Arabic or French. No need to travel up to the capital to book: your advisor is from the wilaya, and answers on the first ring.",
        cta_contact: 'Contact us',
        cta_voyages: 'View trips',
        value_travelers: 'Travelers guided',
        value_satisfaction: 'Client satisfaction',
        value_destinations: '2026 destinations',
        value_experience: 'Years of experience'
      },
      contact: {
        eyebrow: 'Reach us',
        title_l1: 'Tell us about',
        title_em: 'your project',
        lede: "Sign up by phone or WhatsApp. Payment by CCP transfer or cash at the office. A deposit is enough to secure your spot.",
        form_name: 'Full name',
        form_phone: 'WhatsApp number',
        form_city: 'Wilaya / City',
        form_trip: 'Trip you are interested in',
        form_trip_placeholder: '— To be determined —',
        form_submit: 'Send my request on WhatsApp',
        form_hint: 'No auto-send: your message opens in WhatsApp ready to send.',
        staff_lead: 'Reach an advisor — direct',
        conseiller_prefix: 'Advisor',
        addresses_label: 'Addresses',
        addresses_note: '3 branches in Algeria',
        hq_label: 'HQ · BBA La Graf',
        branch_zehour_label: 'BBA Cité Zehour',
        branch_msila_label: "M'Sila",
        branch_msila_addr: 'Downtown',
        payment_label: 'Payment accepted',
        payment_ccp: 'CCP transfer',
        payment_cash: 'Cash at office',
        payment_bank: 'Bank transfer',
        signup_label: 'Sign up',
        signup_lede: 'By phone · WhatsApp · In office. A deposit is enough to secure your spot.'
      },
      map: {
        eyebrow: 'Alliance Travel network · Algeria',
        title_l1: 'Find us',
        title_em: 'close to home',
        subtitle_html: "Three branches to welcome you: <strong>Bordj Bou Arreridj</strong> (La Graf &amp; Cité Zehour) and <strong>M'Sila</strong>.",
        fallback_title: 'Loading map…',
        fallback_sub_html: '3 branches · <strong>BBA La Graf</strong> · <strong>BBA Cité Zehour</strong> · <strong>M\'Sila</strong>',
        siege_pill: 'HQ',
        branch_pill: 'BRANCH',
        directions: 'Directions',
        recenter: 'Recenter'
      },
      footer: {
        tagline: 'Guided trips from Bordj Bou Arreridj. Over 1,200 satisfied travelers since 2019.',
        col_voyages: 'Our 2026 Trips',
        col_contact: 'Contact',
        col_address_label: 'Address',
        col_address_value: "Bd. Houari Boumediene · La Graf · Bordj Bou Arreridj & M'Sila",
        wa_viber: 'WhatsApp / Viber',
        phone: 'Phone',
        address_label: 'Address',
        copyright: '© 2026 Alliance Travel · Bordj Bou Arreridj, Algeria',
        notice: 'Prices in Algerian Dinar (DZD) · Indicative · Confirmation upon booking',
        social_instagram: 'Instagram Alliance Travel',
        social_facebook: 'Facebook Alliance Travel',
        social_tiktok: 'TikTok Alliance Travel'
      },
      conseiller: {
        label_prefix: 'Advisor',
        wa: 'WhatsApp',
        call: 'Call'
      },
      trip_page: {
        included: 'Included',
        not_included: 'Not included',
        itinerary: 'Itinerary',
        hotels: 'Hotels',
        faq: 'FAQ',
        calculator: 'Calculator',
        booking: 'Booking',
        related: 'You may also like',
        from: 'From',
        per_person: 'per person',
        book_now: 'Book now',
        request_quote: 'Request a quote',
        book_via_whatsapp: 'Book via WhatsApp',
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
          title: "Alliance Travel · Travel agency in Bordj Bou Arreridj, Algeria",
          description: "Travel agency in Bordj Bou Arreridj. Guided trips to Egypt, Istanbul, Baku, Kuala Lumpur, Sharm. Flight + visa + hotel included. 1,200+ satisfied travelers.",
          og_title: "Alliance Travel · Guided trips from Bordj Bou Arreridj",
          og_description: "Flight + visa + hotel + Arabic-speaking guide — all included. 5 destinations 2026 from Algiers or Constantine. Licensed agency in Bordj Bou Arreridj. 1,200+ travelers."
        },
        voyages: {
          title: "Guided trips 2026 · 5 destinations from DZD 123,000 — Alliance Travel",
          description: "5 guided trips 2026: Cairo+Sharm, Baku, Istanbul (from Constantine), Kuala Lumpur, Sharm (from Constantine). Flight + visa + hotel included. From DZD 123,000."
        },
        cairo_sharm: {
          title: "Egypt 2026 · Cairo + Sharm El Sheikh from DZD 190,000",
          description: "Cairo (Giza Pyramids) + Sharm El Sheikh (Red Sea) in 8 days. EgyptAir flight, 4★/5★ hotels, visa and excursions included. June 2026 departures from Algiers."
        },
        azerbaidjan: {
          title: "Azerbaijan trip · Baku & Gabala from DZD 227,000 — Alliance",
          description: "7 nights in Baku + Gabala, Turkish Airlines flight, e-visa included, Arabic-speaking guide. April–July 2026 departures from Algiers. From DZD 227,000."
        },
        istanbul: {
          title: "Istanbul trip from Constantine · from DZD 123,000 — Alliance",
          description: "Istanbul in 8 days, direct Turkish Airlines flights from Constantine. 4★ hotel, transfers, Arabic-speaking guide. Weekly departures March–May 2026."
        },
        kuala_lumpur: {
          title: "Malaysia trip · Kuala Lumpur direct flight from DZD 211,000",
          description: "Kuala Lumpur in 8 days, DIRECT Air Algérie flight from Algiers. Grand Mercure 5★, Petronas, Batu Caves, Genting tours. Halal everywhere. From DZD 211,000."
        },
        sharm_constantine: {
          title: "Sharm El Sheikh from Constantine · from DZD 155,000",
          description: "Sharm El Sheikh in 10 days / 8 nights ALL INCLUSIVE from Constantine. Turkish Airlines flight, 4★/5★ Red Sea hotels. 5 departures April–June 2026."
        }
      }
    },

    /* ─── ARABIC (Modern Standard Arabic) ──────────────────────── */
    ar: {
      lang: {
        label: 'اللغة',
        switch_to: 'تغيير اللغة',
        fr: 'الفرنسية',
        en: 'الإنجليزية',
        ar: 'العربية'
      },
      nav: {
        skip: 'تخطّي إلى المحتوى الرئيسي',
        trips: 'رحلاتنا',
        agency: 'الوكالة',
        contact: 'اتصل بنا',
        whatsapp: 'واتساب',
        whatsapp_label: 'تواصل عبر واتساب',
        logo_label: 'أليانس ترافل — الرئيسية',
        theme_label: 'تغيير الوضع',
        trip_program: 'البرنامج',
        trip_hotels: 'الفنادق',
        trip_faq: 'أسئلة شائعة',
        trip_booking: 'احجز'
      },
      hero: {
        eyebrow: 'وكالة معتمدة · برج بوعريريج · الجزائر',
        title_l1: 'العالم،',
        title_em: 'بمرافقة وتنظيم',
        lede: 'تذكرة الطيران، التأشيرة، فندق 4★/5★، التنقّلات، مرافِق يتحدّث العربية — كل شيء مشمول. انطلق من برج بوعريريج نحو مصر أو تركيا أو أذربيجان أو ماليزيا، مرتاح البال.',
        cta_voyages: 'اكتشف رحلاتنا',
        cta_contact: 'تواصل معنا',
        cta_whatsapp: 'واتساب',
        trust_visa: 'التأشيرة مشمولة',
        trust_arabic: 'مرافِق عربي',
        trust_halal: 'فنادق حلال',
        trust_local: 'وكالتك في برج، لا في العاصمة'
      },
      stats: {
        travelers: 'مسافرون برفقتنا',
        satisfaction: 'نسبة الرضا',
        destinations: 'وجهات 2026',
        experience: 'سنوات خبرة'
      },
      voyages_section: {
        eyebrow: 'برامج 2026',
        title_l1: '5 رحلات،',
        title_em: 'بنفس المستوى',
        sub: 'الطيران + التأشيرة + الفندق + مرافِق يتحدّث العربية: كل شيء مشمول في السعر. اختر وجهتك، شغّل الحاسبة — يصلك عرضك عبر واتساب في 30 ثانية.',
        filter_all: 'الكل',
        filter_egypt: 'مصر',
        filter_caucasus: 'القوقاز',
        filter_turkey: 'تركيا',
        filter_asia: 'آسيا',
        card_cta: 'اكتشف هذه الرحلة',
        from: 'انطلاقا من',
        per_person: 'للشخص'
      },
      trips: {
        cairo_sharm: 'القاهرة وشرم الشيخ',
        cairo_sharm_short: 'القاهرة وشرم',
        azerbaidjan: 'أذربيجان · باكو وقبلة',
        azerbaidjan_short: 'أذربيجان',
        istanbul: 'إسطنبول · انطلاقا من قسنطينة',
        istanbul_short: 'إسطنبول',
        kuala_lumpur: 'كوالا لمبور · ماليزيا',
        kuala_lumpur_short: 'كوالا لمبور',
        sharm_constantine: 'شرم الشيخ · انطلاقا من قسنطينة',
        sharm_constantine_short: 'شرم · قسنطينة'
      },
      agency: {
        eyebrow: 'قصتنا',
        title_l1: 'أليانس ترافل،',
        title_em: 'من برج بوعريريج',
        p1_html: 'وُلِدت أليانس ترافل في <strong>برج بوعريريج</strong> — لا في العاصمة. وعدُنا بسيط: تنظيم رحلات مرافَقة لا يحتاج فيها العميل سوى تحضير حقيبته. التأشيرة، الطيران، الفندق، التنقّلات، مرافِق يتحدّث لغتكم على الأرض — كل شيء مدروس مسبقا، لا شيء مرتجل.',
        p2_html: 'منذ 2019، وثق بنا أكثر من <strong>1 200 مسافر جزائري</strong> — لشهر عسل في باكو، لعطلة عائلية في القاهرة، لرحلة ثقافية إلى إسطنبول. معدّل الرضا <strong>98%</strong> ليس رقما تسويقيا: بل نتيجة أسعار شفّافة، ومجموعات صغيرة، ومتابعة عبر واتساب حتى عودتكم إلى الجزائر أو قسنطينة.',
        p3_html: 'بفضل <strong>ثلاث وكالات</strong> — اثنتان في <strong>برج بوعريريج</strong> (لاغراف وحي الزهور) وواحدة في <strong>المسيلة</strong> — نستقبلكم قريبا من بيوتكم، بالعربية أو الفرنسية. لا حاجة للصعود إلى العاصمة للحجز: مستشاركم من الولاية، ويردّ من أول رنّة.',
        cta_contact: 'تواصل معنا',
        cta_voyages: 'اكتشف الرحلات',
        value_travelers: 'مسافرون برفقتنا',
        value_satisfaction: 'رضا العملاء',
        value_destinations: 'وجهات 2026',
        value_experience: 'سنوات خبرة'
      },
      contact: {
        eyebrow: 'تواصل معنا',
        title_l1: 'حدّثنا عن',
        title_em: 'مشروعك',
        lede: 'سجّل عبر الهاتف أو واتساب. الدفع بحوالة CCP أو نقدا في الوكالة. يكفي عربون لحجز مكانك.',
        form_name: 'الاسم واللقب',
        form_phone: 'رقم واتساب',
        form_city: 'الولاية / المدينة',
        form_trip: 'الرحلة التي تهمّك',
        form_trip_placeholder: '— يحدّد لاحقا —',
        form_submit: 'إرسال طلبي عبر واتساب',
        form_hint: 'لا إرسال آلي: ستفتح رسالتك في واتساب جاهزة للإرسال.',
        staff_lead: 'تواصل مع مستشار — مباشرة',
        conseiller_prefix: 'مستشار',
        addresses_label: 'العناوين',
        addresses_note: '3 وكالات في الجزائر',
        hq_label: 'المقر · برج بوعريريج لاغراف',
        branch_zehour_label: 'برج بوعريريج حي الزهور',
        branch_msila_label: 'المسيلة',
        branch_msila_addr: 'وسط المدينة',
        payment_label: 'وسائل الدفع المقبولة',
        payment_ccp: 'حوالة CCP',
        payment_cash: 'نقدا في الوكالة',
        payment_bank: 'تحويل بنكي',
        signup_label: 'طرق التسجيل',
        signup_lede: 'عبر الهاتف · واتساب · في الوكالة. يكفي عربون لحجز مكانك.'
      },
      map: {
        eyebrow: 'شبكة أليانس ترافل · الجزائر',
        title_l1: 'اعثر علينا',
        title_em: 'بالقرب منكم',
        subtitle_html: 'ثلاث وكالات لاستقبالكم: <strong>برج بوعريريج</strong> (لاغراف وحي الزهور) و<strong>المسيلة</strong>.',
        fallback_title: 'جاري تحميل الخريطة…',
        fallback_sub_html: '3 وكالات · <strong>برج بوعريريج لاغراف</strong> · <strong>برج بوعريريج حي الزهور</strong> · <strong>المسيلة</strong>',
        siege_pill: 'المقر',
        branch_pill: 'فرع',
        directions: 'الاتجاهات',
        recenter: 'إعادة التوسيط'
      },
      footer: {
        tagline: 'رحلات سياحية مرافَقة من برج بوعريريج. أكثر من 1.200 مسافر راضٍ منذ 2019.',
        col_voyages: 'رحلاتنا 2026',
        col_contact: 'تواصل',
        col_address_label: 'العنوان',
        col_address_value: 'شارع هواري بومدين · لاغراف · برج بوعريريج والمسيلة',
        wa_viber: 'واتساب / فايبر',
        phone: 'هاتف',
        address_label: 'العنوان',
        copyright: '© 2026 أليانس ترافل · برج بوعريريج، الجزائر',
        notice: 'الأسعار بالدينار الجزائري · إرشادية · التأكيد عند الحجز',
        social_instagram: 'إنستغرام أليانس ترافل',
        social_facebook: 'فيسبوك أليانس ترافل',
        social_tiktok: 'تيك توك أليانس ترافل'
      },
      conseiller: {
        label_prefix: 'مستشار',
        wa: 'واتساب',
        call: 'مكالمة'
      },
      trip_page: {
        included: 'مشمول',
        not_included: 'غير مشمول',
        itinerary: 'البرنامج',
        hotels: 'الفنادق',
        faq: 'أسئلة شائعة',
        calculator: 'حاسبة الأسعار',
        booking: 'الحجز',
        related: 'قد يعجبك أيضا',
        from: 'انطلاقا من',
        per_person: 'للشخص',
        book_now: 'احجز الآن',
        request_quote: 'اطلب عرض سعر',
        book_via_whatsapp: 'احجز عبر واتساب',
        nights: 'ليالٍ',
        days: 'أيام',
        adults: 'بالغون',
        children: 'أطفال',
        infants: 'رضّع',
        total: 'المجموع',
        sticky_total_label: 'انطلاقا من'
      },
      meta: {
        home: {
          title: "أليانس ترافل · وكالة سفر في برج بوعريريج، الجزائر",
          description: "وكالة سفر في برج بوعريريج. رحلات مرافَقة إلى مصر وإسطنبول وباكو وكوالا لمبور وشرم الشيخ. الطيران + التأشيرة + الفندق مشمول. أكثر من 1.200 مسافر راضٍ.",
          og_title: "أليانس ترافل · رحلات مرافَقة من برج بوعريريج",
          og_description: "الطيران + التأشيرة + الفندق + مرافِق عربي — كل شيء مشمول. 5 وجهات لسنة 2026 من الجزائر أو قسنطينة. وكالة معتمدة في برج بوعريريج."
        },
        voyages: {
          title: "رحلات منظمة 2026 · 5 وجهات انطلاقا من 123 000 د.ج — أليانس ترافل",
          description: "5 رحلات منظمة لسنة 2026: القاهرة وشرم، باكو، إسطنبول (من قسنطينة)، كوالا لمبور، شرم (من قسنطينة). الطيران + التأشيرة + الفندق مشمول. انطلاقا من 123 000 د.ج."
        },
        cairo_sharm: {
          title: "رحلة مصر 2026 · القاهرة + شرم الشيخ انطلاقا من 190 000 د.ج",
          description: "القاهرة (أهرامات الجيزة) + شرم الشيخ (البحر الأحمر) في 8 أيام. طيران EgyptAir، فنادق 4★/5★، التأشيرة والجولات مشمولة. انطلاق جوان 2026 من الجزائر."
        },
        azerbaidjan: {
          title: "رحلة أذربيجان · باكو وقبلة انطلاقا من 227 000 د.ج — أليانس",
          description: "7 ليالٍ في باكو وقبلة، طيران Turkish Airlines، تأشيرة إلكترونية مشمولة، مرافِق عربي. انطلاقات أفريل-جويلية 2026 من الجزائر. انطلاقا من 227 000 د.ج."
        },
        istanbul: {
          title: "رحلة إسطنبول من قسنطينة انطلاقا من 123 000 د.ج — أليانس",
          description: "إسطنبول في 8 أيام، رحلات مباشرة Turkish Airlines من قسنطينة. فندق 4★، تنقّلات، مرافِق عربي. انطلاقات أسبوعية مارس-ماي 2026."
        },
        kuala_lumpur: {
          title: "رحلة ماليزيا · كوالا لمبور رحلة مباشرة انطلاقا من 211 000 د.ج",
          description: "كوالا لمبور في 8 أيام، رحلة مباشرة Air Algérie من الجزائر. Grand Mercure 5★، جولات Petronas وBatu Caves وGenting. حلال في كل مكان. انطلاقا من 211 000 د.ج."
        },
        sharm_constantine: {
          title: "رحلة شرم الشيخ من قسنطينة انطلاقا من 155 000 د.ج",
          description: "شرم الشيخ في 10 أيام / 8 ليالٍ All Inclusive من قسنطينة. طيران Turkish Airlines، فنادق البحر الأحمر 4★/5★. 5 انطلاقات أفريل-جوان 2026."
        }
      }
    }
  };

  /* ════════════════════════════════════════════════════════════════
     ENGINE
     ════════════════════════════════════════════════════════════════ */

  function lookup(key, dict) {
    if (!key) return null;
    return key.split('.').reduce((o, k) => (o && k in o) ? o[k] : null, dict);
  }

  function getLang() {
    let stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (_) { /* private mode */ }
    if (stored && SUPPORTED.includes(stored)) return stored;
    const nav = (navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(nav)) return nav;
    return DEFAULT_LANG;
  }

  function persistLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) { /* private */ }
  }

  function ensureArabicFont() {
    if (document.querySelector('link[data-arabic-font]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = AR_FONT_HREF;
    link.dataset.arabicFont = '1';
    document.head.appendChild(link);
  }

  function setHtmlAttrs(lang) {
    const html = document.documentElement;
    html.lang = lang;
    html.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    html.dataset.lang = lang;
  }

  /**
   * Translate the page's meta tags (<title>, meta description, og:title,
   * og:description, twitter:title, twitter:description, og:locale).
   * Reads the page key from <body data-page="..."> and looks up
   * T[lang].meta[pageKey].{title, description, og_title, og_description}.
   * Falls back to French if a key is missing.
   */
  function updateMeta(lang) {
    const pageKey = document.body?.dataset?.page;
    if (!pageKey) return;
    const dict = T[lang] || T[DEFAULT_LANG];
    const fallback = T[DEFAULT_LANG];
    const meta = (dict.meta && dict.meta[pageKey]) || (fallback.meta && fallback.meta[pageKey]);
    if (!meta) return;

    const ogTitle  = meta.og_title || meta.title;
    const ogDesc   = meta.og_description || meta.description;

    if (meta.title) {
      document.title = meta.title;
      setAttr('meta[property="og:title"]',    'content', ogTitle);
      setAttr('meta[name="twitter:title"]',   'content', ogTitle);
    }
    if (meta.description) {
      setAttr('meta[name="description"]',          'content', meta.description);
      setAttr('meta[property="og:description"]',   'content', ogDesc);
      setAttr('meta[name="twitter:description"]',  'content', ogDesc);
    }

    // og:locale per language
    const ogLocaleMap = { fr: 'fr_DZ', en: 'en_US', ar: 'ar_DZ' };
    setAttr('meta[property="og:locale"]', 'content', ogLocaleMap[lang] || 'fr_DZ');
  }

  function setAttr(selector, attr, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.setAttribute(attr, value);
  }

  function translate(lang) {
    const dict = T[lang] || T[DEFAULT_LANG];
    const fallback = T[DEFAULT_LANG];

    // textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = lookup(el.dataset.i18n, dict) ?? lookup(el.dataset.i18n, fallback);
      if (val != null) el.textContent = val;
    });

    // innerHTML (allows embedded <em>, <strong>, etc. — strings should be trusted)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const val = lookup(el.dataset.i18nHtml, dict) ?? lookup(el.dataset.i18nHtml, fallback);
      if (val != null) el.innerHTML = val;
    });

    // attribute translations
    const attrMap = [
      ['aria-label',  'i18nAriaLabel'],
      ['title',       'i18nTitle'],
      ['placeholder', 'i18nPlaceholder'],
      ['alt',         'i18nAlt']
    ];
    attrMap.forEach(([attr, prop]) => {
      document.querySelectorAll(`[data-${attr.replace('aria-', 'i18n-aria-')}], [data-i18n-${attr}]`).forEach(() => {});
      // simpler: query by attr name
      document.querySelectorAll(`[data-i18n-${attr === 'aria-label' ? 'aria-label' : attr}]`).forEach(el => {
        const key = el.dataset[prop];
        const val = lookup(key, dict) ?? lookup(key, fallback);
        if (val != null) el.setAttribute(attr, val);
      });
    });

    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function buildSwitcher() {
    if (document.querySelector('.lang-switcher')) return;
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    const wrap = document.createElement('div');
    wrap.className = 'lang-switcher';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language / Langue / اللغة');
    wrap.innerHTML = `
      <button class="lang-btn" type="button" data-lang="fr" aria-pressed="false" title="Français">FR</button>
      <button class="lang-btn" type="button" data-lang="en" aria-pressed="false" title="English">EN</button>
      <button class="lang-btn lang-btn--ar" type="button" data-lang="ar" aria-pressed="false" title="العربية" lang="ar">عر</button>
    `;

    // Insert before the theme toggle (so visual order: ...links · LANG · THEME · WA)
    const themeToggle = nav.querySelector('.theme-toggle');
    if (themeToggle) {
      nav.insertBefore(wrap, themeToggle);
    } else {
      const cta = nav.querySelector('.nav-cta');
      if (cta) nav.insertBefore(wrap, cta);
      else nav.appendChild(wrap);
    }

    wrap.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
  }

  function reflectActive(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const on = btn.dataset.lang === lang;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.classList.toggle('lang-btn--active', on);
    });
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    if (lang === 'ar') ensureArabicFont();
    persistLang(lang);
    setHtmlAttrs(lang);
    translate(lang);
    updateMeta(lang);
    reflectActive(lang);
  }

  /* Expose for debug / cross-module use */
  window.alSetLang = setLang;
  window.alGetLang = getLang;
  window.alTranslations = T;

  function init() {
    const lang = getLang();
    setHtmlAttrs(lang);               // pre-set ASAP (prevents flash)
    if (lang === 'ar') ensureArabicFont();
    buildSwitcher();
    translate(lang);
    updateMeta(lang);
    reflectActive(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
