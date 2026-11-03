import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { GARAGE_CONFIG } from "@/config/garage";
import {
  CheckCircle2,
  Calendar,
  FileText,
  Cpu,
  MapPin,
  Zap,
  Gauge,
  Fuel,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "L'Atelier Run Auto Marseille 13004 | Équipement TOPDON Phoenix Max, Électronique & Savoir-Faire",
  description:
    "Découvrez l'atelier Run Auto au 52 boulevard de Roux (13004 Marseille) : équipements de diagnostic de dernière génération TOPDON Phoenix Max, recherche de pannes sur schémas électriques, reprogrammation moteur, conversion E85 et mécanique.",
};

export default function LeGaragePage() {
  return (
    <div className="pt-12 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-extrabold tracking-widest uppercase text-racing mb-2 block">
            Atelier Spécialisé • Marseille 13004
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-carbone mb-6 font-display">
            L&apos;Atelier Run Auto à Marseille
          </h1>
          <p className="text-base text-technique leading-relaxed">
            Situé au <strong>52 boulevard de Roux dans le 4ème arrondissement de Marseille</strong>, Run Auto est un atelier spécialisé dans l&apos;adaptation au bioéthanol E85, la reprogrammation moteur, l&apos;électronique automobile, la recherche de pannes complexes sur schémas électriques et la mécanique générale.
          </p>
        </div>

        {/* Cinematic Atelier Visual and Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-6 relative h-[440px] rounded-3xl overflow-hidden border border-aluminium shadow-lg">
            <Image
              src="/images/diagnostic-tool.jpg"
              alt="Station de diagnostic TOPDON Phoenix Max et atelier électronique Run Auto Marseille"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-carbone/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-aluminium text-xs shadow-md">
              <p className="font-extrabold text-carbone">
                Station {GARAGE_CONFIG.equipment.flagshipName} &amp; Schémas Constructeur
              </p>
              <p className="text-technique text-[11px] mt-0.5">
                Communication calculateurs, codage, paramétrage et mesures électriques ciblées.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-extrabold tracking-widest uppercase text-racing">
              Notre Démarche Métier
            </span>
            <h2 className="text-3xl font-extrabold text-carbone leading-tight font-display">
              Identifier la cause réelle plutôt que remplacer au hasard
            </h2>
            <p className="text-sm text-technique leading-relaxed">
              L&apos;automobile moderne repose sur des réseaux multiplexés, des dizaines de capteurs et des calculateurs interdépendants. Chez Run Auto, nous ne nous contentons jamais d&apos;effacer un voyant : nous croisons le diagnostic électronique ({GARAGE_CONFIG.equipment.flagshipName}) avec l&apos;étude des schémas électriques constructeur et des contrôles physiques.
            </p>
            <p className="text-sm text-technique leading-relaxed">
              Sur les projets d&apos;adaptation au bioéthanol E85 comme de reprogrammation moteur, chaque intervention débute par une vérification technique de compatibilité et de santé mécanique, puis se conclut par des contrôles après opération.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-glacier border border-aluminium flex items-center gap-2.5 text-xs font-bold text-carbone">
                <Fuel className="w-4 h-4 text-e85 shrink-0" />
                <span>Conversion Bioéthanol E85</span>
              </div>
              <div className="p-3.5 rounded-xl bg-glacier border border-aluminium flex items-center gap-2.5 text-xs font-bold text-carbone">
                <Gauge className="w-4 h-4 text-racing shrink-0" />
                <span>Reprogrammation Moteur</span>
              </div>
              <div className="p-3.5 rounded-xl bg-glacier border border-aluminium flex items-center gap-2.5 text-xs font-bold text-carbone">
                <Cpu className="w-4 h-4 text-racing shrink-0" />
                <span>Codage &amp; Calculateurs</span>
              </div>
              <div className="p-3.5 rounded-xl bg-glacier border border-aluminium flex items-center gap-2.5 text-xs font-bold text-carbone">
                <Zap className="w-4 h-4 text-racing shrink-0" />
                <span>Pannes &amp; Schémas Électriques</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/prendre-rendez-vous"
                className="btn-racing px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider font-extrabold inline-flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Prendre rendez-vous</span>
              </Link>
              <Link
                href="/contact#formulaire"
                className="btn-outline-racing px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-racing" />
                <span>Demander un devis</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Les 5 Étapes de Prise en Charge */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold tracking-widest uppercase text-racing mb-2 block">
              Parcours Client
            </span>
            <h2 className="text-3xl font-extrabold text-carbone mb-4 font-display">
              Les 5 étapes de votre prise en charge
            </h2>
            <p className="text-sm text-technique">
              Une méthodologie rigoureuse pour garantir une qualité constante et zéro mauvaise surprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {GARAGE_CONFIG.processSteps.map((step) => (
              <div
                key={step.number}
                className="p-6 rounded-2xl bg-glacier border border-aluminium flex flex-col justify-between relative hover:border-racing/50 transition-colors"
              >
                <div>
                  <span className="text-3xl font-black text-racing font-display block mb-3">
                    {step.number}
                  </span>
                  <h3 className="text-base font-extrabold text-carbone mb-2">{step.title}</h3>
                  <p className="text-xs text-technique leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nos 4 Engagements Formels */}
        <div className="p-8 sm:p-12 rounded-3xl bg-glacier border border-aluminium mb-16">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-extrabold tracking-widest uppercase text-racing mb-2 block">
              Nos Engagements
            </span>
            <h2 className="text-3xl font-extrabold text-carbone font-display">
              Les garanties Run Auto envers chaque automobiliste
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {GARAGE_CONFIG.commitments.map((c, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-aluminium shadow-2xs flex items-center justify-center text-racing shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-carbone mb-1">{c.title}</h3>
                  <p className="text-xs text-technique leading-relaxed">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Localisation & Invitation */}
        <div className="p-8 rounded-3xl bg-white border border-aluminium shadow-[0_12px_36px_-10px_rgba(23,25,29,0.06)] text-center space-y-4">
          <MapPin className="w-8 h-8 text-racing mx-auto" />
          <h3 className="text-2xl font-extrabold text-carbone font-display">
            Une question technique ou une intervention à planifier ?
          </h3>
          <p className="text-xs text-technique max-w-lg mx-auto">
            Nous vous accueillons du lundi au vendredi (09:00 – 19:00) au 52 boulevard de Roux, 13004 Marseille.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/prendre-rendez-vous"
              className="btn-racing px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider font-extrabold"
            >
              Prendre rendez-vous en ligne
            </Link>
            <a
              href={`tel:${GARAGE_CONFIG.contact.phone.replace(/\s/g, "")}`}
              className="btn-outline-racing px-7 py-3.5 rounded-xl text-xs font-bold"
            >
              Appeler l&apos;atelier ({GARAGE_CONFIG.contact.phoneDisplay})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
