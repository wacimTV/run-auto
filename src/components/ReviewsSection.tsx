import React from "react";
import { Star, ShieldCheck, ExternalLink, Award } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

export default function ReviewsSection() {
  const { verifiedAverageRating, reviewCount, sourceName, sourceUrl, notice, criteria, testimonials, lastChecked } =
    GARAGE_CONFIG.reviewsSummary;

  return (
    <section className="py-24 bg-glacier border-t border-aluminium relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-aluminium shadow-2xs text-xs text-racing font-extrabold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5 text-racing" />
            <span>Avis clients {sourceName}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-carbone mb-4 font-display">
            La confiance de nos automobilistes à Marseille
          </h2>

          <p className="text-sm text-technique">{notice}</p>
        </div>

        {/* Note globale */}
        <div className="mb-12 p-8 rounded-2xl bg-white border border-aluminium max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_12px_32px_-8px_rgba(23,25,29,0.05)]">
          <div className="flex items-center gap-6">
            <div className="text-center sm:text-left">
              <span className="text-5xl font-extrabold text-carbone font-display">
                {verifiedAverageRating.toLocaleString("fr-FR")}
              </span>
              <span className="text-xl text-racing font-bold"> / 5</span>
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-racing">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(verifiedAverageRating) ? "fill-racing" : "fill-aluminium"}`}
                  />
                ))}
              </div>
            </div>

            <div className="h-12 w-px bg-aluminium hidden sm:block" />

            <div>
              <p className="text-sm font-extrabold text-carbone">{reviewCount} avis clients sur {sourceName}</p>
              <p className="text-xs text-technique">
                Fiche n° <strong className="text-carbone">{GARAGE_CONFIG.partner.idGaragesRef}</strong> · relevé du {lastChecked}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-racing mt-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-racing" />
                <span>Label Garage Confiance idGarages / Autoplus</span>
              </div>
            </div>
          </div>

          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-racing px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
          >
            <span>Lire tous les avis</span>
            <ExternalLink className="w-3.5 h-3.5 text-racing" />
          </a>
        </div>

        {/* Notes détaillées */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
          {criteria.map((c) => (
            <div key={c.label} className="p-4 rounded-xl bg-white border border-aluminium text-center">
              <p className="text-lg font-extrabold text-carbone font-display">
                {c.score.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}
                <span className="text-xs text-racing font-bold"> / 5</span>
              </p>
              <p className="text-[11px] text-technique mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Avis réels (copiés à l'identique depuis la source) */}
        {testimonials.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {testimonials.map((testi) => (
              <figure
                key={`${testi.author}-${testi.date}`}
                className="w-full md:w-[calc(33.333%-1rem)] p-6 rounded-2xl bg-white border border-aluminium shadow-[0_6px_20px_-4px_rgba(23,25,29,0.04)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-racing" aria-label={`${testi.rating} sur 5`}>
                      {[...Array(5)].map((_, s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s < Math.floor(testi.rating) ? "fill-racing" : "fill-aluminium"}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-technique font-medium">{testi.date}</span>
                  </div>
                  <blockquote className="text-sm text-carbone italic leading-relaxed mb-6">
                    « {testi.comment} »
                  </blockquote>
                </div>
                <figcaption className="pt-4 border-t border-aluminium">
                  <p className="text-xs font-extrabold text-carbone">{testi.author}</p>
                  <p className="text-[11px] text-technique">{testi.vehicle}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
