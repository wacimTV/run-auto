"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail, Clock, Cpu, ChevronRight, Lock, Fuel, ExternalLink } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";
import { DAY_NAMES } from "@/lib/motorisations";
import { GarageSettings, OpeningHourEntry, PartnerPlatform } from "@/types";
import type { ServiceLink } from "@/lib/siteData";
import SocialLinks from "@/components/SocialLinks";

export default function Footer({
  settings,
  hours,
  services,
  platforms,
}: {
  settings?: GarageSettings;
  hours?: OpeningHourEntry[];
  services?: ServiceLink[];
  platforms?: PartnerPlatform[];
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const garageName = settings?.name || GARAGE_CONFIG.name;
  const phoneDisplay = settings?.phone || GARAGE_CONFIG.contact.phoneDisplay;
  const email = settings?.email || GARAGE_CONFIG.contact.email;
  const street = settings?.street || GARAGE_CONFIG.contact.address;
  const postalCode = settings?.postalCode || GARAGE_CONFIG.contact.postalCode;
  const city = settings?.city || GARAGE_CONFIG.contact.city;
  const googleMapsUrl =
    settings?.googleMapsUrl || GARAGE_CONFIG.contact.googleMapsUrl;
  const flagshipEquipment =
    settings?.flagshipEquipment || GARAGE_CONFIG.equipment.flagshipName;
  const onlineBookingEnabled = settings?.onlineBookingEnabled ?? true;
  const warrantyNote = settings?.warrantyNote;
  const activeServices =
    services && services.length > 0
      ? services
      : GARAGE_CONFIG.services.map((s) => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
        }));
  const activePlatforms = (platforms ?? []).filter((p) => p.active);

  return (
    <footer className="bg-glacier border-t border-aluminium text-technique pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Col 1: Marque & Positionnement */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3.5 group w-fit">
              <Image
                src="/images/logo-run-auto.png"
                alt="Logo Run Auto Marseille"
                width={150}
                height={66}
                className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </Link>

            <p className="text-sm leading-relaxed text-technique">
              Atelier automobile à Marseille spécialisé en adaptation bioéthanol E85, reprogrammation moteur, électronique automobile, diagnostic avancé, recherche de panne sur schémas électriques, Solutions FAP et mécanique générale.
            </p>

            <div className="flex items-center gap-2.5 text-xs text-carbone bg-white p-3.5 rounded-xl border border-aluminium shadow-2xs font-medium">
              <Cpu className="w-4 h-4 text-racing shrink-0" />
              <span>Diagnostic de dernière génération ({flagshipEquipment}).</span>
            </div>

            <SocialLinks settings={settings} />
          </div>

          {/* Col 2: Prestations Spécialisées */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-carbone uppercase mb-5 flex items-center gap-2 font-display">
              <span className="w-2 h-2 rounded-full bg-racing" />
              Pôles d&apos;Expertise
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {activeServices.slice(0, 7).map((service) => {
                const isE85 = service.slug === "conversion-bioethanol-e85";
                return (
                  <li key={service.id}>
                    <Link
                      href={`/prestations/${service.slug}`}
                      className={`transition-colors flex items-center gap-1.5 group ${
                        isE85
                          ? "text-carbone font-semibold hover:text-e85"
                          : "text-technique hover:text-racing"
                      }`}
                    >
                      <ChevronRight
                        className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0 ${
                          isE85 ? "text-e85" : "text-racing"
                        }`}
                      />
                      <span className="line-clamp-1">{service.title}</span>
                    </Link>
                  </li>
                );
              })}
              <li className="pt-1">
                <Link
                  href="/prestations"
                  className="text-racing hover:text-carbone font-bold text-xs flex items-center gap-1"
                >
                  Voir les {activeServices.length} prestations →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Horaires d'ouverture */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-carbone uppercase mb-5 flex items-center gap-2 font-display">
              <span className="w-2 h-2 rounded-full bg-racing" />
              Horaires d&apos;Ouverture
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              {hours && hours.length > 0 ? (
                [1, 2, 3, 4, 5, 6, 0].map((d) => {
                  const h = hours.find((x) => x.dayOfWeek === d);
                  const isClosed = !h || h.closed;
                  return (
                    <div
                      key={d}
                      className={`flex justify-between pb-1.5 border-b border-aluminium/70 ${
                        isClosed ? "text-technique/60" : ""
                      }`}
                    >
                      <span>{DAY_NAMES[d]}</span>
                      <span className={isClosed ? "" : "text-carbone font-bold"}>
                        {isClosed ? "Fermé" : `${h.openTime} – ${h.closeTime}`}
                      </span>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="flex justify-between pb-2.5 border-b border-aluminium">
                    <span className="text-technique">Lundi – Vendredi</span>
                    <span className="text-carbone font-bold">09:00 – 19:00</span>
                  </div>
                  <div className="flex justify-between pb-2.5 border-b border-aluminium text-technique/60">
                    <span>Samedi</span>
                    <span>Fermé</span>
                  </div>
                  <div className="flex justify-between text-technique/60">
                    <span>Dimanche</span>
                    <span>Fermé</span>
                  </div>
                </>
              )}

              <div className="mt-3 p-3.5 rounded-xl bg-white border border-aluminium shadow-2xs text-xs space-y-2">
                <p className="flex items-center gap-2 text-carbone font-semibold">
                  <Clock className="w-3.5 h-3.5 text-racing shrink-0" />
                  Accueil sur rendez-vous
                </p>
                <Link
                  href="/contact?devis=e85#formulaire"
                  className="flex items-center gap-2 text-e85 hover:underline font-bold"
                >
                  <Fuel className="w-3.5 h-3.5 shrink-0" />
                  Demander une étude E85 →
                </Link>
              </div>
            </div>
          </div>

          {/* Col 4: Atelier & Contact */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-carbone uppercase mb-5 flex items-center gap-2 font-display">
              <span className="w-2 h-2 rounded-full bg-racing" />
              Coordonnées de l&apos;Atelier
            </h3>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-racing shrink-0 mt-0.5" />
                <div>
                  <p className="text-carbone font-bold">{street}</p>
                  <p className="text-xs text-technique">
                    {postalCode} {city}
                  </p>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-racing hover:underline mt-1 inline-block font-bold"
                  >
                    Obtenir l&apos;itinéraire GPS →
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-racing shrink-0" />
                <a
                  href={`tel:${phoneDisplay.replace(/\s/g, "")}`}
                  className="text-carbone hover:text-racing font-extrabold transition-colors"
                >
                  {phoneDisplay}
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-racing shrink-0" />
                <div className="flex flex-col">
                  {email ? (
                    <a
                      href={`mailto:${email}`}
                      className="text-carbone hover:text-racing text-xs font-semibold transition-colors"
                    >
                      {email}
                    </a>
                  ) : null}
                  <Link
                    href="/contact"
                    className="text-technique hover:text-racing text-xs font-medium transition-colors"
                  >
                    Formulaire de contact &amp; demande de devis
                  </Link>
                </div>
              </li>

              {activePlatforms.length > 0 ? (
                <li className="pt-1 border-t border-aluminium/70 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-technique block">
                    Retrouvez-nous aussi sur :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activePlatforms.map((p) => (
                      <a
                        key={p.id}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-carbone bg-white border border-aluminium px-2.5 py-1 rounded-lg hover:border-racing hover:text-racing transition-colors"
                      >
                        <span>{p.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </li>
              ) : null}

              <li className="pt-2">
                <Link
                  href={
                    onlineBookingEnabled
                      ? "/prendre-rendez-vous"
                      : "/contact#formulaire"
                  }
                  className="btn-racing w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold uppercase tracking-wider block"
                >
                  {onlineBookingEnabled
                    ? "Prendre rendez-vous"
                    : "Demander un devis"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {warrantyNote ? (
          <p className="mb-6 text-center text-[11px] text-technique bg-white border border-aluminium rounded-xl px-4 py-2.5">
            {warrantyNote}
          </p>
        ) : null}

        {/* Bottom Bar: Mentions Légales, Droits & Crédit Développeur */}
        <div className="pt-8 border-t border-aluminium flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-technique">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <p className="font-medium">
              © {new Date().getFullYear()} {garageName.toUpperCase()} {city.toUpperCase()}. Tous droits réservés.
            </p>
            <span className="hidden sm:inline text-aluminium">•</span>
            <p className="font-medium">
              Développé par{" "}
              <a
                href="https://www.wacimammouche.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-carbone hover:text-racing font-bold underline underline-offset-4 decoration-racing/40 hover:decoration-racing transition-colors"
              >
                Wacim AMMOUCHE
              </a>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/mentions-legales" className="hover:text-carbone transition-colors">
              Mentions légales
            </Link>
            <Link
              href="/politique-confidentialite"
              className="hover:text-carbone transition-colors"
            >
              Politique de confidentialité (RGPD)
            </Link>
            <Link href="/faq" className="hover:text-carbone transition-colors">
              FAQ
            </Link>
            <Link
              href="/admin"
              className="text-technique/80 hover:text-racing transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              Espace Garage
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
