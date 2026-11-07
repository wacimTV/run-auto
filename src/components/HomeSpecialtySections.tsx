import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Fuel,
  Gauge,
  Cpu,
  Zap,
  Sparkles,
  Activity,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  FileText,
  ArrowRight,
  CircuitBoard,
} from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

/**
 * Sections spécialisées de la page d'accueil Run Auto — Palette « Racing Light » :
 * - Blanc pur (#FFFFFF) & Gris glacier (#F2F4F6)
 * - Bordures Gris aluminium (#E2E6EA)
 * - Titres & bloc performance en Noir carbone (#17191D)
 * - Textes secondaires en Gris technique (#626B75)
 * - Rouge racing (#D71920) & Vert E85 (#198754) réservé au Bioéthanol E85
 */
export default function HomeSpecialtySections() {
  const satisfactionText =
    GARAGE_CONFIG.marketing.verifiedSatisfactionClaim ||
    GARAGE_CONFIG.marketing.satisfactionFallback;

  return (
    <div className="bg-white text-carbone">
      {/* ================================================================== */}
      {/* 5. BLOC BIOÉTHANOL E85 — PRESTATION PRIORITAIRE (ACCENTS VERT E85) */}
      {/* ================================================================== */}
      <section id="bioethanol-e85" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="rounded-3xl bg-white border border-aluminium p-6 sm:p-10 lg:p-14 shadow-[0_20px_50px_-14px_rgba(23,25,29,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-e85 text-white text-xs font-extrabold uppercase tracking-wider shadow-xs">
                  <Fuel className="w-4 h-4" />
                  <span>Prestation Prioritaire • Superéthanol E85</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-carbone leading-[1.1] font-display">
                  Conversion &amp; Adaptation{" "}
                  <span className="text-e85">Bioéthanol E85</span> à Marseille
                </h2>

                <p className="text-base text-technique leading-relaxed">
                  Le superéthanol E85 est un carburant composé majoritairement d&apos;éthanol d&apos;origine végétale dont le prix à la pompe est habituellement plus avantageux que le sans-plomb classique. Run Auto étudie la compatibilité de votre motorisation essence et met en œuvre la solution technique adaptée à votre véhicule.
                </p>

                {/* Points clés E85 avec icônes Vert E85 (#198754) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {[
                    {
                      title: "Étude de compatibilité moteur",
                      desc: "Analyse préalable de l'injection, de l'allumage et de l'état mécanique.",
                    },
                    {
                      title: "Solution adaptée au véhicule",
                      desc: "Conversion et adaptation de la cartographie lorsque cela est approprié.",
                    },
                    {
                      title: "Contrôles & vérifications",
                      desc: "Vérification des paramètres de richesse, démarrage à froid et comportement.",
                    },
                    {
                      title: "Avantages économiques potentiels",
                      desc: "Réduction potentielle du budget carburant selon votre kilométrage annuel.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="p-4 rounded-2xl bg-glacier border border-aluminium"
                    >
                      <div className="flex items-center gap-2 text-sm font-bold text-carbone mb-1">
                        <CheckCircle2 className="w-4 h-4 text-e85 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      <p className="text-xs text-technique leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Mention de transparence et conformité obligatoire */}
                <div className="p-4 rounded-2xl bg-e85-soft border border-e85/30 flex items-start gap-3 text-xs text-technique">
                  <ShieldAlert className="w-5 h-5 text-e85 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-carbone">Information importante :</strong> la compatibilité avec le bioéthanol E85 n&apos;est jamais garantie pour tous les véhicules. Chaque véhicule fait obligatoirement l&apos;objet d&apos;une vérification technique préalable à l&apos;atelier et toute intervention est réalisée dans le respect de la réglementation applicable.
                  </p>
                </div>

                {/* CTAs E85 */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <Link
                    href="/contact?devis=e85#formulaire"
                    className="btn-racing px-8 py-4 rounded-xl text-sm uppercase tracking-wider font-extrabold text-center flex items-center justify-center gap-2.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Demander un devis E85</span>
                  </Link>

                  <Link
                    href="/prendre-rendez-vous?service=srv-bioethanol-e85"
                    className="btn-outline-racing px-6 py-4 rounded-xl text-xs uppercase tracking-wider font-bold text-center flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-e85" />
                    <span>Réserver un contrôle E85</span>
                  </Link>

                  <Link
                    href="/prestations/conversion-bioethanol-e85"
                    className="text-xs font-extrabold text-e85 hover:text-carbone flex items-center justify-center gap-1 py-2 transition-colors"
                  >
                    <span>En savoir plus sur l&apos;E85</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Visual + Pedagogical Box */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-aluminium shadow-lg">
                  <Image
                    src="/images/e85-bioethanol.jpg"
                    alt="Conversion et adaptation au superéthanol E85 chez Run Auto Marseille"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-carbone/20 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-aluminium shadow-md">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-e85 block">
                      Comment fonctionne le bioéthanol E85 ?
                    </span>
                    <p className="text-xs text-technique mt-1 leading-relaxed">
                      L&apos;éthanol nécessite un dosage d&apos;injection différent de l&apos;essence pure. L&apos;adaptation permet au moteur d&apos;ajuster ses temps d&apos;injection et ses démarrages à froid selon le carburant présent dans le réservoir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 6. REPROGRAMMATION MOTEUR (BLOC CONTRASTE NOIR CARBONE #17191D)    */}
      {/* ================================================================== */}
      <section id="reprogrammation" className="py-20 bg-glacier border-t border-aluminium relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="rounded-3xl bg-carbone text-white p-6 sm:p-10 lg:p-14 border border-carbone shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 relative h-[400px] rounded-2xl overflow-hidden border border-white/15 shadow-xl order-2 lg:order-1">
                  <Image
                    src="/images/reprogrammation.jpg"
                    alt="Reprogrammation et optimisation des paramètres moteur chez Run Auto Marseille"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-carbone/25 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-carbone/92 backdrop-blur-md border border-racing/50">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Protocole Run Auto : Diagnostic → Adaptation → Contrôles
                  </p>
                  <p className="text-[11px] text-white/75 mt-0.5">
                    Aucune intervention sur un véhicule présentant une anomalie mécanique ou électronique non résolue.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-racing/50 text-xs text-white font-bold uppercase tracking-wider">
                  <Gauge className="w-3.5 h-3.5 text-racing" />
                  <span>Pôle Performance &amp; Gestion Moteur</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight font-display">
                  Reprogrammation Moteur &amp;{" "}
                  <span className="text-racing">Optimisation sur-mesure</span>
                </h2>

                <p className="text-base text-white/80 leading-relaxed">
                  La reprogrammation moteur consiste à optimiser les paramètres de gestion du calculateur (injection, couple, pression de suralimentation, réponse à l&apos;accélérateur) en fonction des caractéristiques réelles de votre véhicule et de sa motorisation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      step: "01",
                      title: "Diagnostic avant intervention",
                      text: "Lecture complète des calculateurs et vérification de l'état de santé du moteur avant toute modification.",
                    },
                    {
                      step: "02",
                      title: "Adaptation des paramètres moteur",
                      text: "Solution travaillée pour votre motorisation, dans le respect des tolérances mécaniques.",
                    },
                    {
                      step: "03",
                      title: "Préparation selon faisabilité",
                      text: "Les différents niveaux de préparation sont proposés uniquement lorsqu'ils sont réellement réalisables sur le véhicule.",
                    },
                    {
                      step: "04",
                      title: "Vérifications après intervention",
                      text: "Contrôles électroniques et validation du bon fonctionnement après l'optimisation.",
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className="p-4 rounded-2xl bg-white/[0.05] border border-white/12 hover:border-racing/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-xs font-black text-white font-display px-2 py-0.5 rounded bg-racing">
                          {s.step}
                        </span>
                        <h3 className="text-sm font-bold text-white">{s.title}</h3>
                      </div>
                      <p className="text-xs text-white/75 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-white/80 bg-white/[0.04] p-3.5 rounded-xl border border-white/10">
                  <strong className="text-white">Transparence &amp; réglementation :</strong> nous n&apos;annonçons aucun chiffre de puissance ou de couple non vérifié. Chaque étude dépend de votre motorisation et de son état. Toute modification doit respecter les exigences réglementaires et les conditions d&apos;homologation applicables.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/contact?devis=reprogrammation#formulaire"
                    className="btn-racing px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Étudier mon véhicule</span>
                  </Link>
                  <Link
                    href="/prestations/reprogrammation-moteur"
                    className="btn-outline-dark px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2"
                  >
                    <span>Détails de la prestation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 7. EXPERTISE EN ÉLECTRONIQUE AUTOMOBILE (FOND BLANC PUR)            */}
      {/* ================================================================== */}
      <section id="electronique" className="py-24 border-t border-aluminium bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-racing-soft border border-racing/25 text-xs text-racing font-extrabold uppercase tracking-wider">
                <CircuitBoard className="w-3.5 h-3.5 text-racing" />
                <span>Cœur de Métier Run Auto</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-carbone leading-tight font-display">
                Haute Technicité en{" "}
                <span className="text-racing">Électronique Automobile</span>
              </h2>

              <p className="text-base text-technique leading-relaxed">
                Un véhicule moderne embarque des dizaines de modules interconnectés. Run Auto intervient directement sur l&apos;architecture électronique de votre voiture pour diagnostiquer, coder, paramétrer et adapter vos calculateurs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Diagnostic électronique multimarque",
                  "Lecture et analyse approfondie des défauts",
                  "Recherche de pannes électroniques",
                  "Codage de calculateurs",
                  "Paramétrage électronique",
                  "Adaptation de composants",
                  "Programmation et configuration de modules",
                  "Réinitialisations et apprentissages nécessaires",
                  "Contrôle des systèmes électroniques",
                  "Recherche de défauts complexes",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 p-3.5 rounded-xl bg-glacier border border-aluminium text-xs font-bold text-carbone"
                  >
                    <span className="w-2 h-2 rounded-full bg-racing shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/prendre-rendez-vous?service=srv-electronique-codage"
                  className="btn-racing px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Prendre RDV Électronique</span>
                </Link>
                <Link
                  href="/prestations/electronique-automobile"
                  className="btn-outline-racing px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold"
                >
                  Découvrir le pôle électronique →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-[440px] rounded-3xl overflow-hidden border border-aluminium shadow-lg">
              <Image
                src="/images/electronique.jpg"
                alt="Intervention sur calculateur et électronique automobile chez Run Auto Marseille"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbone/15 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-aluminium shadow-md">
                <p className="text-xs font-extrabold text-carbone">
                  Calculateurs moteur, habitacle, ABS/ESP, airbag, gestion batterie
                </p>
                <p className="text-[11px] text-technique mt-0.5">
                  Intervention selon les compatibilités et procédures propres à chaque véhicule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 8. RECHERCHE DE PANNE AVEC SCHÉMAS ÉLECTRIQUES + VOYANTS            */}
      {/* ================================================================== */}
      <section
        id="schemas-electriques"
        className="py-24 border-t border-aluminium bg-glacier relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative h-[420px] rounded-3xl overflow-hidden border border-aluminium shadow-lg">
              <Image
                src="/images/schema-electrique.jpg"
                alt="Recherche de panne électrique automobile avec schémas constructeur et multimètre"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbone/15 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-aluminium shadow-md">
                <p className="text-xs font-extrabold text-carbone">
                  Nous ne nous contentons pas d&apos;effacer les défauts
                </p>
                <p className="text-[11px] text-technique mt-0.5">
                  L&apos;objectif est d&apos;identifier l&apos;origine réelle du dysfonctionnement et de proposer une réparation durable.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-racing/25 text-xs text-racing font-extrabold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-racing" />
                <span>Méthodologie Constructeur</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-carbone leading-tight font-display">
                Recherche de Panne avec{" "}
                <span className="text-racing">Schémas Électriques</span>
              </h2>

              <p className="text-base text-technique leading-relaxed">
                Un code défaut indique rarement la pièce exacte en cause : un capteur mis en défaut peut simplement souffrir d&apos;un fil coupé, d&apos;une masse oxydée ou d&apos;une alimentation absente. Run Auto exploite les schémas électriques constructeur pour contrôler méthodiquement vos faisceaux.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Recherche de panne électrique approfondie",
                  "Analyse des circuits électriques et faisceaux",
                  "Étude des schémas électriques constructeur",
                  "Recherche de court-circuit et fuite de courant",
                  "Diagnostic de capteurs et actionneurs",
                  "Contrôle des alimentations et des masses",
                  "Recherche de défauts intermittents",
                  "Identification de l'origine des dysfonctionnements",
                ].map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-aluminium text-xs font-semibold text-carbone shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-racing shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/prendre-rendez-vous?service=srv-recherche-panne-electrique"
                  className="btn-racing px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Réserver une recherche de panne</span>
                </Link>
                <Link
                  href="/prestations/recherche-panne-electrique"
                  className="btn-outline-racing px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold"
                >
                  En savoir plus →
                </Link>
              </div>
            </div>
          </div>

          {/* SECTION VOYANTS ET DIAGNOSTIC AUTOMOBILE */}
          <div
            id="voyants-diagnostic"
            className="rounded-3xl bg-white border border-aluminium p-6 sm:p-10 shadow-[0_16px_44px_-12px_rgba(23,25,29,0.07)] overflow-hidden relative"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 relative h-56 sm:h-64 rounded-2xl overflow-hidden border border-aluminium">
                <Image
                  src="/images/dashboard-warning.jpg"
                  alt="Voyants allumés au tableau de bord et diagnostic automobile chez Run Auto Marseille"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbone/15 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-carbone bg-white/95 px-3 py-1.5 rounded-lg border border-aluminium">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-racing" />
                    Diagnostic Voyants
                  </span>
                  <span className="text-racing">{satisfactionText}</span>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-racing-soft border border-racing/25 text-xs text-racing font-extrabold uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-racing" />
                  <span>Voyants Tableau de Bord • {satisfactionText}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-carbone leading-snug font-display">
                  « Un voyant allumé ? Un message d&apos;erreur ? Une panne électronique ? Run Auto recherche l&apos;origine du problème grâce à des équipements de diagnostic professionnels. »
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
                  {[
                    "1. Identification des défauts",
                    "2. Analyse des systèmes",
                    "3. Recherche de la cause réelle",
                    "4. Proposition d'une solution adaptée",
                    "5. Réparation & contrôle",
                  ].map((step) => (
                    <div
                      key={step}
                      className="p-3 rounded-xl bg-glacier border border-aluminium font-bold text-carbone text-center"
                    >
                      {step}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <p className="text-xs text-technique">
                    Un voyant correspond à une anomalie détectée par un calculateur : son extinction durable nécessite un diagnostic préalable et la réparation de la cause.
                  </p>
                  <Link
                    href="/prendre-rendez-vous?service=srv-diagnostic-electronique"
                    className="btn-racing px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-bold shrink-0 text-center"
                  >
                    Diagnostic voyant →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 9. ÉQUIPEMENTS DE DIAGNOSTIC DE DERNIÈRE GÉNÉRATION (TOPDON)       */}
      {/* ================================================================== */}
      <section
        id="equipements-topdon"
        className="py-24 border-t border-aluminium bg-white relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-racing-soft border border-racing/25 text-xs text-racing font-extrabold uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-racing" />
                <span>Technologie Embarquée • {GARAGE_CONFIG.equipment.flagshipName}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-carbone leading-tight font-display">
                Des équipements de diagnostic de{" "}
                <span className="text-racing">dernière génération</span>
              </h2>

              <p className="text-base text-technique leading-relaxed">
                L&apos;atelier Run Auto est équipé du système professionnel{" "}
                <strong className="text-carbone">{GARAGE_CONFIG.equipment.flagshipName}</strong>. Cet outil permet de réaliser des opérations avancées de diagnostic automobile, selon les compatibilités et fonctionnalités disponibles sur chaque véhicule.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GARAGE_CONFIG.equipment.capabilities.map((cap) => (
                  <div
                    key={cap.title}
                    className="p-4 rounded-2xl bg-glacier border border-aluminium hover:border-racing/40 transition-colors"
                  >
                    <h3 className="text-sm font-bold text-carbone mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-racing" />
                      {cap.title}
                    </h3>
                    <p className="text-xs text-technique leading-relaxed">{cap.description}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-technique italic">{GARAGE_CONFIG.equipment.notice}</p>
            </div>

            <div className="lg:col-span-5 relative h-[430px] rounded-3xl overflow-hidden border border-aluminium shadow-lg">
              <Image
                src="/images/diagnostic-tool.jpg"
                alt="Valise de diagnostic automobile professionnelle TOPDON Phoenix Max utilisée chez Run Auto"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbone/15 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-aluminium shadow-md">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-racing block">
                  Équipement Professionnel Atelier
                </span>
                <p className="text-sm font-extrabold text-carbone font-display">
                  {GARAGE_CONFIG.equipment.flagshipName}
                </p>
                <p className="text-xs text-technique mt-0.5">
                  Communication avancée avec les calculateurs, tests actionneurs, codage et adaptations compatibles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 10 & 11. AJOUT D'OPTIONS + SOLUTIONS FAP                            */}
      {/* ================================================================== */}
      <section className="py-24 border-t border-aluminium bg-glacier relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 10. Ajout et activation d'options */}
          <div
            id="options"
            className="rounded-3xl bg-white border border-aluminium hover:border-racing/50 transition-all overflow-hidden flex flex-col justify-between shadow-[0_10px_30px_-8px_rgba(23,25,29,0.05)]"
          >
            <div>
              <div className="relative h-60 w-full">
                <Image
                  src="/images/options.jpg"
                  alt="Cockpit numérique et activation d'options automobiles chez Run Auto Marseille"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbone/15 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-aluminium text-xs text-carbone font-bold shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-racing" />
                  <span>Personnalisation &amp; Équipements</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-carbone font-display">
                  Ajout &amp; Activation d&apos;Options
                </h2>
                <p className="text-sm text-technique leading-relaxed">
                  Intégration d&apos;équipements et activation d&apos;options compatibles avec votre modèle grâce au codage et au paramétrage des modules électroniques.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-carbone font-medium pt-2">
                  {[
                    "Ajout d'équipements",
                    "Activation d'options compatibles",
                    "Codage de nouvelles fonctionnalités",
                    "Paramétrage de modules",
                    "Adaptation électronique",
                    "Configuration des équipements",
                  ].map((opt) => (
                    <li key={opt} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-racing shrink-0" />
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-8 pt-4 border-t border-aluminium bg-glacier/50 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/contact?devis=options#formulaire"
                className="btn-racing px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-bold"
              >
                Vérifier la compatibilité
              </Link>
              <Link
                href="/prestations/ajout-activation-options"
                className="text-xs font-extrabold text-racing hover:text-carbone flex items-center gap-1"
              >
                <span>Découvrir la prestation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 11. SOLUTIONS FAP */}
          <div
            id="solutions-fap"
            className="rounded-3xl bg-white border border-aluminium hover:border-racing/50 transition-all overflow-hidden flex flex-col justify-between shadow-[0_10px_30px_-8px_rgba(23,25,29,0.05)]"
          >
            <div>
              <div className="relative h-60 w-full">
                <Image
                  src="/images/fap-exhaust.jpg"
                  alt="Solutions FAP : diagnostic, entretien et remise en conformité chez Run Auto Marseille"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbone/15 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-aluminium text-xs text-carbone font-bold shadow-2xs">
                  <Activity className="w-3.5 h-3.5 text-racing" />
                  <span>Conformité Antipollution</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-carbone font-display">
                  Solutions FAP
                </h2>
                <p className="text-sm text-technique leading-relaxed">
                  Prestation dédiée au diagnostic, à l&apos;analyse des causes d&apos;encrassement, à l&apos;entretien et à la remise en conformité du système FAP selon la situation de votre véhicule.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-carbone font-medium pt-2">
                  {[
                    "Diagnostic complet du système FAP",
                    "Mesure de pression différentielle",
                    "Analyse des causes d'encrassement",
                    "Contrôle des capteurs & sondes",
                    "Entretien et régénération adaptée",
                    "Remise en conformité réglementaire",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-racing shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-technique bg-glacier p-3 rounded-xl border border-aluminium">
                  Toutes nos interventions préservent les dispositifs antipollution d&apos;origine et respectent strictement la réglementation en vigueur.
                </p>
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-8 pt-4 border-t border-aluminium bg-glacier/50 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/prendre-rendez-vous?service=srv-echappement-fap"
                className="btn-racing px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-bold"
              >
                Prendre RDV Solutions FAP
              </Link>
              <Link
                href="/prestations/solutions-fap"
                className="text-xs font-extrabold text-racing hover:text-carbone flex items-center gap-1"
              >
                <span>Détails Solutions FAP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 12. MÉCANIQUE GÉNÉRALE                                              */}
      {/* ================================================================== */}
      <section
        id="mecanique-generale"
        className="py-24 border-t border-aluminium bg-white relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-extrabold tracking-widest uppercase text-racing mb-2 block">
                Entretien &amp; Réparation Multimarque
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-carbone font-display">
                Mécanique Générale de Précision
              </h2>
            </div>
            <p className="text-sm text-technique max-w-md">
              Un moteur optimisé ou diagnostiqué avec rigueur mérite une mécanique irréprochable : freinage, embrayage, distribution, train roulant et révision constructeur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[
              {
                title: "Plaquettes & disques de frein",
                desc: "Contrôle d'usure, remplacement plaquettes/disques et purge du liquide de frein.",
                href: "/prestations/freinage-securite",
              },
              {
                title: "Remplacement d'embrayage",
                desc: "Diagnostic patinage ou commande hydraulique et remplacement du kit d'embrayage.",
                href: "/prestations/mecanique-generale",
              },
              {
                title: "Kit de distribution",
                desc: "Courroie de distribution, galets tendeurs, pompe à eau et calage moteur précis.",
                href: "/prestations/distribution-mecanique",
              },
              {
                title: "Intervention sur le train roulant",
                desc: "Rotules, biellettes, triangles, silentblocs et amortisseurs.",
                href: "/prestations/mecanique-generale",
              },
              {
                title: "Entretien mécanique & vidange",
                desc: "Révision selon le plan constructeur, remplacement des filtres et contrôles.",
                href: "/prestations/entretien-revision",
              },
              {
                title: "Réparation mécanique",
                desc: "Remise en état des organes moteur, refroidissement et périphériques.",
                href: "/prestations/mecanique-generale",
              },
              {
                title: "Recherche de panne mécanique",
                desc: "Identification méthodique de l'origine d'un bruit, d'une fuite ou d'une vibration.",
                href: "/prestations/mecanique-generale",
              },
              {
                title: "Batterie & circuit de charge",
                desc: "Test alternateur/démarreur et remplacement batterie AGM/EFB avec initialisation.",
                href: "/prestations/batterie-demarrage",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group p-5 rounded-2xl bg-white border border-aluminium shadow-[0_4px_16px_-4px_rgba(23,25,29,0.04)] hover:border-racing hover:shadow-[0_12px_28px_-6px_rgba(215,25,32,0.10)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-racing-soft flex items-center justify-center text-racing">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-technique group-hover:text-racing group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-sm font-extrabold text-carbone group-hover:text-racing transition-colors mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-technique leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
