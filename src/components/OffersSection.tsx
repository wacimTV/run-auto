import React from "react";
import Link from "next/link";
import { Wrench, ArrowRight, Sparkles } from "lucide-react";
import { WorkshopOffer } from "@/types";
import { formatPriceCents } from "@/lib/motorisations";

export default function OffersSection({ offers }: { offers: WorkshopOffer[] }) {
  const activeOffers = (offers ?? []).filter((o) => o.active);
  if (activeOffers.length === 0) return null;

  return (
    <section className="py-16 bg-glacier border-t border-aluminium">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-aluminium text-xs text-racing font-extrabold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-racing" />
              <span>Forfaits &amp; Offres Atelier</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-carbone font-display">
              Nos packs &amp; bilans spécialisés à Marseille
            </h2>
          </div>
          <Link
            href="/prendre-rendez-vous"
            className="text-xs font-extrabold uppercase tracking-wider text-racing hover:text-carbone flex items-center gap-1.5"
          >
            <span>Réserver un forfait</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeOffers.map((offer) => {
            const isE85 = offer.badge.toLowerCase().includes("e85");
            return (
              <div
                key={offer.id}
                className="rounded-2xl bg-white border border-aluminium p-6 flex flex-col justify-between shadow-[0_8px_24px_-6px_rgba(23,25,29,0.05)] hover:border-racing/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {offer.badge ? (
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                          isE85
                            ? "bg-e85-soft text-e85 border border-e85/30"
                            : "bg-racing-soft text-racing border border-racing/30"
                        }`}
                      >
                        {offer.badge}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-glacier text-carbone">
                        Forfait Atelier
                      </span>
                    )}
                    <span className="font-display text-sm font-extrabold text-carbone">
                      {formatPriceCents(offer.priceCents)}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-carbone font-display mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-technique leading-relaxed mb-6">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-aluminium flex items-center justify-between">
                  <span className="text-[11px] text-technique flex items-center gap-1.5 font-semibold">
                    <Wrench className="w-3.5 h-3.5 text-racing" />
                    Devis validé avant travaux
                  </span>
                  <Link
                    href="/contact#formulaire"
                    className="text-xs font-extrabold text-racing hover:underline"
                  >
                    Demander →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
