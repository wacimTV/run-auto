import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, MapPin, Phone, Wrench, CheckCircle2 } from "lucide-react";
import { getSiteData, formatPhoneHref } from "@/lib/siteData";

export const metadata: Metadata = {
  title: "Garage & mécanicien Marseille 13004 – Chartreux, Saint-Just",
  description:
    "Garage automobile au 52 bd de Roux, Marseille 13004, proche Chartreux, Saint-Just, Cinq-Avenues et Blancarde : mécanique, entretien, diagnostic, E85 et reprogrammation.",
  alternates: { canonical: "/garage-marseille-13004" },
};

// Quartiers proches de l'atelier (52 boulevard de Roux, 13004) — temps de trajet indicatifs
const NEIGHBORHOODS = [
  { name: "Les Chartreux", district: "4e" },
  { name: "Saint-Just", district: "13e" },
  { name: "Les Cinq-Avenues", district: "4e" },
  { name: "La Blancarde", district: "4e" },
  { name: "Les Chutes-Lavie", district: "4e" },
  { name: "Montolivet", district: "12e" },
  { name: "Saint-Barnabé", district: "12e" },
  { name: "La Belle de Mai", district: "3e" },
  { name: "Malpassé", district: "13e" },
  { name: "Saint-Jérôme", district: "13e" },
];

const MECHANIC_SLUGS = [
  "entretien-revision",
  "freinage-securite",
  "embrayage",
  "distribution-mecanique",
  "batterie-demarrage",
  "injecteurs-vanne-egr",
  "diagnostic-automobile",
  "mecanique-generale",
];

const SPECIALTY_SLUGS = [
  "reprogrammation-moteur",
  "conversion-bioethanol-e85",
  "electronique-automobile",
  "recherche-panne-electrique",
  "ajout-activation-options",
  "solutions-fap",
];

export default async function GarageMarseillePage() {
  const { settings, services } = await getSiteData();
  const bySlug = new Map(services.map((s) => [s.slug, s]));
  const mechanic = MECHANIC_SLUGS.map((s) => bySlug.get(s)).filter(Boolean);
  const specialties = SPECIALTY_SLUGS.map((s) => bySlug.get(s)).filter(Boolean);

  return (
    <div className="pt-12 pb-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-14">
        <header className="max-w-3xl">
          <span className="text-xs font-extrabold tracking-widest uppercase text-racing mb-2 block">
            Garage automobile • {settings.city} {settings.postalCode}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-carbone mb-6 font-display">
            Votre garage et mécanicien à {settings.city} 13004
          </h1>
          <p className="text-base text-technique leading-relaxed">
            {settings.name} est un garage indépendant situé au{" "}
            <strong className="text-carbone">
              {settings.street}, {settings.postalCode} {settings.city}
            </strong>
            . Nous accueillons toutes marques pour l&apos;entretien et la réparation de votre voiture, et nous
            sommes spécialisés dans la reprogrammation moteur, la conversion au bioéthanol E85 et l&apos;électronique
            automobile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link
              href="/prendre-rendez-vous"
              className="btn-racing px-6 py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Prendre rendez-vous
            </Link>
            <a
              href={formatPhoneHref(settings.phone)}
              className="btn-outline-racing px-6 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-racing" />
              {settings.phone}
            </a>
          </div>
        </header>

        <section className="p-6 sm:p-8 rounded-2xl bg-glacier border border-aluminium">
          <h2 className="text-2xl font-extrabold text-carbone mb-3 font-display flex items-center gap-2">
            <MapPin className="w-5 h-5 text-racing" /> Un garage proche de chez vous
          </h2>
          <p className="text-sm text-technique leading-relaxed mb-5">
            Notre atelier du boulevard de Roux est facilement accessible depuis les quartiers du 4e, du 12e, du 13e et
            du 3e arrondissement de {settings.city} :
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-carbone">
            {NEIGHBORHOODS.map((n) => (
              <li key={n.name} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-racing shrink-0" />
                {n.name} <span className="text-technique">({n.district})</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-carbone mb-2 font-display flex items-center gap-2">
            <Wrench className="w-5 h-5 text-racing" /> Mécanique et entretien toutes marques
          </h2>
          <p className="text-sm text-technique mb-6">
            Devis clair avant toute intervention, pièces de qualité et essai routier après réparation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mechanic.map((s) => (
              <Link
                key={s!.slug}
                href={`/prestations/${s!.slug}`}
                className="p-5 rounded-xl bg-white border border-aluminium hover:border-racing transition-colors"
              >
                <p className="font-extrabold text-carbone">{s!.title} à {settings.city}</p>
                <p className="text-xs text-technique mt-1">{s!.shortDescription}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-carbone mb-2 font-display">
            Nos spécialités : reprogrammation, E85 et électronique
          </h2>
          <p className="text-sm text-technique mb-6">
            Des interventions techniques que peu de garages réalisent à {settings.city}, avec un diagnostic professionnel{" "}
            {settings.flagshipEquipment}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specialties.map((s) => (
              <Link
                key={s!.slug}
                href={`/prestations/${s!.slug}`}
                className="p-5 rounded-xl bg-white border border-aluminium hover:border-racing transition-colors"
              >
                <p className="font-extrabold text-carbone">{s!.title} à {settings.city}</p>
                <p className="text-xs text-technique mt-1">{s!.shortDescription}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
