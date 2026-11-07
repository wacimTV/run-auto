import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { GARAGE_CONFIG, getQuoteHref, getServiceBySlug } from "@/config/garage";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Calendar,
  AlertCircle,
  HelpCircle,
  FileText,
  BookOpen,
  ShieldAlert,
  Wrench,
  Phone,
} from "lucide-react";

export async function generateStaticParams() {
  return GARAGE_CONFIG.services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = GARAGE_CONFIG.services.find((s) => s.slug === slug);
  if (!service) return { title: "Prestation non trouvée" };

  return {
    title: service.seoTitle || `${service.title} à Marseille 13004 | Run Auto`,
    description:
      service.seoDescription ||
      `${service.shortDescription} Devis transparent et prise de rendez-vous en ligne chez Run Auto Marseille (13004).`,
    openGraph: {
      title: service.seoTitle || `${service.title} | Run Auto Marseille`,
      description: service.seoDescription || service.shortDescription,
      images: service.heroImage ? [{ url: service.heroImage }] : undefined,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = GARAGE_CONFIG.services.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  const relatedServices = (service.related || [])
    .map((relSlug) => getServiceBySlug(relSlug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const isE85 = service.slug === "conversion-bioethanol-e85";
  const quoteButtonLabel = isE85 ? "Demander un devis E85" : "Demander un devis";

  return (
    <div className="pt-10 pb-24 bg-glacier">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Breadcrumb navigation */}
        <Link
          href="/prestations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-technique hover:text-racing mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-racing" />
          <span>Retour au catalogue des prestations</span>
        </Link>

        {/* Hero Visual Card of the Service */}
        <div className="rounded-3xl bg-white border border-aluminium relative overflow-hidden shadow-[0_14px_40px_-10px_rgba(23,25,29,0.06)] mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between relative z-10">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glacier border border-aluminium text-xs font-bold uppercase tracking-wider text-carbone">
                    <span className={`w-2 h-2 rounded-full ${isE85 ? "bg-e85" : "bg-racing"}`} />
                    <span>{service.category}</span>
                  </span>
                  {service.badge && (
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white ${
                        isE85 ? "bg-e85" : "bg-racing"
                      }`}
                    >
                      {service.badge}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-carbone mb-5 leading-[1.1] font-display">
                  {service.title}
                </h1>

                <p className="text-base text-technique leading-relaxed mb-8">
                  {service.fullDescription}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-6 py-5 border-t border-aluminium text-xs">
                  <div className="flex items-center gap-2 text-technique font-medium">
                    <Clock className={`w-4 h-4 ${isE85 ? "text-e85" : "text-racing"}`} />
                    <span>
                      {service.durationLabel ||
                        `Durée indicative atelier : ~${service.estimatedDurationMinutes} min`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-carbone font-bold">
                    <ShieldCheck className={`w-4 h-4 ${isE85 ? "text-e85" : "text-racing"}`} />
                    <span>{service.priceNotice}</span>
                  </div>
                </div>

                {/* Dual CTAs: Réservation + Demande de devis */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Link
                    href={`/prendre-rendez-vous?service=${service.id}`}
                    className="btn-racing px-7 py-4 rounded-xl text-xs uppercase tracking-wider font-extrabold inline-flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Prendre rendez-vous</span>
                  </Link>

                  <Link
                    href={getQuoteHref(service.quoteKey)}
                    className="btn-outline-racing px-7 py-4 rounded-xl text-xs uppercase tracking-wider font-bold inline-flex items-center justify-center gap-2"
                  >
                    <FileText className={`w-4 h-4 ${isE85 ? "text-e85" : "text-racing"}`} />
                    <span>{quoteButtonLabel}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Hero Photo */}
            <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full bg-glacier">
              <Image
                src={service.heroImage || "/images/hero-performance-light.jpg"}
                alt={service.imageAlt || `${service.title} chez Run Auto Marseille`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Regulatory / Technical Disclaimer if applicable */}
        {service.disclaimer && (
          <div
            className={`p-5 rounded-2xl border flex items-start gap-3.5 text-xs text-technique mb-10 ${
              isE85
                ? "bg-e85-soft border-e85/30"
                : "bg-racing-soft border-racing/30"
            }`}
          >
            <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${isE85 ? "text-e85" : "text-racing"}`} />
            <p className="leading-relaxed">
              <strong className="text-carbone">Cadre technique &amp; réglementaire : </strong>
              {service.disclaimer}
            </p>
          </div>
        )}

        {/* Detailed Interventions Grid */}
        {service.interventions && service.interventions.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <span
                className={`text-xs font-extrabold tracking-widest uppercase block mb-1 ${
                  isE85 ? "text-e85" : "text-racing"
                }`}
              >
                Détail des Opérations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-carbone font-display">
                Les interventions réalisées à l&apos;atelier
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.interventions.map((intv, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl bg-white border border-aluminium shadow-2xs transition-colors ${
                    isE85 ? "hover:border-e85/50" : "hover:border-racing/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center ${
                        isE85
                          ? "bg-e85-soft border border-e85/30 text-e85"
                          : "bg-racing-soft border border-racing/30 text-racing"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-sm font-extrabold text-carbone">{intv.title}</h3>
                  </div>
                  <p className="text-xs text-technique leading-relaxed">{intv.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accessible Grand Public Explainer */}
        {service.explainer && service.explainer.length > 0 && (
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-aluminium shadow-2xs mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isE85
                    ? "bg-e85-soft border border-e85/30 text-e85"
                    : "bg-racing-soft border border-racing/30 text-racing"
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`text-[11px] font-extrabold uppercase tracking-widest block ${
                    isE85 ? "text-e85" : "text-racing"
                  }`}
                >
                  Comprendre simplement
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-carbone font-display">
                  {service.explainerTitle || "Explications claires, sans jargon"}
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-sm text-technique leading-relaxed">
              {service.explainer.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Two-Column Deep-Dive: Symptoms / Use Cases vs Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Column 1: Symptoms or Target Audience */}
          <div className="p-8 rounded-2xl bg-white border border-aluminium shadow-2xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-racing-soft border border-racing/25 flex items-center justify-center text-racing">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-carbone font-display">
                {service.symptomsTitle || "Signes d'alerte & Symptômes"}
              </h2>
            </div>
            <p className="text-xs text-technique mb-6">
              Situations dans lesquelles cette prestation est recommandée :
            </p>
            <ul className="space-y-4 text-sm text-carbone">
              {service.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-racing shrink-0 mt-1.5" />
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Benefits */}
          <div className="p-8 rounded-2xl bg-white border border-aluminium shadow-2xs">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isE85
                    ? "bg-e85-soft border border-e85/30 text-e85"
                    : "bg-racing-soft border border-racing/25 text-racing"
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-carbone font-display">
                Les avantages chez Run Auto
              </h2>
            </div>
            <p className="text-xs text-technique mb-6">
              Ce que garantit notre prise en charge dans notre atelier de Marseille 13004 :
            </p>
            <ul className="space-y-4 text-sm text-carbone">
              {service.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${isE85 ? "text-e85" : "text-racing"}`}
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dedicated Service FAQ */}
        {service.faqs && service.faqs.length > 0 && (
          <div className="p-8 rounded-2xl bg-white border border-aluminium shadow-2xs mb-12">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-5 h-5 text-racing" />
              <h2 className="text-xl font-extrabold text-carbone font-display">
                Questions fréquentes sur cette prestation
              </h2>
            </div>
            <div className="space-y-6">
              {service.faqs.map((faq, fIdx) => (
                <div
                  key={fIdx}
                  className="pb-5 border-b border-aluminium last:border-none last:pb-0"
                >
                  <h3 className="text-sm font-extrabold text-carbone mb-2">{faq.question}</h3>
                  <p className="text-xs text-technique leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Services (Internal SEO Linking) */}
        {relatedServices.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-extrabold text-carbone mb-4 font-display flex items-center gap-2">
              <Wrench className="w-4 h-4 text-racing" />
              <span>Prestations complémentaires à l&apos;atelier</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedServices.map((rel) => {
                const relIsE85 = rel.slug === "conversion-bioethanol-e85";
                return (
                  <Link
                    key={rel.id}
                    href={`/prestations/${rel.slug}`}
                    className={`group p-5 rounded-2xl bg-white border border-aluminium shadow-2xs transition-all flex flex-col justify-between ${
                      relIsE85 ? "hover:border-e85" : "hover:border-racing"
                    }`}
                  >
                    <div>
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${
                          relIsE85 ? "text-e85" : "text-racing"
                        }`}
                      >
                        {rel.category}
                      </span>
                      <h3
                        className={`text-sm font-extrabold text-carbone transition-colors mb-1.5 ${
                          relIsE85 ? "group-hover:text-e85" : "group-hover:text-racing"
                        }`}
                      >
                        {rel.title}
                      </h3>
                      <p className="text-xs text-technique line-clamp-2">{rel.shortDescription}</p>
                    </div>
                    <span
                      className={`text-xs font-extrabold flex items-center gap-1 mt-4 ${
                        relIsE85 ? "text-e85" : "text-racing"
                      }`}
                    >
                      <span>Consulter</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom CTA Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-aluminium text-center space-y-4 shadow-[0_14px_38px_-10px_rgba(23,25,29,0.06)]">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-carbone font-display">
            Besoin d&apos;une étude ou d&apos;un rendez-vous pour votre véhicule ?
          </h2>
          <p className="text-xs sm:text-sm text-technique max-w-xl mx-auto">
            Réservez directement votre créneau en ligne, demandez un devis personnalisé ou appelez l&apos;atelier au{" "}
            <strong className="text-carbone">{GARAGE_CONFIG.contact.phoneDisplay}</strong>.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href={`/prendre-rendez-vous?service=${service.id}`}
              className="btn-racing px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Prendre rendez-vous</span>
            </Link>
            <Link
              href={getQuoteHref(service.quoteKey)}
              className="btn-outline-racing px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2"
            >
              <FileText className={`w-4 h-4 ${isE85 ? "text-e85" : "text-racing"}`} />
              <span>{quoteButtonLabel}</span>
            </Link>
            <a
              href={`tel:${GARAGE_CONFIG.contact.phone.replace(/\s/g, "")}`}
              className="btn-outline-racing px-6 py-3.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-racing" />
              <span>{GARAGE_CONFIG.contact.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
