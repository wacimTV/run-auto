import React from "react";
import Link from "next/link";
import { Clock, MapPin, Phone, Navigation, Calendar } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";
import GoogleMapEmbed from "@/components/GoogleMapEmbed";

export default function OpeningHoursAndMap() {
  return (
    <section className="py-24 bg-glacier border-t border-aluminium relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold tracking-widest uppercase text-racing mb-2 block">
            Accès &amp; Informations Pratiques
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carbone mb-4 font-display">
            Venir à l&apos;atelier Run Auto Marseille
          </h2>
          <p className="text-sm text-technique">
            Facilement accessible dans le 4ème arrondissement de Marseille, au 52 boulevard de Roux (13004).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Card Horaires & Coordonnées */}
          <div className="lg:col-span-5 bg-white border border-aluminium rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_10px_30px_-8px_rgba(23,25,29,0.05)]">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-racing-soft border border-racing/25 flex items-center justify-center text-racing">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-carbone font-display">
                    Horaires de l&apos;Atelier
                  </h3>
                  <p className="text-xs text-technique">Ouvert du lundi au vendredi en continu</p>
                </div>
              </div>

              {/* Table des horaires */}
              <div className="space-y-3 mb-8">
                {GARAGE_CONFIG.openingHours.map((day) => (
                  <div
                    key={day.dayName}
                    className="flex items-center justify-between py-2 border-b border-aluminium text-sm"
                  >
                    <span className="font-semibold text-carbone">{day.dayName}</span>
                    {day.isOpen ? (
                      <span className="text-carbone font-extrabold text-xs">
                        {day.slots.map((s) => `${s.open} - ${s.close}`).join(" & ")}
                      </span>
                    ) : (
                      <span className="text-technique/60 text-xs font-medium">Fermé</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Coordonnées */}
              <div className="space-y-4 pt-4 border-t border-aluminium">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-racing shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-carbone">
                      {GARAGE_CONFIG.contact.address}
                    </p>
                    <p className="text-xs text-technique">
                      {GARAGE_CONFIG.contact.postalCode} {GARAGE_CONFIG.contact.city}, France
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-racing shrink-0" />
                  <div>
                    <a
                      href={`tel:${GARAGE_CONFIG.contact.phone.replace(/\s/g, "")}`}
                      className="text-base font-extrabold text-carbone hover:text-racing transition-colors"
                    >
                      {GARAGE_CONFIG.contact.phoneDisplay}
                    </a>
                    <span className="text-[11px] text-technique block">Ligne directe atelier</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="pt-8 border-t border-aluminium flex flex-col sm:flex-row gap-3">
              <a
                href={GARAGE_CONFIG.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-racing flex-1 py-3 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-racing" />
                <span>Itinéraire GPS</span>
              </a>

              <Link
                href="/prendre-rendez-vous"
                className="btn-racing flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Prendre RDV</span>
              </Link>
            </div>
          </div>

          {/* Interactive Map Embed */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-aluminium shadow-[0_10px_30px_-8px_rgba(23,25,29,0.05)] relative min-h-[420px] bg-white">
            <GoogleMapEmbed />
            {/* Overlay badge on map */}
            <div className="absolute top-4 left-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-aluminium text-xs text-carbone shadow-md">
              <p className="font-extrabold text-carbone font-display">
                RUN <span className="text-racing">AUTO</span> MARSEILLE
              </p>
              <p className="text-[11px] text-technique">52 bd de Roux, 13004 Marseille</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
