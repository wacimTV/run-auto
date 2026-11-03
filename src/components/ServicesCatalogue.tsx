"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  Cpu,
  Disc,
  BatteryCharging,
  Cog,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle,
  Fuel,
  Gauge,
  CircuitBoard,
  Zap,
  Sparkles,
  Droplets,
  FileText,
} from "lucide-react";
import { GARAGE_CONFIG, SERVICE_CATEGORIES, getQuoteHref } from "@/config/garage";

const iconMap: Record<string, React.ElementType> = {
  Wrench,
  Cpu,
  Disc,
  BatteryCharging,
  Cog,
  Activity,
  Fuel,
  Gauge,
  CircuitBoard,
  Zap,
  Sparkles,
  Droplets,
};

export default function ServicesCatalogue() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "Toutes les prestations" },
    ...SERVICE_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
  ];

  const filteredServices =
    activeCategory === "all"
      ? GARAGE_CONFIG.services
      : GARAGE_CONFIG.services.filter((s) => s.category === activeCategory);

  return (
    <section id="prestations" className="py-24 bg-glacier border-t border-aluminium relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-extrabold tracking-widest uppercase text-racing mb-2 block">
              Catalogue Technique • Marseille 13004
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-carbone leading-tight font-display">
              L&apos;ensemble de nos pôles <br />
              <span className="text-racing">d&apos;intervention automobile</span>
            </h2>
          </div>
          <p className="text-sm text-technique max-w-md">
            Du superéthanol E85 et de la reprogrammation moteur jusqu&apos;au diagnostic électronique complexe et à la mécanique générale, chaque intervention débute par un contrôle et un devis clair.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat.id
                  ? "bg-racing text-white shadow-md shadow-racing/25"
                  : "bg-white border border-aluminium text-technique hover:text-carbone hover:border-racing"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid (Cartes blanches, bordures gris aluminium, ombres légères) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const Icon = iconMap[service.iconName] || Wrench;
            const isE85 = service.slug === "conversion-bioethanol-e85";

            return (
              <div
                key={service.id}
                className={`group rounded-2xl bg-white border border-aluminium transition-all duration-300 flex flex-col justify-between relative shadow-[0_6px_24px_-4px_rgba(23,25,29,0.05)] hover:shadow-[0_18px_38px_-8px_rgba(23,25,29,0.11)] overflow-hidden hover:-translate-y-1 ${
                  isE85 ? "hover:border-e85/60" : "hover:border-racing/60"
                }`}
              >
                <div>
                  {/* Card Visual Header */}
                  {service.heroImage && (
                    <div className="relative h-48 w-full overflow-hidden bg-carbone">
                      <Image
                        src={service.heroImage}
                        alt={service.imageAlt || service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-carbone/45 via-transparent to-carbone/15" />
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-carbone border border-aluminium shadow-2xs">
                          {service.category}
                        </span>
                        {service.badge && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-md ${
                              isE85 ? "bg-e85" : "bg-racing"
                            }`}
                          >
                            {service.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-6 pb-4">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 shrink-0 ${
                          isE85
                            ? "bg-e85-soft border border-e85/25 text-e85 group-hover:bg-e85 group-hover:text-white"
                            : "bg-racing-soft border border-racing/25 text-racing group-hover:bg-racing group-hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3
                        className={`text-lg font-extrabold text-carbone transition-colors font-display leading-snug ${
                          isE85 ? "group-hover:text-e85" : "group-hover:text-racing"
                        }`}
                      >
                        <Link href={`/prestations/${service.slug}`}>{service.title}</Link>
                      </h3>
                    </div>

                    <p className="text-xs text-technique leading-relaxed mb-5">
                      {service.shortDescription}
                    </p>

                    {/* Key benefits snippet */}
                    <div className="space-y-1.5 pt-4 border-t border-aluminium">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-technique block">
                        Points clés :
                      </span>
                      {service.benefits.slice(0, 2).map((b, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 text-xs text-carbone">
                          <CheckCircle
                            className={`w-3.5 h-3.5 shrink-0 ${isE85 ? "text-e85" : "text-racing"}`}
                          />
                          <span className="line-clamp-1 font-medium">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="px-6 pb-6 pt-3 border-t border-aluminium bg-glacier/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-technique flex items-center gap-1.5 truncate font-medium">
                      <Clock className={`w-3.5 h-3.5 shrink-0 ${isE85 ? "text-e85" : "text-racing"}`} />
                      <span className="truncate">
                        {service.durationLabel || `~${service.estimatedDurationMinutes} min`}
                      </span>
                    </span>
                    <span className="text-carbone font-bold text-[11px] shrink-0">
                      {service.priceNotice}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Link
                      href={`/prestations/${service.slug}`}
                      className="btn-outline-racing px-2.5 py-2.5 rounded-xl text-xs text-center"
                    >
                      Détails
                    </Link>

                    <Link
                      href={getQuoteHref(service.quoteKey)}
                      className="btn-outline-racing px-2.5 py-2.5 rounded-xl text-xs text-center flex items-center justify-center gap-1"
                    >
                      <FileText className={`w-3 h-3 ${isE85 ? "text-e85" : "text-racing"}`} />
                      <span>Devis</span>
                    </Link>

                    <Link
                      href={`/prendre-rendez-vous?service=${service.id}`}
                      className="btn-racing px-2.5 py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
                    >
                      <span>RDV</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Diagnostic Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-white border border-aluminium shadow-[0_8px_28px_-6px_rgba(23,25,29,0.05)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-extrabold text-carbone mb-1 font-display">
              Une panne complexe, un voyant ou un projet spécifique ?
            </h4>
            <p className="text-xs text-technique">
              Décrivez le comportement de votre véhicule ou votre projet : nous vérifions la compatibilité et planifions le diagnostic adapté.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/contact#formulaire"
              className="btn-outline-racing px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Demander un devis
            </Link>
            <Link
              href="/prendre-rendez-vous?service=custom"
              className="btn-racing px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Prendre rendez-vous
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
