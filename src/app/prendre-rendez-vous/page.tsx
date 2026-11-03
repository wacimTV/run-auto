"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BookingWizard from "@/components/BookingWizard";
import { Calendar, ShieldCheck, Phone, Clock, Loader2 } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

function BookingContent() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service") || undefined;

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
            Complétez les 5 étapes simples ci-dessous pour réserver votre créneau chez Run Auto Marseille (13004). Confirmation garantie sous 2h ouvrées.
          </p>
        </div>

        {/* Wizard */}
        <BookingWizard initialServiceId={serviceId} />

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
              <strong className="text-carbone">{GARAGE_CONFIG.contact.phoneDisplay}</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrendreRendezVousPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-racing">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
