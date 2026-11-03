# RUN AUTO MARSEILLE — SITE WEB PREMIUM & SYSTÈME DE RÉSERVATION

Site web haut de gamme, moderne et optimisé pour le référencement naturel local (SEO) conçu sur-mesure pour le garage **RUN AUTO** situé à **Marseille (13004)**, au **52 boulevard de Roux**.

---

## 💎 Direction Artistique : Luxe Automobile

Le site s'inspire des codes graphiques des constructeurs et préparateurs haut de gamme :
* **Noir profond :** `#0A0A0B` (fond principal immersif)
* **Anthracite :** `#17191D` (cartes, panneaux et conteneurs)
* **Gris graphite :** `#292C32` (séparateurs et bordures subtiles)
* **Blanc cassé :** `#F5F4F0` (titres et typographie principale haute lisibilité)
* **Champagne / Bronze clair :** `#C6A875` (accents d'exception, boutons d'action et reflets métalliques)
* **Gris secondaire :** `#A7A9AE` (textes descriptifs et labels secondaires)
* **Typographie :** **Manrope** (Google Fonts) avec hiérarchie soignée et grands titres affirmés.

---

## 🛠️ Stack Technique

* **Framework :** [Next.js 16](https://nextjs.org/) avec **App Router** & React 19
* **Langage :** **TypeScript** avec typage strict (`src/types/index.ts`)
* **Styles :** **Tailwind CSS v4** & Vanilla CSS avec effets de verre fumé (*glassmorphism*)
* **Icônes :** **Lucide React**
* **Animations :** **Framer Motion** & micro-interactions fluides
* **Dates & Créneaux :** **date-fns** avec localisation française (`fr`)
* **Stockage & Persistance :** 
  * Mode local instantané : Moteur atomique résilient dans `data/storage.json`
  * Mode cloud prêt à l'emploi : Schéma PostgreSQL complet pour **Supabase** dans `supabase/schema.sql`

---

## 📂 Architecture du Projet

```text
j:\DEV\site\run-auto/
├── data/
│   └── storage.json               # Persistance locale atomique (rendez-vous, messages, dates bloquées)
├── public/
│   ├── images/
│   │   ├── hero-car.jpg           # Photographie cinématique automobile sombre (Hero)
│   │   ├── workshop-brakes.jpg    # Macrophotographie freinage & précision atelier
│   │   └── diagnostic-engine.jpg  # Photographie diagnostic électronique & compartiment moteur
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/             # Routes login, logout, blocage de créneaux
│   │   │   ├── appointments/      # Gestion et validation des réservations
│   │   │   ├── contact/           # Traitement des messages de contact avec anti-spam
│   │   │   └── slots/             # Calcul en temps réel des disponibilités
│   │   ├── admin/                 # Espace d'administration protégé par session serveur
│   │   ├── contact/               # Page de contact officielle avec carte et itinéraire
│   │   ├── faq/                   # Foire aux questions dédiée
│   │   ├── le-garage/             # Page de présentation de l'atelier et méthode
│   │   ├── mentions-legales/      # Mentions légales conformes LCEN
│   │   ├── politique-confidentialite/ # Politique de données conforme RGPD
│   │   ├── prendre-rendez-vous/   # Page dédiée au parcours de réservation
│   │   ├── prestations/           # Catalogue global des interventions
│   │   │   └── [slug]/            # Fiches détaillées SEO par prestation
│   │   ├── globals.css            # Tokens de couleurs luxe et utilitaires
│   │   ├── layout.tsx             # Layout global avec Schema.org AutoRepair JSON-LD
│   │   ├── page.tsx               # Page d'accueil complète et immersive
│   │   ├── robots.ts              # Directive d'indexation pour moteurs de recherche
│   │   └── sitemap.ts             # Plan du site XML dynamique
│   ├── components/
│   │   ├── BookingWizard.tsx      # Parcours de réservation interactif en 5 étapes
│   │   ├── ContactForm.tsx        # Formulaire de contact avec protection honeypot
│   │   ├── FAQSection.tsx         # Composant accordéon FAQ
│   │   ├── Footer.tsx             # Pied de page avec coordonnées et horaires vérifiés
│   │   ├── GaragePresentation.tsx # Section présentation des 4 piliers d'engagement
│   │   ├── Header.tsx             # Navigation sticky avec calcul d'ouverture en direct
│   │   ├── HeroSection.tsx        # Hero section spectaculaire et réassurance
│   │   ├── MobileActionBar.tsx    # Barre d'action fixe mobile (Appel direct + RDV)
│   │   ├── OpeningHoursAndMap.tsx # Tableau des horaires et carte Google Maps
│   │   ├── ReviewsSection.tsx     # Section avis vérifiés idGarages (Note 4.7/5)
│   │   └── ServicesCatalogue.tsx  # Grille des 7 catégories de prestations
│   ├── config/
│   │   └── garage.ts              # CONFIGURATION UNIQUE DU GARAGE (coordonnées, horaires, etc.)
│   ├── lib/
│   │   ├── auth.ts                # Sécurité des sessions de l'espace administration
│   │   ├── availability.ts        # Moteur métier de calcul des créneaux
│   │   ├── email.ts               # Notifications transactionnelles (Resend / console fallback)
│   │   └── storage.ts             # Couche d'accès aux données
│   └── types/
│       └── index.ts               # Définitions TypeScript complètes
├── supabase/
│   └── schema.sql                 # Script SQL de création de tables et politiques RLS Supabase
├── .env.example                   # Modèle documenté des variables d'environnement
├── .env.local                     # Variables locales
├── package.json
└── tsconfig.json
```

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances (déjà effectuée)
```bash
npm install
```

### 2. Lancement en mode développement
```bash
npm run dev
```
Le site est disponible immédiatement sur : **[http://localhost:3000](http://localhost:3000)**

### 3. Compilation pour la production
```bash
npm run build
npm run start
```

---

## 🔒 Espace d'Administration (/admin)

Un panneau de gestion complet est accessible sur : **[http://localhost:3000/admin](http://localhost:3000/admin)**

* **Mot de passe initial :** `RunAuto2026!` *(modifiable dans `.env.local` via `ADMIN_PASSWORD`)*
* **Fonctionnalités :**
  1. **Tableau de bord :** Compteurs en direct (Rendez-vous en attente, Rendez-vous du jour, Confirmés, Messages).
  2. **Gestion des réservations :** Filtrage par statut (`pending`, `confirmed`, `completed`, `cancelled`), recherche instantanée par client ou immatriculation, détails complets du véhicule et motif, confirmation ou annulation en 1 clic.
  3. **Messagerie :** Lecture des demandes de contact et boutons de réponse par e-mail ou téléphone direct.
  4. **Gestion du calendrier :** Outil permettant de bloquer ou débloquer des dates spécifiques (congés annuels, jours fériés, fermetures exceptionnelles).
  5. **Prestations :** Vue synoptique des temps d'atelier et conditions tarifaires.

---

## 📅 Moteur de Disponibilités & Prise de Rendez-vous

* **Horaires configurés :**
  * Du Lundi au Vendredi : **09:00 - 19:00**
  * Samedi et Dimanche : **Fermé**
* **Durée des créneaux :** 60 minutes
* **Double réservation :** Bloquée côté client et côté serveur avec vérification d'unicité sur `(date, time)`.
* **Précision légale :** Toute demande est explicitement notifiée avec le statut : **« Demande envoyée, en attente de confirmation »** pour ne pas induire le client en erreur tant que l'atelier n'a pas validé la disponibilité.

---

## 📍 Informations Vérifiées & Fiche idGarages

Les coordonnées publiques suivantes ont été vérifiées et centralisées dans [`src/config/garage.ts`](src/config/garage.ts) :
* **Adresse :** 52 boulevard de Roux, 13004 Marseille, France
* **Téléphone :** `06 18 31 89 15`
* **Partenaire idGarages :** Réf. `GA7683`
* **Lien public idGarages :** [https://www.idgarages.com/fr-fr/garage/marseille/GA7683_run-auto](https://www.idgarages.com/fr-fr/garage/marseille/GA7683_run-auto)
* **Note moyenne vérifiée :** 4.7 / 5

---

## 📋 Checklist Avant Mise en Ligne Définitive

Avant le déploiement sur le nom de domaine de production, le propriétaire du garage doit simplement renseigner ou confirmer dans `src/config/garage.ts` :
1. **Numéro SIRET / SIREN & TVA :** À compléter dans la section `legal` de `src/config/garage.ts`.
2. **Adresse e-mail définitive :** Confirmer l'adresse officielle de réception des demandes.
3. **Mot de passe Admin en production :** Définir une valeur robuste pour `ADMIN_PASSWORD` dans les variables d'environnement Vercel / hébergeur.
4. **Service d'e-mails (Optionnel) :** Ajouter votre clé [Resend](https://resend.com) (`RESEND_API_KEY`) pour l'envoi automatisé des notifications clients.
#   r u n - a u t o  
 