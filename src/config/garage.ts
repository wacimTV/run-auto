/**
 * CONFIGURATION OFFICIELLE DU GARAGE RUN AUTO - MARSEILLE (13004)
 * Ce fichier centralise toutes les informations métier, coordonnées vérifiées,
 * horaires d'ouverture, prestations et paramètres de réservation.
 * Les informations à confirmer par le gérant sont clairement annotées.
 *
 * IMPORTANT : les prestations listées ici alimentent automatiquement
 * le site public, les pages /prestations/[slug], le sitemap,
 * le module de réservation ET l'onglet « Prestations » de l'administration.
 */

export interface OpeningHoursDay {
  dayName: string;
  dayIndex: number; // 0 = Dimanche, 1 = Lundi, ... 6 = Samedi
  isOpen: boolean;
  slots: { open: string; close: string }[];
}

export interface ServiceIntervention {
  title: string;
  description: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  estimatedDurationMinutes: number; // Durée indicative pour le créneau
  durationLabel?: string; // Libellé affiché à la place de la durée lorsqu'elle dépend du véhicule
  priceNotice: string; // "Sur devis gratuit" ou mention claire
  badge?: string;
  symptoms: string[];
  benefits: string[];
  faqs: { question: string; answer: string }[];
  iconName: string;
  // Contenus enrichis des pages prestations
  heroImage?: string;
  imageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  symptomsTitle?: string;
  explainerTitle?: string;
  explainer?: string[]; // Explications accessibles au grand public
  interventions?: ServiceIntervention[];
  disclaimer?: string; // Mention réglementaire / technique
  quoteKey?: string; // Clé du sujet pré-rempli dans le formulaire de devis
  related?: string[]; // Slugs des prestations liées (maillage interne)
}

export interface ServiceCategory {
  id: string;
  label: string;
  description: string;
}

/** Catégories professionnelles de prestations (ordre d'affichage) */
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "Bioéthanol E85",
    label: "Bioéthanol E85",
    description: "Étude de compatibilité et adaptation de votre véhicule au superéthanol E85.",
  },
  {
    id: "Performance moteur",
    label: "Reprogrammation",
    description: "Optimisation moteur et adaptation des paramètres de gestion moteur.",
  },
  {
    id: "Électronique automobile",
    label: "Électronique & Diagnostic",
    description: "Diagnostic, codage, paramétrage et recherche de pannes électroniques.",
  },
  {
    id: "Solutions FAP",
    label: "Solutions FAP",
    description: "Diagnostic, entretien et remise en conformité du filtre à particules.",
  },
  {
    id: "Mécanique générale",
    label: "Mécanique générale",
    description: "Freinage, embrayage, distribution, train roulant et entretien.",
  },
];

/** Sujets de devis (formulaire de contact pré-rempli via /contact?devis=cle) */
export const QUOTE_SUBJECTS: { key: string; label: string }[] = [
  { key: "e85", label: "Demande de devis E85 (bioéthanol)" },
  { key: "reprogrammation", label: "Devis reprogrammation moteur" },
  { key: "electronique", label: "Électronique / codage / paramétrage" },
  { key: "diagnostic", label: "Question sur un diagnostic de panne" },
  { key: "options", label: "Ajout ou activation d'options" },
  { key: "fap", label: "Solutions FAP" },
  { key: "mecanique", label: "Devis freinage / distribution / embrayage" },
  { key: "entretien", label: "Demande de devis d'entretien" },
  { key: "prise-en-charge", label: "Renseignement sur la prise en charge" },
  { key: "autre", label: "Autre demande" },
];

export const GARAGE_CONFIG = {
  name: "Run Auto",
  legalName: "Run Auto Marseille",
  activity:
    "Reprogrammation moteur, conversion bioéthanol E85, électronique et diagnostic automobile, mécanique générale",
  tagline: "Reprogrammation & électronique automobile à Marseille.",
  subTagline:
    "Bioéthanol E85, optimisation moteur, diagnostic avancé, codage et recherche de pannes électriques : Run Auto met la technologie au service de votre véhicule.",

  // Coordonnées vérifiées
  contact: {
    address: "52 boulevard de Roux",
    postalCode: "13004",
    city: "Marseille",
    region: "Provence-Alpes-Côte d'Azur",
    country: "France",
    fullAddress: "52 boulevard de Roux, 13004 Marseille, France",
    phone: "06 18 31 89 15",
    phoneDisplay: "06 18 31 89 15",
    phoneInternational: "+33618318915",
    email: "contact@runauto-marseille.fr", // Email configuré (à valider par le propriétaire)
    emailConfirmed: false,
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=52+boulevard+de+Roux+13004+Marseille",
    googleMapsEmbedUrl: "https://maps.google.com/maps?q=52%20boulevard%20de%20Roux%2C%2013004%20Marseille&t=&z=16&ie=UTF8&iwloc=&output=embed",
    coordinates: {
      latitude: 43.3082,
      longitude: 5.4053,
    },
  },

  // Informations partenaires publiques vérifiées
  partner: {
    idGaragesRef: "GA7683",
    idGaragesUrl: "https://www.idgarages.com/fr-fr/garage/marseille/GA7683_run-auto",
    idGaragesRating: "4.7",
    networkReviewsCount: "34 000+", // Réseau idGarages certifié
    badgeText: "Garage Indépendant Partenaire Référencé",
  },

  // Messages marketing
  marketing: {
    /**
     * Le taux de satisfaction de 100 % ne doit être affiché QUE s'il est confirmé et justifiable
     * par le professionnel (source vérifiable). Tant que ce n'est pas le cas, laisser à null.
     * Exemple une fois justifié : "100 % de clients satisfaits (source : ...)"
     */
    verifiedSatisfactionClaim: null as string | null,
    satisfactionFallback: "Votre satisfaction, notre priorité",
  },

  // Équipement de diagnostic mis en avant
  equipment: {
    flagshipName: "TOPDON Phoenix Max",
    flagshipDescription:
      "Station de diagnostic automobile professionnelle de dernière génération utilisée par l'atelier pour dialoguer avec les calculateurs de votre véhicule, selon les compatibilités et fonctionnalités disponibles sur chaque modèle.",
    capabilities: [
      {
        title: "Diagnostic professionnel multimarque",
        description: "Interrogation des calculateurs et lecture des mémoires de défauts sur un large parc de véhicules compatibles.",
      },
      {
        title: "Communication avec les calculateurs",
        description: "Dialogue avec les différents modules électroniques pour analyser leur fonctionnement.",
      },
      {
        title: "Analyse des systèmes électroniques",
        description: "Observation des paramètres de fonctionnement pour comprendre le comportement réel du véhicule.",
      },
      {
        title: "Recherche de défauts",
        description: "Une base solide pour orienter les mesures et identifier l'origine d'un dysfonctionnement.",
      },
      {
        title: "Paramétrage & adaptations compatibles",
        description: "Opérations de configuration, de codage et d'apprentissage lorsque le véhicule et l'outil le permettent.",
      },
    ],
    notice:
      "Les fonctions disponibles varient selon la marque, le modèle, l'année et les calculateurs du véhicule. Nous vérifions la faisabilité avant toute intervention.",
  },

  // Informations légales (facilement modifiables dès communication par le gérant)
  legal: {
    siren: "À renseigner (ex: 890 000 000)",
    siret: "À renseigner (ex: 890 000 000 00012)",
    rcs: "Marseille B",
    tvaIntracommunautaire: "À renseigner (ex: FR00890000000)",
    formeJuridique: "Entreprise individuelle / Société (à confirmer)",
    directeurPublication: "Responsable Run Auto",
    hebergement: "Vercel Inc. / Serveur dédié sécurisé en Europe",
    donneesPersonnellesDPO: "contact@runauto-marseille.fr",
  },

  // Horaires officiels : Lundi au Vendredi 09:00 - 19:00, Samedi & Dimanche Fermé
  openingHours: [
    {
      dayName: "Lundi",
      dayIndex: 1,
      isOpen: true,
      slots: [{ open: "09:00", close: "19:00" }],
    },
    {
      dayName: "Mardi",
      dayIndex: 2,
      isOpen: true,
      slots: [{ open: "09:00", close: "19:00" }],
    },
    {
      dayName: "Mercredi",
      dayIndex: 3,
      isOpen: true,
      slots: [{ open: "09:00", close: "19:00" }],
    },
    {
      dayName: "Jeudi",
      dayIndex: 4,
      isOpen: true,
      slots: [{ open: "09:00", close: "19:00" }],
    },
    {
      dayName: "Vendredi",
      dayIndex: 5,
      isOpen: true,
      slots: [{ open: "09:00", close: "19:00" }],
    },
    {
      dayName: "Samedi",
      dayIndex: 6,
      isOpen: false,
      slots: [],
    },
    {
      dayName: "Dimanche",
      dayIndex: 0,
      isOpen: false,
      slots: [],
    },
  ] as OpeningHoursDay[],

  // Règles de réservation en ligne
  booking: {
    slotIntervalMinutes: 60, // Créneaux d'1 heure pour l'accueil et le diagnostic
    minNoticeHours: 4, // Délai minimum avant réservation
    maxDaysAhead: 30, // Réservation possible jusqu'à 30 jours à l'avance
    defaultStatus: "pending" as const,
    confirmationNotice:
      "Demande enregistrée. Notre équipe vous contacte sous 2h ouvrées pour confirmer définitivement votre créneau.",
  },

  // Engagements de réassurance vérifiés
  commitments: [
    {
      title: "Diagnostic avant intervention",
      description: "Nous analysons votre véhicule avant toute préconisation : pas de remplacement de pièce au hasard.",
      icon: "Cpu",
    },
    {
      title: "Devis clair & sans surprise",
      description: "Chaque intervention fait l'objet d'un accord explicite avant le moindre début de travaux.",
      icon: "FileCheck",
    },
    {
      title: "Respect de la réglementation",
      description: "Les interventions sont réalisées dans le respect de la réglementation applicable et des dispositifs antipollution.",
      icon: "ShieldCheck",
    },
    {
      title: "Pièces de qualité",
      description: "Sélection rigoureuse de pièces de rechange de qualité constructeur pour une longévité maximale.",
      icon: "Award",
    },
  ],

  // Catalogue des prestations (l'ordre définit l'ordre d'affichage)
  services: [
    /* ------------------------------------------------------------------ */
    /* A. BIOÉTHANOL E85 — PRESTATION PRIORITAIRE                          */
    /* ------------------------------------------------------------------ */
    {
      id: "srv-bioethanol-e85",
      slug: "conversion-bioethanol-e85",
      title: "Conversion Bioéthanol E85",
      category: "Bioéthanol E85",
      shortDescription:
        "Étude de compatibilité, adaptation de votre véhicule au superéthanol E85 et contrôles après intervention.",
      fullDescription:
        "Rouler au superéthanol E85 permet, selon les véhicules, de réduire le coût de chaque plein. Run Auto étudie la compatibilité de votre moteur, vous conseille la solution technique adaptée et réalise l'adaptation dans le respect de la réglementation applicable.",
      estimatedDurationMinutes: 120,
      durationLabel: "Durée selon véhicule et solution retenue",
      priceNotice: "Devis après étude de compatibilité",
      badge: "Prestation phare",
      iconName: "Fuel",
      heroImage: "/images/e85-bioethanol-light.jpg",
      imageAlt: "Plein de superéthanol E85 sur un véhicule adapté par Run Auto à Marseille",
      seoTitle: "Conversion Bioéthanol E85 à Marseille – Étude de compatibilité",
      seoDescription:
        "Adaptation de votre véhicule au bioéthanol E85 à Marseille (13004) : étude de compatibilité moteur, solution adaptée, contrôles. Demandez votre devis E85 chez Run Auto.",
      symptomsTitle: "Pour qui ?",
      symptoms: [
        "Vous roulez beaucoup avec un véhicule essence et souhaitez réduire le coût de vos pleins",
        "Vous souhaitez savoir si votre moteur est compatible avec le superéthanol E85",
        "Votre véhicule a déjà été adapté et vous souhaitez un contrôle ou un diagnostic",
        "Vous avez des questions sur le fonctionnement et les démarches liées au E85",
      ],
      benefits: [
        "Étude de compatibilité préalable de votre moteur",
        "Solution technique adaptée à votre véhicule et à votre usage",
        "Contrôles et vérifications après intervention",
        "Explications claires sur l'utilisation au quotidien et les démarches éventuelles",
      ],
      explainerTitle: "Le bioéthanol E85, comment ça marche ?",
      explainer: [
        "Le superéthanol E85 est un carburant composé majoritairement d'éthanol d'origine végétale, mélangé à de l'essence sans plomb. Son prix au litre est généralement inférieur à celui des essences classiques.",
        "L'éthanol ne brûle pas exactement comme l'essence : le moteur a besoin d'une quantité de carburant plus importante. Sans adaptation, un véhicule non prévu pour ce carburant peut mal démarrer à froid, perdre en agrément ou afficher des défauts. L'adaptation permet d'ajuster le fonctionnement du moteur à ce carburant.",
        "La consommation en litres est en général plus élevée qu'à l'essence. L'intérêt économique dépend donc du prix du carburant, de votre kilométrage et de votre véhicule : nous faisons le point avec vous avant toute décision.",
      ],
      interventions: [
        {
          title: "Étude de compatibilité",
          description: "Analyse de la motorisation, du système d'injection et de l'état général du véhicule avant toute préconisation.",
        },
        {
          title: "Choix de la solution technique",
          description: "Proposition de la solution de fonctionnement à l'E85 la plus adaptée à votre véhicule, selon les possibilités existantes.",
        },
        {
          title: "Adaptation de la cartographie",
          description: "Lorsque c'est approprié et réalisable, ajustement des paramètres de gestion moteur pour le fonctionnement au bioéthanol.",
        },
        {
          title: "Contrôles & vérifications",
          description: "Diagnostic électronique, vérification du démarrage et du comportement moteur après intervention.",
        },
        {
          title: "Conseils d'utilisation",
          description: "Bonnes pratiques au quotidien, entretien et information sur les démarches administratives éventuelles.",
        },
      ],
      disclaimer:
        "Tous les véhicules ne sont pas compatibles avec le bioéthanol E85. Chaque véhicule fait l'objet d'une vérification technique préalable. Les interventions sont réalisées dans le respect de la réglementation applicable ; selon la solution retenue, des démarches administratives (certificat d'immatriculation, assurance) peuvent être nécessaires.",
      quoteKey: "e85",
      related: ["reprogrammation-moteur", "diagnostic-automobile", "electronique-automobile"],
      faqs: [
        {
          question: "Mon véhicule est-il compatible avec le E85 ?",
          answer:
            "Cela dépend de la motorisation, du système d'injection et de l'état du véhicule. Nous ne pouvons pas garantir la compatibilité de tous les véhicules : une étude technique préalable est systématiquement réalisée avant de vous proposer une solution.",
        },
        {
          question: "Vais-je consommer davantage au E85 ?",
          answer:
            "En règle générale, oui : la consommation en litres est plus élevée qu'à l'essence. L'intérêt économique vient du prix au litre habituellement plus bas. Nous vous aidons à évaluer si l'adaptation est intéressante pour votre usage.",
        },
        {
          question: "Puis-je encore rouler à l'essence après l'adaptation ?",
          answer:
            "Selon la solution technique retenue, il est généralement possible de continuer à utiliser de l'essence sans plomb. Nous vous précisons le fonctionnement exact de la solution proposée pour votre véhicule.",
        },
        {
          question: "Y a-t-il des démarches administratives ?",
          answer:
            "Selon la solution retenue, une modification du certificat d'immatriculation et une information de votre assureur peuvent être nécessaires. Nous vous informons des démarches applicables à votre situation.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* B. REPROGRAMMATION MOTEUR                                            */
    /* ------------------------------------------------------------------ */
    {
      id: "srv-reprogrammation-moteur",
      slug: "reprogrammation-moteur",
      title: "Reprogrammation & Optimisation Moteur",
      category: "Performance moteur",
      shortDescription:
        "Optimisation des paramètres moteur adaptée à votre véhicule, avec diagnostic avant intervention et vérifications après.",
      fullDescription:
        "La reprogrammation consiste à ajuster les paramètres du calculateur moteur pour améliorer l'agrément de conduite et les performances, dans les limites mécaniques de votre véhicule. Chaque projet commence par un diagnostic complet et se termine par des contrôles.",
      estimatedDurationMinutes: 180,
      durationLabel: "Durée selon véhicule et motorisation",
      priceNotice: "Devis personnalisé selon motorisation",
      badge: "Expertise",
      iconName: "Gauge",
      heroImage: "/images/reprogrammation-light.jpg",
      imageAlt: "Ordinateur relié à la prise diagnostic pour une reprogrammation moteur chez Run Auto",
      seoTitle: "Reprogrammation Moteur à Marseille – Optimisation sur-mesure",
      seoDescription:
        "Reprogrammation et optimisation moteur à Marseille (13004) : diagnostic préalable, adaptation des paramètres moteur selon votre véhicule, contrôles après intervention. Devis Run Auto.",
      symptomsTitle: "Pour qui ?",
      symptoms: [
        "Vous recherchez davantage d'agrément de conduite et de reprises",
        "Vous souhaitez une solution adaptée à votre motorisation et à votre usage",
        "Vous voulez un diagnostic sérieux avant toute modification",
        "Vous souhaitez combiner optimisation et adaptation au bioéthanol E85",
      ],
      benefits: [
        "Diagnostic complet avant intervention",
        "Paramètres adaptés à votre véhicule, sa motorisation et son état",
        "Vérifications et contrôles après intervention",
        "Conseils sur l'entretien et l'utilisation après optimisation",
      ],
      explainerTitle: "La reprogrammation expliquée simplement",
      explainer: [
        "Votre moteur est piloté par un calculateur électronique qui décide, en permanence, de la quantité de carburant injectée, de l'avance à l'allumage ou encore de la pression de suralimentation. Ces réglages d'usine sont prévus pour convenir à tous les marchés et à tous les usages.",
        "La reprogrammation consiste à ajuster ces paramètres de façon maîtrisée, pour adapter le comportement du moteur à votre véhicule et à votre usage, sans dépasser les limites mécaniques des organes.",
        "Les possibilités dépendent de chaque véhicule : nous ne communiquons aucun gain chiffré avant d'avoir étudié votre moteur. Les différents niveaux de préparation ne sont proposés que lorsqu'ils sont réellement réalisables sur le véhicule concerné.",
      ],
      interventions: [
        {
          title: "Diagnostic avant intervention",
          description: "Lecture des défauts, contrôle des paramètres moteur et de l'état général pour s'assurer que le véhicule est sain.",
        },
        {
          title: "Étude de la motorisation",
          description: "Analyse des possibilités réelles du moteur, de la boîte et des organes associés.",
        },
        {
          title: "Adaptation des paramètres moteur",
          description: "Ajustement maîtrisé de la cartographie selon le véhicule et la solution retenue.",
        },
        {
          title: "Vérifications après intervention",
          description: "Contrôle électronique et essai pour valider le bon fonctionnement du véhicule.",
        },
      ],
      disclaimer:
        "Aucun gain de puissance ou de couple n'est annoncé sans étude préalable du véhicule. Toute modification des caractéristiques d'origine doit respecter la réglementation en vigueur et les conditions d'homologation applicables, et peut nécessiter une déclaration auprès de votre assureur.",
      quoteKey: "reprogrammation",
      related: ["conversion-bioethanol-e85", "diagnostic-automobile", "electronique-automobile"],
      faqs: [
        {
          question: "Combien de chevaux vais-je gagner ?",
          answer:
            "Nous ne communiquons pas de chiffres génériques : les possibilités dépendent du moteur, de son état et de la solution retenue. Après étude de votre véhicule, nous vous expliquons précisément ce qui est réalisable.",
        },
        {
          question: "La reprogrammation est-elle risquée pour mon moteur ?",
          answer:
            "Une optimisation sérieuse reste dans les limites mécaniques des organes. C'est pourquoi nous réalisons un diagnostic avant toute intervention et des contrôles après : un véhicule qui présente des défauts doit d'abord être remis en état.",
        },
        {
          question: "Dois-je prévenir mon assureur ?",
          answer:
            "Toute modification des caractéristiques d'origine du véhicule doit être déclarée à votre assureur et respecter la réglementation, notamment en matière d'homologation. Nous vous informons avant intervention.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* C. ÉLECTRONIQUE AUTOMOBILE                                           */
    /* ------------------------------------------------------------------ */
    {
      id: "srv-electronique-codage",
      slug: "electronique-automobile",
      title: "Électronique Automobile, Codage & Paramétrage",
      category: "Électronique automobile",
      shortDescription:
        "Codage de calculateurs, paramétrage électronique, programmation de modules, adaptations et apprentissages.",
      fullDescription:
        "Les véhicules modernes reposent sur de nombreux calculateurs qui communiquent entre eux. Run Auto intervient sur ces systèmes électroniques : codage, paramétrage, configuration de modules, adaptations de composants et apprentissages nécessaires après réparation.",
      estimatedDurationMinutes: 90,
      durationLabel: "Durée selon l'opération",
      priceNotice: "Devis selon l'intervention",
      badge: "Point fort",
      iconName: "CircuitBoard",
      heroImage: "/images/electronique-light.jpg",
      imageAlt: "Calculateur électronique automobile en cours d'analyse à l'atelier Run Auto",
      seoTitle: "Électronique Automobile à Marseille – Codage & Paramétrage",
      seoDescription:
        "Électronique automobile à Marseille : codage de calculateurs, paramétrage, programmation de modules, adaptations et apprentissages. Atelier spécialisé Run Auto 13004.",
      symptomsTitle: "Quand faire appel à nous ?",
      symptoms: [
        "Remplacement d'un composant nécessitant un codage ou un apprentissage",
        "Module électronique à configurer ou à programmer",
        "Fonction électronique qui ne répond plus correctement",
        "Réinitialisation nécessaire après une intervention",
      ],
      benefits: [
        "Intervention sur de nombreux systèmes électroniques automobiles",
        "Équipement de diagnostic professionnel de dernière génération",
        "Vérification de la compatibilité avant chaque opération",
        "Contrôle du bon fonctionnement après intervention",
      ],
      explainerTitle: "Pourquoi le codage est-il devenu indispensable ?",
      explainer: [
        "Sur une voiture récente, remplacer une pièce ne suffit plus toujours : le calculateur doit souvent la « reconnaître ». C'est le rôle du codage, du paramétrage et des apprentissages.",
        "Sans ces opérations, un composant neuf peut ne pas fonctionner, ou provoquer l'allumage d'un voyant. Run Auto dispose des outils et du savoir-faire pour réaliser ces opérations lorsque le véhicule le permet.",
      ],
      interventions: [
        { title: "Codage de calculateurs", description: "Configuration des calculateurs selon l'équipement et la version du véhicule." },
        { title: "Paramétrage électronique", description: "Réglage des paramètres de fonctionnement des différents modules." },
        { title: "Adaptation de composants", description: "Mise en conformité électronique d'une pièce remplacée pour qu'elle soit reconnue." },
        { title: "Programmation & configuration de modules", description: "Programmation et configuration des modules électroniques compatibles." },
        { title: "Réinitialisations & apprentissages", description: "Remises à zéro et procédures d'apprentissage lorsque cela est nécessaire." },
        { title: "Contrôle des systèmes électroniques", description: "Vérification du dialogue entre calculateurs et du bon fonctionnement des fonctions." },
      ],
      disclaimer:
        "Les opérations réalisables dépendent de la marque, du modèle, de l'année et des calculateurs du véhicule. La faisabilité est vérifiée avant intervention.",
      quoteKey: "electronique",
      related: ["diagnostic-automobile", "recherche-panne-electrique", "ajout-activation-options"],
      faqs: [
        {
          question: "J'ai remplacé une pièce et un voyant reste allumé, est-ce normal ?",
          answer:
            "C'est fréquent sur les véhicules récents : certaines pièces doivent être codées ou faire l'objet d'un apprentissage. Nous analysons la situation pour réaliser l'opération adaptée, ou rechercher une autre cause si nécessaire.",
        },
        {
          question: "Intervenez-vous sur toutes les marques ?",
          answer:
            "Nous intervenons sur un large parc de véhicules. Les opérations disponibles varient toutefois selon les modèles : contactez-nous avec votre immatriculation pour vérifier la faisabilité.",
        },
      ],
    },

    {
      id: "srv-diagnostic-electronique",
      slug: "diagnostic-automobile",
      title: "Diagnostic Électronique & Voyants",
      category: "Électronique automobile",
      shortDescription:
        "Lecture et analyse des défauts, voyants moteur, ABS, airbag, messages d'erreur : nous recherchons la cause réelle.",
      fullDescription:
        "Un voyant allumé ? Un message d'erreur ? Une panne électronique ? Run Auto recherche l'origine du problème grâce à des équipements de diagnostic professionnels, pour vous proposer une solution adaptée sans remplacement inutile de pièces.",
      estimatedDurationMinutes: 60,
      priceNotice: "Bilan diagnostic sur devis clair",
      badge: "Technologie de pointe",
      iconName: "Cpu",
      heroImage: "/images/dashboard-warning-light.jpg",
      imageAlt: "Voyants allumés au tableau de bord avant diagnostic électronique",
      seoTitle: "Diagnostic Voiture & Voyants à Marseille – Diagnostic Électronique",
      seoDescription:
        "Diagnostic électronique automobile à Marseille (13004) : voyant moteur, message d'erreur, perte de puissance. Analyse des défauts et recherche de la cause réelle chez Run Auto.",
      symptoms: [
        "Voyant moteur orange ou rouge allumé au combiné",
        "Mode dégradé avec perte subite de puissance",
        "Comportement anormal, ratés d'allumage ou calages inexpliqués",
        "Message d'alerte électronique au tableau de bord",
      ],
      benefits: [
        "Identification des défauts et analyse des systèmes concernés",
        "Recherche de la cause réelle, pas seulement du symptôme",
        "Rapport clair expliqué en toute transparence",
        "Proposition d'un devis chiffré avant toute réparation",
      ],
      explainerTitle: "Effacer un défaut ne suffit pas",
      explainer: [
        "Lire un code défaut n'est que la première étape : le code indique le système concerné, rarement la pièce exacte à remplacer. Effacer le défaut sans chercher sa cause revient à masquer le problème, qui finit généralement par revenir.",
        "Chez Run Auto, nous analysons les données des calculateurs, contrôlons les éléments suspects et menons les mesures nécessaires pour remonter à l'origine du dysfonctionnement. Un voyant ne peut pas être éteint durablement sans diagnostic ni réparation adaptée.",
      ],
      interventions: [
        { title: "Lecture des défauts", description: "Interrogation des calculateurs et relevé des codes défauts mémorisés." },
        { title: "Analyse des systèmes", description: "Observation des paramètres en fonctionnement pour comprendre le contexte du défaut." },
        { title: "Recherche de la cause", description: "Contrôles et mesures ciblés pour identifier l'origine réelle de la panne." },
        { title: "Solution & réparation", description: "Proposition chiffrée, réparation puis contrôle de bon fonctionnement lorsque cela est possible." },
      ],
      quoteKey: "diagnostic",
      related: ["recherche-panne-electrique", "electronique-automobile", "solutions-fap"],
      faqs: [
        {
          question: "Combien de temps prend un passage à la valise de diagnostic ?",
          answer:
            "La lecture initiale et l'analyse des codes défauts durent en moyenne entre 45 minutes et 1 heure. Des tests complémentaires sous tension peuvent être nécessaires pour confirmer la panne.",
        },
        {
          question: "Pouvez-vous simplement éteindre mon voyant ?",
          answer:
            "Effacer un défaut sans en connaître la cause ne règle pas le problème : le voyant revient en général rapidement. Notre démarche consiste à identifier l'origine du défaut pour proposer une réparation adaptée.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* D. RECHERCHE DE PANNE AVEC SCHÉMAS ÉLECTRIQUES                       */
    /* ------------------------------------------------------------------ */
    {
      id: "srv-recherche-panne-electrique",
      slug: "recherche-panne-electrique",
      title: "Recherche de Panne Électrique & Schémas",
      category: "Électronique automobile",
      shortDescription:
        "Analyse des circuits à l'aide des schémas électriques constructeur : court-circuit, capteurs, alimentations, défauts intermittents.",
      fullDescription:
        "Certaines pannes ne se résolvent pas avec une simple lecture de codes. Run Auto mène de véritables recherches de pannes électriques à l'aide des schémas constructeur et d'appareils de mesure, pour identifier précisément l'origine du dysfonctionnement.",
      estimatedDurationMinutes: 120,
      durationLabel: "Durée selon la complexité de la panne",
      priceNotice: "Devis après premier bilan",
      badge: "Pannes complexes",
      iconName: "Zap",
      heroImage: "/images/schema-electrique-light.jpg",
      imageAlt: "Technicien mesurant un faisceau électrique automobile à l'aide d'un multimètre",
      seoTitle: "Recherche de Panne Électrique Automobile à Marseille",
      seoDescription:
        "Recherche de panne électrique automobile à Marseille : étude des schémas électriques constructeur, court-circuit, capteurs, alimentations, défauts intermittents. Run Auto 13004.",
      symptoms: [
        "Panne électrique qui revient malgré des pièces déjà remplacées",
        "Défaut intermittent difficile à reproduire",
        "Batterie qui se décharge sans raison apparente",
        "Équipement électrique qui ne fonctionne plus ou fonctionne mal",
      ],
      benefits: [
        "Étude des schémas électriques constructeur",
        "Mesures précises sur les circuits, capteurs et alimentations",
        "Identification de l'origine du dysfonctionnement",
        "Réparation adaptée plutôt que remplacement au hasard",
      ],
      explainerTitle: "Notre méthode : comprendre avant de réparer",
      explainer: [
        "Un schéma électrique est le « plan » du câblage de votre véhicule : il montre comment chaque capteur, calculateur et équipement est alimenté et relié. Nous l'utilisons pour suivre le circuit en défaut, point par point.",
        "Grâce aux mesures (tension, continuité, masse, signaux), nous localisons l'élément réellement responsable : un fil coupé, une connexion oxydée, un capteur défaillant ou une alimentation absente. Notre objectif n'est pas d'effacer un défaut, mais de trouver son origine et de proposer une réparation adaptée.",
      ],
      interventions: [
        { title: "Recherche de panne électrique", description: "Démarche méthodique de localisation du défaut sur le circuit concerné." },
        { title: "Analyse des circuits électriques", description: "Suivi du câblage et contrôle des connexions, masses et faisceaux." },
        { title: "Étude des schémas constructeur", description: "Exploitation de la documentation technique pour cibler les mesures." },
        { title: "Recherche de court-circuit", description: "Localisation des courts-circuits et des consommations anormales." },
        { title: "Diagnostic de capteurs", description: "Contrôle des signaux et de l'alimentation des capteurs." },
        { title: "Contrôle des alimentations", description: "Vérification des tensions, fusibles, relais et masses." },
        { title: "Défauts intermittents", description: "Recherche des pannes aléatoires, souvent liées à une connexion ou à un faisceau." },
      ],
      quoteKey: "diagnostic",
      related: ["diagnostic-automobile", "electronique-automobile", "batterie-demarrage"],
      faqs: [
        {
          question: "Pourquoi une recherche de panne peut-elle prendre du temps ?",
          answer:
            "Une panne électrique complexe ou intermittente demande des mesures méthodiques sur plusieurs circuits. Nous réalisons un premier bilan, puis vous proposons un devis pour la suite de la recherche et la réparation.",
        },
        {
          question: "On m'a déjà changé plusieurs pièces sans succès, pouvez-vous m'aider ?",
          answer:
            "C'est précisément notre spécialité : en partant des schémas électriques et des mesures, nous cherchons l'origine réelle du défaut plutôt que de remplacer des pièces au hasard.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* E. AJOUT ET ACTIVATION D'OPTIONS                                     */
    /* ------------------------------------------------------------------ */
    {
      id: "srv-ajout-options",
      slug: "ajout-activation-options",
      title: "Ajout & Activation d'Options",
      category: "Électronique automobile",
      shortDescription:
        "Ajout d'équipements, activation d'options compatibles, codage de nouvelles fonctionnalités et configuration de modules.",
      fullDescription:
        "Votre véhicule peut souvent faire plus que ce qu'il propose à sa sortie d'usine. Run Auto réalise l'ajout d'équipements et l'activation de fonctionnalités compatibles, avec le codage et le paramétrage électronique nécessaires.",
      estimatedDurationMinutes: 90,
      durationLabel: "Durée selon l'option",
      priceNotice: "Devis selon véhicule et option",
      badge: "Personnalisation",
      iconName: "Sparkles",
      heroImage: "/images/options-light.jpg",
      imageAlt: "Cockpit numérique moderne d'un véhicule après activation d'options",
      seoTitle: "Ajout & Activation d'Options Automobile à Marseille",
      seoDescription:
        "Ajout d'options automobile à Marseille : activation de fonctionnalités compatibles, codage, paramétrage de modules et configuration d'équipements. Atelier Run Auto 13004.",
      symptomsTitle: "Pour qui ?",
      symptoms: [
        "Vous souhaitez ajouter un équipement à votre véhicule",
        "Vous voulez activer une fonctionnalité compatible avec votre modèle",
        "Un équipement installé doit être codé ou configuré",
        "Vous souhaitez personnaliser certains réglages électroniques",
      ],
      benefits: [
        "Vérification préalable de la compatibilité avec votre véhicule",
        "Codage et paramétrage réalisés avec un équipement professionnel",
        "Configuration et contrôle des équipements après intervention",
        "Conseils personnalisés selon votre modèle",
      ],
      explainerTitle: "Activer ou ajouter, quelle différence ?",
      explainer: [
        "Certaines fonctionnalités sont déjà prévues par le constructeur mais ne sont pas activées sur votre version : un codage électronique peut permettre de les rendre disponibles, lorsque le véhicule est compatible.",
        "D'autres options nécessitent l'ajout d'un équipement physique, puis son intégration électronique (codage, paramétrage) pour qu'il soit reconnu par le véhicule. Dans tous les cas, nous vérifions la faisabilité avant de vous proposer un devis.",
      ],
      interventions: [
        { title: "Ajout d'équipements", description: "Installation d'équipements compatibles et intégration au véhicule." },
        { title: "Activation d'options compatibles", description: "Activation de fonctions prévues par le constructeur lorsque le véhicule le permet." },
        { title: "Codage de nouvelles fonctionnalités", description: "Codage des calculateurs pour la prise en compte des nouvelles fonctions." },
        { title: "Paramétrage de modules", description: "Réglage des modules concernés pour un fonctionnement correct." },
        { title: "Adaptation électronique", description: "Intégration électronique des équipements ajoutés." },
        { title: "Configuration des équipements", description: "Configuration finale et contrôle du bon fonctionnement." },
      ],
      disclaimer:
        "Les options réalisables dépendent de la marque, du modèle, de la version et de l'équipement d'origine du véhicule. La liste des possibilités pour votre véhicule est établie sur demande, après vérification.",
      quoteKey: "options",
      related: ["electronique-automobile", "diagnostic-automobile", "reprogrammation-moteur"],
      faqs: [
        {
          question: "Quelles options puis-je activer sur ma voiture ?",
          answer:
            "Cela dépend entièrement de votre modèle, de sa version et de ses équipements d'origine. Communiquez-nous votre véhicule (idéalement l'immatriculation) : nous vérifions les possibilités réelles avant de vous répondre.",
        },
        {
          question: "L'activation d'une option peut-elle poser problème ?",
          answer:
            "Nous ne réalisons que les opérations compatibles avec votre véhicule et contrôlons le fonctionnement après intervention. Si une option n'est pas réalisable proprement, nous vous le disons.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* F. SOLUTIONS FAP                                                     */
    /* ------------------------------------------------------------------ */
    {
      id: "srv-echappement-fap",
      slug: "solutions-fap",
      title: "Solutions FAP",
      category: "Solutions FAP",
      shortDescription:
        "Diagnostic, analyse, entretien et remise en conformité du filtre à particules et des organes antipollution.",
      fullDescription:
        "Le filtre à particules (FAP) est un élément essentiel de la dépollution des moteurs. Run Auto diagnostique son fonctionnement, analyse les causes d'encrassement et propose l'entretien ou la remise en conformité adaptée, en préservant les dispositifs antipollution.",
      estimatedDurationMinutes: 90,
      priceNotice: "Diagnostic & devis avant remise en état",
      badge: "Conforme",
      iconName: "Activity",
      heroImage: "/images/fap-exhaust-light.jpg",
      imageAlt: "Ligne d'échappement et système de dépollution contrôlés sur pont élévateur",
      seoTitle: "Solutions FAP à Marseille – Diagnostic & Remise en Conformité",
      seoDescription:
        "Solutions FAP à Marseille : diagnostic du filtre à particules, analyse des causes d'encrassement, entretien et remise en conformité dans le respect de la réglementation. Run Auto 13004.",
      symptoms: [
        "Message « Risque de colmatage FAP » ou « Système antipollution défaillant »",
        "Fumée noire ou bleutée à l'accélération",
        "Perte de puissance et passage en mode dégradé",
        "Refus au contrôle technique pour opacité ou pollution excessive",
      ],
      benefits: [
        "Diagnostic complet du système FAP et des capteurs associés",
        "Recherche de la cause d'encrassement (injection, EGR, capteurs, usage)",
        "Entretien ou remise en conformité selon la situation du véhicule",
        "Dispositifs antipollution préservés, dans le respect de la réglementation",
      ],
      explainerTitle: "À quoi sert le filtre à particules ?",
      explainer: [
        "Le FAP retient les particules fines produites par le moteur. Il se nettoie de lui-même lors de phases appelées « régénérations », qui nécessitent certaines conditions de roulage.",
        "Des trajets courts répétés, un défaut d'injection, une vanne EGR encrassée ou un capteur défaillant peuvent empêcher ces régénérations et provoquer un colmatage. Notre rôle est d'identifier la cause et de rétablir un fonctionnement normal du système, en conformité avec la réglementation.",
      ],
      interventions: [
        { title: "Diagnostic du système FAP", description: "Lecture des défauts et analyse des paramètres (pression différentielle, températures, état de charge)." },
        { title: "Analyse des causes", description: "Contrôle de l'injection, de la vanne EGR, des capteurs et des conditions d'utilisation." },
        { title: "Entretien du système", description: "Régénération assistée et opérations d'entretien adaptées lorsque cela est approprié." },
        { title: "Remise en conformité", description: "Réparation ou remplacement des éléments défaillants pour retrouver un système conforme." },
      ],
      disclaimer:
        "Nos Solutions FAP visent exclusivement le diagnostic, l'entretien et la remise en conformité du système. Les dispositifs antipollution sont préservés et les interventions respectent la réglementation en vigueur.",
      quoteKey: "fap",
      related: ["diagnostic-automobile", "mecanique-generale", "entretien-revision"],
      faqs: [
        {
          question: "Mon véhicule a été refusé au contrôle technique pour pollution, que faire ?",
          answer:
            "Prenez rendez-vous chez Run Auto : nous analysons les paramètres de débit d'air, de pression différentielle FAP et de combustion pour cibler l'entretien ou le composant défaillant et remettre le système en conformité.",
        },
        {
          question: "Faut-il forcément remplacer le FAP ?",
          answer:
            "Pas toujours. Selon le diagnostic, un entretien du système ou la réparation de la cause d'encrassement peut suffire. Lorsque le filtre est endommagé, son remplacement est proposé pour retrouver un système conforme.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* G. MÉCANIQUE GÉNÉRALE                                                */
    /* ------------------------------------------------------------------ */
    {
      id: "srv-mecanique-generale",
      slug: "mecanique-generale",
      title: "Mécanique Générale & Réparation",
      category: "Mécanique générale",
      shortDescription:
        "Embrayage, train roulant, réparation mécanique et recherche de panne mécanique, par un atelier rigoureux.",
      fullDescription:
        "En plus de son expertise électronique, Run Auto assure la mécanique traditionnelle de votre véhicule : remplacement d'embrayage, intervention sur le train roulant, réparations et recherche de pannes mécaniques, avec devis préalable systématique.",
      estimatedDurationMinutes: 120,
      durationLabel: "Durée selon l'intervention",
      priceNotice: "Devis précis selon modèle",
      iconName: "Wrench",
      heroImage: "/images/atelier-light.jpg",
      imageAlt: "Véhicule sur pont élévateur dans l'atelier de mécanique Run Auto à Marseille",
      seoTitle: "Mécanique Automobile à Marseille – Embrayage, Train Roulant, Réparation",
      seoDescription:
        "Mécanique automobile à Marseille (13004) : embrayage, distribution, freinage, train roulant, réparation et recherche de panne mécanique. Devis clair chez Run Auto.",
      symptoms: [
        "Embrayage qui patine, pédale dure ou passage de vitesses difficile",
        "Bruits ou claquements dans le train avant ou arrière",
        "Fuite, vibration ou comportement anormal du véhicule",
        "Panne mécanique dont l'origine reste à identifier",
      ],
      benefits: [
        "Diagnostic mécanique avant toute préconisation",
        "Devis détaillé avant intervention",
        "Pièces de qualité et outillage adapté",
        "Contrôle et essai après réparation",
      ],
      explainerTitle: "Une mécanique rigoureuse, sans surprise",
      explainer: [
        "La mécanique reste le socle de la fiabilité de votre véhicule. Nous commençons toujours par identifier précisément l'origine du problème avant de vous proposer une réparation chiffrée.",
        "Run Auto ne réalise pas de prestations de pneumatiques, de parallélisme ni d'équilibrage : notre activité mécanique se concentre sur les organes moteur, transmission, freinage et train roulant.",
      ],
      interventions: [
        { title: "Remplacement d'embrayage", description: "Diagnostic de l'embrayage et remplacement du kit et des éléments associés." },
        { title: "Remplacement de distribution", description: "Kit de distribution, galets et pompe à eau selon préconisations constructeur." },
        { title: "Plaquettes & disques de frein", description: "Contrôle et remplacement des plaquettes et disques de frein." },
        { title: "Intervention sur le train roulant", description: "Contrôle et remplacement des éléments de train roulant (rotules, biellettes, silentblocs, amortisseurs…)." },
        { title: "Entretien mécanique", description: "Vidange, filtres et contrôles selon le carnet d'entretien constructeur." },
        { title: "Réparation & recherche de panne mécanique", description: "Recherche méthodique de l'origine d'un bruit, d'une fuite ou d'un dysfonctionnement." },
      ],
      quoteKey: "mecanique",
      related: ["freinage-securite", "distribution-mecanique", "entretien-revision"],
      faqs: [
        {
          question: "Proposez-vous le montage de pneus ou la géométrie ?",
          answer:
            "Non. Run Auto ne propose pas de montage de pneumatiques, de parallélisme ni d'équilibrage. Nous intervenons en revanche sur les éléments du train roulant (rotules, biellettes, silentblocs, amortisseurs…).",
        },
        {
          question: "Comment savoir si mon embrayage est usé ?",
          answer:
            "Un embrayage qui patine (le moteur monte dans les tours sans que la voiture accélère), une pédale dure ou qui accroche haut, ou des vitesses difficiles à passer sont des signes fréquents. Un contrôle permet de confirmer.",
        },
      ],
    },

    {
      id: "srv-freinage",
      slug: "freinage-securite",
      title: "Système de Freinage & Sécurité",
      category: "Mécanique générale",
      shortDescription:
        "Contrôle d'usure, remplacement des plaquettes et disques de frein, purge du liquide de frein DOT4 / DOT5.1.",
      fullDescription:
        "Le freinage est votre premier rempart de sécurité. Run Auto procède au contrôle méticuleux de l'épaisseur de garniture, du voile des disques, de l'état des étriers et du point d'ébullition de votre liquide de frein.",
      estimatedDurationMinutes: 90,
      priceNotice: "Contrôle visuel & devis personnalisé",
      badge: "Sécurité absolue",
      iconName: "Disc",
      heroImage: "/images/workshop-brakes-light.jpg",
      imageAlt: "Contrôle des disques et plaquettes de frein chez Run Auto Marseille",
      seoTitle: "Plaquettes & Disques de Frein à Marseille – Freinage",
      seoDescription:
        "Remplacement des plaquettes et disques de frein à Marseille (13004), purge du liquide de frein et contrôle du système de freinage. Devis transparent chez Run Auto.",
      symptoms: [
        "Grincements, sifflements ou bruits métalliques au freinage",
        "Pédale de frein molle, spongieuse ou qui s'enfonce anormalement",
        "Vibrations dans le volant ou la pédale lors du ralentissement",
        "Distance de freinage rallongée ou véhicule qui tire d'un côté",
      ],
      benefits: [
        "Composants de friction homologués de haute qualité",
        "Évacuation de la chaleur et morsure de frein constante",
        "Purge professionnelle évitant les bulles d'air et l'humidité résiduelle",
        "Essai routier systématique après intervention",
      ],
      interventions: [
        { title: "Remplacement des plaquettes de frein", description: "Contrôle de l'usure et remplacement des plaquettes avant et/ou arrière." },
        { title: "Remplacement des disques de frein", description: "Mesure de l'épaisseur et du voile, remplacement des disques si nécessaire." },
        { title: "Purge du liquide de frein", description: "Renouvellement du liquide de frein selon les préconisations." },
        { title: "Contrôle des étriers", description: "Vérification du fonctionnement et de l'état des étriers." },
      ],
      quoteKey: "mecanique",
      related: ["mecanique-generale", "entretien-revision", "distribution-mecanique"],
      faqs: [
        {
          question: "Quand faut-il remplacer le liquide de frein ?",
          answer:
            "Le liquide de frein absorbe naturellement l'humidité ambiante au fil des mois, ce qui réduit son point d'ébullition. Il est impératif de le purger tous les 2 ans.",
        },
      ],
    },
    {
      id: "srv-distribution-moteur",
      slug: "distribution-mecanique",
      title: "Kit de Distribution & Mécanique Moteur",
      category: "Mécanique générale",
      shortDescription:
        "Remplacement kit courroie de distribution, galets tendeurs, pompe à eau, courroie d'accessoires et contrôles calage.",
      fullDescription:
        "La rupture de la courroie de distribution engendre quasi systématiquement la destruction irréversible du haut moteur. Chez Run Auto, cette intervention cruciale est réalisée avec des piges de calage de précision et des kits de qualité d'origine.",
      estimatedDurationMinutes: 240,
      priceNotice: "Devis précis et détaillé selon modèle",
      badge: "Intervention experte",
      iconName: "Cog",
      heroImage: "/images/diagnostic-engine-light.jpg",
      imageAlt: "Compartiment moteur avant remplacement du kit de distribution",
      seoTitle: "Remplacement Distribution à Marseille – Kit Courroie & Pompe à Eau",
      seoDescription:
        "Remplacement du kit de distribution à Marseille (13004) : courroie, galets, pompe à eau, calage précis. Devis détaillé selon votre modèle chez Run Auto.",
      symptoms: [
        "Échéance de préconisation constructeur atteinte (ex: 5 ans ou 100 000 km)",
        "Bruit de sifflement, frottement ou cliquetis au niveau du carter moteur",
        "Fuite de liquide de refroidissement au niveau de la pompe à eau",
        "Craquelures visibles sur la courroie d'accessoires",
      ],
      benefits: [
        "Sérénité contre le risque de casse moteur",
        "Remplacement systématique du kit complet (courroie + galets + pompe)",
        "Purge et remplacement complet du circuit de refroidissement",
        "Calage précis respectant les tolérances usine",
      ],
      quoteKey: "mecanique",
      related: ["mecanique-generale", "entretien-revision", "freinage-securite"],
      faqs: [
        {
          question: "Pourquoi changer la pompe à eau en même temps que la courroie ?",
          answer:
            "La pompe à eau est entraînée par la distribution. Une pompe fatiguée risque de fuir ou de gripper peu de temps après, ce qui obligerait à refaire toute l'opération.",
        },
      ],
    },
    {
      id: "srv-revision-vidange",
      slug: "entretien-revision",
      title: "Entretien, Vidange & Révision",
      category: "Mécanique générale",
      shortDescription:
        "Vidange moteur, remplacement des filtres (huile, air, habitacle, carburant) et contrôle des points de sécurité.",
      fullDescription:
        "L'entretien régulier est le garant de la longévité de votre moteur — et un préalable indispensable avant toute optimisation. Chez Run Auto, chaque révision respecte les préconisations du carnet constructeur de votre véhicule.",
      estimatedDurationMinutes: 90,
      priceNotice: "Devis transparent avant intervention",
      iconName: "Droplets",
      heroImage: "/images/entretien-light.jpg",
      imageAlt: "Entretien et révision moteur à l'atelier Run Auto Marseille",
      seoTitle: "Entretien & Révision Voiture à Marseille – Vidange",
      seoDescription:
        "Entretien et révision automobile à Marseille (13004) : vidange, filtres et contrôles selon le carnet constructeur. Garantie constructeur préservée chez Run Auto.",
      symptoms: [
        "Voyant d'entretien ou clé à molette allumé au tableau de bord",
        "Échéance kilométrique ou annuelle atteinte",
        "Niveau d'huile bas ou huile noircie",
        "Baisse des performances ou légère surconsommation",
      ],
      benefits: [
        "Protection mécanique optimale et lubrification adaptée",
        "Préservation de la garantie constructeur",
        "Contrôle des organes de sécurité (freins, éclairage, niveaux)",
        "Carnet d'entretien à jour pour valoriser votre véhicule",
      ],
      quoteKey: "entretien",
      related: ["mecanique-generale", "freinage-securite", "diagnostic-automobile"],
      faqs: [
        {
          question: "La révision chez Run Auto préserve-t-elle la garantie de mon véhicule neuf ?",
          answer:
            "Oui. Conformément à la réglementation européenne (règlement n° 461/2010), vous pouvez faire entretenir votre véhicule chez un réparateur indépendant sans perdre la garantie constructeur, tant que le plan d'entretien officiel est respecté.",
        },
        {
          question: "À quelle fréquence dois-je faire ma vidange ?",
          answer:
            "Généralement tous les 15 000 à 30 000 km ou tous les 1 à 2 ans selon la motorisation et le type d'huile préconisé par le constructeur.",
        },
      ],
    },
    {
      id: "srv-batterie-alternateur",
      slug: "batterie-demarrage",
      title: "Batterie, Alternateur & Circuit de Charge",
      category: "Électronique automobile",
      shortDescription:
        "Test de charge batterie, diagnostic de démarreur et d'alternateur, remplacement batteries Stop & Start (AGM / EFB).",
      fullDescription:
        "Une panne de batterie ou d'alternateur ne prévient pas. Run Auto teste l'état de santé réel de votre batterie, la tension délivrée par votre alternateur et recherche les consommations anormales pour éviter tout risque de démarrage impossible.",
      estimatedDurationMinutes: 45,
      priceNotice: "Test & remplacement sur devis",
      badge: "Intervention rapide",
      iconName: "BatteryCharging",
      heroImage: "/images/diagnostic-tool-light.jpg",
      imageAlt: "Contrôle électrique du circuit de charge d'un véhicule",
      seoTitle: "Batterie & Alternateur à Marseille – Diagnostic Circuit de Charge",
      seoDescription:
        "Test batterie, diagnostic alternateur et démarreur, remplacement batterie Stop & Start avec initialisation électronique à Marseille (13004). Run Auto.",
      symptoms: [
        "Démarrage difficile, lent ou cliquetis au tour de clé",
        "Voyant batterie rouge persistant moteur tournant",
        "Désactivation intempestive du système Stop & Start",
        "Batterie qui se décharge à l'arrêt",
      ],
      benefits: [
        "Batteries premium adaptées aux véhicules Stop & Start",
        "Initialisation électronique du système de gestion batterie lorsque nécessaire",
        "Contrôle de l'alternateur pour éliminer toute cause cachée",
        "Recherche de consommation parasite en cas de décharge anormale",
      ],
      quoteKey: "electronique",
      related: ["recherche-panne-electrique", "diagnostic-automobile", "electronique-automobile"],
      faqs: [
        {
          question: "Faut-il réinitialiser le véhicule lors du changement de batterie ?",
          answer:
            "Sur de nombreux véhicules modernes équipés de Stop & Start, une initialisation électronique est nécessaire pour indiquer au calculateur l'installation d'une batterie neuve.",
        },
      ],
    },
  ] as ServiceItem[],

  // Déroulement d'une intervention en 5 étapes rassurantes
  processSteps: [
    {
      number: "01",
      title: "Accueil & Écoute",
      description: "Prise en charge attentive, recueil de vos observations et analyse de l'historique du véhicule.",
    },
    {
      number: "02",
      title: "Diagnostic & Bilan",
      description: "Inspection visuelle et électronique détaillée des organes ciblés par nos techniciens.",
    },
    {
      number: "03",
      title: "Devis Transparent",
      description: "Présentation chiffrée claire sans frais dissimulés. Aucune intervention sans votre validation préalable.",
    },
    {
      number: "04",
      title: "Intervention Soignée",
      description: "Travaux réalisés selon les préconisations constructeurs avec pièces certifiées et outillage dédié.",
    },
    {
      number: "05",
      title: "Contrôle & Restitution",
      description: "Vérification des points de sécurité, essai routier si nécessaire et restitution soignée du véhicule.",
    },
  ],

  // Avis clients authentiques & fiches publiques (contenus existants conservés à l'identique)
  reviewsSummary: {
    verifiedAverageRating: 4.7,
    maxRating: 5,
    sourceName: "Réseau idGarages certifié",
    sourceUrl: "https://www.idgarages.com/fr-fr/garage/marseille/GA7683_run-auto",
    notice:
      "Avis certifiés issus des plateformes de réservation professionnelles et des retours d'expérience clients.",
    testimonials: [
      {
        author: "Client vérifié idGarages",
        vehicle: "Véhicule berline",
        date: "Récemment",
        rating: 5,
        comment:
          "Prise en charge ponctuelle, explications claires sur l'état de mes freins sans forcer à la dépense. Travail propre et soigné.",
      },
      {
        author: "Automobiliste Marseille 13004",
        vehicle: "Véhicule compact",
        date: "Récemment",
        rating: 5,
        comment:
          "Très bon accueil, devis respecté à l'euro près pour ma révision annuelle. Garage sérieux et de confiance dans le quartier.",
      },
      {
        author: "Client vérifié",
        vehicle: "SUV diesel",
        date: "Récemment",
        rating: 4.5,
        comment:
          "Diagnostic rapide suite à un voyant moteur. Problème de capteur résolu dans la journée. Équipe disponible et transparente.",
      },
    ],
  },
};

/** Utilitaires */
export function getServiceBySlug(slug: string): ServiceItem | undefined {
  return GARAGE_CONFIG.services.find((s) => s.slug === slug);
}

export function getQuoteHref(quoteKey?: string): string {
  return quoteKey ? `/contact?devis=${quoteKey}#formulaire` : "/contact#formulaire";
}

export const PHONE_HREF = `tel:${GARAGE_CONFIG.contact.phoneInternational}`;
