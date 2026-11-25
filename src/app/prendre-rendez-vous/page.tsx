import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import BookingWizard from "@/components/BookingWizard";
import { Calendar, ShieldCheck, Phone, Clock, FileText } from "lucide-react";
import { getSiteData, toBookingServices } from "@/lib/siteData";

export const metadata: Metadata = {
  title: "Prendre rendez-vous en ligne – Garage Marseille",
  description:
    "Réservez votre créneau en ligne chez Run Auto, garage à Marseille 13004 : diagnostic, E85, reprogrammation ou mécanique. Confirmation par l’atelier.",
  alternates: { canonical: "/prendre-rendez-vous" },
};

export default async function PrendreRendezVousPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [{ service: serviceId }, { services, settings, hours }] = await Promise.all([
    searchParams,
    getSiteData(),
  ]);

  return (
    <div className="pt-12 pb-24 bg-glacier">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-aluminium shadow-2xs text-xs text-racing font-extrabold uppercase tracking-wider mb-4">
            <Calendar className="w-3.5 h-3.5 text-racing" />
            <span>Service Officiel de Réservation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-carbone mb-4 tracking-tight font-display">
            Prendre Rendez-vous à l&apos;Atelier
          </h1>
          <p className="text-sm text-technique">
            Complétez les 5 étapes simples ci-dessous pour réserver votre créneau chez {settings.name} {settings.city} ({settings.postalCode}). Confirmation garantie sous 2h ouvrées.
          </p>
        </div>

        {settings.onlineBookingEnabled ? (
          <BookingWizard
            initialServiceId={serviceId}
            services={toBookingServices(services)}
            settings={settings}
            hours={hours}
          />
        ) : (
          <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-aluminium p-8 text-center space-y-4 shadow-sm">
            <p className="text-base font-bold text-carbone">
              La prise de rendez-vous en ligne est momentanément désactivée.
            </p>
            <p className="text-sm text-technique">
              Appelez-nous directement au{" "}
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="font-bold text-racing underline">
                {settings.phone}
              </a>{" "}
              ou envoyez votre demande via notre formulaire de devis.
            </p>
            <Link
              href="/contact#formulaire"
              className="btn-racing inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              <FileText className="w-4 h-4" />
              <span>Demander un devis</span>
            </Link>
          </div>
        )}

        {/* Reassurance notes below wizard */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-technique">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-aluminium shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-racing shrink-0" />
            <span>Devis systématique et accord préalable avant tout début de travaux.</span>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-aluminium shadow-2xs">
            <Clock className="w-5 h-5 text-racing shrink-0" />
            <span>Créneaux organisés pour réduire au minimum votre temps d&apos;immobilisation.</span>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-aluminium shadow-2xs">
            <Phone className="w-5 h-5 text-racing shrink-0" />
            <span>
              Une urgence immédiate ? Joignez l&apos;atelier en direct au{" "}
              <strong className="text-carbone">{settings.phone}</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
