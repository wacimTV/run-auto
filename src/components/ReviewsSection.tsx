import React from "react";
import { Star, ShieldCheck, ExternalLink, Award } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

export default function ReviewsSection() {
  const { verifiedAverageRating, sourceUrl, notice, testimonials } =
    GARAGE_CONFIG.reviewsSummary;

  return (
    <section className="py-24 bg-glacier border-t border-aluminium relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-aluminium shadow-2xs text-xs text-racing font-extrabold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5 text-racing" />
            <span>Retours d&apos;Expérience Certifiés</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-carbone mb-4 font-display">
            La confiance de nos automobilistes à Marseille
          </h2>

          <p className="text-sm text-technique">
            {notice} Consultez également notre fiche officielle sur la plateforme de référence idGarages.
          </p>
        </div>

        {/* Global Rating Hero Card */}
        <div className="mb-12 p-8 rounded-2xl bg-white border border-aluminium max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_12px_32px_-8px_rgba(23,25,29,0.05)]">
          <div className="flex items-center gap-6">
            <div className="text-center sm:text-left">
              <span className="text-5xl font-extrabold text-carbone font-display">
                {verifiedAverageRating}
              </span>
              <span className="text-xl text-racing font-bold"> / 5</span>
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-racing">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-racing" />
                ))}
              </div>
            </div>

            <div className="h-12 w-px bg-aluminium hidden sm:block" />

            <div>
              <p className="text-sm font-extrabold text-carbone">
                {GARAGE_CONFIG.partner.badgeText}
              </p>
              <p className="text-xs text-technique">
                Référencé idGarages sous le matricule{" "}
                <strong className="text-carbone">{GARAGE_CONFIG.partner.idGaragesRef}</strong>
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-racing mt-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-racing" />
                <span>Votre satisfaction, notre priorité</span>
              </div>
            </div>
          </div>

          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-racing px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
          >
            <span>Consulter la fiche idGarages</span>
            <ExternalLink className="w-3.5 h-3.5 text-racing" />
          </a>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testi, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-aluminium shadow-[0_6px_20px_-4px_rgba(23,25,29,0.04)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-racing">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s < Math.floor(testi.rating) ? "fill-racing" : "fill-aluminium"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-technique font-medium">{testi.date}</span>
                </div>

                <p className="text-sm text-carbone italic leading-relaxed mb-6">
                  « {testi.comment} »
                </p>
              </div>

              <div className="pt-4 border-t border-aluminium">
                <p className="text-xs font-extrabold text-carbone">{testi.author}</p>
                <p className="text-[11px] text-technique">{testi.vehicle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
