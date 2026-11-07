import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Wrench, Eye, Cpu } from "lucide-react";

export default function GaragePresentation() {
  const pillars = [
    {
      icon: Cpu,
      title: "Maîtrise électronique & moteur",
      text: "Spécialisation en reprogrammation, conversion E85, codage de calculateurs et recherche de pannes électriques sur schémas.",
    },
    {
      icon: Eye,
      title: "Devis clair & transparence",
      text: "Chaque anomalie vous est expliquée avec un devis chiffré avant tout engagement de travaux.",
    },
    {
      icon: Wrench,
      title: "Outillage dernière génération",
      text: "Station de diagnostic TOPDON Phoenix Max, appareils de mesure électrique et outillage mécanique de précision.",
    },
    {
      icon: ShieldCheck,
      title: "Respect de la réglementation",
      text: "Vérification de compatibilité systématique, préservation des dispositifs antipollution et respect des préconisations constructeur.",
    },
  ];

  return (
    <section
      id="presentation"
      className="py-24 bg-white border-t border-aluminium relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Atelier Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-[480px] w-full rounded-3xl overflow-hidden border border-aluminium shadow-lg group">
              <Image
                src="/images/atelier.jpg"
                alt="Atelier Run Auto à Marseille 13004 : reprogrammation, électronique et mécanique"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbone/20 via-transparent to-transparent" />

              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-aluminium shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-racing flex items-center justify-center text-white shrink-0 font-extrabold font-display text-xs">
                    13004
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-carbone uppercase tracking-wider">
                      Atelier Run Auto Marseille
                    </p>
                    <p className="text-[11px] text-technique">
                      52 boulevard de Roux • Lun–Ven 09:00–19:00
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Values */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <span className="text-xs font-extrabold tracking-widest uppercase text-racing mb-3">
              L&apos;Atelier &amp; Notre Savoir-Faire
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-carbone leading-tight mb-6 font-display">
              Un atelier spécialisé, <br />
              <span className="text-racing">alliant électronique de pointe et mécanique.</span>
            </h2>

            <p className="text-technique leading-relaxed mb-8 text-base">
              Implanté au <strong>52 boulevard de Roux dans le 4ème arrondissement de Marseille</strong>,{" "}
              <strong className="text-carbone">Run Auto</strong> accompagne les automobilistes aussi bien sur les projets d&apos;optimisation (conversion bioéthanol E85, reprogrammation moteur, ajout d&apos;options) que sur les pannes électroniques complexes et l&apos;entretien mécanique général.
            </p>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10">
              {pillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-glacier border border-aluminium hover:border-racing/45 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-white border border-aluminium shadow-2xs flex items-center justify-center text-racing">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-carbone">{pillar.title}</h3>
                    </div>
                    <p className="text-xs text-technique leading-relaxed">{pillar.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/le-garage"
                className="btn-outline-racing px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2"
              >
                <span>Découvrir l&apos;atelier et notre méthode</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/prendre-rendez-vous"
                className="text-xs text-racing hover:text-carbone font-extrabold uppercase tracking-wider flex items-center gap-1.5 p-2 transition-colors"
              >
                <span>Prendre rendez-vous en ligne →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
