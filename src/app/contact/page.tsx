import React from "react";
import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import GoogleMapEmbed from "@/components/GoogleMapEmbed";
import { getSiteData, formatWhatsAppHref } from "@/lib/siteData";
import { DAY_NAMES } from "@/lib/motorisations";
import { MapPin, Phone, Clock, Navigation, Fuel, Gauge, Cpu, Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Devis & contact – Garage à Marseille 13004",
  description:
    "Demandez votre devis conversion bioéthanol E85, reprogrammation moteur, diagnostic électronique ou mécanique chez Run Auto à Marseille.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { settings, hours } = await getSiteData();
  const waHref = settings.whatsapp ? formatWhatsAppHref(settings.whatsapp) : null;

  return (
    <div className="pt-12 pb-24 bg-glacier">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-extrabold tracking-widest uppercase text-racing mb-2 block">
            Étude de Compatibilité &amp; Devis
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-carbone mb-4 font-display">
            Demander un Devis ou Contacter l&apos;Atelier
          </h1>
          <p className="text-base text-technique">
            Une demande de devis bioéthanol E85, un projet de reprogrammation moteur, un voyant allumé ou une intervention mécanique ? Notre atelier à {settings.city} ({settings.postalCode}) vous répond rapidement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Contact Details & Practical Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-2xl bg-white border border-aluminium space-y-6 shadow-[0_10px_30px_-8px_rgba(23,25,29,0.05)]">
              <h2 className="text-xl font-extrabold text-carbone border-b border-aluminium pb-4 font-display">
                Coordonnées de l&apos;Atelier
              </h2>

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-racing shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-technique mb-1">
                    Adresse
                  </p>
                  <p className="text-sm font-bold text-carbone">{settings.street}</p>
                  <p className="text-xs text-technique">
                    {settings.postalCode} {settings.city}, France
                  </p>
                  {settings.parkingInfo ? (
                    <p className="text-[11px] text-technique mt-1.5">{settings.parkingInfo}</p>
                  ) : null}
                  {settings.transportInfo ? (
                    <p className="text-[11px] text-technique mt-0.5">{settings.transportInfo}</p>
                  ) : null}
                  <a
                    href={settings.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-racing hover:underline mt-2 inline-flex items-center gap-1 font-bold"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Ouvrir l&apos;itinéraire GPS</span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-4 border-t border-aluminium">
                <Phone className="w-5 h-5 text-racing shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-technique mb-1">
                    Téléphone Direct
                  </p>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="text-lg font-extrabold text-carbone hover:text-racing transition-colors"
                  >
                    {settings.phone}
                  </a>
                  <p className="text-[11px] text-technique">Appel direct vers l&apos;atelier</p>
                  {waHref ? (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-e85 hover:underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Écrire sur WhatsApp</span>
                    </a>
                  ) : null}
                </div>
              </div>

              {settings.email ? (
                <div className="flex items-start gap-4 pt-4 border-t border-aluminium">
                  <Mail className="w-5 h-5 text-racing shrink-0 mt-1" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-technique mb-1">
                      E-mail
                    </p>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-sm font-bold text-carbone hover:text-racing transition-colors"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>
              ) : null}

              <div className="flex items-start gap-4 pt-4 border-t border-aluminium">
                <Clock className="w-5 h-5 text-racing shrink-0 mt-1" />
                <div className="w-full">
                  <p className="text-xs font-bold uppercase tracking-wider text-technique mb-2">
                    Horaires d&apos;Ouverture
                  </p>
                  <div className="space-y-1 text-xs">
                    {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                      const h = hours.find((x) => x.dayOfWeek === d);
                      const closed = !h || h.closed;
                      return (
                        <div
                          key={d}
                          className={`flex justify-between ${closed ? "text-technique/60" : "text-carbone"}`}
                        >
                          <span>{DAY_NAMES[d]}</span>
                          <span className={closed ? "" : "font-bold"}>
                            {closed ? "Fermé" : `${h.openTime} – ${h.closeTime}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-aluminium space-y-2 text-xs text-technique">
                <p className="font-extrabold text-carbone uppercase tracking-wider text-[11px]">
                  Pour une étude rapide, indiquez :
                </p>
                <div className="flex items-center gap-2">
                  <Fuel className="w-3.5 h-3.5 text-e85 shrink-0" />
                  <span>Marque, modèle, année et motorisation (ou immatriculation)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5 text-racing shrink-0" />
                  <span>Projet souhaité (E85, reprogrammation, option à activer)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-racing shrink-0" />
                  <span>Symptômes ou voyants allumés en cas de recherche de panne</span>
                </div>
              </div>
            </div>

            {/* Embedded Natural Map */}
            <div className="rounded-2xl overflow-hidden border border-aluminium min-h-64 shadow-sm bg-white">
              <GoogleMapEmbed
                minHeight={256}
                fullAddress={`${settings.street}, ${settings.postalCode} ${settings.city}, France`}
                googleMapsUrl={settings.googleMapsUrl}
              />
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
